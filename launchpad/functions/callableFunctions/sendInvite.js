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
                Greetings ${recipientData[i].userName.split(" ")[0]},

                You've been invited to our amazing app by ${senderName}!
                
                Blah blah blah
            `;

            const mailOptions = {
                from: 'launchpad861@gmail.com',
                to: recipientData[i].email,
                subject: `${senderName}'s Invitation to Launchpad`,
                text: emailTemplate
            };

            await transporter.sendMail(mailOptions);
        }

        return { success: true, message: 'Invitations sent successfully' };
    } catch (error) {
        console.error('Detailed error:', error);
        throw new functions.https.HttpsError('internal', 'Error sending invitations: ' + error.message, error);
    }
});

