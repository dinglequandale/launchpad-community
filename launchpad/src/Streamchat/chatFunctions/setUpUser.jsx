import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamChat } from 'stream-chat';

// IMPORTANT TODO: call this on this to onboarding

export const getStreamToken = async () => {
    const getToken = httpsCallable(getFunctions(),"createStreamToken");
    try {
      const result = await getToken();
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

  const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
  let connectPromise = null;

  export function useStreamConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const isConnectedRef = useRef(false);
    // const [userName, setUserName] = useState("");
    // const [userPfp, setUserPfp] = useState("");
    // const { userName, userPfpPreview } = JSON.parse(localStorage.getItem("basicUserInfo"));

    const connectToStream = useCallback(async (user) => {
      // Check if basicUserInfo exists in localStorage
      const basicUserInfoString = localStorage.getItem("basicUserInfo");
      if (!basicUserInfoString) {
        console.log('No basicUserInfo found in localStorage - user likely in onboarding');
        return;
      }

      const {userName, userPfpPreview} = JSON.parse(basicUserInfoString);

      // The Stream client is a module-level singleton. If a different account was
      // connected in this tab (logout -> login without a reload), disconnect it first;
      // otherwise the new user would be handed the previous user's chat session.
      if (chatClient.userID && chatClient.userID !== user.uid) {
        await chatClient.disconnectUser();
        connectPromise = null;
      }

      if (chatClient.userID === user.uid && !connectPromise) {
        setIsConnected(true);
        isConnectedRef.current = true;
        return;
      }

      // De-duplicate concurrent calls (GlobalAuthWrapper may call this twice on load).
      if (!connectPromise) {
        connectPromise = (async () => {
          const token = await getStreamToken();
          if (!token) {
            throw new Error('Could not obtain a chat token');
          }
          await chatClient.connectUser(
            {
              id: user.uid,
              name: userName,
              image: userPfpPreview ?? null
            },
            token
          );
        })();
      }

      try {
        await connectPromise;
        setIsConnected(true);
        isConnectedRef.current = true;
      } catch (error) {
        connectPromise = null;
        console.error('Error connecting to Stream:', error);
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
    connectPromise = null;
    if (chatClient.userID) {
      return chatClient.disconnectUser();
    }
    return Promise.resolve();
  }