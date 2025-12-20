const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Generate unsubscribe token and link
 */
async function generateUnsubscribeLink(email, emailType) {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await db.collection('unsubscribe_tokens').doc(token).set({
        email: email.toLowerCase(),
        emailType,
        expiresAt,
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return `https://launchpadhouston.com/unsubscribe?token=${token}`;
}

/**
 * Check if user has unsubscribed from a specific email type
 */
async function isUnsubscribed(email, emailType) {
    const unsubscribeDoc = await db.collection('unsubscribed_emails').doc(email.toLowerCase()).get();

    if (unsubscribeDoc.exists) {
        const unsubscribeData = unsubscribeDoc.data();
        if (!unsubscribeData.emailType || unsubscribeData.emailType === emailType) {
            return true;
        }
    }

    return false;
}

/**
 * Check if user has email notifications enabled
 */
async function hasEmailNotificationsEnabled(userId) {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
        return false;
    }

    const userData = userDoc.data();
    return userData.emailNotificationsEnabled !== false;
}

/**
 * Callable function to send email notification when a message is received
 * Called from client-side when a user sends a message
 */
exports.sendEmailNotifications = functions.https.onCall(async (data, context) => {
    try {
        const { receiverId, senderName, messagePreview } = data;
        console.log('Message notification request:', { receiverId, senderName });

        // Ensure the user is authenticated (message sender)
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send messages.');
        }

        // Get receiver's user data
        const receiverDoc = await db.collection('users').doc(receiverId).get();

        if (!receiverDoc.exists) {
            console.error('Receiver user document not found:', { receiverId });
            throw new functions.https.HttpsError('not-found', 'Receiver user not found');
        }

        const receiverData = receiverDoc.data();
        const receiverEmail = receiverData.email;

        if (!receiverEmail) {
            console.error('Receiver email not found in document:', { receiverId });
            throw new functions.https.HttpsError('not-found', 'Receiver email not found');
        }

        // Check if receiver has email notifications enabled
        const notificationsEnabled = await hasEmailNotificationsEnabled(receiverId);
        if (!notificationsEnabled) {
            console.log(`User ${receiverId} has email notifications disabled`);
            return { success: true, message: 'User has notifications disabled' };
        }

        // Check if receiver has unsubscribed from message notifications
        const unsubscribed = await isUnsubscribed(receiverEmail, 'new_message');
        if (unsubscribed) {
            console.log(`User ${receiverEmail} has unsubscribed from message notifications`);
            return { success: true, message: 'User has unsubscribed' };
        }

        // Generate unsubscribe link
        const unsubscribeLink = await generateUnsubscribeLink(receiverEmail, 'new_message');

        // Prepare email template data
        const recipientName = receiverData.userName?.split(' ')[0] || 'there';

        // Import email template
        const { newMessageEmailTemplate } = require('../utils/emailTemplates');

        const emailHtml = newMessageEmailTemplate(
            recipientName,
            senderName,
            messagePreview,
            unsubscribeLink
        );

        // Create email document for MailGun
        await db.collection('mail').add({
            to: receiverEmail,
            message: {
                subject: `${senderName} sent you a message on Launchpad`,
                html: emailHtml,
            },
            from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'new_message',
            unsubscribeLink,
            metadata: {
                senderId: context.auth.uid,
                receiverId,
                messagePreview: messagePreview.substring(0, 100)
            }
        });

        console.log(`Message notification email queued for ${receiverEmail}`);
        return { success: true, message: 'Email notification queued' };

    } catch (error) {
        console.error('Error in sendEmailNotifications:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
