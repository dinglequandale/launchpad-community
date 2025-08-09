import React, { useState, useEffect, useRef } from 'react'
import { IoCloseOutline, IoChevronDown, IoFlag, IoCalendar, IoLocation, IoTime, IoPerson } from 'react-icons/io5'
import { LuMapPin, LuCalendar, LuBriefcase, LuGraduationCap, LuUsers, LuBuilding, LuBookOpen, LuAward, LuGlobe, LuHeart, LuTarget, LuZap, LuChevronDown, LuChevronUp } from 'react-icons/lu'
import './organizationprofile.css'
import { useModal } from '../../contexts/ModalContext'
import { useReport } from '../../contexts/report/ReportContext'
import { useAuth } from '../../contexts/auth/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import { displayFieldsOfInterest } from '../../services/userProfileServices'
import { stableLinkCheck } from '../../services/opportunityServices'

export default function OrganizationProfile({ organizationData, location, handleShowProfile, handleReferalClick, isPublished = true }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  
  const descRef = useRef()
  const { currentUser } = useAuth()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { openApplyModal } = useModal()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified

  // Process organization data to match expected structure
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
  }, [organizationData.createdBy, location, currentUser?.uid])

  // Check if description needs expansion
  useEffect(() => {
    if (descRef.current && descRef.current.clientHeight <= 16 * 8) {
      setIsDescriptionExpanded(true)
    }
  }, [organizationProfile.description])

  const getActionButtonText = (orgType) => {
    switch(orgType){
      case "Club":
        return "Join";
      case "Shadowing":
      case "Job":
      case "Internship":
      case "Leadership":
        return "Apply";
      case "Nonprofit":
      case "Business":
        return "Contact Us";
      case "Community Service":
        return "Volunteer";
      default:
        return "Contact Us";
    }
  }

  const getTypeIcon = (type) => {
    const iconMap = {
      'Internship': <LuBriefcase size={16} />,
      'Scholarship': <LuAward size={16} />,
      'Program': <LuBookOpen size={16} />,
      'Event': <LuUsers size={16} />,
      'Competition': <LuTarget size={16} />,
      'Workshop': <LuZap size={16} />,
      'Conference': <LuGlobe size={16} />,
      'Mentorship': <LuHeart size={16} />,
      'Research': <LuGraduationCap size={16} />,
      'Other': <LuBuilding size={16} />
    }
    return iconMap[type] || <LuBuilding size={16} />
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
      handleReferalClick?.('apply', organizationData, userData)
    }
  }

  const handleLearnMore = () => {
    handleReferalClick?.('learnMore', organizationData, userData)
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
    if (location === 'organizations_page') return 'v0-organization-wide'
    return 'v0-organization-popup'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const hasLogistics = organizationProfile.logistics

  return (
    <div className={`v0-organization-card ${getLayoutClass()}`}>
      {/* Status Banners */}
      {!isPublished && (
        <div className="v0-unpublished-banner">Unpublished</div>
      )}
      {organizationProfile.tags && isPublished && (
        <div className="v0-relevance-banner">
          {['Shadowing', 'Job', 'Internship'].includes(organizationProfile.type) && 'Target fields: '}
          {organizationProfile.tags}
        </div>
      )}

      {/* Report Button */}
      {location !== 'user_profile' && (
        <button className="v0-report-button" onClick={handleReport} aria-label="Report Organization">
          <IoFlag size={18} />
        </button>
      )}

      {/* Organization Logo */}
      <div className="v0-organization-logo">
        <img src={organizationProfile.logo} alt="Organization Logo" />
      </div>

      <div className="v0-organization-content">
        <div className="v0-organization-title-row">
          <div className="v0-organization-title-content">
            <h3 className="v0-organization-name">
              {organizationProfile.name}
            </h3>
            <div className="v0-organization-type-badge">
              {getTypeIcon(organizationProfile.type)}
              {organizationProfile.type}
              {!['Club', 'Initiative', 'Business'].includes(organizationProfile.type) && ' opportunity'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="v0-organization-description">
          <div 
            ref={descRef}
            className={`v0-description-text ${!isDescriptionExpanded && !isExpanded ? 'contracted' : 'expanded'}`}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ cursor: 'pointer' }}
          >
            {organizationProfile.description}
          </div>
        </div>

        {/* Content Container with Fixed Height */}
        <div className={`v0-organization-content-container ${isContentExpanded ? 'expanded' : 'contracted'}`}>
          {/* Dates and Organizer Info - only show in wide contexts */}
          {(location === 'organizations_page') && (organizationProfile.startDate || organizationProfile.deadline || organizationProfile.host) && (
            <div className="v0-organization-dates">
              {organizationProfile.startDate && (
                <div className="v0-date-item">
                  <IoCalendar size={16} />
                  <strong>Start Date:</strong> {formatDate(organizationProfile.startDate)}
                </div>
              )}
              {organizationProfile.deadline && (
                <div className="v0-date-item">
                  <IoTime size={16} />
                  <strong>Deadline:</strong> {formatDate(organizationProfile.deadline)}
                </div>
              )}
              {organizationProfile.host && (
                <div className="v0-organizer-item">
                  <IoPerson size={16} />
                  <strong>Organizer:</strong> 
                  <button className="v0-organizer-link" onClick={handleHostClick} disabled={isDisabled}>
                    {organizationProfile.hostName}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Logistics Section */}
          {hasLogistics && isExpanded && (
            <div className="v0-organization-logistics">
              <h4 className="v0-logistics-title">Details</h4>
              <div className="v0-logistics-grid">
                {organizationProfile.logistics.compensation && (
                  <div className="v0-logistic-item">
                    <LuBriefcase size={16} />
                    <span>{organizationProfile.logistics.compensation}</span>
                  </div>
                )}
                {organizationProfile.logistics.eligibility && (
                  <div className="v0-logistic-item">
                    <LuUsers size={16} />
                    <span>{organizationProfile.logistics.eligibility}</span>
                  </div>
                )}
                {organizationProfile.logistics.location && (
                  <div className="v0-logistic-item">
                    <LuMapPin size={16} />
                    <span>{organizationProfile.logistics.location}</span>
                  </div>
                )}
                {organizationProfile.logistics.duration && (
                  <div className="v0-logistic-item">
                    <LuCalendar size={16} />
                    <span>{organizationProfile.logistics.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button - only show if there's content to expand */}
        {(location === 'organizations_page') && (organizationProfile.startDate || organizationProfile.deadline || organizationProfile.host || hasLogistics) && (
          <button 
            className={`v0-organization-expand-btn ${isContentExpanded ? 'expanded' : ''}`}
            onClick={() => setIsContentExpanded(!isContentExpanded)}
          >
            {isContentExpanded ? (
              <>
                <LuChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <LuChevronDown size={16} />
                Show More
              </>
            )}
          </button>
        )}

        {/* Action Buttons */}
        <div className="v0-organization-actions">
          <button 
            className="v0-btn v0-btn-secondary" 
            onClick={handleLearnMore}
            disabled={disableActions}
            title={disableActions ? 'Parent/guardian approval required' : ''}
          >
            Learn More
          </button>
          {organizationData.apply !== "NOAPPLY" && (
            <button 
              className="v0-btn v0-btn-primary" 
              onClick={handleConnect}
              disabled={disableActions}
              title={disableActions ? 'Parent/guardian approval required' : ''}
            >
              {getActionButtonText(organizationProfile.type)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}