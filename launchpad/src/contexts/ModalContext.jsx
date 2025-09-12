import React, { createContext, useContext, useState } from 'react';
import OpportunityApplyModal from '../components/OpportunityApplyModal/OpportunityApplyModal';
import ProfileModal from '../components/Profilemodal/ProfileModal';
import ConnectModal from '../components/Connectmodal/ConnectModal';
import ParentalConnectionModal from '../components/ParentalConnectionModal';
import LogoutVerificationModal from '../components/Logoutbutton/LogoutVerificationModal';

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [applyModalProps, setApplyModalProps] = useState(null);
  const [profileModalProps, setProfileModalProps] = useState(null);
  const [connectModalProps, setConnectModalProps] = useState(null);
  const [parentalModalProps, setParentalModalProps] = useState(null);
  const [logoutModalProps, setLogoutModalProps] = useState(null);

  // Opportunity Apply Modal
  const openApplyModal = (props) => setApplyModalProps(props);
  const closeApplyModal = () => setApplyModalProps(null);

  // Profile Modal
  const openProfileModal = (props) => setProfileModalProps(props);
  const closeProfileModal = () => setProfileModalProps(null);

  // Connect Modal
  const openConnectModal = (props) => setConnectModalProps(props);
  const closeConnectModal = () => setConnectModalProps(null);

  // Parental Connection Modal
  const openParentalConnectionModal = (props) => setParentalModalProps(props);
  const closeParentalConnectionModal = () => setParentalModalProps(null);

  // Logout Verification Modal
  const openLogoutModal = (props) => setLogoutModalProps(props);
  const closeLogoutModal = () => setLogoutModalProps(null);

  return (
    <ModalContext.Provider value={{
      openApplyModal, closeApplyModal,
      openProfileModal, closeProfileModal,
      openConnectModal, closeConnectModal,
      openParentalConnectionModal, closeParentalConnectionModal,
      openLogoutModal, closeLogoutModal,
      // Add modal state for checking if modals are open
      isApplyModalOpen: !!applyModalProps,
      isProfileModalOpen: !!profileModalProps,
      isConnectModalOpen: !!connectModalProps,
      isParentalModalOpen: !!parentalModalProps,
      isLogoutModalOpen: !!logoutModalProps
    }}>
      {children}
      {applyModalProps && (
        <OpportunityApplyModal
          {...applyModalProps}
          isOpen={!!applyModalProps}
          onClose={closeApplyModal}
        />
      )}
      {profileModalProps && (
        <ProfileModal
          {...profileModalProps}
          visibility={!!profileModalProps}
          onClose={closeProfileModal}
        />
      )}
      {connectModalProps && (
        <ConnectModal
          {...connectModalProps}
          visibility={!!connectModalProps}
          onClose={closeConnectModal}
          chat={connectModalProps.chat}
        />
      )}
      {parentalModalProps && (
        <ParentalConnectionModal
          {...parentalModalProps}
          onClose={closeParentalConnectionModal}
        />
      )}
      {logoutModalProps && (
        <LogoutVerificationModal
          {...logoutModalProps}
          visibility={!!logoutModalProps}
          onCancel={closeLogoutModal}
          onVerify={logoutModalProps.onVerify}
        />
      )}
    </ModalContext.Provider>
  );
} 