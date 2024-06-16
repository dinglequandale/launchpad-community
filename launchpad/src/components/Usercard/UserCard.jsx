import "./usercard.css";
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState, useEffect } from "react";
import ProfileCard from "../Profilecard/ProfileCard";

export default function UserCard({userData}) {
    const [userName, userDescription, userFOI, userLocation] = ["Full Name", "User Description", "User's interests / fields of expertise", "User dream/current school / workplace"];
    const [bannerVisibility, setBannerVisibility] = useState(false);
    const [showPfpCard, setShowPfpCard] = useState(false);

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
      }, [])
    
      const onKeyPress = (e) => {
        if(e.key === "Escape"){
          setShowPfpCard(false)
        }
      }

    console.log(bannerVisibility);
    return(
        <>
            {showPfpCard && <ProfileCard onClose={()=>setShowPfpCard(false)}/>}
            <div className='networkProfileCard'>
                {bannerVisibility && <ConnectionBanner/>}
                <span style={{position: "absolute", right: "3%", fontSize: "smaller"}} className="seeProfile" onClick={
                    ()=>setShowPfpCard(true)
                }>See Profile</span>
                <div className='basicInfo'>
                    <div>
                        <VscAccount size = {80} className='cardPfp'/>
                        {/* If user has a pfp, then add it here */}
                    </div>
                    <div className='cardNameDescription'>
                        <span className='cardName'>{userName}</span>
                        <span className='cardDescription'>{userDescription}</span>
                    </div>
                </div>
                <div className='userInfo'>
                    <span>{userFOI}</span>
                    <span>{userLocation}</span>
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