const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { requireAuth, toHttpsError } = require('../utils/security');
const {
    generateUnsubscribeLink,
    isUnsubscribed,
    recordUnsubscribe,
} = require('../utils/unsubscribe');

/**
 * Generate an unsubscribe link for the CALLER's own email address.
 * (Previously unauthenticated and accepted any email, which let anyone mint a
 * token for -- and then unsubscribe -- any address.)
 */
exports.generateUnsubscribeLink = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const email = context.auth.token.email;
    if (!email) {
        throw new functions.https.HttpsError('failed-precondition', 'Your account has no email address.');
    }
    try {
        return await generateUnsubscribeLink(email, (data && data.emailType) || 'general');
    } catch (error) {
        throw toHttpsError(error, 'Could not generate unsubscribe link');
    }
});

/**
 * Process an unsubscribe request. The token itself is the credential (it is only
 * ever delivered to the mailbox it belongs to), so no sign-in is required.
 */
exports.processUnsubscribe = functions.https.onCall(async (data) => {
    const token = data && data.token;
    if (!token || typeof token !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Token is required');
    }

    try {
        const tokenRef = admin.firestore().collection('unsubscribe_tokens').doc(token);
        const tokenData = await admin.firestore().runTransaction(async (tx) => {
            const snap = await tx.get(tokenRef);
            if (!snap.exists) {
                throw new functions.https.HttpsError('not-found', 'Invalid unsubscribe token');
            }
            const t = snap.data();
            if (t.expiresAt < Date.now()) {
                throw new functions.https.HttpsError('failed-precondition', 'Unsubscribe token has expired');
            }
            if (t.used) {
                throw new functions.https.HttpsError('failed-precondition', 'Unsubscribe token has already been used');
            }
            tx.update(tokenRef, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });
            return t;
        });

        await recordUnsubscribe(tokenData.email, tokenData.emailType, token);

        return {
            success: true,
            message: 'Successfully unsubscribed from emails',
            email: tokenData.email,
        };
    } catch (error) {
        throw toHttpsError(error, 'Could not process unsubscribe request');
    }
});

/** Check whether the CALLER's own email is unsubscribed (no longer an email-enumeration oracle). */
exports.checkUnsubscribeStatus = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const email = context.auth.token.email;
    if (!email) {
        return { unsubscribed: false };
    }
    try {
        return { unsubscribed: await isUnsubscribed(email, (data && data.emailType) || 'general') };
    } catch (error) {
        throw toHttpsError(error, 'Could not check unsubscribe status');
    }
});
