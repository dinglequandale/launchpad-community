import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { ModalProvider } from './ModalContext';
import { loadHighSchools } from '../services/highSchoolService';

function GlobalAuthWrapper() {
  const { currentUser, loading } = useAuth();
  // COMMUNITY VERSION: Removed schoolId state (no longer needed)
  const { chatClient, isConnected, connectToStream } = useStreamConnection();
  const [isInitializing, setIsInitializing] = useState(true);
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userData,setUserData] = useState(null);
  const basicUserInfo = localStorage.getItem("basicUserInfo");

  // Connection modal state
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectedUserData, setConnectedUserData] = useState(null);
  const [showVerifiedConnectionModal, setShowVerifiedConnectionModal] = useState(false);

  // Ensure loading screen displays for minimum 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimeElapsed(true);
    }, 3500); // 3.5 seconds to enjoy the rocket animation

    return () => clearTimeout(timer);
  }, []);

  // Initialize high school list cache on app load
  useEffect(() => {
    const initializeHighSchools = async () => {
      try {
        await loadHighSchools();
        console.log('✓ High schools loaded and cached');
      } catch (error) {
        console.error('Failed to load high schools:', error);
      }
    };

    initializeHighSchools();
  }, []);

  // Get connection data and modal functions
  // COMMUNITY VERSION: Removed parent approval states
  const {
    pending,
    approved,
    incomingRequests,
    loading: connectionsLoading,
    refetchConnections,
  } = useConnections();
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
    // This will be handled by the individual pages through their own modal context
    console.log('Profile click in GlobalAuthWrapper:', userData);
  };

  const user = auth.currentUser;

  // COMMUNITY VERSION: Removed getUserTokenInfo (no longer needed without custom claims)

  const fetchAndStoreConnections = useCallback(async () => {
    try {
      // COMMUNITY VERSION: Simplified connection fetching without parent approval states
      const approvedResult = await getConnectionsByStatus('approved');
      const approvedUserIds = approvedResult.connections?.map(conn =>
        conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
      ) || [];

      localStorage.setItem('approvedConnections', JSON.stringify(approvedUserIds));
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, []);

  // COMMUNITY VERSION: Simplified connection modal logic (no parent verification check)
  useEffect(() => {
    // Only run if we have basic user info and connections are loaded
    if (!basicUserInfo || connectionsLoading) return;

    const connectionSessionFlag = sessionStorage.getItem('connectionModalShown');
    const info = JSON.parse(basicUserInfo);

    if (info && !connectionSessionFlag) {
      const openConnectionModal = (pending.length > 0 || approved.length > 0);
      if(openConnectionModal){
        setShowConnectionModal(true);
        sessionStorage.setItem("connectionModalShown", "true");
      }
    }
  }, [basicUserInfo, pending, approved, connectionsLoading]);

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
    const initializeUser = async () => {
      if (!currentUser) {
        // Store the current location before redirecting to signup
        if (location.pathname !== '/' && location.pathname !== '/Login' && location.pathname !== '/Signup') {
          sessionStorage.setItem('intendedDestination', location.pathname);
        }
        navigate("/Signup");
        return;
      }

      try {
        // COMMUNITY VERSION: Removed tenant-based architecture and custom claims
        console.log("Initializing user UID: ", currentUser.uid);
        const userRef = doc(db, 'users', currentUser.uid);
        async function initializeApp() {
          if (currentUser && !isConnected) {
            unsubscribe = onSnapshot(userRef, (doc) => {
              if (!doc.exists()) {
                navigate("/Onboarding");
                return;
              }

              packageBasicUserInfoToLS(doc.data());
              pushInitialProfileCompletion(doc.data());

              // connections population logic
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
        console.error("Error initializing user:", error);
        navigate("/Onboarding");
      }
    };

    initializeUser();
  }, [currentUser, isConnected, connectToStream, loading, fetchAndStoreConnections, navigate]);

  // Show loading screen if: still loading OR minimum display time hasn't elapsed
  if (loading || isInitializing || !minLoadingTimeElapsed) {
    return <PageLoading />;
  }

  if (!currentUser) {
    return <Navigate to="/Signup" />;
  }

  if (!isConnected) {
    return <PageLoading />;
  }
  
  return (
    <ModalProvider chatClient={chatClient}>
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
      {showConnectionModal && !location.pathname.startsWith('/profile') && !location.pathname.startsWith('/organization') && (
        <ConnectionStatusModal
          onClose={() => setShowConnectionModal(false)}
          onConnect={handleOnConnectClick}
          handleProfileClick={handleOnProfileClick}
          pending={pending}
          approved={approved}
          incomingRequests={incomingRequests}
          refetchConnections={refetchConnections}
        />
      )}
      {console.log('GlobalAuthWrapper providing chatClient to Outlet:', {
        chatClient: !!chatClient,
        chatClientUserID: chatClient?.userID,
        isConnected,
        chatClientType: typeof chatClient
      })}
      <Outlet context={{ chatClient, isConnected }} />
    </ModalProvider>
  );
}

export default GlobalAuthWrapper;