const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// When sending the email:

exports.generateVerificationLink = functions.https.onCall(async (data, context) => {
    const { uid, action, schoolId, targetUserId="", targetUserName="", userType="", targetUserType="" } = data;

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 * 2;
    const email = context.auth.token.email;
    
    try{
        if(action === 'verify_account'){
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

        if(action === 'connection'){
            // Generate a new connection ID for the centralized connection architecture
            const connectionRef = admin.firestore().collection('tenants').doc(schoolId).collection('connections').doc();
            const connectionId = connectionRef.id;
            
            // Create the connection document with pending_parental_approval status
            await connectionRef.set({
                initiateUserId: uid,
                targetUserId: targetUserId,
                status: 'pending_parental_approval',
                userType: userType,
                targetUserType: targetUserType,
                targetUserName: targetUserName,
                parentApprovalRequired: true,
                parentApprovalSentAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Create the verification token
            await admin.firestore().collection('tenants').
                doc(schoolId)
                .collection('parent_verification_tokens')
                .doc(token)
                .set(
                    {
                        studentId: uid,
                        studentEmail: email,
                        connectionId: connectionId,
                        connectionName: targetUserName,
                        targetUserId: targetUserId,
                        action: action,
                        expiresAt,
                        used: false
                    });

            return `https://launchpadhouston.com/parent-verify?token=${token}&mode=${action}&school=${schoolId}`;
        }

        throw new functions.https.HttpsError('invalid-argument', 'Invalid action. Must be "verify_account" or "connection"');
    }
    catch(e){
        console.log("error: ", e);
        throw new functions.https.HttpsError('internal', 'Could not generate verification link');
    }

});