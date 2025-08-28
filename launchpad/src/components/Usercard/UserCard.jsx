import "./usercard.css";
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState } from "react";
import { FaLink } from "react-icons/fa6";
import {
  displayColleges,
  displayFieldsOfInterest,
  displayShortenedName,
  getBasicUserDescription,
} from "../../services/userProfileServices";
import DefaultIcon from "../DefaultIcon/DefaultIcon";
import { useConnections } from '../../contexts/ConnectionContext';
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../contexts/auth/AuthContext";
import { isConnectionApproved } from "../../services/connectionService";

/**
  Modernized User Card (v0 styling)
  - Preserves all logic and connection gating
  - Adopts white card, subtle border/shadow, rounded corners
*/
export default function UserCard({ userData, onProfileClick, onConnectClick, refreshKey = 0 }) {
  const [bannerVisibility, setBannerVisibility] = useState(false);
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections();
  const { currentUser } = useAuth();
  const { openParentalConnectionModal, openConnectModal } = useModal();

  const connectionStatus =
    approved.some((conn) => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId) ||
    parent_approved.some((conn) => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId);

  const [userBasicInfo, setUserBasicInfo] = useState(JSON.parse(localStorage.getItem('basicUserInfo') || '{}'));
  const viewingUserType = userBasicInfo.userType;
  const hideConnectBtn = false; // Always show connect button
  const disableActions = userBasicInfo && userBasicInfo.userType === 'High Schooler' && !userBasicInfo.parentVerified;

  const handleConnectClick = () => {
    const parentVerified = userBasicInfo.parentVerified;
    const isApproved = isConnectionApproved(
      viewingUserType,
      currentUser,
      userData,
      parent_approved,
      approved,
      parentVerified,
    );
    if (!isApproved) {
      openParentalConnectionModal({ professionalData: userData });
      return;
    }
    openConnectModal({ userData });
  };

  const descType = () => {
    switch (userData.userType) {
      case 'High Schooler':
        return userData.collegeDecision === 'No' ? 'Dream Colleges' : 'Committed College';
      case 'Alumni':
        return 'Attending College';
      case 'Professional':
        return 'Job';
      default:
        return '';
    }
  };

  const userType = userData.userType;
  const basicInfoContent = {
    userPreface: userType === 'Alumni' ? getBasicUserDescription(userData) : getBasicUserDescription(userData).split(' in ')[0],
    userFirstDesc: {
      label: userType !== 'Professional' ? 'Interests' : 'Expertise',
      content:
        userData.areasOfInterest && userData.areasOfInterest.length > 0
          ? displayFieldsOfInterest(userData.areasOfInterest, 'shorter')
          : displayFieldsOfInterest(userData.areasOfInterest, 'shorter'),
    },
    userSecondDesc: {
      label: descType(),
      content:
        userType === 'Professional'
          ? userData.industryPosition || 'None'
          : userType === 'Alumni'
          ? displayColleges([userData.collegeAttending], 'shorter')
          : Array.isArray(userData.collegeInterestsOrDecision)
          ? displayColleges([...userData.collegeInterestsOrDecision], 'shorter')
          : displayColleges([userData.collegeInterestsOrDecision]),
    },
  };

  const getButtonState = () => {
    // console.log('getButtonState debug:', { 
    //   connectionsLoading, 
    //   connectionStatus, 
    //   disableActions, 
    //   viewingUserType, 
    //   userDataUserType: userData.userType,
    //   condition: viewingUserType === 'Alumni' && userData.userType === 'High Schooler'
    // });
    
    if (connectionsLoading) {
      return { text: 'Loading...', disabled: true };
    }
    if (connectionStatus) {
      return { text: 'Contact', disabled: false };
    }
    if (disableActions) {
      return { text: 'Connect', disabled: true };
    }
    // For Alumni viewing High Schoolers, show connect button but disabled
    if (viewingUserType === 'Alumni' && userData.userType === 'High Schooler') {
      console.log('Alumni viewing High Schooler - button should be disabled');
      return { text: 'Connect', disabled: true };
    }
    return { text: 'Connect', disabled: false };
  };

  const buttonState = getButtonState();

  const handleSeeProfile = () => {
    onProfileClick(userData.userId, connectionStatus);
  };

  return (
    <div className="v0-user-card" style={{ height: Math.max(hideConnectBtn ? 120 : 172, 200) }}>
      {bannerVisibility && <ConnectionBanner />}
      <button className="v0-link-ghost" onClick={handleSeeProfile} aria-label="See Profile">
        See Profile
      </button>

      <div className="v0-user-top">
        <div className="v0-user-avatar">
          {userData.userPfpPreview ? (
            <img className="v0-user-pfp" src={userData.userPfpPreview || "/placeholder.svg"} alt="" />
          ) : (
            <DefaultIcon size={37} />
          )}
        </div>
        <div className="v0-user-meta">
          <div className="v0-user-name">{displayShortenedName(userData.userName)}</div>
          <div className="v0-user-subtitle">{basicInfoContent.userPreface}</div>
        </div>
      </div>

      <div className="v0-user-info">
        <div className="v0-ellipsed">
          <strong>{basicInfoContent.userFirstDesc.label}:</strong> {basicInfoContent.userFirstDesc.content}
        </div>
        <div className="v0-ellipsed">
          <strong>{basicInfoContent.userSecondDesc.label}:</strong> {basicInfoContent.userSecondDesc.content}
        </div>
      </div>

      {!hideConnectBtn && (
        <button
          className="v0-btn v0-btn-primary v0-btn-block"
          disabled={buttonState.disabled}
          title={
            disableActions
              ? 'Parent/guardian approval required'
              : viewingUserType === 'Alumni' && userData.userType === 'High Schooler'
              ? 'High Schoolers cannot connect with Alumni'
              : connectionStatus
              ? 'Contact'
              : 'Connect'
          }
          onClick={() => {
            if (!buttonState.disabled) handleConnectClick();
          }}
          style={{ 
            opacity: buttonState.disabled ? 0.6 : 1,
            cursor: buttonState.disabled ? 'not-allowed' : 'pointer'
          }}
        >
          <FaLink size={18} />
          <span>{buttonState.text}</span>
        </button>
      )}
    </div>
  );
}