const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { StreamChat } = require('stream-chat');

admin.initializeApp();

const serverClient = new StreamChat(
  process.env.STREAM_API_KEY,
  process.env.STREAM_SECRET
);

exports.createStreamToken = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const uid = context.auth.uid;
  // console.log('API Key:', process.env.STREAM_API_KEY);
  // console.log('Secret:', process.env.STREAM_SECRET);
  // console.log('User Authentication:', uid);
  try {
    
    console.log('Attempting to create Stream token');
    const streamToken = serverClient.createToken(uid);
    console.log('Stream token created successfully');

    return {
      success: true,
      token: streamToken,
      userId: uid
    };
  } catch (error) {
    console.log('Error in createStreamToken:', error);
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the Stream token');
  }

});

