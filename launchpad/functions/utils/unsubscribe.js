/**
 * Single source of truth for unsubscribe handling (previously copy-pasted into
 * four files with subtly different behaviour).
 *
 * Storage model: `unsubscribed_emails/{lowercased email}`
 *   - all: true            -> unsubscribed from every email type
 *   - types: [string]      -> unsubscribed from these specific types
 *   - emailType (legacy)   -> older docs stored a single type; still honoured
 */
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

if (!admin.apps.length) {
    admin.initializeApp();
}

const UNSUBSCRIBE_BASE_URL = 'https://launchpadhouston.com/unsubscribe';
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function db() {
    return admin.firestore();
}

async function generateUnsubscribeLink(email, emailType = 'general') {
    const token = crypto.randomUUID();
    await db().collection('unsubscribe_tokens').doc(token).set({
        email: email.toLowerCase(),
        emailType,
        expiresAt: Date.now() + TOKEN_TTL_MS,
        used: false,
        createdAt: FieldValue.serverTimestamp(),
    });
    return `${UNSUBSCRIBE_BASE_URL}?token=${token}`;
}

function isUnsubscribedData(data, emailType) {
    if (!data) return false;
    if (data.all === true) return true;
    if (Array.isArray(data.types) && data.types.includes(emailType)) return true;
    // Legacy single-type docs. A legacy doc with no emailType meant "everything".
    if (!('types' in data) && !('all' in data)) {
        return !data.emailType || data.emailType === 'general' || data.emailType === emailType;
    }
    return false;
}

async function isUnsubscribed(email, emailType) {
    if (!email) return false;
    const snap = await db().collection('unsubscribed_emails').doc(email.toLowerCase()).get();
    return snap.exists && isUnsubscribedData(snap.data(), emailType);
}

/** Records an unsubscribe without clobbering earlier per-type unsubscribes. */
async function recordUnsubscribe(email, emailType, tokenUsed) {
    const ref = db().collection('unsubscribed_emails').doc(email.toLowerCase());
    const update = {
        email: email.toLowerCase(),
        unsubscribedAt: FieldValue.serverTimestamp(),
        tokenUsed,
    };
    if (!emailType || emailType === 'general') {
        update.all = true;
    } else {
        update.types = FieldValue.arrayUnion(emailType);
    }
    await ref.set(update, { merge: true });
}

async function hasEmailNotificationsEnabled(userId) {
    const snap = await db().collection('users').doc(userId).get();
    if (!snap.exists) return false;
    return snap.data().emailNotificationsEnabled !== false;
}

module.exports = {
    generateUnsubscribeLink,
    isUnsubscribed,
    isUnsubscribedData,
    recordUnsubscribe,
    hasEmailNotificationsEnabled,
};
