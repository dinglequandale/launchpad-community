import "./user_network.css";
import UserCard from "../../components/Usercard/UserCard";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileCard from '../../components/Profilecard/ProfileCard';
import { useState } from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SearchBar from "../../components/Searchbar/SearchBar";
import UserWheelView from "../../components/Userwheel/UserWheelView";

export default function UserNetwork() {

  const [sideNavVisibility, setSideNavVisibility] = useState(false);
  const [showPfpCard, setShowPfpCard] = useState(false);

  const onBurgerPress = () => {
    setSideNavVisibility(!sideNavVisibility);
  }


  const bsData = [{id: 1, userName: "Bubba", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 2, userName: "Ting Skra", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 3, userName: "Glug But", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}, 
    {id: 4, userName: "EWEEW", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"},
    {id: 5, userName: "BuFOFOFbba", userDescription: "stupid and dumb x30", userFOI: "TIG TING", userLocation: "Dingle-ville"}];


  return (
    <>
      {showPfpCard && <ProfileCard onClose={() => setShowPfpCard(false)}/>}
      <div>
          <TopBar onBurgerPress={onBurgerPress}/>
          <SideNav show={sideNavVisibility}/>
          <div className='networkContainer'>
            <SearchBar/>
            <div className="mainBody" style={{paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px"}}>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <h3>Upperclassmen</h3>
                <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
              </div>
              <UserWheelView userNetworkData={bsData}/>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <h3>Alumni</h3>
                <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
              </div>
              <UserWheelView userNetworkData={bsData}/>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <h3>Professionals</h3>
                <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
              </div>
              <UserWheelView userNetworkData={bsData}/>
            </div>
          </div>
      </div>
    </>
  );
}