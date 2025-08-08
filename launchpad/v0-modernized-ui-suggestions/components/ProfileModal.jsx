import React, { useEffect, useRef, useState } from 'react'
import { X, Flag, Link, MapPin, Calendar, Briefcase, GraduationCap } from 'lucide-react'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useModal } from '../../contexts/ModalContext'
import { useConnections } from '../../contexts/ConnectionContext'
import { useReport } from '../../contexts/report/ReportContext'
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
import './ProfileModal.css'

export default function ProfileModal({
  userData,
  visibility,
  onClose,
  handleReferalClick,
}) {
  const { currentUser } = useAuth()
  const { openConnectModal, openParentalConnectionModal } = useModal()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { approved = [], parent_approved = [] } = useConnections()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const schoolId = localStorage.getItem('schoolId')
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified
  const hideConnectBtn = userBasicInfo?.userType !== 'High Schooler' && userData?.userType === 'High Schooler'

  const isConnection =
    approved.some(conn => conn.targetUserId === userData?.userId || conn.initiateUserId === userData?.userId) ||
    parent_approved.some(conn => conn.targetUserId === userData?.userId || conn.initiateUserId === userData?.userId)

  const [opportunitiesData, setOpportunitiesData] = useState([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)
  const modalRef = useRef(null)

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
        onClose()
      }
    }

    if (visibility) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [visibility, onClose])

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
      openConnectModal({ userData })
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
            <Flag size={18} />
          </button>
          <button className="profile-modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            {userData.userPfpPreview ? (
              <img src={userData.userPfpPreview || "/placeholder.svg"} alt={`${userData.userName}'s profile`} />
            ) : (
              <DefaultIcon size={80} />
            )}
          </div>
          
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{userData.userName}</h1>
              {isConnection && (
                <span className="connection-badge">Connected</span>
              )}
            </div>
            <p className="profile-description">{userDescription}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="profile-details">
          <div className="detail-item">
            <div className="detail-icon">
              {userData.userType === 'Professional' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
            </div>
            <div className="detail-content">
              <span className="detail-label">
                {userData.userType !== 'Professional' ? 'Interests' : 'Expertise'}
              </span>
              <span className="detail-value">
                {displayFieldsOfInterest(userData.areasOfInterest || [], 'longer')}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon">
              <MapPin size={16} />
            </div>
            <div className="detail-content">
              <span className="detail-label">
                {userData.userType === 'Professional' ? 'Position' : 
                 userData.userType === 'Alumni' ? 'College' : 
                 userData.collegeDecision === 'No' ? 'Dream Colleges' : 'Committed College'}
              </span>
              <span className="detail-value">
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
            <div className="detail-item">
              <div className="detail-icon">
                <Calendar size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Accepted Colleges</span>
                <span className="detail-value">{userData.acceptedColleges}</span>
              </div>
            </div>
          )}
        </div>

        {/* Connect Button */}
        {!hideConnectBtn && (
          <button 
            className={`connect-btn ${isConnection ? 'connected' : ''}`}
            onClick={handleConnect}
            disabled={disableActions}
            title={disableActions ? 'Parent/guardian approval required' : ''}
          >
            <Link size={18} />
            {isConnection ? 'Contact' : 'Connect'}
          </button>
        )}

        {/* Content Sections */}
        <div className="profile-content">
          {/* Opportunities */}
          {opportunitiesLoading ? (
            <div className="loading-section">
              <Loading />
            </div>
          ) : opportunitiesData.length > 0 ? (
            <div className="content-section">
              <h3 className="section-title">
                {firstName} is offering opportunities
              </h3>
              <div className="opportunities-grid">
                {opportunitiesData.map((opportunity) => (
                  <div key={opportunity.id} className="opportunity-card">
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
            <div className="content-section">
              <h3 className="section-title">{firstName}'s About Me</h3>
              <div className="about-card">
                <p>{userData.userAboutMe}</p>
              </div>
            </div>
          )}

          {/* Skills */}
          {userData.userSkills?.length > 0 && (
            <div className="content-section">
              <h3 className="section-title">{firstName}'s Skills</h3>
              <div className="skills-container">
                {Object.entries(
                  userData.userSkills.reduce((acc, skill) => {
                    const category = skill.skillCategory || 'Other'
                    if (!acc[category]) acc[category] = []
                    acc[category].push(skill.skillDescription)
                    return acc
                  }, {})
                ).map(([category, skills]) => (
                  <div key={category} className="skill-category">
                    <h4 className="skill-category-title">{category}</h4>
                    <div className="skill-tags">
                      {skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
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
            <div className="content-section">
              <h3 className="section-title">{firstName}'s Resume</h3>
              <div className="resume-container">
                <iframe
                  src={userData.userResumePreview.split(' ').pop()}
                  title="Resume"
                  className="resume-iframe"
                />
              </div>
            </div>
          )}

          {/* Commitment */}
          {userData.networkingLevel?.length > 0 && (
            <div className="content-section">
              <h3 className="section-title">{firstName}'s Availability</h3>
              <div className="commitment-tags">
                {userData.networkingLevel.map((level) => (
                  <span key={level} className="commitment-tag">{level}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
