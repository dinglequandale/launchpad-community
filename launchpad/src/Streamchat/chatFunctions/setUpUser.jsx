import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from '../../contexts/auth/AuthContext';

// IMPORTANT TODO: call this on this to onboarding

export const getStreamToken = async () => {
    const getToken = httpsCallable(getFunctions(),"createStreamToken");
    try {
      const result = await getToken();
      if (result.data && result.data.token) {
        console.log("success!")
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

  const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

  export function useStreamConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const { currentUser } = useAuth();
  
    useEffect(() => {
      async function connectStreamUser() {
        if (currentUser && !isConnected && !chatClient.userID) {
          try {
            const token = await getStreamToken();
            
            await chatClient.connectUser(
              {
                id: currentUser.uid,
                // name: currentUser.displayName || "New User",
                // image: currentUser.photoURL || "/assets/default-avatar.jpg"
              },
              token
            ).then(()=>{
              setIsConnected(true);
            });
          } catch (error) {
            console.error('Error connecting to Stream:', error);
          }
        }
      }
  
      connectStreamUser();
  
      return () => {
        // chatClient.disconnectUser();
      };
    }, [currentUser]);
  
    return { chatClient, isConnected };
  }
  
  export function disconnectFromStream() {
    if (chatClient.userID) {
      chatClient.disconnectUser();
    }
  }
  