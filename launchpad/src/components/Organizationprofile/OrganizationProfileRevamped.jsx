import React, { useState, useEffect, useRef } from 'react'
import { Flag, ChevronDown, ChevronUp, ExternalLink, Send, Calendar, MapPin, DollarSign, Users, Clock, Building, GraduationCap, Briefcase } from 'lucide-react'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useReport } from '../../contexts/report/ReportContext'
import { useModal } from '../../contexts/ModalContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import { displayFieldsOfInterest } from '../../services/userProfileServices'
import { stableLinkCheck } from '../../services/opportunityServices'
import './OrganizationProfile.css'

export default function OrganizationProfile({
  organizationData,
  location,
  handleShowProfile,
  handleReferalClick,
  isPublished = true
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  
  const descRef = useRef()
  const { currentUser } = useAuth()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { openApplyModal } = useModal()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified

  // Process organization data
  const getName = () => {
    if (organizationData.organizationName) return organizationData.organizationName
    return `${organizationData.applicantPosition} at ${organizationData.organizationHostCompany}`
  }

  const organizationProfile = {
    name: getName(),
    type: organizationData.organizationType,
    host: organizationData.organizationHostCompany ?? organizationData.organizationHostStudent,
    description: organizationData.applicantExpectations ?? organizationData.organizationMission,
    logo: organizationData.organizationLogoPreview ?? '/assets/launchpad_logo_raw.png',
    createdBy: organizationData.createdBy,
    hostName: organizationData.createdByUserName,
    deadline: organizationData.deadline,
    startDate: organizationData.startDate,
    tags: organizationData.organizationTags?.length > 0 
      ? displayFieldsOfInterest(organizationData.organizationTags)
      : organizationData.applicantFieldOfWork 
        ? `${organizationData.applicantFieldOfWork}, ${organizationData.applicantPosition}`
        : null,
    logistics: organizationData.isPaid ? {
      compensation: organizationData.isPaid,
      eligibility: organizationData.applicants,
      location: organizationData.workLocation,
      duration: organizationData.timeFrame,
      timeCommitment: organizationData.timeCommitment
    } : null,
    apply: {
      method: organizationData.apply?.split(': ')[0],
      value: organizationData.apply?.split(': ')[1] && organizationData.apply.split(': ')[0] === 'Website'
        ? stableLinkCheck(organizationData.apply.split(': ')[1])
        : organizationData.apply?.split(': ')[1]
    },
    learnMore: {
      method: organizationData.learnMore?.split(': ')[0],
      value: organizationData.learnMore?.split(': ')[1] && organizationData.learnMore.split(': ')[0] === 'Website'
        ? stableLinkCheck(organizationData.learnMore.split(': ')[1])
        : organizationData.learnMore?.split(': ')[1]
    }
  }

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      if (!organizationProfile.createdBy) return
      
      try {
        const userSnap = await getDoc(doc(db, 'tenants', localStorage.getItem('schoolId'), 'users', organizationProfile.createdBy))
        if (userSnap.exists()) {
          setUserData({ id: userSnap.id, ...userSnap.data() })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    getUserData()
  }, [organizationProfile.createdBy])

  // Check if actions should be disabled
  useEffect(() => {
    if (!organizationData.createdBy && location !== 'organizations_page') {
      setIsDisabled(true)
    } else if (
      location !== 'organizations_page' && 
      location !== 'user_profile_public' && 
      organizationData.createdBy === currentUser?.uid
    ) {
      setIsDisabled(true)
    }
  }, [organizationData.createdBy, currentUser?.uid, location])

  // Check if description needs truncation
  useEffect(() => {
    if (descRef.current && descRef.current.scrollHeight > 120) {
      setShowFullDescription(false)
    } else {
      setShowFullDescription(true)
    }
  }, [organizationProfile.description])

  const getActionButtonText = (orgType) => {
    switch (orgType) {
      case 'Club': return 'Join'
      case 'Shadowing':
      case 'Job':
      case 'Internship':
      case 'Leadership': return 'Apply'
      case 'Nonprofit':
      case 'Business': return 'Contact'
      case 'Community Service': return 'Volunteer'
      default: return 'Contact'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Job':
      case 'Internship': return <Briefcase size={16} />
      case 'Club':
      case 'Leadership': return <Users size={16} />
      case 'Shadowing': return <GraduationCap size={16} />
      default: return <Building size={16} />
    }
  }

  const handleConnect = () => {
    if (organizationData.organizationHostCompany) {
      openApplyModal({
        requirements: organizationData.applicantRequirements,
        applyType: organizationProfile.apply.method,
        applyValue: organizationProfile.apply.value,
        orgName: organizationProfile.host,
        opportunityDetails: {
          format: organizationProfile.logistics?.location,
          eligibility: organizationProfile.logistics?.eligibility,
          compensation: organizationProfile.logistics?.compensation,
          duration: organizationProfile.logistics?.duration,
          startDate: organizationProfile.startDate,
          timeCommitment: organizationProfile.logistics?.timeCommitment,
          deadline: organizationProfile.deadline,
          learnMoreType: organizationProfile.learnMore.method,
          learnMoreValue: organizationProfile.learnMore.value,
          organizationType: organizationProfile.type,
        }
      })
    } else {
      handleReferalClick?.('apply', organizationProfile, userData)
    }
  }

  const handleLearnMore = () => {
    handleReferalClick?.('learnMore', organizationProfile, userData)
  }

  const handleHostClick = () => {
    if (handleShowProfile && userData) {
      handleShowProfile(userData)
    }
  }

  const handleReport = () => {
    setReportTarget('Organization')
    setReportedUser(organizationProfile.name)
    setShowReportUserName(false)
    setReportVisibility(true)
  }

  const getLayoutClass = () => {
    switch (location) {
      case 'organizations_page': return 'org-card-wide'
      case 'user_profile':
      case 'user_profile_public': return 'org-card-profile'
      default: return 'org-card-popup'
    }
  }

  return (
    <div className={`org-card ${getLayoutClass()}`}>
      {/* Status Banners */}
      {!isPublished && (
        <div className="org-status-banner unpublished">
          <span>Unpublished</span>
        </div>
      )}
      
      {organizationProfile.tags && isPublished && (
        <div className="org-status-banner relevance">
          <span>
            {['Shadowing', 'Job', 'Internship'].includes(organizationProfile.type) && 'Target fields: '}
            {organizationProfile.tags}
          </span>
        </div>
      )}

      {/* Report Button */}
      {location !== 'user_profile' && (
        <button className="org-report-btn" onClick={handleReport} title="Report organization">
          <Flag size={18} />
        </button>
      )}

      {/* Header */}
      <div className="org-header">
        <div className="org-logo">
          <img src={organizationProfile.logo || "/placeholder.svg"} alt={`${organizationProfile.name} logo`} />
        </div>
        
        <div className="org-info">
          <div className="org-title-row">
            <h3 className="org-name">{organizationProfile.name}</h3>
            <div className="org-type-badge">
              {getTypeIcon(organizationProfile.type)}
              <span>
                {organizationProfile.type}
                {!['Club', 'Initiative', 'Business'].includes(organizationProfile.type) && ' opportunity'}
              </span>
            </div>
          </div>
          
          {organizationProfile.host && (
            <p className="org-host">
              Run by{' '}
              <button 
                className="org-host-link" 
                onClick={handleHostClick}
                disabled={isDisabled}
              >
                {organizationProfile.hostName}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="org-description">
        <div 
          ref={descRef}
          className={`org-description-text ${!showFullDescription && !isExpanded ? 'truncated' : ''}`}
        >
          {organizationProfile.description}
        </div>
        
        {!showFullDescription && (
          <button 
            className="org-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Read more
              </>
            )}
          </button>
        )}
      </div>

      {/* Dates */}
      {(organizationProfile.deadline || organizationProfile.startDate) && (
        <div className="org-dates">
          {organizationProfile.deadline && (
            <div className="org-date-item">
              <Calendar size={16} />
              <span>
                <strong>Deadline:</strong> {organizationProfile.deadline}
              </span>
            </div>
          )}
          {organizationProfile.startDate && (
            <div className="org-date-item">
              <Calendar size={16} />
              <span>
                <strong>Start Date:</strong> {organizationProfile.startDate}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Logistics */}
      {organizationProfile.logistics && isExpanded && (
        <div className="org-logistics">
          <h4 className="org-logistics-title">Details</h4>
          <div className="org-logistics-grid">
            {organizationProfile.logistics.compensation && (
              <div className="org-logistics-item">
                <DollarSign size={16} />
                <span>{organizationProfile.logistics.compensation}</span>
              </div>
            )}
            {organizationProfile.logistics.eligibility && (
              <div className="org-logistics-item">
                <Users size={16} />
                <span>{organizationProfile.logistics.eligibility}</span>
              </div>
            )}
            {organizationProfile.logistics.location && (
              <div className="org-logistics-item">
                <MapPin size={16} />
                <span>{organizationProfile.logistics.location}</span>
              </div>
            )}
            {organizationProfile.logistics.duration && (
              <div className="org-logistics-item">
                <Clock size={16} />
                <span>{organizationProfile.logistics.duration}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="org-actions">
        <button 
          className="org-btn org-btn-secondary"
          onClick={handleLearnMore}
          disabled={disableActions}
          title={disableActions ? 'Parent/guardian approval required' : ''}
        >
          <ExternalLink size={16} />
          Learn More
        </button>
        
        {organizationData.apply !== 'NOAPPLY' && (
          <button 
            className="org-btn org-btn-primary"
            onClick={handleConnect}
            disabled={disableActions}
            title={disableActions ? 'Parent/guardian approval required' : ''}
          >
            <Send size={16} />
            {getActionButtonText(organizationProfile.type)}
          </button>
        )}
      </div>
    </div>
  )
}
