import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { packageBasicUserInfoToLS } from '../services/onboardingServices';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  const [schoolId, setSchoolId] = useState("");
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const [userData,setUserData] = useState(null);
  const basicUserInfo = localStorage.getItem("basicUserInfo");

  const user = auth.currentUser;

  const getUserTokenInfo = async () => {
    const idTokenResult = await user.getIdTokenResult();
  
    // Access the school_id claim
    console.log("schoolId!!!!! ", idTokenResult.claims.school_id);
    return idTokenResult.claims.school_id;
  }

  useEffect(() => {
    let unsubscribe;
    const fetchUserTokenInfo = async () => {
      if (!currentUser) {
        navigate("/Login");
        return;
      }
  
      try {
        const schoolId = await getUserTokenInfo();
        if(!localStorage.getItem("schoolId")){localStorage.setItem("schoolId", schoolId);}
        const userRef = doc(db, "tenants", schoolId, 'users', currentUser.uid);
        async function initializeApp() {
          if (currentUser && !isConnected) {
            unsubscribe = onSnapshot(userRef, (doc) => {
              if (!doc.exists()) {
                navigate("/school-signup");
                return;
              }
              
              // if(!basicUserInfo){packageBasicUserInfoToLS(doc.data())};
              //IMPORTANT: Switch back later
              packageBasicUserInfoToLS(doc.data());
              
              console.log(basicUserInfo);
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
        // Rest of your code using userRef
      } catch (error) {
        console.error("Error fetching user token info:", error);
        navigate("/school-signup");
      }
    };
  
    fetchUserTokenInfo();
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