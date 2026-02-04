const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendInviteEmail = functions.https.onCall(async (data, context) => {
    const { recipientData, senderName, schoolName } = data;

    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send invitations.');
    }

    try {
        // Create email template
        const createInviteEmailTemplate = (recipientName, senderName, schoolName) => {
            // Build school-aware text with fallbacks
            const communityText = schoolName
                ? `${schoolName}'s networking community`
                : `the Launchpad networking community`;
            const schoolCommunityText = schoolName
                ? `the ${schoolName} community`
                : `your school's community`;

            return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invitation to Launchpad</title>
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
                    .logo {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo img {
                        max-width: 200px;
                        height: auto;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #2c5282;
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .content p {
                        margin-bottom: 15px;
                        font-size: 16px;
                    }
                    .highlight {
                        background-color: #e6fffa;
                        border-left: 4px solid #38b2ac;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .button {
                        display: inline-block;
                        padding: 15px 30px;
                        background-color: #2c5282;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        text-align: center;
                        transition: background-color 0.3s ease;
                    }
                    .button:hover {
                        background-color: #2a4a7c;
                    }
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .benefits {
                        background-color: #f7fafc;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .benefits h3 {
                        color: #2c5282;
                        margin-bottom: 15px;
                    }
                    .benefits ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .benefits li {
                        margin-bottom: 8px;
                        color: #4a5568;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        color: #718096;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="logo">
                        <img src="https://launchpadhouston.com/assets/launchpad_logo.png" alt="Launchpad Logo">
                    </div>

                    <div class="header">
                        <h1>${senderName} invited you to join Launchpad</h1>
                    </div>

                    <div class="content">
                        <p>Hi there,</p>

                        <p>${senderName} has joined Launchpad and invited you to become part of ${communityText}!</p>

                        <div class="highlight">
                            <strong>What is Launchpad?</strong> Launchpad is a networking platform that connects Houston high schools' students, alumni, and parents. As a professional, you can offer mentorship, share career insights, and help students discover opportunities in your field. You can choose to connect only with students from ${schoolCommunityText}, or you can make your profile public to users from other Houston high school communities.
                        </div>

                        <div class="benefits">
                            <h3>Benefits of Joining:</h3>
                            <ul>
                                <li>Share your professional expertise with motivated students</li>
                                <li>Make a difference in students' career development</li>
                                <li>Connect with other professionals and parents</li>
                            </ul>
                        </div>

                        <p><strong>Ready to join?</strong></p>
                    </div>

                    <div class="button-container">
                        <a href="https://launchpadhouston.com" class="button">Join Launchpad Today</a>
                    </div>

                    <div class="content">
                        <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:launchpadhelpline@gmail.com">launchpadhelpline@gmail.com</a>.</p>

                        <p>Best regards,<br>
                        <strong>The Launchpad Team</strong></p>
                    </div>

                    <div class="footer">
                        <p>This invitation was sent by ${senderName} through Launchpad.</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        };

        // Build subject line with school name fallback
        const emailSubject = schoolName
            ? `${senderName} invited you to join ${schoolName}'s network on Launchpad!`
            : `${senderName} invited you to join Launchpad!`;

        // Process each recipient
        const emailPromises = recipientData.map(async (recipient, index) => {
            const emailTemplate = createInviteEmailTemplate(
                recipient.userName.split(" ")[0],
                senderName,
                schoolName || ''
            );

            // Create email document for MailGun
            return admin.firestore().collection('mail').add({
                to: recipient.email,
                message: {
                    subject: emailSubject,
                    html: emailTemplate,
                },
                from: 'Launchpad Networks <no-reply@launchpadhouston.com>',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'pending',
                provider: 'mailgun',
                emailType: 'invitation',
                senderName: senderName,
                senderId: context.auth.uid,
                recipientName: recipient.userName,
                recipientEmail: recipient.email
            });
        });

        const emailDocs = await Promise.all(emailPromises);
        const emailIds = emailDocs.map(doc => doc.id);

        // Log the invitation batch for tracking
        await admin.firestore().collection('invitation_batches').add({
            senderId: context.auth.uid,
            senderName: senderName,
            recipientsCount: recipientData.length,
            recipients: recipientData.map(r => ({ name: r.userName, email: r.email })),
            emailIds: emailIds,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });

        return { 
            success: true, 
            message: `Invitations sent successfully to ${recipientData.length} recipients`,
            emailIds: emailIds,
            recipientsCount: recipientData.length
        };
    } catch (error) {
        console.error('Error sending invitations:', error);
        throw new functions.https.HttpsError('internal', 'Error sending invitations: ' + error.message, error);
    }
});