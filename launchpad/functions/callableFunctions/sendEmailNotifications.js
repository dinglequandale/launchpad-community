const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { requireAuth, sanitizeHeader, enforceRateLimit, toHttpsError } = require('../utils/security');
const {
    generateUnsubscribeLink,
    isUnsubscribed,
    hasEmailNotificationsEnabled,
} = require('../utils/unsubscribe');
const { newMessageEmailTemplate } = require('../utils/emailTemplates');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function haveConnection(userA, userB) {
    const ref = db.collection('connections');
    const [a, b] = await Promise.all([
        ref.where('initiateUserId', '==', userA).where('targetUserId', '==', userB).limit(1).get(),
        ref.where('initiateUserId', '==', userB).where('targetUserId', '==', userA).limit(1).get(),
    ]);
    return !a.empty || !b.empty;
}

/**
 * Email a user that they received a message.
 *
 * SECURITY: previously any signed-in user could make the platform email ANY user
 * with an arbitrary sender name and message body. Now the caller must have a
 * connection (pending or approved) with the receiver, the sender name comes from
 * the caller's own profile, and calls are rate limited.
 */
exports.sendEmailNotifications = functions.https.onCall(async (data, context) => {
    const senderId = requireAuth(context, 'Only authenticated users can send messages.');
    const { receiverId, messagePreview } = data || {};

    if (typeof receiverId !== 'string' || !receiverId || receiverId.includes('/')) {
        throw new functions.https.HttpsError('invalid-argument', 'receiverId is required');
    }
    if (receiverId === senderId) {
        return { success: true, message: 'No notification for self-messages' };
    }

    try {
        if (!(await haveConnection(senderId, receiverId))) {
            throw new functions.https.HttpsError('permission-denied', 'You can only notify users you are connected with.');
        }

        await enforceRateLimit(`messageNotification:${senderId}`, { limit: 30, windowSeconds: 60 * 60 });

        const [receiverDoc, senderDoc] = await Promise.all([
            db.collection('users').doc(receiverId).get(),
            db.collection('users').doc(senderId).get(),
        ]);

        if (!receiverDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Receiver user not found');
        }

        const receiverData = receiverDoc.data();
        const receiverEmail = receiverData.email;
        if (!receiverEmail) {
            return { success: true, message: 'Receiver has no email on file' };
        }

        if (!(await hasEmailNotificationsEnabled(receiverId))) {
            return { success: true, message: 'User has notifications disabled' };
        }
        if (await isUnsubscribed(receiverEmail, 'new_message')) {
            return { success: true, message: 'User has unsubscribed' };
        }

        const unsubscribeLink = await generateUnsubscribeLink(receiverEmail, 'new_message');
        const recipientName = receiverData.userName?.split(' ')[0] || 'there';
        const senderName = (senderDoc.exists && senderDoc.data().userName) || 'A Launchpad user';
        const preview = typeof messagePreview === 'string' ? messagePreview.slice(0, 300) : '';

        await db.collection('mail').add({
            to: receiverEmail,
            message: {
                subject: sanitizeHeader(`${senderName} sent you a message on Launchpad`),
                html: newMessageEmailTemplate(recipientName, senderName, preview, unsubscribeLink),
            },
            from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'new_message',
            unsubscribeLink,
            metadata: {
                senderId,
                receiverId,
                messagePreview: preview.substring(0, 100),
            },
        });

        return { success: true, message: 'Email notification queued' };
    } catch (error) {
        throw toHttpsError(error, 'Error sending message notification');
    }
});
