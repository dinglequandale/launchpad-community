const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const { StreamChat } = require('stream-chat');
// const sgMail = require('../config/sendgrid');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// admin.initializeApp() is automatically called by Firebase Functions runtime

// const serverClient = new StreamChat(
//   process.env.STREAM_API_KEY,
//   process.env.STREAM_SECRET
// );

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Function to send email notification
exports.sendEmailNotifications = functions.https.onCall(async (data, context) => {
    try {
        const { receiverId, senderName, messagePreview, schoolId } = data;
        console.log('Received data:', { receiverId, senderName, schoolId });
        
        // Get user's email from Firestore
        const userDoc = await admin.firestore().collection('tenants').doc(schoolId).collection('users').doc(receiverId).get();
        
        if (!userDoc.exists) {
            console.error('User document not found:', { receiverId, schoolId });
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const userEmail = userData.email;
        
        if (!userEmail) {
            console.error('User email not found in document:', { receiverId, schoolId });
            throw new Error('User email not found');
        }
        
        await sendEmailNotification(userEmail, senderName, messagePreview);
        return { success: true };
    } catch (error) {
        console.error('Error in sendEmailNotifications:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

async function sendEmailNotification(userEmail, senderName, messagePreview) {
  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'launchpad861@gmail.com',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
    }
  });

  const mailOptions = {
    from: 'launchpad861@gmail.com',
    to: userEmail,
    subject: `New unread message from ${senderName}`,
    html: `
        <h2>You have an unread message</h2>
        <p>${senderName} sent you a message:</p>
        <p><em>${messagePreview}</em></p>
        <p>Click here to view the message: <a href="${process.env.APP_URL}/messages">View Message</a></p>
        `
    };

  // const msg = {
  //   to: userEmail,
  //   from: process.env.SENDGRID_FROM_EMAIL,
  //   subject: `New unread message from ${senderName}`,
  //   html: `
  //     <h2>You have an unread message</h2>
  //     <p>${senderName} sent you a message:</p>
  //     <p><em>${messagePreview}</em></p>
  //     <p>Click here to view the message: <a href="${process.env.APP_URL}/messages">View Message</a></p>
  //   `
  // };

  try {
    // Send email using SendGrid
    // await sgMail.send(msg);

    await transporter.sendMail(mailOptions);

    await admin.firestore().collection('emailNotifications').add({
      to: userEmail,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      messagePreview,
      senderName
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Function to check for unread messages and send notifications
// exports.checkUnreadMessages = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
//   try {
//     // Get all channels
//     const channels = await serverClient.queryChannels({
//       type: 'messaging'
//     });

//     for (const channel of channels) {
//       // Get channel members
//       const members = await channel.queryMembers();
      
//       for (const member of members.members) {
//         // Skip if member is the sender
//         if (member.user_id === channel.state.messages[channel.state.messages.length - 1]?.user?.id) {
//           continue;
//         }

//         // Get user's last read timestamp
//         const lastRead = channel.state.read[member.user_id]?.last_read;
//         const lastMessage = channel.state.messages[channel.state.messages.length - 1];

//         if (!lastRead || new Date(lastMessage.created_at) > new Date(lastRead)) {
//           // Check if we've already sent a notification for this message
//           const notificationRef = admin.firestore().collection('messageNotifications')
//             .where('channelId', '==', channel.id)
//             .where('messageId', '==', lastMessage.id)
//             .where('recipientId', '==', member.user_id);

//           const existingNotification = await notificationRef.get();

//           if (existingNotification.empty) {
//             // Get user's email from Firestore
//             const userDoc = await admin.firestore().collection('users').doc(member.user_id).get();
//             const userData = userDoc.data();

//             if (userData && userData.email) {
//               // Send email notification
//               await sendEmailNotification(
//                 userData.email,
//                 lastMessage.user.name || 'Someone',
//                 lastMessage.text || 'Sent you a message'
//               );

//               // Record that we sent a notification
//               await admin.firestore().collection('messageNotifications').add({
//                 channelId: channel.id,
//                 messageId: lastMessage.id,
//                 recipientId: member.user_id,
//                 sentAt: admin.firestore.FieldValue.serverTimestamp()
//               });
//             }
//           }
//         }
//       }
//     }

//     return null;
//   } catch (error) {
//     console.error('Error in checkUnreadMessages:', error);
//     return null;
//   }
// }); 