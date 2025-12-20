const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

exports.sendSESEmail = functions.https.onCall(async (data, context) => {
    const {recipient, subject, htmlTemplate, sender="no-reply@launchpadhouston.com", emailType="general"} = data;

    if (!recipient || !subject || !htmlTemplate) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: recipient, subject, and htmlTemplate are required');
    }

    try {
        // Generate unsubscribe link for each recipient
        const unsubscribeLinks = [];
        for (const email of recipient) {
            // Check if email is already unsubscribed
            const unsubscribeDoc = await admin.firestore().collection('unsubscribed_emails').doc(email.toLowerCase()).get();
            
            if (unsubscribeDoc.exists) {
                const unsubscribeData = unsubscribeDoc.data();
                // Skip sending if email is unsubscribed for this email type
                if (!unsubscribeData.emailType || unsubscribeData.emailType === emailType) {
                    console.log(`Skipping email to ${email} - already unsubscribed`);
                    continue;
                }
            }

            // Generate unsubscribe token
            const token = crypto.randomUUID();
            const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

            // Store the unsubscribe token
            await admin.firestore().collection('unsubscribe_tokens').doc(token).set({
                email: email.toLowerCase(),
                emailType,
                expiresAt,
                used: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const unsubscribeLink = `https://launchpadhouston.com/unsubscribe?token=${token}`;
            unsubscribeLinks.push({ email, unsubscribeLink });
        }

        // If no valid recipients, return early
        if (unsubscribeLinks.length === 0) {
            return { 
                success: true, 
                message: 'No valid recipients (all unsubscribed)',
                emailId: null
            };
        }

        // Create email documents for each recipient with their unsubscribe link
        const emailPromises = unsubscribeLinks.map(async ({ email, unsubscribeLink }) => {
            // Replace unsubscribe placeholder in template if it exists
            let personalizedTemplate = htmlTemplate;
            if (htmlTemplate.includes('${unsubscribeLink}')) {
                personalizedTemplate = htmlTemplate.replace(/\${unsubscribeLink}/g, unsubscribeLink);
            }

            return admin.firestore().collection('mail').add({
                to: email,
                message: {
                    subject: subject,
                    html: personalizedTemplate,
                },
                // Mailgun specific fields
                from: `Launchpad Networks <${sender}>`,
                // Additional metadata for tracking
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                // Specify Mailgun as the provider
                provider: 'mailgun',
                // Store unsubscribe link for reference
                unsubscribeLink,
                emailType
            });
        });

        const emailDocs = await Promise.all(emailPromises);
        const emailIds = emailDocs.map(doc => doc.id);

        console.log(`Emails queued for sending with IDs: ${emailIds.join(', ')}`);
        
        return { 
            success: true, 
            message: 'Emails queued for sending successfully',
            emailIds: emailIds,
            recipientsCount: unsubscribeLinks.length
        };
    }
    catch(error) {
        console.log(error);
        throw new functions.https.HttpsError('internal', 'Error sending email: ' + error.message, error);
    }     
});