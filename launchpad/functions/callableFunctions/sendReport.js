const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

exports.sendReport = functions.https.onCall(async (data, context) => {
    const { reportedUser, reportTarget, reportReason } = data;

    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can submit reports.');
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

        const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Report Submission</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .report-details {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .label {
                    font-weight: bold;
                    color: #2c5282;
                }
            </style>
        </head>
        <body>
            <h2>New Report Submission</h2>
            <div class="report-details">
                <p><span class="label">Report Type:</span> ${reportTarget}</p>
                <p><span class="label">Reported User/Organization:</span> ${reportedUser}</p>
                <p><span class="label">Report Reason:</span></p>
                <p>${reportReason}</p>
            </div>
            <p>This report was submitted by a user on Launchpad. Please review and take appropriate action.</p>
        </body>
        </html>
        `;

        const mailOptions = {
            from: 'launchpad861@gmail.com',
            to: 'launchpadhelpline@gmail.com',
            subject: `New Report: ${reportTarget} - ${reportedUser}`,
            html: emailTemplate
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Report submitted successfully' };
    } catch (error) {
        console.error('Error sending report:', error);
        throw new functions.https.HttpsError('internal', 'Error submitting report: ' + error.message, error);
    }
}); 