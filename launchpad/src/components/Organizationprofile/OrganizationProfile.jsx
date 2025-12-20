import React, { useState, useEffect, useRef } from 'react'
import { IoCloseOutline, IoChevronDown, IoFlag, IoCalendar, IoLocation, IoTime, IoPerson } from 'react-icons/io5'
import { LuMapPin, LuCalendar, LuBriefcase, LuGraduationCap, LuUsers, LuBuilding, LuBookOpen, LuAward, LuGlobe, LuHeart, LuTarget, LuZap, LuChevronDown, LuChevronUp } from 'react-icons/lu'
import './OrganizationProfile.css'
import { useModal } from '../../contexts/ModalContext'
import { useReport } from '../../contexts/report/ReportContext'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import { displayFieldsOfInterest } from '../../services/userProfileServices'
import { stableLinkCheck } from '../../services/opportunityServices'
import toast from 'react-hot-toast'

export default function OrganizationProfile({ organizationData, location, handleShowProfile, handleReferalClick, isPublished = true, isPreview = false, hideHeartButton = false }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [needsExpandButton, setNeedsExpandButton] = useState(false)

  const descRef = useRef()
  const contentRef = useRef()
  const { currentUser } = useAuth()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { openApplyModal } = useModal()
  const navigate = useNavigate()

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
    collaborators: organizationData.collaborators || [],
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
        // COMMUNITY VERSION: Use flat collection path
        const userSnap = await getDoc(doc(db, 'users', organizationProfile.createdBy))
        if (userSnap.exists()) {
          setUserData({ id: userSnap.id, ...userSnap.data() })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    getUserData()
  }, [organizationProfile.createdBy])

  // Check if this opportunity is already favorited
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('launchpadOrganizationFavorites') || '[]');
    const isAlreadyFavorite = savedFavorites.some(fav => 
      fav.id === organizationData.id || 
      (fav.name === getName() && fav.type === organizationData.organizationType)
    );
    setIsFavorite(isAlreadyFavorite);
  }, [organizationData]);

  const handleToggleFavorite = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('launchpadOrganizationFavorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = savedFavorites.filter(fav => 
        !(fav.id === organizationData.id || 
          (fav.name === getName() && fav.type === organizationData.organizationType))
      );
      localStorage.setItem('launchpadOrganizationFavorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      // Add to favorites
      const newFavorite = {
        id: organizationData.id,
        name: getName(),
        type: organizationData.organizationType,
        description: organizationData.applicantExpectations ?? organizationData.organizationMission,
        host: organizationData.organizationHostCompany ?? organizationData.organizationHostStudent,
        position: organizationData.applicantPosition,
        fieldOfWork: organizationData.applicantFieldOfWork,
        isPaid: organizationData.isPaid,
        deadline: organizationData.deadline,
        startDate: organizationData.startDate,
        location: organizationData.workLocation,
        timeFrame: organizationData.timeFrame,
        logo: organizationData.organizationLogoPreview ?? '/assets/launchpad_logo_raw.png'
      };
      const newFavorites = [...savedFavorites, newFavorite];
      localStorage.setItem('launchpadOrganizationFavorites', JSON.stringify(newFavorites));
      setIsFavorite(true);
      toast.success('Added to favorites!');
    }
  };

  // Check if actions should be disabled
  useEffect(() => {
    // Disable if it's a preview or if the current user created this opportunity
    const isOwnOpportunity = organizationData.createdBy === currentUser?.uid;
    setIsDisabled(isPreview || isOwnOpportunity);
  }, [organizationData.createdBy, currentUser?.uid, isPreview])

  // Check if description needs expansion
  useEffect(() => {
    if (descRef.current && descRef.current.clientHeight <= 16 * 8) {
      setIsDescriptionExpanded(true)
    }
  }, [organizationProfile.description])

  // Check if content container needs expand button
  useEffect(() => {
    if (location === 'organizations_page' && contentRef.current) {
      // Temporarily expand to measure full height
      const originalMaxHeight = contentRef.current.style.maxHeight
      contentRef.current.style.maxHeight = 'none'
      const fullHeight = contentRef.current.scrollHeight
      contentRef.current.style.maxHeight = originalMaxHeight

      // Only show expand button if content is taller than contracted height (approx 250px)
      setNeedsExpandButton(fullHeight > 250)
    } else {
      setNeedsExpandButton(false)
    }
  }, [location, organizationProfile.description, organizationProfile.startDate, organizationProfile.deadline, organizationProfile.host, organizationProfile.logistics])

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

  const handleNavigateToOrganization = () => {
    if (organizationData.id) {
      navigate(`/organization/${organizationData.id}`)
    }
  }

  const handleCardClick = (e) => {
    // Only navigate if clicking on the card itself, not on buttons or interactive elements
    const clickedElement = e.target
    const isButton = clickedElement.tagName === 'BUTTON' || clickedElement.closest('button')
    const isLink = clickedElement.tagName === 'A' || clickedElement.closest('a')

    if (!isButton && !isLink) {
      handleNavigateToOrganization()
    }
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
    <div
      className={`v0-organization-card ${getLayoutClass()}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
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

      {/* Favorite Button */}
      {!hideHeartButton && (
        <button 
          className={`v0-favorite-button ${isFavorite ? 'favorited' : ''}`} 
          onClick={handleToggleFavorite} 
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <LuHeart size={18} />
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

        {/* Organizer Information - Always Visible */}
        {organizationProfile.hostName && (
          <div className="v0-organization-owner">
            <IoPerson size={14} />
            <span className="v0-owner-label">Run by:</span>
            <button
              className="v0-owner-name"
              onClick={handleHostClick}
              disabled={isDisabled}
              title={isDisabled ? "Can't view your own profile" : "View organizer profile"}
            >
              {organizationProfile.hostName}
            </button>
          </div>
        )}

        {/* Content Container with Fixed Height */}
        <div ref={contentRef} className={`v0-organization-content-container ${isContentExpanded ? 'expanded' : 'contracted'} ${needsExpandButton ? 'has-expand-button' : ''}`}>
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
          {/* Dates and Organizer Info - only show in wide contexts */}
          {/* {(location === 'organizations_page') && (organizationProfile.startDate || organizationProfile.deadline || organizationProfile.host) && (
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
              {organizationProfile.collaborators && organizationProfile.collaborators.length > 0 && (
                <div className="v0-collaborators-section">
                  <div className="v0-collaborators-header">
                    <LuUsers size={16} />
                    <strong>Collaborators:</strong>
                  </div>
                  <div className="v0-collaborators-list">
                    {organizationProfile.collaborators
                      .filter(collab => collab.name && collab.email) // Only show complete collaborators
                      .map((collaborator, index) => (
                        <div key={index} className="v0-collaborator-item">
                          <span className="v0-collaborator-name">{collaborator.name}</span>
                          <a
                            href={`mailto:${collaborator.email}`}
                            className="v0-collaborator-email"
                            onClick={(e) => e.stopPropagation()} // Prevent card click navigation
                          >
                            {collaborator.email}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )} */}

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

        {/* See More Button - routes to OrganizationPage when content exceeds height */}
        {needsExpandButton && (
          <button
            className="v0-organization-expand-btn"
            onClick={handleNavigateToOrganization}
          >
            <LuChevronDown size={16} />
            See More
          </button>
        )}

        {/* Action Buttons */}
        <div className="v0-organization-actions">
          <button
            className="v0-btn v0-btn-secondary"
            onClick={handleLearnMore}
            disabled={isDisabled}
            title={isDisabled ? (isPreview ? 'Available after publishing' : "You can't interact with your own opportunity") : ''}
          >
            Learn More
          </button>
          {organizationData.apply !== "NOAPPLY" && (
            <button
              className="v0-btn v0-btn-primary"
              onClick={handleConnect}
              disabled={isDisabled}
              title={isDisabled ? (isPreview ? 'Available after publishing' : "You can't apply to your own opportunity") : ''}
            >
              {getActionButtonText(organizationProfile.type)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}