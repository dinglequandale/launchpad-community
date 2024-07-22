import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';

function GlobalAuthWrapper() {
  const { currentUser } = useAuth();
  const { chatClient, isConnected } = useStreamConnection();

  if (!currentUser) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/Login" />;
  }


  // TODO: revamp loading
  if (!isConnected) {
    return <div>Connecting to chat...</div>;
  }

  return <Outlet context={{ chatClient, isConnected }} />;
}

export default GlobalAuthWrapper;
