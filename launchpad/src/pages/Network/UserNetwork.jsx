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


const NetworkContext = createContext();

export default function UserNetwork() {

  const {currentUser} = useAuth();

  const { chatClient, isConnected } = useOutletContext();

  const pageName = "Network";
  const [profileModalVisibility, setProfileModalVisibility] = useState(false);
  const [connectModalVisibility, setConnectModalVisibility] = useState(false);
  const [connectTargetUserId, setConnectTargetUserId] = useState("");

  const [highSchoolers, setHighSchoolers] = useState([]);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [lastDocs, setLastDocs] = useState({ highSchool: null, college: null, professional: null });
  const [loading, setLoading] = useState({ highSchool: false, college: false, professional: false });
  const [overallLoading, setOverallLoading] = useState(false);

  const [userSearchText, setUserSearchText] = useState("");
  const [allVisibleUserData, setAllVisibleUserData] = useState(null);

  const [profileTargetData, setProfileTargetData] = useState(null);
  const [connectTargerUserName, setConnectTargetUserName] = useState("");
  
  const [profileModalTop, setProfileModalTop] = useState(0);

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress, true)
  }, [])

  const onKeyPress = (e) => {
    if(e.key === "Escape"){
      setProfileModalVisibility(false);
    }
  }

  const { userType } = JSON.parse(localStorage.getItem("basicUserInfo"));
  const [filters, setFilters] = useState({
    userType: 'Any User',
    collegeInterestsOrDecision: userType === "High Schooler" ? "Any College" : null,
    areasOfInterestOrExpertise: `My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`,
    schoolAttending: 'Any High School',
  });

  const filterContent = {
    userType: ["Any User", "High Schoolers", "College Students", "Professionals"],
    collegeInterestsOrDecision: userType === "High Schooler" ? ["Any College", "My Dream Colleges"] : null,
    areasOfInterestOrExpertise: [`My ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`, `Any ${userType === "Professional" ? "Fields of Expertise" : "Interests"}`],
    schoolAttending: ["Any High School", "My High School"]
  };

  useEffect(()=>{
    setOverallLoading(true);
    fetchAllUserTypes();
  },[filters])

  useEffect(() => {
    setAllVisibleUserData([...highSchoolers, ...collegeStudents, ...professionals])
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
                isLoadMore ? lastDocs[category] : null
            );

            setLastDocs(prev => ({ ...prev, [category]: lastVisible }));

            switch(category) {
                case 'High Schooler':
                    setHighSchoolers(prev => isLoadMore ? [...prev, ...results] : results);
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
        }
    };

    const loadMore = (category) => {
        if (!loading[category] && lastDocs[category]) {
            fetchUserType(category, true);
        }
    };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({...prev, [filterKey]: value}));
  };

  const handleConnectClick = (userId) => {
    setConnectTargetUserId(userId);
    setConnectTargetUserName(allVisibleUserData.filter((user)=>(user.userId === userId))[0].userName);
    setProfileModalVisibility(false);
    setConnectModalVisibility(true);
  }
  const handleOnProfileClick = (userId) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const modalTop = Math.max(0, scrollY + (window.innerHeight - 100) / 2);
    
    setProfileModalTop(modalTop);
    if(allVisibleUserData){
      setProfileTargetData(allVisibleUserData.filter((user) => (user.userId === userId))[0]);
    }

    setProfileModalVisibility(true);
  }

    useEffect(() => {
      if (profileModalVisibility) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }, [profileModalVisibility]);

  const handleSearch = async (e, queryText) => {
    e.preventDefault();
    // setIsSearching(false);
    if (queryText) {
      const searchResults = await searchDocuments('users', queryText);
      setAllVisibleUserData(searchResults);
    }
  };
    
  return (
    <NetworkContext.Provider value={{handleOnProfileClick, handleConnectClick}}>
      <>
        {connectModalVisibility && <ConnectModal onClose = {()=>setConnectModalVisibility(false)} userName={connectTargerUserName} visibility={connectModalVisibility} chat={chatClient} userId = {connectTargetUserId}/>}
        {profileModalVisibility && <ProfileModal visibility={profileModalVisibility} onClose={()=>setProfileModalVisibility(false)} top={profileModalTop} onConnectClick={handleConnectClick} userData={profileTargetData}/>}
        <div>
            <TopBar/>
            <SideNav/>
            <div className='networkContainer' id="networkContainer" style={{paddingTop: "4%", paddingLeft: "10%"}}>
              <SearchBar filters = {filterContent} pageName={pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/>
              <div className="mainBody" style={{paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px", minHeight: "67vh", position: "relative"}}>
                {allVisibleUserData && allVisibleUserData.length > 0 ? <>
                {highSchoolers.length > 0 && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>High Schoolers</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel 
                  userNetworkData={highSchoolers} 
                  onEndReached={() => loadMore('High Schooler')} 
                  loading={loading.highSchool}
                />
                </>}
                {collegeStudents.length > 0 && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>College Students</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel 
                  userNetworkData={collegeStudents}
                  onEndReached={() => loadMore('Alumni')}
                  loading={loading.college}
                />
                </>}
                {professionals.length > 0 && <>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Professionals</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel 
                  userNetworkData={professionals}
                  onEndReached={() => loadMore('Professional')} 
                  loading={loading.professional}
                />
                </>}
                </> : overallLoading ? <div style={{position: "absolute", left: "50%",top: "50%", transform: "translate(-50%,-50%)", width: "300px"}}> <Loading/> </div> : 
                <div style={{position: "absolute", left: "50%",top: "45%", transform: "translate(-50%,-40%)", width: "400px", height: "500px"}}><NoResults/></div>}
              </div>
            </div>
        </div>
      </>
    </NetworkContext.Provider>
  );
}

function UserCarousel({userNetworkData, loading, onEndReached}){
  const { handleOnProfileClick,handleConnectClick } = useContext(NetworkContext);
  const itemsPerPage = 3;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const carouselRef = useRef(null);


  useEffect(() => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth / itemsPerPage;
      const offset = currentIndex * (itemWidth);
      carouselRef.current.style.transform = `translateX(-${offset}px)`;
    }

    if(currentIndex % 9 === 6) {
      onEndReached();
    }
  }, [currentIndex, itemsPerPage]);

  const nextSlide = () => {
    setSlideDirection('slide-left');
    setCurrentIndex(prevIndex => 
      Math.min(prevIndex + 1, userNetworkData.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setSlideDirection('slide-right');
    setCurrentIndex(prevIndex => 
      Math.max(prevIndex - 1, 0)
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
              <UserCard userData={profile} onProfileClick={() => handleOnProfileClick(profile.userId)} onConnectClick={handleConnectClick}/>
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