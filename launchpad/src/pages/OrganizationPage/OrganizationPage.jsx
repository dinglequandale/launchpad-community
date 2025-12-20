import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useReport } from '../../contexts/report/ReportContext';
import { displayFieldsOfInterest } from '../../services/userProfileServices';
import { stableLinkCheck } from '../../services/opportunityServices';
import Loading from '../../components/LoadingAnimation/Loading';
import SideNav from '../../components/Sidenav/SideNav';
import TopBar from '../../components/Topbar/TopBar';
import { IoFlag, IoCalendar, IoTime, IoPerson } from 'react-icons/io5';
import { LuMapPin, LuCalendar, LuAward, LuTarget, LuArrowLeft, LuShare2, LuUsers, LuMail } from 'react-icons/lu';
import toast from 'react-hot-toast';
import './OrganizationPage.css';

export default function OrganizationPage() {
  const { organizationId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { openApplyModal, openConnectModal } = useModal();
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport();
  const { chatClient } = useOutletContext() || {};

  const [organization, setOrganization] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  const userBasicInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}');

  // Disable actions if the current user created this opportunity
  const disableActions = organization?.createdBy === currentUser?.uid || organization?.userId === currentUser?.uid;

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    const sidebar = document.querySelector('.v0-sidebar');
    if (sidebar) {
      const isCollapsed = sidebar.classList.contains('v0-sidebar-collapsed');
      setIsSidebarCollapsed(isCollapsed);
    }

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!organizationId) {
        setError('No organization ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orgDoc = await getDoc(doc(db, 'opportunities', organizationId));

        if (orgDoc.exists()) {
          const orgData = { id: organizationId, ...orgDoc.data() };
          setOrganization(orgData);
          console.log('Fetched organization data:', orgData);
          // Fetch creator data if available
          const creatorId = orgData.createdBy || orgData.userId;
          if (creatorId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', creatorId));
              if (userDoc.exists()) {
                const fetchedUserData = { id: userDoc.id, userId: userDoc.id, ...userDoc.data() };
                setUserData(fetchedUserData);
                console.log('Fetched user data:', fetchedUserData);
              } else {
                console.log('No user document found for ID:', creatorId);
              }
            } catch (userErr) {
              console.error('Error fetching creator data:', userErr);
            }
          } else {
            console.log('No creator ID found in organization data');
          }
        } else {
          setError('Organization not found');
          console.log('No such organization!');
        }
      } catch (err) {
        console.error('Error fetching organization data:', err);
        setError('Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
    console.log('user data:', userData);
  }, [organizationId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Organization link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleReport = () => {
    if (organization) {
      setReportTarget(organization);
      setReportedUser(organization);
      setShowReportUserName(organization.name || organization.userName || 'Unknown');
      setReportVisibility(true);
    }
  };

  const getActionButtonText = (orgType) => {
    switch (orgType) {
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
  };

  const getOrganizationProfile = () => {
    const getName = () => {
      if (organization.organizationName) return organization.organizationName;
      return `${organization.applicantPosition || organization.position} at ${organization.organizationHostCompany || organization.host || 'Organization'}`;
    };

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
      collaborators: organization.collaborators || [],
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
    };
  };

  const handleConnect = () => {
    const orgProfile = getOrganizationProfile();

    if (organization.organizationHostCompany || organization.host) {
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
      });
    } else if (userData) {
      openConnectModal({
        userData: userData,
        chat: chatClient,
        isOpportunity: true,
        opportunityType: orgProfile.type,
        onClose: () => {},
        visibility: true
      });
    }
  };

  const handleLearnMore = () => {
    const orgProfile = getOrganizationProfile();

    if (orgProfile.learnMore.method === 'Website' && orgProfile.learnMore.value) {
      window.open(orgProfile.learnMore.value, '_blank', 'noopener,noreferrer');
    } else if ((orgProfile.learnMore.method === 'Email' || orgProfile.learnMore.method === 'Messages') && userData) {
      // Both "Email me" and "Message me" now open the ConnectModal for consistency
      openConnectModal({
        userData: userData,
        chat: chatClient,
        isOpportunity: true,
        opportunityType: orgProfile.type,
        onClose: () => {},
        visibility: true
      });
    }
  };

  const handleOrganizerClick = () => {
    if (userData) {
      navigate(`/profile/${userData.userId || userData.id}`);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />
        <SideNav />
        <div className="organization-page-loading">
          <Loading />
          <p>Loading organization...</p>
        </div>
      </>
    );
  }

  if (error || !organization) {
    return (
      <>
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />
        <SideNav />
        <div className="organization-page-error">
          <h2>{error ? 'Error' : 'Organization Not Found'}</h2>
          <p>{error || "The organization you're looking for doesn't exist."}</p>
          <button onClick={handleBack} className="organization-page-back-button">
            <LuArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </>
    );
  }

  // Get normalized organization profile data
  const orgProfile = getOrganizationProfile();

  const opportunityType = organization.organizationType || organization.type || organization.opportunityType;
  const opportunityTitle = organization.applicantPosition || organization.position || organization.opportunityTitle || organization.title;
  const description = organization.applicantExpectations || organization.organizationMission || organization.description || organization.opportunityDescription;
  const location_text = organization.workLocation || organization.location || organization.opportunityLocation;
  const timeCommitment = organization.timeFrame || organization.timeCommitment || organization.opportunityTimeCommitment;
  const requirements = organization.applicantRequirements || organization.requirements || organization.opportunityRequirements;
  const benefits = organization.benefits || organization.opportunityBenefits;
  const applicationDeadline = organization.deadline || organization.applicationDeadline || organization.opportunityApplicationDeadline;
  const startDate = organization.startDate || organization.opportunityStartDate;
  const endDate = organization.endDate || organization.opportunityEndDate;
  const compensation = organization.isPaid !== undefined && organization.isPaid !== null ? (organization.isPaid === true ? 'Paid' : 'Unpaid') : null;
  const contactInfo = organization.contactInfo || organization.opportunityContactInfo;

  return (
    <>
      <TopBar isSidebarCollapsed={isSidebarCollapsed} />
      <SideNav />
      <div className={`organization-page-container ${isSidebarCollapsed ? 'organization-page-sidebar-collapsed' : 'organization-page-sidebar-expanded'}`}>
      <div className="organization-page-header-actions">
        <button onClick={handleBack} className="organization-page-back-button">
          <LuArrowLeft size={20} />
          Back
        </button>
        <button onClick={handleShare} className="organization-page-share-button">
          <LuShare2 size={18} />
          Share Opportunity
        </button>
      </div>

      <div className="organization-page-content">
        {/* Header */}
        <div className="organization-page-header">
          <div className="organization-page-title-section">
            <div className="organization-page-avatar">
              <img
                src={orgProfile.logo}
                alt={orgProfile.name || 'Organization'}
                onError={(e) => {
                  e.target.src = '/src/public/assets/placeholder_pfp.png';
                }}
              />
            </div>
            <div className="organization-page-title-content">
              <h2 className="organization-page-name">{orgProfile.name}</h2>
              <div className="organization-page-type-badge">
                <LuTarget size={16} />
                <span>{orgProfile.type}</span>
              </div>
            </div>
          </div>

          <button className="organization-page-report-btn" onClick={handleReport} aria-label="Report Organization">
            <IoFlag size={18} />
          </button>
        </div>

        {/* Opportunity Details */}
        <div className="organization-page-details">
          {opportunityTitle && (
            <h3 className="organization-page-opportunity-title">{opportunityTitle}</h3>
          )}

          {/* Organizer Info */}
          {userData && orgProfile.hostName && (
            <div className="organization-page-organizer">
              <IoPerson size={18} />
              <span>Run by </span>
              <button
                className="organization-page-organizer-link"
                onClick={handleOrganizerClick}
                aria-label={`View ${orgProfile.hostName}'s profile`}
              >
                {orgProfile.hostName}
              </button>
            </div>
          )}

          {/* Key Info Grid */}
          {(location_text || (startDate && endDate) || timeCommitment || compensation) && (
            <div className="organization-page-info-grid">
              {location_text && (
                <div className="organization-page-info-item">
                  <LuMapPin size={20} />
                  <span>{location_text}</span>
                </div>
              )}
              {startDate && endDate && (
                <div className="organization-page-info-item">
                  <LuCalendar size={20} />
                  <span>{startDate} - {endDate}</span>
                </div>
              )}
              {timeCommitment && (
                <div className="organization-page-info-item">
                  <IoTime size={20} />
                  <span>{timeCommitment}</span>
                </div>
              )}
              {compensation && (
                <div className="organization-page-info-item">
                  <LuAward size={20} />
                  <span>{compensation}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="organization-page-section">
              <h4>Description</h4>
              <p>{description}</p>
            </div>
          )}

          {/* Requirements */}
          {requirements && (
            <div className="organization-page-section">
              <h4>Requirements</h4>
              <p>{requirements}</p>
            </div>
          )}

          {/* Benefits */}
          {benefits && (
            <div className="organization-page-section">
              <h4>Benefits</h4>
              <p>{benefits}</p>
            </div>
          )}

          {/* Contact Details */}
          {(userData || (orgProfile.collaborators && orgProfile.collaborators.length > 0)) && (
            <div className="organization-page-section organization-page-contact-section">
              <h4>Contact Details</h4>
              <div className="organization-page-contact-grid">
                {/* Organizer/Owner */}
                {userData && orgProfile.hostName && (
                  <div className="organization-page-contact-card">
                    <div className="organization-page-contact-header">
                      <IoPerson size={18} />
                      <span className="organization-page-contact-role">Organizer</span>
                    </div>
                    <div className="organization-page-contact-info">
                      <button
                        className="organization-page-contact-name"
                        onClick={handleOrganizerClick}
                      >
                        {orgProfile.hostName}
                      </button>
                      {userData.email && (
                        <a
                          href={`mailto:${userData.email}`}
                          className="organization-page-contact-email"
                        >
                          <LuMail size={14} />
                          {userData.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Collaborators */}
                {orgProfile.collaborators && orgProfile.collaborators.length > 0 && (
                  <div className="organization-page-contact-card">
                    <div className="organization-page-contact-header">
                      <LuUsers size={18} />
                      <span className="organization-page-contact-role">
                        {orgProfile.collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
                      </span>
                    </div>
                    <div className="organization-page-contact-list">
                      {orgProfile.collaborators
                        .filter(collab => collab.name && collab.email)
                        .map((collaborator, index) => (
                          <div key={index} className="organization-page-contact-info">
                            <span className="organization-page-contact-name">{collaborator.name}</span>
                            <a
                              href={`mailto:${collaborator.email}`}
                              className="organization-page-contact-email"
                            >
                              <LuMail size={14} />
                              {collaborator.email}
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Details */}
          {(applicationDeadline || contactInfo) && (
            <div className="organization-page-section">
              <h4>Application Details</h4>
              <div className="organization-page-application-info">
                {applicationDeadline && (
                  <div className="organization-page-info-item">
                    <LuCalendar size={16} />
                    <span><strong>Deadline:</strong> {applicationDeadline}</span>
                  </div>
                )}
                {contactInfo && (
                  <div className="organization-page-info-item">
                    <IoPerson size={16} />
                    <span><strong>Contact:</strong> {contactInfo}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Info */}
          {/* {userData && (
            <div className="organization-page-section">
              <h4>About the Organization</h4>
              <div className="organization-page-organization-info">
                {userData.bio && (
                  <p className="organization-page-organization-bio">{userData.bio}</p>
                )}
                {userData.fieldsOfInterest && userData.fieldsOfInterest.length > 0 && (
                  <div className="organization-page-fields-of-interest">
                    <strong>Areas of Expertise:</strong>
                    <div className="organization-page-fields-tags">
                      {userData.fieldsOfInterest.map((field, index) => (
                        <span key={index} className="organization-page-field-tag">
                          {displayFieldsOfInterest(field)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="organization-page-actions">
            <button
              className="organization-page-btn organization-page-btn-secondary"
              onClick={handleLearnMore}
              disabled={disableActions}
              title={disableActions ? "You can't interact with your own opportunity" : ''}
            >
              Learn More
            </button>
            {organization.apply !== "NOAPPLY" && (
              <button
                className="organization-page-btn organization-page-btn-primary"
                onClick={handleConnect}
                disabled={disableActions}
                title={disableActions ? "You can't apply to your own opportunity" : ''}
              >
                {getActionButtonText(organization.type)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
