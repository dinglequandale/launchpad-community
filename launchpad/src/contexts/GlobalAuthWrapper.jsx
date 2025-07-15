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
        const parentPendingResult = await getConnectionsByStatus(schoolId, 'pending_parental_approval');
        const parentApprovedResult = await getConnectionsByStatus(schoolId, 'parent_approved');
        // const approvedResult = await getConnectionsByStatus(schoolId, 'approved');
        // Extract user IDs from the connections
        const pendingUserIds = parentPendingResult.connections?.map(conn => 
          conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
        ) || [];
        
        const parentApprovedUserIds = parentApprovedResult.connections?.map(conn => 
          conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
        ) || [];

        // const approvedUserIds = approvedResult.connections?.map(conn => 
        //   conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
        // ) || [];

        
        localStorage.setItem('pendingConnections', JSON.stringify(pendingUserIds));
        localStorage.setItem('approvedConnections', JSON.stringify(parentApprovedUserIds));
        // localStorage.setItem('trueApprovedConnections', JSON.stringify(approvedUserIds));
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