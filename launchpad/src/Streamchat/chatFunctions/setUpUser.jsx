import { getFunctions, httpsCallable } from 'firebase/functions';
import { StreamChat } from 'stream-chat';

const chatClient = StreamChat.getInstance(import.meta.env.STREAM_API_KEY);

// IMPORTANT TODO: call this on this to onboarding

export const getStreamToken = async () => {
    const getStreamToken = httpsCallable(getFunctions(),"createStreamToken");
    try {
      const result = await getStreamToken();
      if (result.data && result.data.token) {
        return result.data.token;
      } else {
        console.error('Failed to get token:', result.data);
        return null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }

  }

export async function setupStreamUser(userId, userName="Anonymous") {
    const userToken = await getStreamToken();

    try {
        await chatClient.connectUser(
        {
            id: userId,
            name: userName,
            // You can add other user data here, such as:
            // image: 'https://example.com/user-image.jpg',
        },
        userToken
        );

        console.log('User connected to Stream Chat successfully');


        // const channel = chatClient.channel('messaging', `welcome-${userId}`, {
        // name: 'Welcome Channel',
        // members: [userId],
        // });

        // await channel.create();

        return { success: true };
    } catch (error) {
        console.error('Error setting up Stream user:', error);
        return { success: false, error: error.message };
    } finally {
        // Disconnect the client after setup
        await chatClient.disconnectUser();
    }
}