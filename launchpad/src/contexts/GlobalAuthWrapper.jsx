import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useStreamConnection } from '../Streamchat/chatFunctions/setUpUser';
import PageLoading from '../components/LoadingAnimation/PageLoading';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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
    if (loading) return undefined;

    if (!currentUser) {
      // Store the current location before redirecting to signup
      if (location.pathname !== '/' && location.pathname !== '/Login' && location.pathname !== '/Signup') {
        sessionStorage.setItem('intendedDestination', location.pathname);
      }
      navigate("/Signup");
      return undefined;
    }

    let cancelled = false;
    const userRef = doc(db, 'users', currentUser.uid);

    // NOTE: the previous implementation returned this cleanup from inside an async
    // function, so React never received it: every auth change stacked another
    // Firestore listener that was never removed (and kept firing after logout).
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (cancelled) return;
      if (!docSnap.exists()) {
        navigate("/Onboarding");
        return;
      }

      let data = docSnap.data();

      // Set active society from user's societies field
      if (data.societies && data.societies.length > 0) {
        const primarySociety = data.societyPrimary || data.societies[0];
        localStorage.setItem('activeSociety', primarySociety);
      }

      // For society users, fetch full data from society subcollection
      if (data.societyPrimary) {
        try {
          const societyDoc = await getDoc(doc(db, 'societies', data.societyPrimary, 'users', currentUser.uid));
          if (societyDoc.exists()) {
            data = societyDoc.data();
          }
        } catch (err) {
          console.error('Error fetching society user data:', err);
        }
      }
      if (cancelled) return;

      packageBasicUserInfoToLS(data);
      pushInitialProfileCompletion(data);
      fetchAndStoreConnections();

      // Stream needs the profile (name/picture) from localStorage. On a fresh
      // device that only exists after this first snapshot, so connect here as well;
      // connectToStream is a no-op once connected.
      await connectToStream(currentUser);
      if (!cancelled) setIsInitializing(false);
    }, (error) => {
      console.error("Error listening to user profile:", error);
      if (!cancelled) setIsInitializing(false);
    });

    // Returning users already have their profile cached; connect right away.
    connectToStream(currentUser).finally(() => {
      if (!cancelled && localStorage.getItem("basicUserInfo")) setIsInitializing(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [currentUser, loading, connectToStream, fetchAndStoreConnections, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Outlet context={{ chatClient, isConnected }} />
    </ModalProvider>
  );
}

export default GlobalAuthWrapper;