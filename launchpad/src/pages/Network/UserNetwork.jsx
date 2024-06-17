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
              <UserWheelView/>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <h3>Alumni</h3>
                <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
              </div>
              <UserWheelView/>
              <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                <h3>Professionals</h3>
                <span style={{fontWeight: "lighter", fontSize: "smaller"}}>(recommended)</span>
              </div>
              <UserWheelView/>
            </div>
          </div>
      </div>
    </>
  );
}