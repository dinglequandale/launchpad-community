const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.verifyParentToken = functions.https.onCall(async (data, context) => {
    console.log('verifyParentToken called with data:', data);
    const { token, decision, schoolId, parentName="" } = data;

    try {
        const tokenDoc = await admin.firestore().collection('tenants').doc(schoolId).collection('parent_verification_tokens').doc(token).get();
        console.log('tokenDoc.exists:', tokenDoc.exists);
        if (!tokenDoc.exists) {
            console.error('Token document does not exist or is expired.');
            throw new functions.https.HttpsError('invalid-argument', 'Invalid or expired link.');
        }
        const tokenData = tokenDoc.data();
        console.log('tokenData:', tokenData);

        if (tokenData.used || Date.now() > tokenData.expiresAt) {
            console.error('Token expired or already used.');
            throw new functions.https.HttpsError('invalid-argument', 'Link expired or already used.');
        }

        console.log('tokenData.action:', tokenData.action);
        if (tokenData.action === 'verify_account') {
            await admin.firestore().collection('tenants').doc(schoolId).collection("users").doc(tokenData.studentId).update({
                parentVerified: true,
                parentName: parentName,
                parentVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Parent verified for student:', tokenData.studentId);
        } else if (tokenData.action === 'connection') {
            // Update connection in the centralized connections collection
            await admin.firestore().collection('tenants').doc(schoolId).collection("connections").doc(tokenData.connectionId).update({
                status: decision === 'yes' ? "parent_approved" : "rejected",
                parentApprovedAt: admin.firestore.FieldValue.serverTimestamp(),
                parentDecision: decision,
                parentName: parentName
            });
            console.log('Connection status updated for connection:', tokenData.connectionId);
        } else {
            console.warn('Unknown action:', tokenData.action);
        }

        await tokenDoc.ref.update({ used: true });
        console.log('Token marked as used.');

        return { email: tokenData.studentEmail, success: true, connectionName: tokenData.connectionName };
    } catch (error) {
        console.error('Error in verifyParentToken:', error);
        throw error;
    }
});