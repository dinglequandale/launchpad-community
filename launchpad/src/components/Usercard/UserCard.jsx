import "./usercard.css";
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState, useEffect } from "react";
import ProfileCard from "../Profilecard/ProfileCard";

export default function UserCard({userData, onProfileClick}) {
    const [userName, userDescription, userFOI, userLocation] = ["Full Name", "User Description", "User's interests / fields of expertise", "User dream/current school / workplace"];
    const [bannerVisibility, setBannerVisibility] = useState(false);
    const [showPfpCard, setShowPfpCard] = useState(false);
    
    return(
        <>
            <div className='networkProfileCard'>
                {bannerVisibility && <ConnectionBanner/>}
                <span style={{position: "absolute", right: "3%", fontSize: "smaller"}} className="seeProfile" onClick={onProfileClick} userData = {userData}>
                    See Profile</span>
                <div className='basicInfo'>
                    <div>
                        <VscAccount size = {80} className='cardPfp'/>
                        {/* If user has a pfp, then add it here */}
                    </div>
                    <div className='cardNameDescription'>
                        <span className='cardName'>{userData.userName}</span>
                        <span className='cardDescription'>{userData.userDescription}</span>
                    </div>
                </div>
                <div className='userInfo'>
                    <span>{userData.userFOI}</span>
                    <span>{userData.userLocation}</span>
                </div>
                <button className='userCardBtnConnect'> 
                    <div>
                        <SlLink size={15}/> Connect
                    </div> 
                </button>
            </div>
        </>
        
    )
}