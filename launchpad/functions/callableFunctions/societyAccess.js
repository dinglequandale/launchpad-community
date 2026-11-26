const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { requireAuth, enforceRateLimit, toHttpsError } = require('../utils/security');

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Society (e.g. HSFS) access codes.
 *
 * SECURITY: access codes used to be checked in the browser. Any signed-in user
 * could read every code from `societies/{id}`, rewrite the codes and limits, or
 * simply skip the check and add the society to their own profile. Signed-out
 * visitors (the people the page is for) could not read the doc at all, so the
 * check always failed for new sign-ups.
 *
 * Now:
 *   verifySocietyAccessCode  - no sign-in needed; checks a code without consuming it.
 *   redeemSocietyAccessCode  - signed-in; consumes one use and writes
 *                              `societies/{id}/grants/{uid}`, which Firestore rules
 *                              require before a user can join the society.
 * The society root doc is no longer readable or writable by clients.
 */
const KNOWN_SOCIETIES = new Set(['hsfs']);

function todayKey() {
    return new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
}

function parseInput(data) {
    const societyId = (data && data.societyId) || 'hsfs';
    const code = data && typeof data.code === 'string' ? data.code.trim() : '';
    if (!KNOWN_SOCIETIES.has(societyId)) {
        throw new functions.https.HttpsError('invalid-argument', 'Unknown society.');
    }
    if (!code || code.length > 64) {
        throw new functions.https.HttpsError('invalid-argument', 'An access code is required.');
    }
    return { societyId, code };
}

/** Returns { ok: true, keyType } or { ok: false, reason }. */
function checkCode(society, code) {
    const accessCodes = society.accessCodes || {};
    const match = Object.entries(accessCodes).find(([, value]) => value === code);
    if (!match) return { ok: false, reason: 'invalid' };

    const expiration = society.expiration_date;
    if (expiration && typeof expiration.toDate === 'function' && new Date() > expiration.toDate()) {
        return { ok: false, reason: 'expired' };
    }

    const today = todayKey();
    const used = society.usages_count || 0;
    const usedToday = (society.daily_usage_tracker && society.daily_usage_tracker[today]) || 0;
    if ((typeof society.usages_threshold === 'number' && society.usages_threshold <= used) ||
        (typeof society.daily_usages_threshold === 'number' && society.daily_usages_threshold <= usedToday)) {
        return { ok: false, reason: 'limit' };
    }
    return { ok: true, keyType: match[0] };
}

exports.verifySocietyAccessCode = functions.https.onCall(async (data, context) => {
    const { societyId, code } = parseInput(data);
    try {
        // Unauthenticated endpoint: throttle guesses per caller IP.
        const ip = (context.rawRequest && (context.rawRequest.ip || context.rawRequest.headers['x-forwarded-for'])) || 'unknown';
        await enforceRateLimit(`societyCode:${societyId}:${ip}`, { limit: 20, windowSeconds: 60 * 60 });

        const snap = await admin.firestore().collection('societies').doc(societyId).get();
        if (!snap.exists) {
            throw new functions.https.HttpsError('not-found', 'Society not found.');
        }
        const result = checkCode(snap.data(), code);
        return { valid: result.ok, reason: result.ok ? null : result.reason };
    } catch (error) {
        throw toHttpsError(error, 'Could not verify access code');
    }
});

exports.redeemSocietyAccessCode = functions.https.onCall(async (data, context) => {
    const uid = requireAuth(context);
    const { societyId, code } = parseInput(data);
    const db = admin.firestore();
    const societyRef = db.collection('societies').doc(societyId);
    const grantRef = societyRef.collection('grants').doc(uid);

    try {
        await enforceRateLimit(`societyRedeem:${uid}`, { limit: 10, windowSeconds: 60 * 60 });

        return await db.runTransaction(async (tx) => {
            const [societySnap, grantSnap] = await Promise.all([tx.get(societyRef), tx.get(grantRef)]);
            if (grantSnap.exists) {
                return { success: true, alreadyMember: true };
            }
            if (!societySnap.exists) {
                throw new functions.https.HttpsError('not-found', 'Society not found.');
            }
            const society = societySnap.data();
            const result = checkCode(society, code);
            if (!result.ok) {
                const messages = {
                    invalid: 'Invalid access code.',
                    expired: 'This code has expired. Please request a new one.',
                    limit: 'Code usage limit reached.',
                };
                throw new functions.https.HttpsError('failed-precondition', messages[result.reason]);
            }

            const today = todayKey();
            tx.update(societyRef, {
                last_used: admin.firestore.FieldValue.serverTimestamp(),
                usages_count: admin.firestore.FieldValue.increment(1),
                [`daily_usage_tracker.${today}`]: admin.firestore.FieldValue.increment(1),
            });
            tx.set(grantRef, {
                uid,
                keyType: result.keyType,
                grantedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { success: true, alreadyMember: false };
        });
    } catch (error) {
        throw toHttpsError(error, 'Could not redeem access code');
    }
});
