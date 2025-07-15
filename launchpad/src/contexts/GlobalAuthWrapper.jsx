import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from '../services/onboardingServices';
import { getConnectionsByStatus } from '../services/connectionService';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  const [schoolId, setSchoolId] = useState("");
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const [userData,setUserData] = useState(null);
  const basicUserInfo = localStorage.getItem("basicUserInfo");

  const user = auth.currentUser;

  const getUserTokenInfo = useCallback(async () => {
    const idTokenResult = await user.getIdTokenResult();
    // console.log("schoolId!!!!! ", idTokenResult.claims.school_id);
    return idTokenResult.claims.school_id;
  }, [user]);

  const fetchAndStoreConnections = useCallback(async () => {
    try {
      const schoolId = localStorage.getItem("schoolId");
      if (schoolId) {
        const pending = await getConnectionsByStatus(schoolId, 'pending');
        const approved = await getConnectionsByStatus(schoolId, 'approved');
        localStorage.setItem('pendingConnections', JSON.stringify(pending));
        localStorage.setItem('approvedConnections', JSON.stringify(approved));
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, []);

  useEffect(() => {
    let unsubscribe;
    const fetchUserTokenInfo = async () => {
      if (!currentUser) {
        navigate("/Login");
        return;
      }
  
      try {
        const schoolId = await getUserTokenInfo();
        if(!localStorage.getItem("schoolId")){
          localStorage.setItem("schoolId", schoolId);
        }
        console.log("School id: ", schoolId, "UID: ", currentUser.uid);
        const userRef = doc(db, "tenants", schoolId, 'users', currentUser.uid);
        async function initializeApp() {
          if (currentUser && !isConnected) {
            unsubscribe = onSnapshot(userRef, (doc) => {
              if (!doc.exists()) {
                navigate("/Onboarding");
                return;
              }
              
              // if(!basicUserInfo){packageBasicUserInfoToLS(doc.data())};
              //IMPORTANT: Switch back later
              packageBasicUserInfoToLS(doc.data());
              pushInitialProfileCompletion(doc.data());

              // connections population logic (single subcollection)
              fetchAndStoreConnections();
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
      } catch (error) {
        console.error("Error fetching user token info:", error);
        navigate("/Onboarding");
      }
    };
  
    fetchUserTokenInfo();
  }, [currentUser, isConnected, connectToStream, loading, getUserTokenInfo, fetchAndStoreConnections, navigate]);

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