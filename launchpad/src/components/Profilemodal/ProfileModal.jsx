import React, { useEffect, useRef, useState } from 'react'
import { IoCloseOutline } from 'react-icons/io5'
import { BiFlag } from 'react-icons/bi'
import { FaLink } from 'react-icons/fa'
import { LuMapPin, LuCalendar, LuBriefcase, LuGraduationCap } from 'react-icons/lu'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { useConnections } from '../../contexts/ConnectionContext'
import { useReport } from '../../contexts/report/ReportContext'
import { useOutletContext } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import {
  displayColleges,
  displayFieldsOfInterest,
  displaySchools,
  getBasicUserDescription,
} from '../../services/userProfileServices'
import DefaultIcon from '../DefaultIcon/DefaultIcon'
import OrganizationProfile from '../Organizationprofile/OrganizationProfile'
import Loading from '../LoadingAnimation/Loading'
import { isConnectionApproved } from '../../services/connectionService'
import './profilemodal.css'

export default function ProfileModal({
  userData,
  visibility,
  onClose,
  handleReferalClick,
  chatClient,
}) {
  const { currentUser } = useAuth()
  const { openConnectModal, openParentalConnectionModal, isConnectModalOpen } = useModal()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { approved = [], parent_approved = [] } = useConnections()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const schoolId = localStorage.getItem('schoolId')
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified
  const hideConnectBtn = false // Always show connect button

  const isConnection =
    approved.some(conn => conn.targetUserId === userData?.userId || conn.initiateUserId === userData?.userId) ||
    parent_approved.some(conn => conn.targetUserId === userData?.userId || conn.initiateUserId === userData?.userId)

  const [opportunitiesData, setOpportunitiesData] = useState([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)
  const modalRef = useRef(null)
  const connectModalOpenRef = useRef(false)
  const closeTimeoutRef = useRef(null)

  // Track ConnectModal state
  useEffect(() => {
    connectModalOpenRef.current = isConnectModalOpen
    
    // Clear any pending close timeout when ConnectModal opens
    if (isConnectModalOpen && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [isConnectModalOpen])

  // Fetch opportunities
  useEffect(() => {
    if (!visibility || !schoolId || !userData?.userId) return

    const fetchOpportunities = async () => {
      setOpportunitiesLoading(true)
      try {
        const opportunitiesRef = collection(db, 'tenants', schoolId, 'opportunities')
        const userOpportunityQuery = query(opportunitiesRef, where('createdBy', '==', userData.userId))
        const snapshot = await getDocs(userOpportunityQuery)
        setOpportunitiesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error('Error fetching opportunities:', error)
      } finally {
        setOpportunitiesLoading(false)
      }
    }

    fetchOpportunities()
  }, [visibility, schoolId, userData?.userId])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        // Don't close if ConnectModal is open
        if (!connectModalOpenRef.current) {
          // Add a small delay to prevent immediate closing when ConnectModal closes
          closeTimeoutRef.current = setTimeout(() => {
            if (!connectModalOpenRef.current) {
              onClose()
            }
          }, 100)
        }
      }
    }

    if (visibility) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
      // Clear timeout on cleanup
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [visibility, onClose])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleConnect = () => {
    const isApproved = isConnectionApproved(
      userBasicInfo?.userType,
      currentUser,
      userData,
      parent_approved,
      approved,
      userBasicInfo?.parentVerified
    )
    
    if (!isApproved) {
      openParentalConnectionModal({ professionalData: userData })
    } else {
      openConnectModal({ userData, chat: chatClient })
    }
  }

  const handleReport = () => {
    setReportTarget('User')
    setReportVisibility(true)
    setReportedUser(userData?.userName)
    setShowReportUserName(false)
    onClose()
  }

  if (!visibility || !userData) return null

  const firstName = userData.userName?.split(' ')[0] || 'User'
  const userDescription = getBasicUserDescription(userData, false)

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal" ref={modalRef}>
        {/* Header */}
        <div className="profile-modal-header">
          <button className="profile-modal-action-btn" onClick={handleReport} title="Report user">
            <BiFlag size={18} />
          </button>
          <button className="profile-modal-close-btn" onClick={onClose} title="Close">
            <IoCloseOutline size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="profile-modal-section">
          <div className="profile-modal-avatar">
            {userData.userPfpPreview ? (
              <img src={userData.userPfpPreview || "/placeholder.svg"} alt={`${userData.userName}'s profile`} />
            ) : (
              <DefaultIcon size={80} />
            )}
          </div>
          
          <div className="profile-modal-info">
            <div className="profile-modal-name-row">
              <h1 className="profile-modal-name">{userData.userName}</h1>
              {isConnection && (
                <span className="profile-modal-connection-badge">Connected</span>
              )}
            </div>
            <p className="profile-modal-description">{userDescription}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="profile-modal-details">
          <div className="profile-modal-detail-item">
            <div className="profile-modal-detail-icon">
              {userData.userType === 'Professional' ? <LuBriefcase size={16} /> : <LuGraduationCap size={16} />}
            </div>
            <div className="profile-modal-detail-content">
              <span className="profile-modal-detail-label">
                {userData.userType !== 'Professional' ? 'Interests' : 'Expertise'}
              </span>
              <span className="profile-modal-detail-value">
                {displayFieldsOfInterest(userData.areasOfInterest || [], 'longer')}
              </span>
            </div>
          </div>

          <div className="profile-modal-detail-item">
            <div className="profile-modal-detail-icon">
              <LuMapPin size={16} />
            </div>
            <div className="profile-modal-detail-content">
              <span className="profile-modal-detail-label">
                {userData.userType === 'Professional' ? 'Position' : 
                 userData.userType === 'Alumni' ? 'College' : 
                 userData.collegeDecision === 'No' ? 'Dream Colleges' : 'Committed College'}
              </span>
              <span className="profile-modal-detail-value">
                {userData.userType === 'Professional' 
                  ? `${userData.industryPosition || 'Not specified'}${userData.companyName ? ` at ${userData.companyName}` : ''}`
                  : userData.userType === 'Alumni'
                  ? displayColleges([userData.collegeAttending])
                  : displayColleges(Array.isArray(userData.collegeInterestsOrDecision) 
                      ? userData.collegeInterestsOrDecision 
                      : [userData.collegeInterestsOrDecision])}
              </span>
            </div>
          </div>

          {userData.acceptedColleges?.length > 0 && (
            <div className="profile-modal-detail-item">
              <div className="profile-modal-detail-icon">
                <LuCalendar size={16} />
              </div>
              <div className="profile-modal-detail-content">
                <span className="profile-modal-detail-label">Accepted Colleges</span>
                <span className="profile-modal-detail-value">{userData.acceptedColleges}</span>
              </div>
            </div>
          )}

          {userData.linkedinLink && (
            <div className="profile-modal-detail-item">
              <div className="profile-modal-detail-icon">
                <FaLink size={16} />
              </div>
              <div className="profile-modal-detail-content">
                <span className="profile-modal-detail-label">LinkedIn</span>
                <span className="profile-modal-detail-value">
                  <a 
                    href={userData.linkedinLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-modal-linkedin-link"
                  >
                    View Profile
                  </a>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Connect Button */}
        {!hideConnectBtn && (
          <button 
            className={`profile-modal-connect-btn ${isConnection ? 'connected' : ''}`}
            onClick={handleConnect}
            disabled={disableActions || (userBasicInfo?.userType === 'Alumni' && userData?.userType === 'High Schooler')}
            title={
              disableActions 
                ? 'Parent/guardian approval required' 
                : userBasicInfo?.userType === 'Alumni' && userData?.userType === 'High Schooler'
                ? 'High Schoolers cannot connect with Alumni'
                : ''
            }
          >
            <FaLink size={18} />
            {isConnection ? 'Contact' : 'Connect'}
          </button>
        )}

        {/* Content Sections */}
        <div className="profile-modal-content">
          {/* Opportunities */}
          {opportunitiesLoading ? (
            <div className="profile-modal-loading-section">
              <Loading />
            </div>
          ) : opportunitiesData.length > 0 ? (
            <div className="profile-modal-content-section">
              <h3 className="profile-modal-section-title">Opportunities</h3>
              <div className="profile-modal-opportunities-grid">
                {opportunitiesData.map((opportunity) => (
                  <div key={opportunity.id} className="profile-modal-opportunity-card">
                    <OrganizationProfile
                      location="user_profile_public"
                      organizationData={opportunity}
                      handleReferalClick={handleReferalClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* About Me */}
          {userData.userAboutMe && (
            <div className="profile-modal-content-section">
              <h3 className="profile-modal-section-title">About</h3>
              <div className="profile-modal-about-card">
                <p>{userData.userAboutMe}</p>
              </div>
            </div>
          )}

          {/* Skills */}
          {userData.userSkills?.length > 0 && (
            <div className="profile-modal-content-section">
              <h3 className="profile-modal-section-title">Skills</h3>
              <div className="profile-modal-skills-container">
                {Object.entries(
                  userData.userSkills.reduce((acc, skill) => {
                    const category = skill.skillCategory || 'Other'
                    if (!acc[category]) acc[category] = []
                    acc[category].push(skill.skillDescription)
                    return acc
                  }, {})
                ).map(([category, skills]) => (
                  <div key={category} className="profile-modal-skill-category">
                    <h4 className="profile-modal-skill-category-title">{category}</h4>
                    <div className="profile-modal-skill-tags">
                      {skills.map((skill, index) => (
                        <span key={index} className="profile-modal-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {userData.userResumePreview && 
           (userData.userResumePreview.split(' ')[0] !== 'private' || userData.userType === 'Professional') && (
            <div className="profile-modal-content-section">
              <h3 className="profile-modal-section-title">Resume</h3>
              <div className="profile-modal-resume-container">
                <iframe
                  src={userData.userResumePreview.split(' ').pop()}
                  title="Resume"
                  className="profile-modal-resume-iframe"
                />
              </div>
            </div>
          )}

          {/* Commitment */}
          {userData.networkingLevel?.length > 0 && (
            <div className="profile-modal-content-section">
              <h3 className="profile-modal-section-title">{firstName}'s Availability</h3>
              <div className="profile-modal-commitment-tags">
                {userData.networkingLevel.map((level) => (
                  <span key={level} className="profile-modal-commitment-tag">{level}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}