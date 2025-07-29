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

  const { openProfileModal, openConnectModal, openParentalConnectionModal } = useModal();

  const [highSchoolers, setHighSchoolers] = useState([]);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const loadLimit = 6;
  const [lastDocs, setLastDocs] = useState({ highSchool: null, college: null, professional: null });
  const [loading, setLoading] = useState({ highSchool: false, college: false, professional: false });
  const [overallLoading, setOverallLoading] = useState(false);

  const [allVisibleUserData, setAllVisibleUserData] = useState(null);
  const [connectionRefreshKey, setConnectionRefreshKey] = useState(0);
  const { approved = [], parent_approved = [], loading: connectionsLoading } = useConnections();

  const [isRecommended, setIsRecommended] = useState("(recommended)");
  
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
    areasOfInterestOrExpertise: `My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`,
    // schoolAttending: 'Any High School',
  });
  const [filterChanged, setFilterChanged] = useState(false);

  const filterContent = {
    userType: ["Any User", "Professionals", "College Students", "High Schoolers"],
    collegeInterestsOrDecision: userType === "High Schooler" ? (!isCommitted ? ["Any College", "My Dream Colleges"] : ["Any College", "My College"]) : null,
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`, `Any ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    // schoolAttending: ["Any High School", "My High School"]
    // schoolAttending: ["Any High School", "My High School"],
  };

  useEffect(()=>{
    setOverallLoading(true);
    fetchAllUserTypes();
    if(filters.areasOfInterestOrExpertise.substring(0,3) === "Any"){
      setIsRecommended("");
    }
    else{
      setIsRecommended("(recommended)");
    }
  },[filters]);

  useEffect(() => {
    setAllVisibleUserData([...highSchoolers, ...collegeStudents, ...professionals]);

    console.log("All data:", allVisibleUserData)
  },[collegeStudents, highSchoolers, professionals]);

  const fetchAllUserTypes = async () => {
      await Promise.all([
          fetchUserType('High Schooler'),
          fetchUserType('Alumni'),
          fetchUserType('Professional')
      ]);
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
    setFilterChanged(true);
    setFilters(prev => ({...prev, [filterKey]: value}));
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
    const referalValue = organizationData[`organization${referalType === "learnMore" ? "LearnMore" : "Apply"}`];
    const methodType = organizationData[`organization${referalType === "learnMore" ? "LearnMore" : "Apply"}Method`];
    console.log("DATA:", userData);
    
    switch(methodType){
        case "Messages":
            handleConnectClick(userData.id);
            return;
        case "Email":
            handleEmailClick(referalValue);
            return;
        case "Website":
            window.open(referalValue, '_blank', 'noopener,noreferrer');
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
        <Toaster position={'bottom-right'} reverseOrder={false}/>
        {/* All modals are now handled globally via ModalContext */}
        <div>
            <TopBar/>
            <SideNav/>
            <div className='networkContainer' id="networkContainer" style={{paddingTop: "6%", paddingLeft: "10%"}}>
              <SearchBar filters = {filterContent} pageName={pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/>
              <div className="mainBody" style={{paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px", minHeight: "67vh", position: "relative"}}>
                {allVisibleUserData && allVisibleUserData.length > 0 ? <>
                {professionals.length > 0 && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Professionals</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>{isRecommended}</span>
                </div>
                <UserCarousel 
                  userNetworkData={professionals}
                  onEndReached={() => loadMore('Professional')} 
                  loading={loading.professional}
                  connectionRefreshKey={connectionRefreshKey}
                />
                </>}
                {collegeStudents.length > 0 && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>College Students</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>{isRecommended}</span>
                </div>
                <UserCarousel 
                  userNetworkData={collegeStudents}
                  onEndReached={() => loadMore('Alumni')}
                  loading={loading.college}
                  connectionRefreshKey={connectionRefreshKey}
                />
                </>}
                {highSchoolers.length > 0 && userType !== "Professional" && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>High Schoolers</h3>
                  <span style={{fontWeight: "400", fontSize: "smaller"}}>{isRecommended}</span>
                </div>
                <UserCarousel 
                  userNetworkData={highSchoolers} 
                  onEndReached={() => loadMore('High Schooler')} 
                  loading={loading.highSchool}
                  connectionRefreshKey={connectionRefreshKey}
                />
                </>}
                </> : overallLoading ? <div style={{position: "absolute", left: "50%",top: "50%", transform: "translate(-50%,-50%)", width: "300px"}}> <Loading/> </div> : 
                <div style={{position: "absolute", left: "50%",top: "45%", transform: "translate(-50%,-40%)", width: "400px", height: "500px"}}><NoResults/></div>}
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