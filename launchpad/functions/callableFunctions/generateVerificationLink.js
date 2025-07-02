const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// When sending the email:

exports.generateVerificationLink = functions.https.onCall(async (data, context) => {
    const { uid, action, schoolId, connectionId="", connectionName="" } = data;

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 * 2;
    const email = context.auth.token.email;
    
    try{
        if(!connectionId){
            await admin.firestore().collection('tenants').
                doc(schoolId)
                .collection('parent_verification_tokens')
                .doc(token)
                .set(
                    {
                        studentId: uid,
                        studentEmail: email,
                        action: action,
                        expiresAt,
                        used: false,
                    });

            return `https://launchpadhouston.com/parent-verify?token=${token}&mode=${action}&school=${schoolId}`;
        }

        await admin.firestore().collection('tenants').
                doc(schoolId)
                .collection('parent_verification_tokens')
                .doc(token)
                .set(
                    {
                        studentId: uid,
                        studentEmail: email,
                        connectionId: connectionId,
                        connectionName: connectionName,
                        action: action,
                        expiresAt,
                        used: false
                    });

        return `https://launchpadhouston.com/parent-verify?token=${token}&mode=${action}&school=${schoolId}`;
    }
    catch(e){
        console.log("error: ", e);
        throw new functions.https.HttpsError('internal', 'Could not generate verification link');
    }

});