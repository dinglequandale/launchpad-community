const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.deleteAuthUsers = functions.https.onRequest(async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;

    for (const user of users) {
      await admin.auth().deleteUser(user.uid);
      console.log(`Deleted user with UID: ${user.uid}`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Avoid rate limits
    }

    res.status(200).send('All users deleted successfully.');
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).send(`Error deleting users: ${error.message}`);
  }
});