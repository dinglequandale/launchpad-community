import React, { useState, useEffect } from 'react'
import { IoCloseOutline, IoFlag, IoCalendar, IoLocation, IoTime, IoPerson } from 'react-icons/io5'
import { LuMapPin, LuCalendar, LuBriefcase, LuGraduationCap, LuUsers, LuBuilding, LuBookOpen, LuAward, LuGlobe, LuTarget, LuZap, LuChevronDown, LuChevronUp } from 'react-icons/lu'
import './organizationprofile.css'
import { useModal } from '../../contexts/ModalContext'
import { useReport } from '../../contexts/report/ReportContext'
import { useAuth } from '../../contexts/auth/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebaseConfig'
import { displayFieldsOfInterest } from '../../services/userProfileServices'
import { stableLinkCheck } from '../../services/opportunityServices'

export default function OrganizationProfileModal({ 
  organization, 
  isVisible, 
  onClose, 
  location = 'modal',
  handleReferalClick
}) {
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  
  const { currentUser } = useAuth()
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport()
  const { openApplyModal, openConnectModal } = useModal()

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}')
  const disableActions = userBasicInfo?.userType === 'High Schooler' && !userBasicInfo?.parentVerified

  // Get user data for the organization
  useEffect(() => {
    const fetchUserData = async () => {
      if (organization?.userId) {
        try {
          const userDocRef = doc(db, "tenants", localStorage.getItem("schoolId"), 'users', organization.userId)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }

    if (isVisible && organization) {
      fetchUserData()
    }
  }, [organization, isVisible])

  const handleReport = () => {
    setReportTarget(organization)
    setReportedUser(organization)
    setShowReportUserName(organization.name || organization.userName || 'Unknown')
    setReportVisibility(true)
    onClose()
  }

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

  // Process organization data to match expected structure (emulating OrganizationProfile)
  const getOrganizationProfile = () => {
    const getName = () => {
      if (organization.organizationName) return organization.organizationName
      return `${organization.applicantPosition || organization.position} at ${organization.organizationHostCompany || organization.host || 'Organization'}`
    }

    return {
      name: getName(),
      type: organization.organizationType || organization.type,
      host: organization.organizationHostCompany || organization.host,
      description: organization.applicantExpectations || organization.organizationMission || organization.description,
      logo: organization.organizationLogoPreview || organization.logo || '/assets/launchpad_logo_raw.png',
      createdBy: organization.createdBy || organization.userId,
      hostName: organization.createdByUserName || organization.hostName,
      deadline: organization.deadline || organization.applicationDeadline,
      startDate: organization.startDate,
      tags: organization.organizationTags?.length > 0 
        ? displayFieldsOfInterest(organization.organizationTags)
        : organization.applicantFieldOfWork || organization.fieldOfWork
          ? `${organization.applicantFieldOfWork || organization.fieldOfWork}, ${organization.applicantPosition || organization.position}`
          : null,
      logistics: organization.isPaid ? {
        compensation: organization.isPaid,
        eligibility: organization.applicants || organization.eligibility,
        location: organization.workLocation || organization.location,
        duration: organization.timeFrame || organization.duration,
        timeCommitment: organization.timeCommitment
      } : null,
      apply: {
        method: organization.apply?.split(': ')[0] || 'Messages',
        value: organization.apply?.split(': ')[1] && organization.apply.split(': ')[0] === 'Website'
          ? stableLinkCheck(organization.apply.split(': ')[1])
          : organization.apply?.split(': ')[1] || ''
      },
      learnMore: {
        method: organization.learnMore?.split(': ')[0] || 'Messages',
        value: organization.learnMore?.split(': ')[1] && organization.learnMore.split(': ')[0] === 'Website'
          ? stableLinkCheck(organization.learnMore.split(': ')[1])
          : organization.learnMore?.split(': ')[1] || ''
      }
    }
  }

  const handleConnect = () => {
    const orgProfile = getOrganizationProfile()
    
    if (organization.organizationHostCompany || organization.host) {
      // Open the apply modal with properly formatted data
      openApplyModal({
        requirements: organization.applicantRequirements || organization.requirements || [],
        applyType: orgProfile.apply.method,
        applyValue: orgProfile.apply.value,
        orgName: orgProfile.host,
        opportunityDetails: {
          format: orgProfile.logistics?.location,
          eligibility: orgProfile.logistics?.eligibility,
          compensation: orgProfile.logistics?.compensation,
          duration: orgProfile.logistics?.duration,
          startDate: orgProfile.startDate,
          timeCommitment: orgProfile.logistics?.timeCommitment,
          deadline: orgProfile.deadline,
          learnMoreType: orgProfile.learnMore.method,
          learnMoreValue: orgProfile.learnMore.value,
          organizationType: orgProfile.type,
        }
      })
      onClose()
    } else if (handleReferalClick) {
      // Fallback to referral handler
      handleReferalClick('apply', organization, userData)
      onClose()
    } else {
      // If no referral handler, try to open connect modal for messaging
      if (userData) {
        openConnectModal({
          userData: userData,
          isOpportunity: true,
          opportunityType: orgProfile.type,
          onClose: () => {},
          visibility: true
        })
        onClose()
      }
    }
  }

  const handleLearnMore = () => {
    const orgProfile = getOrganizationProfile()
    
    if (handleReferalClick) {
      // Use referral handler if available
      handleReferalClick('learnMore', organization, userData)
      onClose()
    } else {
      // Handle learn more based on type
      if (orgProfile.learnMore.method === 'Website' && orgProfile.learnMore.value) {
        // Open website in new tab
        window.open(orgProfile.learnMore.value, '_blank', 'noopener,noreferrer')
      } else if (orgProfile.learnMore.method === 'Email' && orgProfile.learnMore.value) {
        // Open email client
        window.location.href = `mailto:${orgProfile.learnMore.value}`
      } else if (orgProfile.learnMore.method === 'Messages' && userData) {
        // Open connect modal for messaging
        openConnectModal({
          userData: userData,
          isOpportunity: true,
          opportunityType: orgProfile.type,
          onClose: () => {},
          visibility: true
        })
        onClose()
      }
    }
  }

  if (!isVisible || !organization) return null

  const opportunityType = organization.type || organization.opportunityType || 'Opportunity'
  const opportunityTitle = organization.position || organization.opportunityTitle || organization.title || 'Position not specified'
  const description = organization.description || organization.opportunityDescription
  const location_text = organization.location || organization.opportunityLocation
  const timeCommitment = organization.timeFrame || organization.timeCommitment || organization.opportunityTimeCommitment
  const requirements = organization.requirements || organization.opportunityRequirements
  const benefits = organization.benefits || organization.opportunityBenefits
  const applicationDeadline = organization.deadline || organization.applicationDeadline || organization.opportunityApplicationDeadline
  const startDate = organization.startDate || organization.opportunityStartDate
  const endDate = organization.endDate || organization.opportunityEndDate
  const compensation = organization.isPaid !== undefined && organization.isPaid !== null ? (organization.isPaid === true ? 'Paid' : 'Unpaid') : null
  const contactInfo = organization.contactInfo || organization.opportunityContactInfo

  return (
    <div className="v0-modal-overlay" onClick={onClose}>
      <div className="v0-organization-profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="v0-modal-close-btn" onClick={onClose}>
          <IoCloseOutline size={24} />
        </button>

        {/* Header */}
        <div className="v0-organization-header">
          <div className="v0-organization-title-section">
            <div className="v0-organization-avatar">
              <img 
                src={organization.logo || organization.profilePictureUrl || organization.pfp || '/src/public/assets/placeholder_pfp.png'} 
                alt={organization.name || 'Organization'}
                onError={(e) => {
                  e.target.src = '/src/public/assets/placeholder_pfp.png';
                }}
              />
            </div>
            <div className="v0-organization-title-content">
              <h2 className="v0-organization-name">{organization.name || 'Organization Name'}</h2>
              <div className="v0-opportunity-type-badge">
                <LuTarget size={16} />
                <span>{opportunityType}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {/* <div className="v0-organization-actions">
            {location !== 'user_profile' && (
              <button className="v0-report-button" onClick={handleReport} aria-label="Report Organization">
                <IoFlag size={18} />
              </button>
            )}
          </div> */}
        </div>

        {/* Opportunity Details */}
        <div className="v0-opportunity-details">
          <h3 className="v0-opportunity-title">{opportunityTitle}</h3>
          
          {/* Key Info Grid */}
          <div className="v0-opportunity-info-grid">
            {location_text && location_text !== 'Location not specified' && (
              <div className="v0-info-item">
                <LuMapPin size={20} />
                <span>{location_text}</span>
              </div>
            )}
            {startDate && startDate !== 'Start date not specified' && endDate && endDate !== 'End date not specified' && (
              <div className="v0-info-item">
                <LuCalendar size={20} />
                <span>{startDate} - {endDate}</span>
              </div>
            )}
            {timeCommitment && timeCommitment !== 'Time commitment not specified' && (
              <div className="v0-info-item">
                <IoTime size={20} />
                <span>{timeCommitment}</span>
              </div>
            )}
            {compensation && compensation !== 'Compensation not specified' && (
              <div className="v0-info-item">
                <LuAward size={20} />
                <span>{compensation}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && description !== 'No description available' && (
            <div className="v0-opportunity-section">
              <h4>Description</h4>
              <p>{description}</p>
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements !== 'No specific requirements' && (
            <div className="v0-opportunity-section">
              <h4>Requirements</h4>
              <p>{requirements}</p>
            </div>
          )}

          {/* Benefits */}
          {benefits && benefits !== 'Benefits not specified' && (
            <div className="v0-opportunity-section">
              <h4>Benefits</h4>
              <p>{benefits}</p>
            </div>
          )}

          {/* Application Details */}
          {(applicationDeadline && applicationDeadline !== 'No deadline specified') || (contactInfo && contactInfo !== 'Contact information not available') ? (
            <div className="v0-opportunity-section">
              <h4>Application Details</h4>
              <div className="v0-application-info">
                {applicationDeadline && applicationDeadline !== 'No deadline specified' && (
                  <div className="v0-info-item">
                    <LuCalendar size={16} />
                    <span><strong>Deadline:</strong> {applicationDeadline}</span>
                  </div>
                )}
                {contactInfo && contactInfo !== 'Contact information not available' && (
                  <div className="v0-info-item">
                    <IoPerson size={16} />
                    <span><strong>Contact:</strong> {contactInfo}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Organization Info */}
          {userData && (
            <div className="v0-organization-section">
              <h4>About the Organization</h4>
              <div className="v0-organization-info">
                {userData.bio && (
                  <p className="v0-organization-bio">{userData.bio}</p>
                )}
                {userData.fieldsOfInterest && userData.fieldsOfInterest.length > 0 && (
                  <div className="v0-fields-of-interest">
                    <strong>Areas of Expertise:</strong>
                    <div className="v0-fields-tags">
                      {userData.fieldsOfInterest.map((field, index) => (
                        <span key={index} className="v0-field-tag">
                          {displayFieldsOfInterest(field)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            {organization.apply !== "NOAPPLY" && (
              <button 
                className="v0-btn v0-btn-primary" 
                onClick={handleConnect}
                disabled={disableActions}
                title={disableActions ? 'Parent/guardian approval required' : ''}
              >
                {getActionButtonText(organization.type)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
