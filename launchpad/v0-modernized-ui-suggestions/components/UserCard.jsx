import React from 'react'
import { Link, MapPin, User } from 'lucide-react'
import { useConnections } from '../../contexts/ConnectionContext'
import { useModal } from '../../contexts/ModalContext'
import { useAuth } from '../../contexts/auth/AuthContext'
import {
  displayColleges,
  displayFieldsOfInterest,
  displayShortenedName,
  getBasicUserDescription,
} from '../../services/userProfileServices'
import DefaultIcon from '../DefaultIcon/DefaultIcon'
import { isConnectionApproved } from '../../services/connectionService'
import './UserCard.css'

export default function UserCard({ userData, onProfileClick, onConnectClick }) {
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections()
  const { currentUser } = useAuth()
  const { openParentalConnectionModal, openConnectModal } = useModal()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const viewingUserType = userBasicInfo.userType
  const hideConnectBtn = viewingUserType !== 'High Schooler' && userData.userType === 'High Schooler'
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified

  const connectionStatus =
    approved.some(conn => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId) ||
    parent_approved.some(conn => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId)

  const handleConnect = () => {
    const isApproved = isConnectionApproved(
      viewingUserType,
      currentUser,
      userData,
      parent_approved,
      approved,
      userBasicInfo?.parentVerified
    )
    
    if (!isApproved) {
      openParentalConnectionModal({ professionalData: userData })
    } else {
      openConnectModal({ userData })
    }
  }

  const handleProfileClick = () => {
    onProfileClick(userData.userId, connectionStatus)
  }

  const getInterests = () => {
    return userData.areasOfInterest?.length > 0 
      ? displayFieldsOfInterest(userData.areasOfInterest, 'shorter')
      : 'Not specified'
  }

  const getLocation = () => {
    switch (userData.userType) {
      case 'Professional':
        return userData.industryPosition || 'Professional'
      case 'Alumni':
        return displayColleges([userData.collegeAttending], 'shorter')
      case 'High Schooler':
        const colleges = Array.isArray(userData.collegeInterestsOrDecision) 
          ? userData.collegeInterestsOrDecision 
          : [userData.collegeInterestsOrDecision]
        return displayColleges(colleges, 'shorter')
      default:
        return 'Student'
    }
  }

  const getButtonState = () => {
    if (connectionsLoading) return { text: 'Loading...', disabled: true }
    if (connectionStatus) return { text: 'Contact', disabled: false }
    if (disableActions) return { text: 'Connect', disabled: true }
    return { text: 'Connect', disabled: false }
  }

  const buttonState = getButtonState()

  return (
    <div className="user-card">
      <button className="user-card-profile-btn" onClick={handleProfileClick}>
        View Profile
      </button>

      <div className="user-card-header">
        <div className="user-card-avatar">
          {userData.userPfpPreview ? (
            <img src={userData.userPfpPreview || "/placeholder.svg"} alt={`${userData.userName}'s profile`} />
          ) : (
            <DefaultIcon size={48} />
          )}
        </div>
        
        <div className="user-card-info">
          <h3 className="user-card-name">{displayShortenedName(userData.userName)}</h3>
          <p className="user-card-role">{getBasicUserDescription(userData).split(' in ')[0]}</p>
          {connectionStatus && (
            <span className="user-card-badge">Connected</span>
          )}
        </div>
      </div>

      <div className="user-card-details">
        <div className="user-card-detail">
          <User size={14} />
          <span className="detail-text">{getInterests()}</span>
        </div>
        <div className="user-card-detail">
          <MapPin size={14} />
          <span className="detail-text">{getLocation()}</span>
        </div>
      </div>

      {!hideConnectBtn && (
        <button
          className={`user-card-connect-btn ${connectionStatus ? 'connected' : ''}`}
          onClick={handleConnect}
          disabled={buttonState.disabled}
          title={
            disableActions ? 'Parent/guardian approval required' :
            connectionStatus ? 'Contact this person' : 'Send connection request'
          }
        >
          <Link size={16} />
          {buttonState.text}
        </button>
      )}
    </div>
  )
}
