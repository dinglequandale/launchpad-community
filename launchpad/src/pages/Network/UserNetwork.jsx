import "./user_network.css";
import UserCard from "../../components/Usercard/UserCard";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileCard from '../../components/Profilecard/ProfileCard';
import { useState } from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SearchBar from "../../components/Searchbar/SearchBar";

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
            <div>
              <span>Upperclassmen</span>
              <UserCard/>
            </div>
          </div>
      </div>
    </>
  );
}