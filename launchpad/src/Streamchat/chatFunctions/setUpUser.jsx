import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState, useEffect, useCallback, useRef } from 'react';
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
    const isConnectedRef = useRef(false);
    // const [userName, setUserName] = useState("");
    // const [userPfp, setUserPfp] = useState("");
    // const { userName, userPfpPreview } = JSON.parse(localStorage.getItem("basicUserInfo"));

    console.log('useStreamConnection hook state:', {
      isConnected,
      chatClientUserID: chatClient?.userID,
      chatClientExists: !!chatClient
    });

    const connectToStream = useCallback(async (user) => {
      console.log('Attempting to connect to Stream');
      console.log('Current chatClient.userID:', chatClient.userID);
      console.log('Current user:', user.uid);

      // Check if basicUserInfo exists in localStorage
      const basicUserInfoString = localStorage.getItem("basicUserInfo");
      if (!basicUserInfoString) {
        console.log('No basicUserInfo found in localStorage - user likely in onboarding');
        return;
      }

      const {userName, userPfpPreview} = JSON.parse(basicUserInfoString);

      if(chatClient.userID){
        setIsConnected(true);
        isConnectedRef.current = true;
      }

      if (!isConnectedRef.current && !chatClient.userID) {

        try {
          const token = await getStreamToken();
          await chatClient.connectUser(
            {
              id: user.uid,
              name: userName,
              image: userPfpPreview ?? null
            },
            token
          );
          console.log("Connected! chatClient.userID:", chatClient.userID);
          setIsConnected(true);
          isConnectedRef.current = true;
        } catch (error) {
          console.error('Error connecting to Stream:', error);
        }
      }
    }, []); // Remove isConnected from dependencies to prevent infinite loops

    // Update ref when state changes
    useEffect(() => {
      isConnectedRef.current = isConnected;
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