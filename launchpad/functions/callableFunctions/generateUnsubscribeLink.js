const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.generateUnsubscribeLink = functions.https.onCall(async (data, context) => {
    const { email, emailType = 'general' } = data;

    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    try {
        // Generate a secure token
        const token = crypto.randomUUID();
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

        // Store the unsubscribe token in Firestore
        await admin.firestore().collection('unsubscribe_tokens').doc(token).set({
            email: email.toLowerCase(),
            emailType,
            expiresAt,
            used: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Generate the unsubscribe link
        const unsubscribeLink = `https://launchpadhouston.com/unsubscribe?token=${token}`;

        return unsubscribeLink;
    } catch (error) {
        console.error('Error generating unsubscribe link:', error);
        throw new functions.https.HttpsError('internal', 'Could not generate unsubscribe link');
    }
});

/**
 * Process unsubscribe request
 * @param {Object} data
 * @param {string} data.token - The unsubscribe token
 * @returns {Object} Result of unsubscribe operation
 */
exports.processUnsubscribe = functions.https.onCall(async (data, context) => {
    const { token } = data;

    if (!token) {
        throw new functions.https.HttpsError('invalid-argument', 'Token is required');
    }

    try {
        // Get the unsubscribe token document
        const tokenDoc = await admin.firestore().collection('unsubscribe_tokens').doc(token).get();

        if (!tokenDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Invalid unsubscribe token');
        }

        const tokenData = tokenDoc.data();

        // Check if token is expired
        if (tokenData.expiresAt < Date.now()) {
            throw new functions.https.HttpsError('failed-precondition', 'Unsubscribe token has expired');
        }

        // Check if token has already been used
        if (tokenData.used) {
            throw new functions.https.HttpsError('failed-precondition', 'Unsubscribe token has already been used');
        }

        // Mark token as used
        await admin.firestore().collection('unsubscribe_tokens').doc(token).update({
            used: true,
            usedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add email to unsubscribe list
        await admin.firestore().collection('unsubscribed_emails').doc(tokenData.email).set({
            email: tokenData.email,
            emailType: tokenData.emailType,
            unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
            tokenUsed: token
        });

        return {
            success: true,
            message: 'Successfully unsubscribed from emails',
            email: tokenData.email
        };
    } catch (error) {
        console.error('Error processing unsubscribe:', error);
        throw new functions.https.HttpsError('internal', 'Could not process unsubscribe request');
    }
});

/**
 * Check if an email is unsubscribed
 * @param {Object} data
 * @param {string} data.email - The email to check
 * @param {string} [data.emailType] - Type of email to check
 * @returns {Object} Unsubscribe status
 */
exports.checkUnsubscribeStatus = functions.https.onCall(async (data, context) => {
    const { email, emailType } = data;

    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    try {
        const emailDoc = await admin.firestore().collection('unsubscribed_emails').doc(email.toLowerCase()).get();

        if (!emailDoc.exists) {
            return { unsubscribed: false };
        }

        const unsubscribeData = emailDoc.data();

        // If emailType is specified, check if it matches
        if (emailType && unsubscribeData.emailType && unsubscribeData.emailType !== emailType) {
            return { unsubscribed: false };
        }

        return {
            unsubscribed: true,
            unsubscribedAt: unsubscribeData.unsubscribedAt,
            emailType: unsubscribeData.emailType
        };
    } catch (error) {
        console.error('Error checking unsubscribe status:', error);
        throw new functions.https.HttpsError('internal', 'Could not check unsubscribe status');
    }
}); 