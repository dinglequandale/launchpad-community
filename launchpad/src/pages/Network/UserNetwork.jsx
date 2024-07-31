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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";


const NetworkContext = createContext();

export default function UserNetwork() {

  const { chatClient, isConnected } = useOutletContext();

  const pageName = "Network";
  const [profileModalVisibility, setProfileModalVisibility] = useState(false);
  const [connectModalVisibility, setConnectModalVisibility] = useState(false);
  const [profileTargetUserId, setProfileTargetUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [allUserData, setAllUserData] = useState([]);

  const filterContent = [
    ["Any Education Stage", "High School Student", "College Student"],
    ["Any College", "Dream College(s)"],
    ["Any Interest","Your Interests", "Physics", "Finance", "Theatre"]
  ];
  const [profileModalTop, setProfileModalTop] = useState(0);

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress, true)
  }, [])

  const onKeyPress = (e) => {
    if(e.key === "Escape"){
      setProfileModalVisibility(false);
    }
  }

  const handleOnProfileClick = (userId) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const modalTop = Math.max(0, scrollY + (window.innerHeight - 100) / 2);
    
    setProfileModalTop(modalTop);

    setProfileTargetUserId(userId);

    setProfileModalVisibility(true);
  }

  useEffect(() => {
    const usersRef = collection(db, "users");
    setLoading(true);
  
    const unsubscribe = onSnapshot(usersRef, 
      (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUserData(userData);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching opportunities:", error);
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, []);

    useEffect(() => {
      if (profileModalVisibility) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }, [profileModalVisibility]);
    
  return (
    <NetworkContext.Provider value={{handleOnProfileClick, setConnectModalVisibility}}>
      <>
        {connectModalVisibility && <ConnectModal onClose = {()=>setConnectModalVisibility(false)} visibility={connectModalVisibility} chat={chatClient}/>}
        <div>
            <TopBar/>
            <SideNav/>
            <div className='networkContainer' id="networkContainer" style={{paddingTop: "3%", paddingLeft: "10%"}}>
              <SearchBar filters = {filterContent} pageName={pageName}/>
              <div className="mainBody" style={{paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px"}}>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Upperclassmen</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel userNetworkData={allUserData.filter((user) => user.userType === "High Schooler")}/>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Alumni</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel userNetworkData={allUserData.filter((user) => user.userType === "Alumni")}/>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Professionals</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel userNetworkData={allUserData.filter((user) => user.userType === "Professional")}/>
                {profileModalVisibility && <ProfileModal visibility={profileModalVisibility} onClose={()=>setProfileModalVisibility(false)} top={profileModalTop} onConnectClick={()=>setConnectModalVisibility(true)} userId={profileTargetUserId}/>}
              </div>
            </div>
        </div>
      </>
    </NetworkContext.Provider>
  );
}

function UserCarousel({userNetworkData}){
  const { handleOnProfileClick,setConnectModalVisibility } = useContext(NetworkContext);
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
    <div className="carousel" style={{width: "1022px", margin: "0 auto"}}>
      <div className="carousel-container">
        <div
          className={`carousel-content ${slideDirection}`}
          style={{justifyContent: `${userNetworkData.length <= 3 ? "center" : ""}`}}
          onAnimationEnd={() => setSlideDirection('')}
          ref={carouselRef}
        >
          {userNetworkData.map((profile, index) => (
            <div key={index} className="carousel-item">
              <UserCard userData={profile} onProfileClick={handleOnProfileClick} onConnectClick={()=>setConnectModalVisibility(true)}/>
            </div>
          ))}
        </div>
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