/**
 * Shared security helpers for Cloud Functions.
 *
 * - escapeHtml: every user-controlled string that ends up inside an email body
 *   MUST go through this (names, bios, report text, opportunity titles, ...).
 * - requireAuth / requireAdmin: callable guards. Admins are listed in the
 *   `admins/{uid}` Firestore collection (create the doc from the Firebase console;
 *   clients cannot write to it).
 * - enforceRateLimit: simple fixed-window counter stored in Firestore.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

if (!admin.apps.length) {
    admin.initializeApp();
}

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Strip CR/LF so user input can never inject extra mail headers via the subject line. */
function sanitizeHeader(value, maxLength = 200) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}

function isValidEmail(email) {
    return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim());
}

/** Only allow http(s) URLs; anything else (javascript:, data:, ...) becomes ''. */
function safeHttpUrl(value) {
    if (typeof value !== 'string') return '';
    try {
        const url = new URL(value.trim());
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
    } catch (e) {
        return '';
    }
}

function requireAuth(context, message = 'You must be signed in.') {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', message);
    }
    return context.auth.uid;
}

async function isAdmin(uid) {
    if (!uid) return false;
    const snap = await admin.firestore().collection('admins').doc(uid).get();
    return snap.exists;
}

async function requireAdmin(context) {
    const uid = requireAuth(context);
    if (!(await isAdmin(uid))) {
        throw new functions.https.HttpsError('permission-denied', 'Administrator access required.');
    }
    return uid;
}

/**
 * Fixed-window rate limit. Throws resource-exhausted once `limit` units have been
 * consumed in the current window. `cost` lets one call consume several units
 * (e.g. one unit per email recipient).
 */
async function enforceRateLimit(key, { limit, windowSeconds, cost = 1 }) {
    const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
    const safeKey = String(key).replace(/[^A-Za-z0-9_.:-]/g, '_').slice(0, 200);
    const ref = admin.firestore().collection('rate_limits').doc(`${safeKey}__${windowId}`);

    await admin.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const used = snap.exists ? snap.data().count || 0 : 0;
        if (used + cost > limit) {
            throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.');
        }
        tx.set(ref, {
            count: used + cost,
            // Lets a Firestore TTL policy on `expiresAt` clean these up automatically.
            expiresAt: Timestamp.fromMillis((windowId + 2) * windowSeconds * 1000),
        }, { merge: true });
    });
}

/**
 * Re-throw HttpsErrors untouched; wrap anything else as `internal` without leaking
 * internal error messages to the client.
 */
function toHttpsError(error, publicMessage) {
    if (error instanceof functions.https.HttpsError) return error;
    console.error(publicMessage, error);
    return new functions.https.HttpsError('internal', publicMessage);
}

module.exports = {
    escapeHtml,
    sanitizeHeader,
    isValidEmail,
    safeHttpUrl,
    requireAuth,
    requireAdmin,
    isAdmin,
    enforceRateLimit,
    toHttpsError,
};
