const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.getEmail = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to access this function.'
      );
    }

    const uid = context.auth.uid;

    const userRecord = await admin.auth().getUser(uid);

    // Return the email address
    return {
      email: userRecord.email
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
