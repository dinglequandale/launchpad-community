const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Helper function to get user description for email
 */
function getUserDescription(userData) {
    const { userType, college, highSchool, company, industry } = userData;

    if (userType === 'High Schooler') {
        return highSchool || 'High School Student';
    } else if (userType === 'College Student') {
        return college || 'College Student';
    } else if (userType === 'Professional') {
        if (company && industry) {
            return `${industry} at ${company}`;
        } else if (company) {
            return company;
        } else if (industry) {
            return industry;
        }
        return 'Professional';
    } else if (userType === 'Staff') {
        return company || 'School Staff';
    }

    return userType || 'Launchpad User';
}

/**
 * Generate unsubscribe token and link
 */
async function generateUnsubscribeLink(email, emailType) {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    // Store the unsubscribe token
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
        // Check if email is unsubscribed for this specific type or all emails
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
    // Default to true if not explicitly set to false
    return userData.emailNotificationsEnabled !== false;
}

/**
 * Firestore onCreate trigger for connection requests
 * Sends email notification to the target user when someone sends them a connection request
 */
exports.onConnectionCreated = functions.firestore
    .document('connections/{connectionId}')
    .onCreate(async (snap, context) => {
        const connectionData = snap.data();
        const { initiateUserId, targetUserId, status } = connectionData;

        // Only send notification for pending connection requests
        if (status !== 'pending') {
            console.log('Connection status is not pending, skipping notification');
            return null;
        }

        try {
            // Get initiator (sender) and target (recipient) user data
            const [initiatorDoc, targetDoc] = await Promise.all([
                db.collection('users').doc(initiateUserId).get(),
                db.collection('users').doc(targetUserId).get()
            ]);

            if (!initiatorDoc.exists || !targetDoc.exists) {
                console.error('User documents not found');
                return null;
            }

            const initiatorData = initiatorDoc.data();
            const targetData = targetDoc.data();

            // Check if target user has email notifications enabled
            const notificationsEnabled = await hasEmailNotificationsEnabled(targetUserId);
            if (!notificationsEnabled) {
                console.log(`User ${targetUserId} has email notifications disabled`);
                return null;
            }

            // Check if target user has unsubscribed
            const unsubscribed = await isUnsubscribed(targetData.email, 'connection_request');
            if (unsubscribed) {
                console.log(`User ${targetData.email} has unsubscribed from connection request emails`);
                return null;
            }

            // Generate unsubscribe link
            const unsubscribeLink = await generateUnsubscribeLink(targetData.email, 'connection_request');

            // Prepare email template data
            const recipientName = targetData.userName?.split(' ')[0] || 'there';
            const senderName = initiatorData.userName || 'A Launchpad user';
            const senderUserType = initiatorData.userType || 'User';
            const senderDescription = getUserDescription(initiatorData);
            const senderPfp = initiatorData.userPfpPreview || null;

            // Import email template (will be imported in Cloud Functions)
            // Note: We'll need to make the template available in functions directory
            const { connectionRequestEmailTemplate } = require('../utils/emailTemplates');

            const emailHtml = connectionRequestEmailTemplate(
                recipientName,
                senderName,
                senderUserType,
                senderDescription,
                senderPfp,
                unsubscribeLink
            );

            // Create email document for MailGun
            await db.collection('mail').add({
                to: targetData.email,
                message: {
                    subject: `${senderName} wants to connect with you on Launchpad`,
                    html: emailHtml,
                },
                from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                provider: 'mailgun',
                emailType: 'connection_request',
                unsubscribeLink,
                metadata: {
                    connectionId: context.params.connectionId,
                    initiatorId: initiateUserId,
                    targetId: targetUserId
                }
            });

            console.log(`Connection request email sent to ${targetData.email}`);
            return null;

        } catch (error) {
            console.error('Error sending connection request notification:', error);
            return null;
        }
    });

/**
 * Firestore onUpdate trigger for connection acceptance
 * Sends email notification to the initiator when their connection request is accepted
 */
exports.onConnectionStatusUpdated = functions.firestore
    .document('connections/{connectionId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();

        // Only send notification when status changes from pending to approved
        if (beforeData.status === 'pending' && afterData.status === 'approved') {
            const { initiateUserId, targetUserId } = afterData;

            try {
                // Get initiator (original requester) and target (accepter) user data
                const [initiatorDoc, targetDoc] = await Promise.all([
                    db.collection('users').doc(initiateUserId).get(),
                    db.collection('users').doc(targetUserId).get()
                ]);

                if (!initiatorDoc.exists || !targetDoc.exists) {
                    console.error('User documents not found');
                    return null;
                }

                const initiatorData = initiatorDoc.data();
                const targetData = targetDoc.data();

                // Check if initiator has email notifications enabled
                const notificationsEnabled = await hasEmailNotificationsEnabled(initiateUserId);
                if (!notificationsEnabled) {
                    console.log(`User ${initiateUserId} has email notifications disabled`);
                    return null;
                }

                // Check if initiator has unsubscribed
                const unsubscribed = await isUnsubscribed(initiatorData.email, 'connection_accepted');
                if (unsubscribed) {
                    console.log(`User ${initiatorData.email} has unsubscribed from connection accepted emails`);
                    return null;
                }

                // Generate unsubscribe link
                const unsubscribeLink = await generateUnsubscribeLink(initiatorData.email, 'connection_accepted');

                // Prepare email template data
                const recipientName = initiatorData.userName?.split(' ')[0] || 'there';
                const accepterName = targetData.userName || 'A Launchpad user';
                const accepterUserType = targetData.userType || 'User';
                const accepterDescription = getUserDescription(targetData);
                const accepterPfp = targetData.userPfpPreview || null;

                // Import email template
                const { connectionAcceptedEmailTemplate } = require('../utils/emailTemplates');

                const emailHtml = connectionAcceptedEmailTemplate(
                    recipientName,
                    accepterName,
                    accepterUserType,
                    accepterDescription,
                    accepterPfp,
                    unsubscribeLink
                );

                // Create email document for MailGun
                await db.collection('mail').add({
                    to: initiatorData.email,
                    message: {
                        subject: `${accepterName} accepted your connection request on Launchpad!`,
                        html: emailHtml,
                    },
                    from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'pending',
                    provider: 'mailgun',
                    emailType: 'connection_accepted',
                    unsubscribeLink,
                    metadata: {
                        connectionId: context.params.connectionId,
                        initiatorId: initiateUserId,
                        accepterId: targetUserId
                    }
                });

                console.log(`Connection accepted email sent to ${initiatorData.email}`);
                return null;

            } catch (error) {
                console.error('Error sending connection accepted notification:', error);
                return null;
            }
        }

        return null;
    });
