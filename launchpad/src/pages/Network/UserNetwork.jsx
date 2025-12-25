import "./UserNetwork.css";
import UserCard from "../../components/Usercard/UserCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileModal from '../../components/Profilemodal/ProfileModal';
import { useState, useEffect, useContext, createContext, useRef } from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SearchBar from "../../components/Searchbar/SearchBar";
import { GrNext, GrPrevious } from "react-icons/gr";
import ConnectModal from "../../components/Connectmodal/ConnectModal";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { getFilteredData } from "../../services/filteringServices";
import { searchDocuments } from "../../services/searchServices";
import NoResults from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";
import toast, { Toaster } from "react-hot-toast";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from 'firebase/firestore';
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import { capitalizeFirstLetter } from "../Homepage/Home";
import ParentalConnectionModal from "../../components/ParentalConnectionModal";
import { useModal } from '../../contexts/ModalContext';
import { useConnections } from "../../contexts/ConnectionContext";
import { checkConnection, isConnectionApproved } from "../../services/connectionService";
import { highSchools } from "../Onboarding/Options";
import { motion } from 'framer-motion';
import { FaUserFriends } from 'react-icons/fa';
import InviteContactsModal from "../../components/InviteContactsmodal/InviteContactsModal";
// import { checkConnection } from "../../services/connectionService";


const NetworkContext = createContext();

