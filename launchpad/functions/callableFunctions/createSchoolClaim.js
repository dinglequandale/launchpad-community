const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.createSchoolClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;
  const { schoolId } = data;

  try {
    if (!schoolId) {
      throw new functions.https.HttpsError('invalid-argument', 'School ID is required');
    }

    await admin.auth().setCustomUserClaims(uid, {
      school_id: schoolId
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

