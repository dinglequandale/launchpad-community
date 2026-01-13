import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useConnections } from '../../contexts/ConnectionContext';
import { useReport } from '../../contexts/report/ReportContext';
import {
  displayColleges,
  displayFieldsOfInterest,
  getBasicUserDescription,
  formatLinkedInUrl,
} from '../../services/userProfileServices';
import DefaultIcon from '../../components/DefaultIcon/DefaultIcon';
import OrganizationProfile from '../../components/Organizationprofile/OrganizationProfile';
import Loading from '../../components/LoadingAnimation/Loading';
import SideNav from '../../components/Sidenav/SideNav';
import TopBar from '../../components/Topbar/TopBar';
import { BiFlag } from 'react-icons/bi';
import { FaLink } from 'react-icons/fa';
import { LuMapPin, LuCalendar, LuBriefcase, LuGraduationCap, LuSchool, LuArrowLeft, LuShare2 } from 'react-icons/lu';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { openConnectModal } = useModal();
  const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport();
  const { approved = [], parent_approved = [] } = useConnections();
  const { chatClient } = useOutletContext() || {};

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opportunitiesData, setOpportunitiesData] = useState([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  const hideConnectBtn = false;

  const isConnection =
    userData && (
      approved.some(conn => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId) ||
      parent_approved.some(conn => conn.targetUserId === userData.userId || conn.initiateUserId === userData.userId)
    );

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
    const fetchUserData = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (userDoc.exists()) {
          setUserData({ id: userId, userId: userId, ...userDoc.data() });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch opportunities
  useEffect(() => {
    if (!userData?.userId) return;

    const fetchOpportunities = async () => {
      setOpportunitiesLoading(true);
      try {
        const opportunitiesRef = collection(db, 'opportunities');
        const userOpportunityQuery = query(opportunitiesRef, where('createdBy', '==', userData.userId));
        const snapshot = await getDocs(userOpportunityQuery);
        setOpportunitiesData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setOpportunitiesLoading(false);
      }
    };

    fetchOpportunities();
  }, [userData?.userId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleConnect = () => {
    if (userData) {
      openConnectModal({ userData, chat: chatClient });
    }
  };

  const handleReport = () => {
    if (userData) {
      setReportTarget('User');
      setReportVisibility(true);
      setReportedUser(userData.userName);
      setShowReportUserName(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleReferalClick = (action, opportunityData, creatorData) => {
    // For opportunities on a user's profile page, connect with the profile owner
    const userToConnect = creatorData || userData;
    if (userToConnect && chatClient) {
      openConnectModal({
        userData: userToConnect,
        chat: chatClient,
        isOpportunity: true,
        opportunityType: opportunityData.organizationType || opportunityData.type,
      });
    }
  };

  const handleShowProfile = (user) => {
    // Navigate to the user's profile
    if (user?.userId || user?.id) {
      navigate(`/profile/${user.userId || user.id}`);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />
        <SideNav />
        <div className="profile-page-loading">
          <Loading />
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />
        <SideNav />
        <div className="profile-page-error">
          <h2>{error ? 'Error' : 'Profile Not Found'}</h2>
          <p>{error || "The user profile you're looking for doesn't exist."}</p>
          <button onClick={handleBack} className="profile-page-back-button">
            <LuArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </>
    );
  }

  const firstName = userData.userName?.split(' ')[0] || 'User';
  const userDescription = getBasicUserDescription(userData, false);

  return (
    <>
      <TopBar isSidebarCollapsed={isSidebarCollapsed} />
      <SideNav />
      <div className={`profile-page-container ${isSidebarCollapsed ? 'profile-page-sidebar-collapsed' : 'profile-page-sidebar-expanded'}`}>
      <div className="profile-page-header-actions">
        <button onClick={handleBack} className="profile-page-back-button">
          <LuArrowLeft size={20} />
          Back
        </button>
        <button onClick={handleShare} className="profile-page-share-button">
          <LuShare2 size={18} />
          Share Profile
        </button>
      </div>

      <div className="profile-page-content">
        {/* Header */}
        <div className="profile-page-top-actions">
          <button className="profile-page-action-btn" onClick={handleReport} title="Report user">
            <BiFlag size={18} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="profile-page-section-container">
          <div className="profile-page-section">
            <div className="profile-page-avatar">
              {userData.userPfpPreview ? (
                <img src={userData.userPfpPreview} alt={`${userData.userName}'s profile`} />
              ) : (
                <DefaultIcon length={75} size={50} />
              )}
            </div>

            <div className="profile-page-info">
              <div className="profile-page-name-row">
                <h1 className="profile-page-name">{userData.userName}</h1>
                {isConnection && (
                  <span className="profile-page-connection-badge">Connected</span>
                )}
              </div>
              <p className="profile-page-description">{userDescription}</p>
            </div>
          </div>
          {/* Connect Button */}
          {!hideConnectBtn && currentUser?.uid !== userData.userId && (
            <button
              className={`profile-page-connect-btn ${isConnection ? 'connected' : ''}`}
              onClick={handleConnect}
            >
              <FaLink size={18} />
              {isConnection ? 'Contact' : 'Connect'}
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="profile-page-main-content">
          {/* Basic Info Details */}
          <div className="profile-page-content-section">
            <div className="profile-page-details">
              <div className="profile-page-detail-item">
                <div className="profile-page-detail-icon">
                  {userData.userType === 'Professional' ? <LuBriefcase size={16} /> : <LuGraduationCap size={16} />}
                </div>
                <div className="profile-page-detail-content">
                  <span className="profile-page-detail-label">
                    {userData.userType !== 'Professional' ? 'Interests' : 'Expertise'}
                  </span>
                  <span className="profile-page-detail-value">
                    {displayFieldsOfInterest(userData.areasOfInterest || [], 'longer')}
                  </span>
                </div>
              </div>

              <div className="profile-page-detail-item">
                <div className="profile-page-detail-icon">
                  <LuMapPin size={16} />
                </div>
                <div className="profile-page-detail-content">
                  <span className="profile-page-detail-label">
                    {userData.userType === 'Professional' ? 'Position' :
                     userData.userType === 'College Student' ? 'College Attending' :
                     userData.collegeDecision === 'No' ? 'Dream Colleges' : 'Committed College'}
                  </span>
                  <span className="profile-page-detail-value">
                    {userData.userType === 'Professional'
                      ? `${userData.industryPosition || 'Not specified'}${userData.companyName ? ` at ${userData.companyName}` : ''}`
                      : userData.userType === 'College Student'
                      ? displayColleges([userData.collegeAttending])
                      : displayColleges(Array.isArray(userData.collegeInterestsOrDecision)
                          ? userData.collegeInterestsOrDecision
                          : [userData.collegeInterestsOrDecision])}
                  </span>
                </div>
              </div>

              {userData.schoolAttending && (
                <div className="profile-page-detail-item">
                  <div className="profile-page-detail-icon">
                    <LuSchool size={16} />
                  </div>
                  <div className="profile-page-detail-content">
                    <span className="profile-page-detail-label">
                      {userData.userType === 'High Schooler' ? 'Attends' :
                       userData.userType === 'College Student' ? 'Graduated From' :
                       'School Connection'}
                    </span>
                    <span className="profile-page-detail-value">
                      {userData.schoolAttending}
                    </span>
                  </div>
                </div>
              )}

              {userData.acceptedColleges?.length > 0 && (
                <div className="profile-page-detail-item">
                  <div className="profile-page-detail-icon">
                    <LuCalendar size={16} />
                  </div>
                  <div className="profile-page-detail-content">
                    <span className="profile-page-detail-label">Accepted Colleges</span>
                    <span className="profile-page-detail-value">{userData.acceptedColleges}</span>
                  </div>
                </div>
              )}

              {userData.linkedinLink && (
                <div className="profile-page-detail-item">
                  <div className="profile-page-detail-icon">
                    <FaLink size={16} />
                  </div>
                  <div className="profile-page-detail-content">
                    <span className="profile-page-detail-label">LinkedIn</span>
                    <span className="profile-page-detail-value">
                      <a
                        href={formatLinkedInUrl(userData.linkedinLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-page-linkedin-link"
                      >
                        View Profile
                      </a>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opportunities */}
          {opportunitiesLoading ? (
            <div className="profile-page-loading-section">
              <Loading />
            </div>
          ) : opportunitiesData.length > 0 ? (
            <div className="profile-page-content-section">
              <h3 className="profile-page-section-title">Opportunities</h3>
              <div className="profile-page-opportunities-grid">
                {opportunitiesData.map((opportunity) => (
                  <div key={opportunity.id} className="profile-page-opportunity-card">
                    <OrganizationProfile
                      location="organizations_page"
                      organizationData={opportunity}
                      handleReferalClick={handleReferalClick}
                      handleShowProfile={handleShowProfile}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* About Me */}
          {userData.userAboutMe && (
            <div className="profile-page-content-section">
              <h3 className="profile-page-section-title">About</h3>
              <div className="profile-page-about-card">
                <p>{userData.userAboutMe}</p>
              </div>
            </div>
          )}

          {/* Skills */}
          {userData.userSkills?.length > 0 && (
            <div className="profile-page-content-section">
              <h3 className="profile-page-section-title">Skills</h3>
              <div className="profile-page-skills-container">
                {Object.entries(
                  userData.userSkills.reduce((acc, skill) => {
                    const category = skill.skillCategory || 'Other';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(skill.skillDescription);
                    return acc;
                  }, {})
                ).map(([category, skills]) => (
                  <div key={category} className="profile-page-skill-category">
                    <h4 className="profile-page-skill-category-title">{category}</h4>
                    <div className="profile-page-skill-tags">
                      {skills.map((skill, index) => (
                        <span key={index} className="profile-page-skill-tag">{skill}</span>
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
            <div className="profile-page-content-section">
              <h3 className="profile-page-section-title">Resume</h3>
              <div className="profile-page-resume-container">
                <iframe
                  src={userData.userResumePreview.split(' ').pop()}
                  title="Resume"
                  className="profile-page-resume-iframe"
                />
              </div>
            </div>
          )}

          {/* Commitment */}
          {userData.networkingLevel?.length > 0 && (
            <div className="profile-page-content-section">
              <h3 className="profile-page-section-title">{firstName}'s Availability</h3>
              <div className="profile-page-commitment-tags">
                {userData.networkingLevel.map((level) => (
                  <span key={level} className="profile-page-commitment-tag">{level}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