export default function UserNetwork() {

  const {currentUser} = useAuth();
  const navigate = useNavigate();

  const { chatClient, isConnected } = useOutletContext();

  // COMMUNITY VERSION: Generic network name instead of school-specific
  const pageName = "Launchpad Network";

  // COMMUNITY VERSION: Removed tenantId - no longer needed without multi-tenant architecture
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { openConnectModal, openParentalConnectionModal } = useModal();

  const [highSchoolers, setHighSchoolers] = useState([]);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  // const [staff, setStaff] = useState([]);

  const loadLimit = 9;
  const [lastDocs, setLastDocs] = useState({ highSchool: null, college: null, professional: null });
  const [loading, setLoading] = useState({ highSchool: false, college: false, professional: false });
  const [overallLoading, setOverallLoading] = useState(false);

  const [allVisibleUserData, setAllVisibleUserData] = useState(null);
  const [connectionRefreshKey, setConnectionRefreshKey] = useState(0);
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections();

  const [isRecommended, setIsRecommended] = useState("(recommended)");
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const userName = JSON.parse(localStorage.getItem("basicUserInfo") || '{}').userName || '';
  
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
  
  useEffect(() => {
    document.addEventListener("keydown", onKeyPress, true)
  }, [])

  const onKeyPress = (e) => {
    if(e.key === "Escape"){
      // setProfileModalVisibility(false); // This line is removed
    }
  }

  // COMMUNITY VERSION: Removed parentVerified - no longer needed without parent verification system
  const { userType, isCommitted } = JSON.parse(localStorage.getItem("basicUserInfo"));
  const [filters, setFilters] = useState({
    userType: 'Any User',
    collegeInterestsOrDecision: userType === "High Schooler" ? "Any College" : null,
    // Default to "My Interests" to show relevant users
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    networkingLevel: 'Any Availability',
    schoolAttending: 'Any High School',
  });
  const [filterChanged, setFilterChanged] = useState(false);

  const filterContent = {
    userType: ["Any User", "Professionals", "College Students", "High Schoolers"],
    collegeInterestsOrDecision:  (!isCommitted ? ["Any College", "My Dream Colleges"] : ["Any College", "My College"]),
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`, `Any ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    networkingLevel: ["Any Availability", "Casual Connection", "General Inquiries", "Short Interview", "Project Support", "Mock Interview", "Workplace Opportunities"],
    schoolAttending: ["Any High School", "My High School", ...highSchools.map(school => school.label)],
  };

  useEffect(()=>{
    setOverallLoading(true);

    // DIAGNOSTIC: Check what's actually in the database
    const diagnosticCheck = async () => {
      console.log('🔍 DIAGNOSTIC: Checking users collection...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log('🔍 Total users in database:', usersSnapshot.docs.length);

      const userTypes = {};
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.userType || 'NO_TYPE';
        userTypes[type] = (userTypes[type] || 0) + 1;
        console.log('🔍 User:', doc.id, 'Type:', data.userType, 'Name:', data.userName);
      });

      console.log('🔍 UserType breakdown:', userTypes);
    };
    diagnosticCheck();

    fetchAllUserTypes();
    
    // Check if any interests are selected (not just "Any")
    const hasSpecificInterests = Array.isArray(filters.areasOfInterestOrExpertise) && 
      filters.areasOfInterestOrExpertise.some(interest => !interest.includes('Any'));
    
    if(hasSpecificInterests){
      setIsRecommended("(recommended)");
    } else {
      setIsRecommended("");
    }
  },[filters]);

  useEffect(() => {
    setAllVisibleUserData([...highSchoolers, ...collegeStudents, ...professionals ]);
    // setAllVisibleUserData([...highSchoolers, ...collegeStudents, ...professionals, ...staff]);

    console.log("All data:", allVisibleUserData)
  },[collegeStudents, highSchoolers, professionals]);

  const fetchAllUserTypes = async () => {
      console.log('fetchAllUserTypes called with filters:', filters);
      // Only fetch user types based on the userType filter
      if (filters.userType === 'Any User') {
          console.log('Fetching all user types');
          await Promise.all([
              fetchUserType('High Schooler'),
              fetchUserType('College Student'),
              fetchUserType('Professional'),
              // fetchUserType('Staff')
          ]);
      } else {
          console.log('Fetching specific user type:', filters.userType);
          // Map filter values to actual user types
          const userTypeMap = {
              'High Schoolers': 'High Schooler',
              'College Students': 'College Student',
              'Professionals': 'Professional',
              // 'Staff': 'Staff'
          };
          
          const targetUserType = userTypeMap[filters.userType];
          if (targetUserType) {
              console.log('Target user type:', targetUserType);
              // Clear other user type arrays when filtering to specific type
              if (targetUserType !== 'High Schooler') setHighSchoolers([]);
              if (targetUserType !== 'College Student') setCollegeStudents([]);
              if (targetUserType !== 'Professional') setProfessionals([]);
              // if (targetUserType !== 'Staff') setStaff([]);
              
              await fetchUserType(targetUserType);
          }
      }
  };

  const fetchUserType = async (category, isLoadMore = false) => {
      setLoading(prev => ({ ...prev, [category]: true }));
      console.log(`[UserNetwork] Fetching ${category} with filters:`, filters);
      try {
          const { results, lastVisible } = await getFilteredData(
              'users',
              filters,
              currentUser.uid,
              category,
              isLoadMore ? lastDocs[category] : null,
              loadLimit,
          );

          console.log(`[UserNetwork] Got ${results.length} results for ${category}:`, results);
          setLastDocs(prev => ({ ...prev, [category]: lastVisible }));

          switch(category) {
              case 'High Schooler':
                  // COMMUNITY VERSION: Removed parentVerified filter - all high schoolers are now visible
                  setHighSchoolers(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
              case 'College Student':
                  setCollegeStudents(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
              case 'Professional':
                  setProfessionals(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
              // case 'Staff':
              //     setStaff(prev => isLoadMore ? [...prev, ...results] : results);
              //     break;
          }
      } catch (error) {
          console.error(`Error fetching ${category} data:`, error);
      } finally {
          setLoading(prev => ({ ...prev, [category]: false }));
          setOverallLoading(false);
          setFilterChanged(false);
      }
  };

  const loadMore = (category) => {
      if (!loading[category] && lastDocs[category]) {
        console.log("fetching more...");
        fetchUserType(category, true);
      }
  };

  const handleFilterChange = (filterKey, value) => {
    console.log('Filter changed:', filterKey, value);
    setFilterChanged(true);
    setFilters(prev => {
      const newFilters = {...prev, [filterKey]: value};
      console.log('New filters:', newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      userType: 'Any User',
      collegeInterestsOrDecision: userType === "High Schooler" ? "Any College" : null,
      // Reset to "My Interests" to show relevant users
      areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
      networkingLevel: 'Any Availability',
      schoolAttending: 'Any High School',
    });
    setFilterChanged(true);
  };

  const handleConnectClick = (userId) => {
    const user = allVisibleUserData.filter((user) => user.userId === userId)[0];
    // COMMUNITY VERSION: Removed parental connection logic - all users can connect freely
    
    // Get connection status from localStorage to avoid redundant Firebase calls
    // const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    // const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    // Check both pending and approved connections, or any direct connections (not in pending list)
    // const isConnected = pendingConnections.includes(userId) || approvedConnections.includes(userId);
    // COMMUNITY VERSION: No schoolId needed
    const connectionData = checkConnection(userId);
    
    openConnectModal({ 
      userData: user, 
      chat: chatClient, 
      userId,
      isConnected: connectionData.isConnected,
      onConnectionSuccess: () => {
        // Refresh connection status for all UserCard components
        setConnectionRefreshKey(prev => prev + 1);
      }
    });
  };

  const handleOnProfileClick = (userId, connectionStatus) => {
    // Navigate to the user's profile page
    navigate(`/profile/${userId}`);
  };

  // All modal logic is now handled via ModalContext

  // COMMUNITY VERSION: Removed custom claims logic - no longer using school_id claims

  const handleSearch = async (e, queryText) => {
    e.preventDefault();
    if (queryText) {
      // COMMUNITY VERSION: No tenantId needed for search
      const searchResults = await searchDocuments('users', queryText);
      setAllVisibleUserData(searchResults);
      // COMMUNITY VERSION: Removed parentVerified filter from search results
      setHighSchoolers(searchResults.filter((result) => result.userType === "High Schooler"));
      setCollegeStudents(searchResults.filter((result) => result.userType === "College Student"));
      setProfessionals(searchResults.filter((result) => result.userType === "Professional"));
    }
  };

  const handleEmailClick = async (email) => {
    console.log(`Email clicked: ${email}`)
    try {
        await navigator.clipboard.writeText(email);
        toast.success('Email copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy email: ', err);
        toast.error('Failed to copy email');
      }
  
}

  const handleReferalClick = async (referalType, organizationData, userData) => {
    const referalValue = organizationData[referalType === "learnMore" ? "learnMore" : "apply"];
    const methodType = referalValue?.split(': ')[0];
    const value = referalValue?.split(': ')[1];
    console.log("DATA:", userData);
    
    switch(methodType){
        case "Messages":
            handleConnectClick(userData.id);
            return;
        case "Email":
            handleEmailClick(value);
            return;
        case "Website":
            window.open(value, '_blank', 'noopener,noreferrer');
            return;
      }
  }

  // const isConnectionApproved = (targetUser) => {
  //   if (userType !== 'High Schooler' || targetUser.userType === 'High Schooler') {
  //     return true;
  //   }
  //   if (!parentVerified) {
  //     return false;
  //   }
  //   const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
  //   return approvedConnections.includes(targetUser.id);
  // };

  // Remove all unused modal state and related variables
  // Remove: profileModalVisibility, connectModalVisibility, showParentalConnectionModal, profileTargetData, connectTargetUser, connectTargetUserId, profileModalTop, setProfileTargetData, setConnectTargetUser, setConnectTargetUserId, setProfileModalTop
  // Remove any useEffect or logic that references these variables
  // Remove lines:
  //   if (profileModalVisibility) { ... }
  //   }, [profileModalVisibility]);
  //   if (!connectTargetUser) return;
  //   if (userType === 'High Schooler' && connectTargetUser.userType !== 'High Schooler') { ... }
  //   setShowParentalConnectionModal(true);
  //   setConnectModalVisibility(false);
  //   setShowParentalConnectionModal(false);
  //   setConnectModalVisibility(true);
  //   }, [connectTargetUser]);
  // All modal logic is now handled via ModalContext

  return (
    <NetworkContext.Provider value={{handleOnProfileClick, handleConnectClick, loadLimit, filterChanged}}>
      <>
        {inviteModalVisible && (
          <InviteContactsModal
            onClose={() => setInviteModalVisible(false)}
            visibility={inviteModalVisible}
            userName={userName}
          />
        )}
        {/* <Toaster position={'bottom-right'} reverseOrder={false}/> */}
        {/* All modals are now handled globally via ModalContext */}
        <div>
            <TopBar isSidebarCollapsed={isSidebarCollapsed}/>
            <SideNav/>
            <div className={`networkContainer ${isSidebarCollapsed ? 'network-sidebar-collapsed' : 'network-sidebar-expanded'}`} id="networkContainer">
              <SearchBar 
  filters={filterContent} 
  currentFilters={filters}
  pageName={pageName} 
  handleFilterChange={handleFilterChange} 
  handleSearch={handleSearch}
  clearAllFilters={clearAllFilters}
/>
              <div className="v0-network-content">
                {allVisibleUserData && allVisibleUserData.length > 0 ? (
                  // Show grid view when filtering by specific user type
                  filters.userType !== 'Any User' ? (
                    <div className="v0-filtered-results">
                      {filters.userType === 'Professionals' && professionals.length > 0 && (
                        <UserGrid 
                          userNetworkData={professionals}
                          onEndReached={() => loadMore('Professional')}
                          loading={loading.professional}
                          connectionRefreshKey={connectionRefreshKey}
                          title="Professionals"
                        />
                      )}
                      {filters.userType === 'College Students' && collegeStudents.length > 0 && (
                        <UserGrid 
                          userNetworkData={collegeStudents}
                          onEndReached={() => loadMore('College Student')}
                          loading={loading.college}
                          connectionRefreshKey={connectionRefreshKey}
                          title="College Students"
                        />
                      )}
                      {filters.userType === 'High Schoolers' && highSchoolers.length > 0 && (
                        <UserGrid 
                          userNetworkData={highSchoolers}
                          onEndReached={() => loadMore('High Schooler')}
                          loading={loading.highSchool}
                          connectionRefreshKey={connectionRefreshKey}
                          title="High Schoolers"
                        />
                      )}
                      {/* {filters.userType === 'Staff' && staff.length > 0 && (
                        <UserGrid 
                          userNetworkData={staff}
                          onEndReached={() => loadMore('Staff')}
                          loading={loading.staff}
                          connectionRefreshKey={connectionRefreshKey}
                          title="Staff"
                        />
                      )} */}
                    </div>
                  ) : (
                    // Show carousel view when showing all user types
                    <>
                      {professionals.length > 0 && (
                        <div className="v0-network-section">
                          <div className="v0-network-section-header">
                            <h3 className="v0-network-section-title">Professionals</h3>
                            <span className="v0-network-section-badge">{isRecommended}</span>
                          </div>
                          <div className="v0-network-section-content">
                            <UserCarousel 
                              userNetworkData={professionals}
                              onEndReached={() => loadMore('Professional')} 
                              loading={loading.professional}
                              connectionRefreshKey={connectionRefreshKey}
                            />
                          </div>
                        </div>
                      )}
                      {collegeStudents.length > 0 && (
                        <div className="v0-network-section">
                          <div className="v0-network-section-header">
                            <h3 className="v0-network-section-title">College Students</h3>
                            <span className="v0-network-section-badge">{isRecommended}</span>
                          </div>
                          <div className="v0-network-section-content">
                            <UserCarousel 
                              userNetworkData={collegeStudents}
                              onEndReached={() => loadMore('College Student')}
                              loading={loading.college}
                              connectionRefreshKey={connectionRefreshKey}
                            />
                          </div>
                        </div>
                      )}
                      {highSchoolers.length > 0 && (
                        <div className="v0-network-section">
                          <div className="v0-network-section-header">
                            <h3 className="v0-network-section-title">High Schoolers</h3>
                            <span className="v0-network-section-badge">{isRecommended}</span>
                          </div>
                          <div className="v0-network-section-content">
                            <UserCarousel 
                              userNetworkData={highSchoolers} 
                              onEndReached={() => loadMore('High Schooler')} 
                              loading={loading.highSchool}
                              connectionRefreshKey={connectionRefreshKey}
                            />
                          </div>
                        </div>
                      )}
                      {/* {staff.length > 0 && (
                        <div className="v0-network-section">
                          <div className="v0-network-section-header">
                            <h3 className="v0-network-section-title">Staff</h3>
                            <span className="v0-network-section-badge">{isRecommended}</span>
                          </div>
                          <div className="v0-network-section-content">
                            <UserGrid 
                              userNetworkData={staff}
                              onEndReached={() => loadMore('Staff')}
                              loading={loading.staff}
                              connectionRefreshKey={connectionRefreshKey}
                              title="Staff"
                            />
                          </div>
                        </div>
                      )} */}
                    </>
                  )
                ) : overallLoading ? (
                  <div className="v0-loading-container">
                    <Loading/>
                  </div>
                ) : (
                  <div className="v0-no-results-container">
                    <EmptyNetworkState onInviteClick={() => setInviteModalVisible(true)} />
                  </div>
                )}
              </div>
            </div>
        </div>
        {/* <footer className="landing-footer">
          <LegalityFooter pathName={location.pathname}/>
        </footer> */}
      </>
    </NetworkContext.Provider>
  );
}

function UserCarousel({userNetworkData, loading, onEndReached, connectionRefreshKey}){
  const { handleOnProfileClick,handleConnectClick,loadLimit, filterChanged } = useContext(NetworkContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const itemsPerPage = isMobile ? 1 : 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const carouselRef = useRef(null);
  const scrollAmount = isMobile ? 1 : 3;

  // Listen for window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth <= 768;
      setIsMobile(nowMobile);
      // Reset index when switching between mobile and desktop
      if (wasMobile !== nowMobile) {
        setCurrentIndex(0);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(()=>{
    console.log(filterChanged)
    if(filterChanged){
      console.log("setting current index to zero...")
      setCurrentIndex(0);
    }
  },[filterChanged])

  useEffect(() => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth / itemsPerPage;
      const offset = currentIndex * (itemWidth);
      carouselRef.current.style.transform = `translateX(-${offset}px)`;
    }
    console.log(currentIndex)
    if((currentIndex % loadLimit) === (loadLimit - 3)) {
      onEndReached();
    }
  }, [currentIndex, itemsPerPage]);

  const nextSlide = () => {
    setSlideDirection('slide-left');
    setCurrentIndex(prevIndex => 
      Math.min(prevIndex + scrollAmount, userNetworkData.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setSlideDirection('slide-right');
    setCurrentIndex(prevIndex => 
      Math.max(prevIndex - scrollAmount, 0)
    );
  };

  // Calculate responsive width based on screen size and number of items
  const getCarouselWidth = () => {
    if (isMobile) {
      return "100%"; // Full width on mobile
    }
    // Desktop widths
    if (userNetworkData.length === 1) return "340.66px";
    if (userNetworkData.length === 2) return "681.33px";
    return "1022px";
  };

  return (
    <div className="carousel" style={{width: getCarouselWidth(), maxWidth: isMobile ? "400px" : "none", margin: "0 auto"}}>
      <div className="carousel-container">
        {!loading ? <div
          className={`carousel-content ${slideDirection}`}
          style={{justifyContent: `${(isMobile || userNetworkData.length <= 3) ? "center" : ""}`, gap: `${userNetworkData.length < 3 ? "10px" : ""}`}}
          onAnimationEnd={() => setSlideDirection('')}
          ref={carouselRef}
        >
          {userNetworkData.map((profile, index) => (
            <div key={index} className="carousel-item">
              <UserCard
                userData={profile}
                onProfileClick={() => handleOnProfileClick(profile.userId)}
                onConnectClick={handleConnectClick}
                refreshKey={connectionRefreshKey}
              />
            </div>
          ))}
        </div>
        : <Loading/>
        }
      </div>

      {currentIndex > 0 && (
        <button
          className="carousel-button prev"
          onClick={prevSlide}
        >
          <GrPrevious color="var(--accent)"/>
        </button>
      )}
      {currentIndex + itemsPerPage < userNetworkData.length && (
        <button
          className="carousel-button next"
          onClick={nextSlide}
        >
          <GrNext color="var(--accent)"/>
        </button>
      )}
    </div>
  )
}

function UserGrid({userNetworkData, loading, onEndReached, connectionRefreshKey, title}){
  const { handleOnProfileClick, handleConnectClick, loadLimit, filterChanged } = useContext(NetworkContext);
  const [visibleCount, setVisibleCount] = useState(loadLimit); // Start with loadLimit (9) visible items

  // Reset visible count when filter changes
  useEffect(() => {
    if (filterChanged) {
      setVisibleCount(loadLimit);
    }
  }, [filterChanged, loadLimit]);

  // Reset visible count when data changes significantly (new filter applied)
  useEffect(() => {
    if (userNetworkData.length <= loadLimit) {
      setVisibleCount(userNetworkData.length);
    }
  }, [userNetworkData.length, loadLimit]);

  // Check if there are more items to display (either in current data or to fetch)
  const hasMoreToShow = visibleCount < userNetworkData.length;
  const hasMoreToFetch = userNetworkData.length > 0 && userNetworkData.length % loadLimit === 0;

  const handleLoadMore = () => {
    // If we have more data already loaded, just show more of it
    if (hasMoreToShow) {
      setVisibleCount(prev => Math.min(prev + loadLimit, userNetworkData.length));
    }
    // If we've shown all loaded data and there might be more to fetch, fetch more
    if (!hasMoreToShow && hasMoreToFetch && !loading) {
      onEndReached();
      setVisibleCount(prev => prev + loadLimit);
    }
  };

  // Only display the visible subset of users
  const visibleUsers = userNetworkData.slice(0, visibleCount);

  return (
    <div className="user-grid-container">
      <div className="user-grid-header">
        <h3 className="user-grid-title">{title}</h3>
        <span className="user-grid-count">{userNetworkData.length} users</span>
      </div>

      <div className="user-grid">
        <div className="user-grid-content">
          {visibleUsers.map((profile, index) => (
            <div key={index} className="user-grid-item">
              <UserCard
                userData={profile}
                onProfileClick={() => handleOnProfileClick(profile.userId)}
                onConnectClick={handleConnectClick}
                refreshKey={connectionRefreshKey}
              />
            </div>
          ))}
        </div>

        {loading && (
          <div className="user-grid-loading-inline">
            <Loading size={40} />
          </div>
        )}

        {(hasMoreToShow || hasMoreToFetch) && !loading && (
          <div className="user-grid-load-more">
            <button
              className="load-more-button"
              onClick={handleLoadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty state component for when no users are found
function EmptyNetworkState({ onInviteClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="empty-field"
    >
      <FaUserFriends className="empty-icon" style={{ fontSize: '80px', color: 'var(--secondary)' }} />
      <h3 className="empty-title">Nothing to see here ... yet!</h3>
      <p className="empty-message">
        Your network is waiting to grow! <br />
        Invite colleagues, friends, or mentors <br />
        who share your interests.
      </p>
      <button
        className='btnSaveChanges'
        style={{ padding: "10px", borderRadius: "10px", fontSize: "15px" }}
        onClick={onInviteClick}
      >
        Invite to Launchpad
      </button>
    </motion.div>
  );
}