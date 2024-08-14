const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 configuration

// TODO: change to bash CLI storing
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

exports.sendInviteEmail = functions.https.onCall(async (data, context) => {
    const { recipientData, senderName } = data;

    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send invitations.');
    }

    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'launchpad861@gmail.com',
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken,
            }
        });

        for(let i = 0 ; i < recipientData.length ; i++){
            const emailTemplate = `
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
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo img {
                        max-width: 200px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="logo">
                    <img src="/assets/launchpad_logo.png" alt="Launchpad Logo">
                </div>
                <h1>Welcome to Launchpad!</h1>
                <p>Greetings ${recipientData[i].userName.split(" ")[0]},</p>
                <p>You've been invited to our community by ${senderName}!</p>
                <p>Launchpad is a platform that fosters high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and other resourse, we empower our youth to strengthen their portfolio of work experience and extracurriculars.</p>
                <p>We're excited to have join us in our mission! Click the button below to get started:</p>
                <a href="https://launchpad.com/signup" class="button">Join Launchpad</a>
                <p>If you have any questions, feel free to reach out to our support team at support@launchpad.com.</p>
                <p>Best regards,<br>The Launchpad Team</p>
            </body>
            </html>
            `;

            // <ul>
            // <li>[Key feature 1]</li>
            // <li>[Key feature 2]</li>
            // <li>[Key feature 3]</li>
            // </ul>

            const mailOptions = {
                from: 'launchpad861@gmail.com',
                to: recipientData[i].email,
                subject: `${senderName} invites you to join Launchpad!`,
                html: emailTemplate
            };
            

            await transporter.sendMail(mailOptions);
        }

        return { success: true, message: 'Invitations sent successfully' };
    } catch (error) {
        console.error('Detailed error:', error);
        throw new functions.https.HttpsError('internal', 'Error sending invitations: ' + error.message, error);
    }
});

