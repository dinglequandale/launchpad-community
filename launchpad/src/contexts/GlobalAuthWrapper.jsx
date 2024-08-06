import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const [userData,setUserData] = useState(null);

  useEffect(() => {
    let unsubscribe;
    if(!currentUser){navigate("/Login")}
    const userRef = doc(db, 'users', currentUser.uid);
    async function initializeApp() {
      if (currentUser && !isConnected) {
        unsubscribe = onSnapshot(userRef, (doc) => {
          if (!doc.exists()) {
            navigate("/Onboarding");
            return;
          }

          // setUserData({...doc.data()});
        });
        
        await connectToStream(currentUser);
      }
      setIsInitializing(false);
    }

    if (!loading) {
      initializeApp();
    }

    return () => {
      if (unsubscribe) {
          unsubscribe();
      }
  };

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