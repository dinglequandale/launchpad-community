import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      if (currentUser && !isConnected) {
        await connectToStream(currentUser);
      }
      setIsInitializing(false);
    }

    if (!loading) {
      console.log("Ello")
      initializeApp();
    }
  }, [currentUser, isConnected, connectToStream, loading]);

  if (loading || isInitializing) {
    return <PageLoading />;
  }

  if (!currentUser) {
    return <Navigate to="/Login" />;
  }

  if (!isConnected) {
    return <PageLoading />;
  }
  return <Outlet context={{ chatClient, isConnected }} />;
}

export default GlobalAuthWrapper;