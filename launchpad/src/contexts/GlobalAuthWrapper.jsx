import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { packageBasicUserInfoToLS, pushInitialProfileCompletion } from '../services/onboardingServices';
import { getConnectionsByStatus } from '../services/connectionService';
import ConnectionStatusModal from '../components/ConnectionStatusModal';
import ConnectModal from '../components/Connectmodal/ConnectModal';
import { useConnections } from './ConnectionContext';
import { useModal } from './ModalContext';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  const [schoolId, setSchoolId] = useState("");
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const [userData,setUserData] = useState(null);
  const basicUserInfo = localStorage.getItem("basicUserInfo");
  
  // Connection modal state
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectedUserData, setConnectedUserData] = useState(null);
  const [showVerifiedConnectionModal, setShowVerifiedConnectionModal] = useState(false);
  
  // Get connection data and modal functions
  const {
    pending,
    pending_parental_approval,
    parent_approved,
    approved,
    incomingRequests,
    loading: connectionsLoading,
    refetchConnections,
  } = useConnections();
  const { openProfileModal, openConnectModal } = useModal();

  // Connection modal handlers
  const handleOnConnectClick = async (connectingUserData) => {
    console.log('GlobalAuthWrapper handleOnConnectClick called with:', {
      connectingUserData,
      chatClient: !!chatClient,
      isConnected,
      chatClientUserID: chatClient?.userID
    });
    
    setConnectedUserData(connectingUserData);
    setShowVerifiedConnectionModal(true);
  };

  const handleOnProfileClick = (userData) => {
    openProfileModal({userData, onConnectClick: handleOnConnectClick});
  };

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

  // Connection modal logic - show once per session
  useEffect(() => {
    // Only run if we have basic user info and connections are loaded
    if (!basicUserInfo || connectionsLoading) return;
    
    const connectionSessionFlag = sessionStorage.getItem('connectionModalShown');
    const info = JSON.parse(basicUserInfo);
    
    if (
      (info &&
      info.userType === 'High Schooler' &&
      info.parentVerified &&
      !connectionSessionFlag) ||
      (info && info.userType !== 'High Schooler' && !connectionSessionFlag)
    ) {
      const openConnectionModal = info.userType === "High Schooler" ? (pending.length > 0 ||
        pending_parental_approval.length > 0 ||
        parent_approved.length > 0 ||
        approved.length > 0) : (pending.length > 0 ||
          approved.length > 0);
      if(openConnectionModal){
        setShowConnectionModal(true);
        sessionStorage.setItem("connectionModalShown", "true");
      }
    }
  }, [basicUserInfo, pending, pending_parental_approval, parent_approved, approved, connectionsLoading]);

  // Listen for notification click events from TopBar
  useEffect(() => {
    const handleShowConnectionModal = () => {
      setShowConnectionModal(true);
    };

    window.addEventListener('showConnectionModal', handleShowConnectionModal);
    return () => {
      window.removeEventListener('showConnectionModal', handleShowConnectionModal);
    };
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
        localStorage.setItem("schoolId", schoolId);
        console.log("School id: ", localStorage.getItem("schoolId"), "UID: ", currentUser.uid);
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
  
  return (
    <>
      {showVerifiedConnectionModal && (
        <>
          {console.log('GlobalAuthWrapper rendering ConnectModal with:', {
            chatClient: !!chatClient,
            chatClientUserID: chatClient?.userID,
            isConnected,
            connectedUserData: connectedUserData?.userId
          })}
          <ConnectModal 
            onClose={() => setShowVerifiedConnectionModal(false)} 
            userData={connectedUserData} 
            visibility={showVerifiedConnectionModal} 
            chat={chatClient} 
            userId={connectedUserData?.userId}
          />
        </>
      )}
      {showConnectionModal && (
        <ConnectionStatusModal
          onClose={() => setShowConnectionModal(false)}
          onConnect={handleOnConnectClick}
          handleProfileClick={handleOnProfileClick}
          pending={pending}
          pending_parental_approval={pending_parental_approval}
          parent_approved={parent_approved}
          approved={approved}
          incomingRequests={incomingRequests}
        />
      )}
      {console.log('GlobalAuthWrapper providing chatClient to Outlet:', {
        chatClient: !!chatClient,
        chatClientUserID: chatClient?.userID,
        isConnected,
        chatClientType: typeof chatClient
      })}
      <Outlet context={{ chatClient, isConnected }} />
    </>
  );
}

export default GlobalAuthWrapper;