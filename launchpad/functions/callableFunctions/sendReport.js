const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendReport = functions.https.onCall(async (data, context) => {
    const { reportedUser, reportTarget, reportReason } = data;

    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can submit reports.');
    }

    try {
        // Create email template
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
                    border-bottom: 2px solid #e53e3e;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #e53e3e;
                    font-size: 24px;
                    margin: 0;
                }
                .report-details {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #e53e3e;
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
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>🚨 New Report Submission</h1>
                </div>
                
                <div class="report-details">
                    <p><span class="label">Report Type:</span> <span class="value">${reportTarget}</span></p>
                    <p><span class="label">Reported User/Organization:</span> <span class="value">${reportedUser}</span></p>
                    <p><span class="label">Report Reason:</span></p>
                    <p class="value" style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">${reportReason}</p>
                </div>
                
                <p><strong>Action Required:</strong> This report was submitted by a user on Launchpad. Please review and take appropriate action.</p>
                
                <div class="footer">
                    <p>Report submitted on: ${new Date().toLocaleString()}</p>
                    <p>Please investigate this matter promptly.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Create email document for MailGun
        const emailDoc = await admin.firestore().collection('mail').add({
            to: 'launchpadhelpline@gmail.com',
            message: {
                subject: `🚨 New Report: ${reportTarget} - ${reportedUser}`,
                html: emailTemplate,
            },
            from: 'no-reply@launchpadhouston.com',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            provider: 'mailgun',
            emailType: 'report',
            reportedUser: reportedUser,
            reportTarget: reportTarget,
            reportReason: reportReason,
            reporterId: context.auth.uid
        });

        // Log the report for tracking
        await admin.firestore().collection('reports').add({
            reportedUser: reportedUser,
            reportTarget: reportTarget,
            reportReason: reportReason,
            reporterId: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            emailId: emailDoc.id
        });

        return { 
            success: true, 
            message: 'Report submitted successfully',
            emailId: emailDoc.id
        };
    } catch (error) {
        console.error('Error sending report:', error);
        throw new functions.https.HttpsError('internal', 'Error submitting report: ' + error.message, error);
    }
});