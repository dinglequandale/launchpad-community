const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendSESEmail = functions.https.onCall(async (data, context) => {
    const {recipient, subject, htmlTemplate, sender="noreply@launchpadhouston.com"} = data;


    if (!recipient || !subject || !htmlTemplate) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: recipient, subject, and htmlTemplate are required');
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(recipient)) {
    //     throw new functions.https.HttpsError('invalid-argument', 'Invalid recipient email format');
    // }

    try {
        const emailDoc = await admin.firestore().collection('mail').add({
            from: sender,
            to: recipient,
            message: {
                subject: subject,
                html: htmlTemplate,
            },
            // createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // status: 'pending',
            // type: 'ses'
        });

        console.log(`Email queued for sending with ID: ${emailDoc.id}`);
        
        return { 
            success: true, 
            message: 'Email queued for sending successfully',
            emailId: emailDoc.id
        };
    }
    catch(error) {
        console.log(error);
        throw new functions.https.HttpsError('internal', 'Error sending email: ' + error.message, error);
    }     
});