import "./Home.css";
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";
import ReactPlayer from "react-player/youtube";
import ProfileStrength from "../../components/Profilestrength/ProfileStrength";
import { FaArrowCircleDown } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import InviteContactsModal from "../../components/InviteContactsmodal/InviteContactsModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { auth, db } from "../../firebase/firebaseConfig";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import ParentalVerificationModal from '../../components/ParentalVerificationModal';
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { parentVerificationResendTemplate } from "../../utils/parentVerificationTemplates";
import ConnectModal from "../../components/Connectmodal/ConnectModal";
import { useOutletContext } from "react-router-dom";
import { useModal } from '../../contexts/ModalContext';
import ResourceCarousel from "./ResourceCarousel";
import { LuPlay, LuUsers, LuGraduationCap, LuBriefcase, LuFileText, LuBookOpen, LuMapPin, LuCalendar, LuTarget, LuAward } from "react-icons/lu";
import toast from "react-hot-toast";
import OrganizationProfileModal from "../../components/Organizationprofile/OrganizationProfileModal";


class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error("ReactPlayer error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Error loading video player</div>;
    }
    return this.props.children;
  }
}

export default function Home(){

    const currentUser = auth.currentUser;

    const [userBasicInfo, setUserBasicInfo] = useState(null);
    const [showParentModal, setShowParentModal] = useState(false);
    const [showVerifedConnectionModal, setShowVerifiedConnectionModal] = useState(false);
    const [connectedUserData, setConnectedUserData] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('launchpadOrganizationFavorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedFavorite, setSelectedFavorite] = useState(null);
    const [showFavoriteModal, setShowFavoriteModal] = useState(false);
    const {openProfileModal, openApplyModal, openConnectModal} = useModal();

    const { chatClient } = useOutletContext();

    const storedUserBasicInfo = localStorage.getItem("basicUserInfo");

    const info = JSON.parse(storedUserBasicInfo);

    // Listen for sidebar state changes
    useEffect(() => {
        const handleSidebarToggle = (event) => {
            const isCollapsed = event.detail.isCollapsed;
            setIsSidebarCollapsed(isCollapsed);
        };

        // Initial check - get current state from DOM
        const sidebar = document.querySelector('.v0-sidebar');
        if (sidebar) {
            const isCollapsed = sidebar.classList.contains('v0-sidebar-collapsed');
            setIsSidebarCollapsed(isCollapsed);
        }

        // Listen for custom sidebar toggle events
        window.addEventListener('sidebarToggle', handleSidebarToggle);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
        };
    }, []);

    const getUserData = async () => {
      // COMMUNITY VERSION: Removed tenant-based architecture
      const userDocRef = doc(db, 'users', currentUser.uid);
      unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
              return doc.data();
          } else {
              console.log("No such document!");
              return null;
          }
      });
    };

    // COMMUNITY VERSION: Commented out parent verification logic
    // const onUpdateParentEmail = async (newEmail) => {
    //   const updatedBasicUserInfo = { ...userBasicInfo, parentEmail: newEmail };
    //   localStorage.setItem('basicUserInfo', JSON.stringify(updatedBasicUserInfo));
    //   setUserBasicInfo(updatedBasicUserInfo);
    //   const userDocRef = doc(db, 'users', currentUser.uid);
    //   try{
    //     await updateDoc(userDocRef, {parentEmail: newEmail});
    //   } catch (error) {
    //     console.error("Error updating parent email:", error);
    //   }
    // };

    // COMMUNITY VERSION: Commented out parent verification logic
    // const onParentVerificationResend = async () => {
    //   const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
    //   const verificationLinkResult = await generateVerificationLink({
    //     uid: currentUser.uid,
    //     action: "verify_account",
    //   });
    //
    //   // Extract the verification link from the result
    //   const verificationLink = verificationLinkResult.data;
    //
    //   const sendSESEmail = httpsCallable(getFunctions(), "sendSESEmail");
    //   const result = await sendSESEmail({
    //     recipient: [ userBasicInfo.parentEmail ],
    //     subject: "Verify Your Student's Account",
    //     htmlTemplate: parentVerificationResendTemplate({
    //       studentName: userBasicInfo.userName ? userBasicInfo.userName.split(" ")[0] : "",
    //       parentName: "",
    //       verificationLink: verificationLink}),
    //     emailType: "parent_verification"});
    // };

    
    const getUserTokenInfo = async () => {
        if (currentUser) {
            const idTokenResult = await currentUser.getIdTokenResult();
            const schoolId = idTokenResult.claims.school_id;
            console.log("School Id!!!!:", schoolId);

            setUserBasicInfo((prev) => ({
                ...prev, 
                schoolId,
            }));
        }
    };

    useEffect(() => {
      setUserBasicInfo(JSON.parse(storedUserBasicInfo));

      // if(!schoolId){
      getUserTokenInfo();
      // }

      const sessionFlag = sessionStorage.getItem('parentalModalShown');
      if (
        info &&
        info.userType === 'High Schooler' &&
        info.parentEmail &&
        !info.parentVerified &&
        !sessionFlag
      ) {
        setShowParentModal(true);
        sessionStorage.setItem('parentalModalShown', 'true');
        return;
      }

    }, []);

    const handleOnConnectClick = async (connectingUserData) => {
      setConnectedUserData(connectingUserData);
      setShowVerifiedConnectionModal(true);
    }
    
    const resourceData = {
        "How To Network": [
          {
            title: "The Basics of (Digital) Networking for Highschoolers",
            link: "https://docs.google.com/document/d/1G57KLYBhdCnElJDgJ_zYKv1Eg-3_MYZ8ULVhyW0B3j0/edit",
            description: "Launchpad gives you access to undergraduates and industry professionals who are experienced in your fields of interest - but it's up to YOU to make the most of these connections. Read this guide to learn how to approach busy professionals and take full advantage of their expertise. By following these networking strategies, you will open doors to the learning and working opportunities of your lifetime.",
            recommendedBanner: "yes (highly recommended)",
            userType: "High Schoolers"
          }
        ],
        "Find Your Ideal Career": [
          {
            title: "Career Explorer Free Career Survey",
            link: "https://www.careerexplorer.com/career-test/",
            description: "Find your dream career based on your personality, strengths, and experiences! The Career Explorer Career Survey is widely regarded as the #1 career survey in the world for any students seeking to learn more about careers they'd be a great fit for. It is perfect for students who want to learn more about jobs within a certain area of interest (i.e business) or just understand careers better in general. Though long, it is very highly recommended to complete this survey in order to find careers that are a great fit for you (career explorer generates 30 career options based on responses).",
            recommendedBanner: "yes",
            time: "20 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "VIA Free Character Strength Survey",
            link: "https://www.viacharacter.org/surveys/takesurvey",
            description: "Find your top 3 strengths with the VIA survey! The VIA free personality test is highly recommended by experts for anyone seeking to learn more about their character. It's an excellent, thorough tool for gaining self-awareness, helping highschool students craft compelling college essays, and considering which colleges might be the best fit. For students and professionals alike, it provides valuable insights into which career environments might make you happiest.",
            recommendedBanner: "yes",
            time: "10 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Myers Briggs Free Personality Test",
            link: "https://www.16personalities.com/free-personality-test",
            description: "Possibly the most famous and respected personality test, a test that has helped millions understand themselves better and thus find their dream career. The Myers Briggs personality test places you into one of the 16 personality types and then gives you a multiple page report with recommendations about career paths, what workplace is best for you, famous people with your personality type, etc… Overall, it is a very useful tool to determine what career matches your personality.",
            recommendedBanner: "no",
            time: "10 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Indigo Research Career Pathway Guide",
            link: "https://www.indigoresearch.org/blog/how-to-choose-profession",
            description: "Not sure how to start your career path as a highschooler? You're not alone! The Indigo Research Blog offers an insightful guide that gives you, as a highschooler, actionable steps to start your real-world career experience. This blog provides practical tips on how to identify your strengths, explore your interests, and seek mentorship and internships. Make sure to take action on the lessons by reaching out to undergrads and professionals on Launchpad after!",
            recommendedBanner: "yes",
            userType: "High Schoolers"
          },
          {
            title: "Education Planner Checklist and Resources",
            link: "http://www.educationplanner.org/students/career-planning/checklists",
            description: "Learn about the 6 core tasks you should have done by highschool. Make sure you are on task to achieve them! Education Planner has links to other useful guides, it is a great starting point to understand what to do during your highschool years. Take action on what you learn with Launchpad! Find volunteer opportunities and reach out to undergrads & professionals to check off your highschool list.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "My Next Move Career Outlook",
            link: "https://www.mynextmove.org/?fbclid=IwAR2OGpd-YNBFlZu_ZUOW8RQY1kFf1Exanso_MPFmT2vF6aRaluimDiMwde4",
            description: "Discover your ideal career path with My Next Move! Think of it as an interactive version of regular career outlook resources like Occupational Outlook Handbook. My Next Move is a top-rated resource designed to help students identify careers that align with their interests, strengths, and goals - you'll understand the average salary, job growth, and other key metrics about your dream careers. Whether you're passionate about a specific field, like finance or healthcare, or just want to explore your options, My Next Move offers a personalized experience that guides you toward the careers that are the best fit for you.",
            recommendedBanner: "no",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Occupational Outlook Handbook",
            link: "https://www.bls.gov/ooh/home.htm",
            description: "The Occupational Outlook Handbook is an excellent tool for exploring different careers. It provides insights into what a typical day looks like in a given profession, the required education, and average salaries in the U.S. Additionally, the Similar Careers tab helps you discover related fields, broadening your understanding of career possibilities. The more you explore, the better informed you'll be about your options.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          }
        ],
        "Find Your Dream University": [
          {
            title: "College Board College Search and Quiz",
            link: "https://bigfuture.collegeboard.org/college-search/filters",
            description: "The college board provides a great university search tool. Click 'match me' to take their quick quiz and find your best-fit universities, based on your interests. You can also search and learn more about universities you already have in mind.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "Cialfo College Search",
            link: "https://www.cialfo.co/",
            description: "If your school provides you with Cialfo, take full advantage of it. Cialfo provides an excellent college search tool that allows you to search for colleges based on your interests and learn everything about them.",
            recommendedBanner: "no",
            userType: "High Schoolers",
          }
        ],
        "Resume-Building": [
          {
            title: "Yale Resume-Phrasing Guide",
            link: "https://ocs.yale.edu/resources/writing-impactful-resume-bullets/",
            description: "According to Yale University Admissions, the key to writing a resume is not quantity, but quality. Only write about your experiences that truly made an impact and/or showcase your interests. Filler awards and positions only hinder you. A good student resume is one page long. Here's how to write a student resume that impresses both college admissions and internship and job employers.",
            recommendedBanner: "yes",
            userType: "High Schoolers and Undergrads"
          }
        ],
        "SAT/ACT Hacks": [
          {
            title: "College Board Bluebook Practice Tests",
            link: "https://bluebook.app.collegeboard.org/",
            description: "Download bluebook to take 6 college board verified digital SAT practice Tests. This is the nearest thing to the actual SAT exam, and is the most useful tool to gauge where you are and how you are improving",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "SAT Panda FREE Practice Test and Study Guides",
            link: "https://www.satpanda.com/sat/",
            description: "SAT Panda is widely regarded as the #1 free resource for SAT Prep. It gives you access to 20 free practice tests and thousands of free practice questions in specific subjects you need to work on. Stand-alone, SAT Panda is a great SAT prep tool alone, but it works best as a complementary resource to tutors or other study programs.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "ACT Test Free Practice Tests & Questions",
            link: "https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html",
            description: "This is the nearest thing to the actual ACT exam, and is a useful tool to gauge where you are and how you are improving. You can take tests specific to your weaker sections, as well as answer hundreds of free practice questions. Remember, like for the SAT, It is recommended to find some sort of a tutor or self-study ACT prep plan to prepare for this important test.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          }
        ],
      };

    const refSections = useRef({});

    const resourceSections = { "How To Network": "howToNetwork", "Find Your Ideal Career": "discoverYourCareer", "Find Your Dream University":"findDreamUniversity", "Resume-Building": "buildResume", "SAT/ACT Hacks":"satTips"}
    
    const handleSectionRef = (title, ref) => {
        if (refSections.current) {
            refSections.current[title] = ref;
        }
    };

    const removeFavorite = (index) => {
        const newFavorites = favorites.filter((_, i) => i !== index);
        setFavorites(newFavorites);
        localStorage.setItem('launchpadOrganizationFavorites', JSON.stringify(newFavorites));
        toast.success('Removed from favorites');
    };

    const openFavoriteModal = (favorite) => {
        setSelectedFavorite(favorite);
        setShowFavoriteModal(true);
    };

    const handleReferalClick = (action, organizationData, userData) => {
        if (action === 'learnMore') {
            // Handle learn more action based on the organization data
            const learnMoreMethod = organizationData.learnMore?.split(': ')[0] || 'Messages'
            const learnMoreValue = organizationData.learnMore?.split(': ')[1]
            
            if (learnMoreMethod === 'Website' && learnMoreValue) {
                // Open website in new tab
                window.open(learnMoreValue, '_blank', 'noopener,noreferrer')
            } else if (learnMoreMethod === 'Email' && learnMoreValue) {
                // Open email client
                window.location.href = `mailto:${learnMoreValue}`
            } else if (learnMoreMethod === 'Messages' && userData) {
                // Open connect modal for messaging
                openConnectModal({
                    userData: userData,
                    isOpportunity: true,
                    opportunityType: organizationData.type || organizationData.organizationType,
                    onClose: () => {},
                    visibility: true
                })
            } else {
                // Fallback
                toast.success('Learn more functionality coming soon!')
            }
        } else if (action === 'apply') {
            // Handle apply action by opening the apply modal
            
            // Process organization data to match expected structure
            const orgName = organizationData.organizationHostCompany || organizationData.host || 'Organization'
            const applyMethod = organizationData.apply?.split(': ')[0] || 'Messages'
            const applyValue = organizationData.apply?.split(': ')[1] && organizationData.apply.split(': ')[0] === 'Website'
                ? organizationData.apply.split(': ')[1]
                : organizationData.apply?.split(': ')[1] || ''
            
            openApplyModal({
                requirements: organizationData.applicantRequirements || organizationData.requirements || [],
                applyType: applyMethod,
                applyValue: applyValue,
                orgName: orgName,
                opportunityDetails: {
                    format: organizationData.workLocation || organizationData.location,
                    eligibility: organizationData.applicants || organizationData.eligibility,
                    compensation: organizationData.isPaid,
                    duration: organizationData.timeFrame || organizationData.duration,
                    startDate: organizationData.startDate,
                    timeCommitment: organizationData.timeCommitment,
                    deadline: organizationData.deadline || organizationData.applicationDeadline,
                    learnMoreType: organizationData.learnMore?.split(': ')[0] || 'Messages',
                    learnMoreValue: organizationData.learnMore?.split(': ')[1] || '',
                    organizationType: organizationData.type || organizationData.organizationType,
                }
            })
        }
    };

    // Auto-scroll to resource details when selected
    useEffect(() => {
        if (selectedResource) {
            const resourceDetails = document.querySelector('.v0-resource-details');
            if (resourceDetails) {
                resourceDetails.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }, [selectedResource]);

    // Listen for storage changes to update favorites
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'launchpadOrganizationFavorites') {
                const newFavorites = e.newValue ? JSON.parse(e.newValue) : [];
                setFavorites(newFavorites);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return(
        <>
            {showVerifedConnectionModal && <ConnectModal onClose = {()=>setShowVerifiedConnectionModal(false)} userData={connectedUserData} visibility={showVerifedConnectionModal} chat={chatClient} userId = {connectedUserData.id}/>}
            {showParentModal && (
              <ParentalVerificationModal
                parentEmail={userBasicInfo.parentEmail}
                parentVerified={userBasicInfo.parentVerified}
                userEmail={userBasicInfo.email}
                onResend={onParentVerificationResend}
                onClose={() => setShowParentModal(false)}
                onUpdateEmail={onUpdateParentEmail}
              />
            )}
            
            {/* Organization Profile Modal for Favorites */}
            {showFavoriteModal && selectedFavorite && (
              <OrganizationProfileModal
                organization={selectedFavorite}
                isVisible={showFavoriteModal}
                onClose={() => {
                  setShowFavoriteModal(false);
                  setSelectedFavorite(null);
                }}
                location="modal"
                handleReferalClick={handleReferalClick}
              />
            )}
            <TopBar isSidebarCollapsed={isSidebarCollapsed}/>
            <SideNav/>
            <div className={`v0-home-container ${isSidebarCollapsed ? 'v0-home-sidebar-collapsed' : 'v0-home-sidebar-expanded'}`}>
                {/* {localStorage.getItem("schoolId") && (
                    <div className="v0-invite-section">
                    {userBasicInfo && <InviteContacts userBasicInfo={userBasicInfo} userName={userBasicInfo.userName.split(" ")[0] ?? "User"} tenantId={capitalizeFirstLetter(localStorage.getItem("schoolId"))}/>}
                    </div>
                )}
                 */}
                <div className="v0-welcome-section">
                    <div className="v0-welcome-banner">
                        <h1 className="v0-welcome-title">Welcome back, {userBasicInfo?.userName?.split(" ")[0] || "User"}!</h1>
                        <p className="v0-welcome-subtitle">Ready to connect and grow your {capitalizeFirstLetter(localStorage.getItem("schoolId") || "school")} network today?</p>
                    </div>
                </div>

                <div className="v0-main-content">
                    <div className="v0-content-grid">
                        <div className="v0-video-section">
                            <div className="v0-video-card">
                                <div className="v0-video-header">
                                    <LuPlay size={20} />
                                    <span>Getting Started</span>
                                    <span className="v0-video-subtitle">Learn how to make the most of the {capitalizeFirstLetter(localStorage.getItem("schoolId") || "Awty")} Network</span>
                                </div>
                                <div className="v0-video-container">
                        <ErrorBoundary>
                            <ReactPlayer
                                url='https://www.youtube.com/watch?v=uhnxWBqVvbY'
                                width='100%'
                                height='100%'
                                            controls={true}
                                        />
                        </ErrorBoundary>
                                </div>
                                <button className="v0-watch-btn">Watch Tutorial</button>
                            </div>
                        </div>

                        <div className="v0-profile-section">
                            <div className="v0-profile-card">
                                <div className="v0-profile-header">
                                    <h3>Profile Strength</h3>
                                    {/* <br /> */}
                                    {/* <p>Complete your profile to connect with more people</p> */}
                                </div>
                                <div className="v0-profile-content">
                                    <ProfileStrength userData={userBasicInfo}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Favorites Section - Only show when there are favorites */}
                    {favorites && favorites.length > 0 && (
                        <div className="v0-favorites-section">
                            <div className="v0-favorites-header">
                                <h2>My Favorite Opportunities</h2>
                                <p>Save opportunities you're interested in to come back to later</p>
                            </div>
                            <div className="v0-favorites-content">
                                <div className="v0-favorites-grid">
                                    {favorites.map((favorite, index) => (
                                        <div key={index} className="v0-favorite-item">
                                            <div className="v0-favorite-header">
                                                <div className="v0-favorite-org-info">
                                                    <div className="v0-favorite-org-avatar">
                                                        <img 
                                                            src={favorite.logo || favorite.profilePictureUrl || favorite.pfp || '/src/public/assets/placeholder_pfp.png'} 
                                                            alt={favorite.name || 'Organization'}
                                                            onError={(e) => {
                                                                e.target.src = '/src/public/assets/placeholder_pfp.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="v0-favorite-title-section">
                                                        <h3>{favorite.name || 'Organization'}</h3>
                                                        <div className="v0-favorite-type-badge">
                                                            <LuTarget size={14} />
                                                            <span>{favorite.type || 'Opportunity'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="v0-favorite-remove-btn"
                                                    onClick={() => removeFavorite(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            
                                            {favorite.position && (
                                                <div className="v0-favorite-opportunity-title">
                                                    {favorite.position}
                                                </div>
                                            )}
                                            
                                            <div className="v0-favorite-info-grid">
                                                {favorite.location && (
                                                    <div className="v0-favorite-info-item">
                                                        <LuMapPin size={16} />
                                                        <span>{favorite.location}</span>
                                                    </div>
                                                )}
                                                {favorite.startDate && (
                                                    <div className="v0-favorite-info-item">
                                                        <LuCalendar size={16} />
                                                        <span>{favorite.startDate}</span>
                                                    </div>
                                                )}
                                                {favorite.timeFrame && (
                                                    <div className="v0-favorite-info-item">
                                                        <LuCalendar size={16} />
                                                        <span>{favorite.timeFrame}</span>
                                                    </div>
                                                )}
                                                {favorite.isPaid !== undefined && favorite.isPaid !== null && (
                                                    <div className="v0-favorite-info-item">
                                                        <LuAward size={16} />
                                                        <span>{favorite.isPaid ? 'Paid' : 'Unpaid'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {favorite.description && (
                                                <p className="v0-favorite-description">
                                                    {favorite.description.length > 120 
                                                        ? `${favorite.description.substring(0, 120)}...` 
                                                        : favorite.description
                                                    }
                                                </p>
                                            )}
                                            
                                            <div className="v0-favorite-actions">
                                                <button 
                                                    className="v0-favorite-view-btn"
                                                    onClick={() => openFavoriteModal(favorite)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="v0-resource-section">
                        <div className="v0-resource-header">
                            <h2>Resource Center</h2>
                            <p>Explore resources to help with your academic and professional journey</p>
                        </div>
                        <div className="v0-resource-grid">
                            <div 
                                className={`v0-resource-item ${selectedResource === 'How To Network' ? 'v0-resource-item-selected' : ''}`}
                                onClick={() => setSelectedResource(selectedResource === 'How To Network' ? null : 'How To Network')}
                            >
                                <LuUsers size={32} className="v0-resource-icon" />
                                <h3>Networking Tips</h3>
                                <p>Build meaningful connections</p>
                            </div>
                            <div 
                                className={`v0-resource-item ${selectedResource === 'Find Your Ideal Career' ? 'v0-resource-item-selected' : ''}`}
                                onClick={() => setSelectedResource(selectedResource === 'Find Your Ideal Career' ? null : 'Find Your Ideal Career')}
                            >
                                <LuBriefcase size={32} className="v0-resource-icon" />
                                <h3>Career Guidance</h3>
                                <p>Explore career paths</p>
                            </div>
                            <div 
                                className={`v0-resource-item ${selectedResource === 'Find Your Dream University' ? 'v0-resource-item-selected' : ''}`}
                                onClick={() => setSelectedResource(selectedResource === 'Find Your Dream University' ? null : 'Find Your Dream University')}
                            >
                                <LuGraduationCap size={32} className="v0-resource-icon" />
                                <h3>College Prep</h3>
                                <p>Application tips and guidance</p>
                            </div>
                            <div 
                                className={`v0-resource-item ${selectedResource === 'Resume-Building' ? 'v0-resource-item-selected' : ''}`}
                                onClick={() => setSelectedResource(selectedResource === 'Resume-Building' ? null : 'Resume-Building')}
                            >
                                <LuFileText size={32} className="v0-resource-icon" />
                                <h3>Resume Building</h3>
                                <p>Create compelling resumes</p>
                            </div>
                            {/* <div 
                                className={`v0-resource-item ${selectedResource === 'SAT/ACT Hacks' ? 'v0-resource-item-selected' : ''}`}
                                onClick={() => setSelectedResource(selectedResource === 'SAT/ACT Hacks' ? null : 'SAT/ACT Hacks')}
                            >
                                <LuBookOpen size={32} className="v0-resource-icon" />
                                <h3>Test Prep</h3>
                                <p>SAT/ACT preparation tips</p>
                            </div> */}
                        </div>
                    </div>

                    {selectedResource && (
                        <div className="v0-resource-details">
                            <div className="v0-resource-header-selected">
                                <h3>{selectedResource}</h3>
                                <button 
                                    className="v0-resource-close-btn"
                                    onClick={() => setSelectedResource(null)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="v0-resource-content">
                                <ResourceCarousel
                                    title={selectedResource}
                                    resources={resourceData[selectedResource]}
                                    sectionRef={refSections.current[selectedResource]}
                                    onSectionRef={handleSectionRef}
                                />
                            </div>
                        </div>
                    )}

                    <div className="v0-support-section">
                        <h2>Launchpad Support</h2>
                        <div className="v0-support-card">
                            <p>If you experience any technical bugs, errors, or issues of any sort, please contact <span className="v0-highlight">launchpadhelpline@gmail.com</span>. Additionally, if you have any questions about networking or certain opportunities, feel free to contact us there as well!</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function InviteContacts({userName, tenantId, userBasicInfo}){
    const [inviteContactsModalVisibility,setInviteContactsModalVisibility] = useState(false);

    const disableActions = userBasicInfo.userType === "High Schooler" && !userBasicInfo.parentVerified;

    return(
        <>
        {inviteContactsModalVisibility && <InviteContactsModal onClose={()=>setInviteContactsModalVisibility(false)} visibility={inviteContactsModalVisibility} tenantId={tenantId}/>}
        <div className="v0-invite-card">
            <div className="v0-invite-content">
                <h2 className="v0-invite-title">Hello, {userName}!</h2>
                <p className="v0-invite-text">
                    Know any <strong>{tenantId} high schoolers</strong> or <strong>{tenantId} alumni</strong> who would benefit from being on the app? Know other <strong>professionals</strong> in the {tenantId} community willing to share their expertise? Invite friends and family below!
                </p>
                <button 
                  disabled={disableActions} 
                    className="v0-invite-btn"
                    onClick={() => {if(!disableActions)setInviteContactsModalVisibility(true)}}
                  title={disableActions ? "Parent/guardian approval required" : ""}
                >
                  Invite Contacts
                </button>
            </div>
        </div>
        </>
    )
}

function ResourceItem({resourceType, resourceRef}){

  const handleResourceClick = () => {
    resourceRef.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      });
  }
  return(
      <button className="v0-resource-tab" onClick={handleResourceClick}>
          <span>{resourceType}</span>
          <FaArrowCircleDown color="grey" size={20}/>
      </button>
  )
}

function ResourceCard({ title, link, description, recommendedBanner, time, userType }) {
    return (
      <div className="v0-resource-card">
        {recommendedBanner === "yes (highly recommended)" && (
            <ImportanceBanner/>
        )}
        <h3>{title}</h3>
        <p>{description}</p>
        {time && <span>Time: {time}</span>}
        <p>For: {userType}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="v0-resource-link">
          Access Resource
        </a>
      </div>
    );
  }  

function ImportanceBanner(){
    return(
        <div className="v0-importance-banner">
            <span>Highly Recommended!</span>
        </div>
    )
}