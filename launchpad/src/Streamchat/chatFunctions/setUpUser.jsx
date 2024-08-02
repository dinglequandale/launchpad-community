import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState, useEffect, useCallback } from 'react';
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
    // const [userName, setUserName] = useState("");
    // const [userPfp, setUserPfp] = useState("");
    const { userName, userPfpPreview } = JSON.parse(localStorage.getItem("basicUserInfo"));

    // console.log(isConnected, chatClient.userID)

    const connectToStream = useCallback(async (user) => {
      console.log('Attempting to connect to Stream');
      console.log('Current chatClient.userID:', chatClient.userID);
      console.log('Current user:', user.uid);

      if(chatClient.userID){
        setIsConnected(true);
      }

      if (!isConnected && !chatClient.userID) {
        
        try {
          const token = await getStreamToken();
          await chatClient.connectUser(
            {
              id: user.uid,
              name: userName,
              image: userPfpPreview ?? "/assets/awty-logo.jpg"
            },
            token
          );
          console.log("Connected!")
          setIsConnected(true);
        } catch (error) {
          console.error('Error connecting to Stream:', error);
        }
      }
    }, [isConnected]);


    // unload the user when they close their session
    useEffect(() => {
      const handleBeforeUnload = () => {
        if (isConnected) {
          chatClient.disconnectUser();
        }
      };
  
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [isConnected]);  
  
    return { chatClient, isConnected, connectToStream };
  }

  export function disconnectFromStream() {
    if (chatClient.userID) {
      chatClient.disconnectUser();
    }
  }