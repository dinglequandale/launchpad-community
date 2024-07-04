import "./user_network.css";
import UserCard from "../../components/Usercard/UserCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileModal from '../../components/Profilemodal/ProfileModal';
import { useState, useEffect, useContext, createContext } from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SearchBar from "../../components/Searchbar/SearchBar";

const NetworkContext = createContext();

export default function UserNetwork() {

  const pageName = "Network";
  const [profileModalVisibility, setProfileModalVisibility] = useState(false);
  const filterContent = [
    ["Any Education Stage", "High School Student", "College Student"],
    ["Any College", "Dream College(s)"],
    ["Any Interest","Relevant Interest(s)", "Physics", "Finance", "Theatre"]
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

  const handleOnProfileClick = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const modalTop = Math.max(0, scrollY + (window.innerHeight - 100) / 2);

    setProfileModalTop(modalTop);
    setProfileModalVisibility(true);
  }
  
  // transition to actual database PLEASE  

  const bsData = [{id: 1, userName: "Bubba", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 2, userName: "Ting Skra", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 3, userName: "Glug But", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 4, userName: "EWEEW", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"},
    {id: 5, userName: "BuFOFOFbba", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}];

    useEffect(() => {
      if (profileModalVisibility) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }, [profileModalVisibility]);

  return (
    <NetworkContext.Provider value={handleOnProfileClick}>
      <>
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
                <UserCarousel userNetworkData={bsData}/>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Alumni</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel userNetworkData={bsData}/>
                <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                  <h3>Professionals</h3>
                  <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
                </div>
                <UserCarousel userNetworkData={bsData}/>
                {profileModalVisibility && <ProfileModal onClose={()=>setProfileModalVisibility(false)} top={profileModalTop}/>}
              </div>
            </div>
        </div>
      </>
    </NetworkContext.Provider>
  );
}

function UserCarousel({userNetworkData}){

  const handleOnProfileClick = useContext(NetworkContext);

  const settings = {
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: '0px'
        };
      
  //TODO: curr localStorage; transition this to storage!!! all messed up
  return (
    <>
    <div style={{width: "80%", margin: "0 auto"}}>
      <Slider {...settings}>
        {userNetworkData.map((profile) => (
                <UserCard key={profile.id} userData={profile} onProfileClick={handleOnProfileClick}/>
                ))}
      </Slider>
    </div>
  </>
  )
}