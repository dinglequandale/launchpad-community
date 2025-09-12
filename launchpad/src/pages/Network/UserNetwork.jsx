import "./user_network.css";
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
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { getFilteredData } from "../../services/filteringServices";
import { searchDocuments } from "../../services/searchServices";
import NoResults from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../../firebase/firebaseConfig";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import { capitalizeFirstLetter } from "../Homepage/Home";
import ParentalConnectionModal from "../../components/ParentalConnectionModal";
import { useModal } from '../../contexts/ModalContext';
import { useConnections } from "../../contexts/ConnectionContext";
import { checkConnection, isConnectionApproved } from "../../services/connectionService";
// import { checkConnection } from "../../services/connectionService";


const NetworkContext = createContext();

export default function UserNetwork() {

  const {currentUser} = useAuth();

  const { chatClient, isConnected } = useOutletContext();

  const schoolId = localStorage.getItem("schoolId");

  const pageName = `The ${capitalizeFirstLetter(schoolId)} Network`;

  const [tenantId, setTenantId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { openProfileModal, openConnectModal, openParentalConnectionModal } = useModal();

  const [highSchoolers, setHighSchoolers] = useState([]);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [staff, setStaff] = useState([]);

  const loadLimit = 6;
  const [lastDocs, setLastDocs] = useState({ highSchool: null, college: null, professional: null, staff: null });
  const [loading, setLoading] = useState({ highSchool: false, college: false, professional: false, staff: false });
  const [overallLoading, setOverallLoading] = useState(false);

  const [allVisibleUserData, setAllVisibleUserData] = useState(null);
  const [connectionRefreshKey, setConnectionRefreshKey] = useState(0);
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections();

  const [isRecommended, setIsRecommended] = useState("(recommended)");
  
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

  const { userType,isCommitted,parentVerified } = JSON.parse(localStorage.getItem("basicUserInfo"));
  const [filters, setFilters] = useState({
    userType: 'Any User',
    collegeInterestsOrDecision: userType === "High Schooler" ? "Any College" : null,
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    networkingLevel: 'Any Availability',
    // schoolAttending: 'Any High School',
  });
  const [filterChanged, setFilterChanged] = useState(false);

  const filterContent = {
    userType: ["Any User", "Professionals", "College Students", "High Schoolers", "Staff"],
    collegeInterestsOrDecision:  (!isCommitted ? ["Any College", "My Dream Colleges"] : ["Any College", "My College"]),
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`, `Any ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    networkingLevel: ["Any Availability", "Casual Connection", "General Inquiries", "Short Interview", "Project Support", "Mock Interview", "Workplace Opportunities"],
    // schoolAttending: ["Any High School", "My High School"]
    // schoolAttending: ["Any High School", "My High School"],
  };

  useEffect(()=>{
    setOverallLoading(true);
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
    setAllVisibleUserData([...highSchoolers, ...collegeStudents, ...professionals, ...staff]);

    console.log("All data:", allVisibleUserData)
  },[collegeStudents, highSchoolers, professionals, staff]);

  const fetchAllUserTypes = async () => {
      console.log('fetchAllUserTypes called with filters:', filters);
      // Only fetch user types based on the userType filter
      if (filters.userType === 'Any User') {
          console.log('Fetching all user types');
          await Promise.all([
              fetchUserType('High Schooler'),
              fetchUserType('Alumni'),
              fetchUserType('Professional'),
              fetchUserType('Staff')
          ]);
      } else {
          console.log('Fetching specific user type:', filters.userType);
          // Map filter values to actual user types
          const userTypeMap = {
              'High Schoolers': 'High Schooler',
              'College Students': 'Alumni',
              'Professionals': 'Professional',
              'Staff': 'Staff'
          };
          
          const targetUserType = userTypeMap[filters.userType];
          if (targetUserType) {
              console.log('Target user type:', targetUserType);
              // Clear other user type arrays when filtering to specific type
              if (targetUserType !== 'High Schooler') setHighSchoolers([]);
              if (targetUserType !== 'Alumni') setCollegeStudents([]);
              if (targetUserType !== 'Professional') setProfessionals([]);
              if (targetUserType !== 'Staff') setStaff([]);
              
              await fetchUserType(targetUserType);
          }
      }
  };

  const fetchUserType = async (category, isLoadMore = false) => {
      setLoading(prev => ({ ...prev, [category]: true }));
      try {
          const { results, lastVisible } = await getFilteredData(
              'users', 
              filters, 
              currentUser.uid, 
              category,
              isLoadMore ? lastDocs[category] : null,
              loadLimit,
          );

          setLastDocs(prev => ({ ...prev, [category]: lastVisible }));

          switch(category) {
              case 'High Schooler':
                  setHighSchoolers(prev => isLoadMore ? [...prev, ...results].filter(result => result.parentVerified) : results.filter(result => result.parentVerified));
                  break;
              case 'Alumni':
                  setCollegeStudents(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
              case 'Professional':
                  setProfessionals(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
              case 'Staff':
                  setStaff(prev => isLoadMore ? [...prev, ...results] : results);
                  break;
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
      areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
      networkingLevel: 'Any Availability',
    });
    setFilterChanged(true);
  };

  const handleConnectClick = (userId) => {
    const user = allVisibleUserData.filter((user) => user.userId === userId)[0];
    // Parental connection logic
    if (userType === 'High Schooler' && user.userType !== 'High Schooler') {
      const isApproved = isConnectionApproved(currentUser, user, parent_approved, approved, parentVerified);
      if (!isApproved) {
        openParentalConnectionModal({ professionalData: user });
        return;
      }
    }
    
    // Get connection status from localStorage to avoid redundant Firebase calls
    // const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    // const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    // Check both pending and approved connections, or any direct connections (not in pending list)
    // const isConnected = pendingConnections.includes(userId) || approvedConnections.includes(userId);
    const connectionData = checkConnection(schoolId, userId);
    
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
    const user = allVisibleUserData.filter((user) => (user.userId === userId))[0];
    
    // Use connection status from UserCard if provided, otherwise check localStorage
    let isConnected = false;
    if (connectionStatus !== undefined) {
      // connectionStatus can be true (connected), false (not connected), or null (not checked)
      isConnected = connectionStatus === true;
    } else {
      const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
      const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
      isConnected = pendingConnections.includes(userId) || approvedConnections.includes(userId);
    }
    
    openProfileModal({ 
      userData: user, 
      onConnectClick: handleConnectClick, 
      handleReferalClick,
      isConnected: isConnected
    });
  };

  // All modal logic is now handled via ModalContext

  const user = auth.currentUser;
  useEffect(() => {
    const getUserTokenInfo = async () => {
      const idTokenResult = await user.getIdTokenResult();
      setTenantId(idTokenResult.claims.school_id);
    };

    getUserTokenInfo();
  }, [user]);

  const handleSearch = async (e, queryText) => {
    e.preventDefault();
    if (queryText) {
      const searchResults = await searchDocuments('users', queryText, tenantId);
      setAllVisibleUserData(searchResults);
      setHighSchoolers(searchResults.filter((result) => (result.userType === "High Schooler" && result.parentVerified)));
      setCollegeStudents(searchResults.filter((result) => result.userType === "Alumni"));
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
                          onEndReached={() => loadMore('Alumni')}
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
                      {filters.userType === 'Staff' && staff.length > 0 && (
                        <UserGrid 
                          userNetworkData={staff}
                          onEndReached={() => loadMore('Staff')}
                          loading={loading.staff}
                          connectionRefreshKey={connectionRefreshKey}
                          title="Staff"
                        />
                      )}
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
                              onEndReached={() => loadMore('Alumni')}
                              loading={loading.college}
                              connectionRefreshKey={connectionRefreshKey}
                            />
                          </div>
                        </div>
                      )}
                      {highSchoolers.length > 0 && userType !== "Professional" && (
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
                      {staff.length > 0 && (
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
                      )}
                    </>
                  )
                ) : overallLoading ? (
                  <div className="v0-loading-container">
                    <Loading/>
                  </div>
                ) : (
                  <div className="v0-no-results-container">
                    <NoResults/>
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
  const itemsPerPage = 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const carouselRef = useRef(null);
  const scrollAmount = 3;

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

  return (
    <div className="carousel" style={{width: `${userNetworkData.length === 1 ? "340.66px" : userNetworkData.length === 2 ? "681.33px" : "1022px"}`, margin: "0 auto"}}>
      <div className="carousel-container">
        {!loading ? <div
          className={`carousel-content ${slideDirection}`}
          style={{justifyContent: `${userNetworkData.length <= 3 ? "center" : ""}`, gap: `${userNetworkData.length < 3 ? "10px" : ""}`}}
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
      
      <button 
        className="carousel-button prev" 
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        <GrPrevious color="var(--accent)"/>
      </button>
      <button 
        className="carousel-button next" 
        onClick={nextSlide}
        disabled={currentIndex + itemsPerPage >= userNetworkData.length}
      >
        <GrNext color="var(--accent)"/>
      </button>
    </div>
  )
}

function UserGrid({userNetworkData, loading, onEndReached, connectionRefreshKey, title}){
  const { handleOnProfileClick, handleConnectClick, loadLimit, filterChanged } = useContext(NetworkContext);
  const [hasMore, setHasMore] = useState(true);

  // Check if we need to load more when scrolling
  useEffect(() => {
    if (userNetworkData.length > 0 && userNetworkData.length % loadLimit === 0) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }, [userNetworkData.length, loadLimit]);

  // Load more when user scrolls near the bottom
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
      onEndReached();
    }
  };

  return (
    <div className="user-grid-container">
      <div className="user-grid-header">
        <h3 className="user-grid-title">{title}</h3>
        <span className="user-grid-count">{userNetworkData.length} users</span>
      </div>
      
      <div className="user-grid" onScroll={handleScroll}>
        {!loading ? (
          <>
            <div className="user-grid-content">
              {userNetworkData.map((profile, index) => (
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
            {hasMore && (
              <div className="user-grid-load-more">
                <button 
                  className="load-more-button" 
                  onClick={onEndReached}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="user-grid-loading">
            <Loading/>
          </div>
        )}
      </div>
    </div>
  );
}