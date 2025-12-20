const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendFeedback = functions.https.onCall(async (data, context) => {
    const { feedbackType, feedbackDetails, attachments } = data;

    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can submit feedback.');
    }

    try {
        // Get user information
        const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        const userName = userData?.name || 'Anonymous User';
        const userEmail = userData?.email || context.auth.token.email || 'No email';

        // Build attachments HTML if there are any
        let attachmentsHTML = '';
        if (attachments && attachments.length > 0) {
            attachmentsHTML = `
                <div style="margin-top: 20px;">
                    <p class="label">Attachments:</p>
                    <div style="margin-top: 10px;">
                        ${attachments.map((url, index) => `
                            <div style="margin-bottom: 10px;">
                                <a href="${url}" target="_blank" style="color: #2c5282; text-decoration: none;">
                                    📎 Screenshot ${index + 1}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Get feedback icon based on type
        const feedbackIcon = {
            'Bug': '🐛',
            'Inconvenience': '⚠️',
            'Suggestion': '💡',
            'Other': '📝'
        }[feedbackType] || '📝';

        // Create email template
        const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Feedback Submission</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2c8bff;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #2c8bff;
                    font-size: 24px;
                    margin: 0;
                }
                .feedback-details {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #2c8bff;
                }
                .label {
                    font-weight: bold;
                    color: #2c5282;
                    display: inline-block;
                    min-width: 150px;
                }
                .value {
                    color: #4a5568;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #718096;
                    font-size: 14px;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    background-color: #e8f0fe;
                    color: #1967d2;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>${feedbackIcon} New Feedback Submission</h1>
                </div>

                <div class="feedback-details">
                    <p><span class="label">Feedback Type:</span> <span class="badge">${feedbackType}</span></p>
                    <p><span class="label">Submitted By:</span> <span class="value">${userName}</span></p>
                    <p><span class="label">User Email:</span> <span class="value">${userEmail}</span></p>
                    <p><span class="label">Feedback Details:</span></p>
                    <p class="value" style="margin-top: 10px; padding: 15px; background: white; border-radius: 4px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${feedbackDetails}</p>
                    ${attachmentsHTML}
                </div>

                <p><strong>User Feedback:</strong> A user has shared valuable feedback about Launchpad. Please review and consider for future improvements.</p>

                <div class="footer">
                    <p>Feedback submitted on: ${new Date().toLocaleString()}</p>
                    <p>Thank you for listening to our users!</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Create email document for MailGun
        const emailDoc = await admin.firestore().collection('mail').add({
            to: 'launchpadhelpline@gmail.com',
            message: {
                subject: `${feedbackIcon} New ${feedbackType} Feedback from ${userName}`,
                html: emailTemplate,
            },
            from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'feedback',
            feedbackType: feedbackType,
            feedbackDetails: feedbackDetails,
            attachments: attachments || [],
            userId: context.auth.uid,
            userName: userName,
            userEmail: userEmail
        });

        // Log the feedback for tracking
        await admin.firestore().collection('feedback').add({
            feedbackType: feedbackType,
            feedbackDetails: feedbackDetails,
            attachments: attachments || [],
            userId: context.auth.uid,
            userName: userName,
            userEmail: userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            emailId: emailDoc.id
        });

        return {
            success: true,
            message: 'Feedback submitted successfully',
            emailId: emailDoc.id
        };
    } catch (error) {
        console.error('Error sending feedback:', error);
        throw new functions.https.HttpsError('internal', 'Error submitting feedback: ' + error.message, error);
    }
});
