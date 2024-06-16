import "./usercard.css";
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState } from "react";

export default function ProfileCard({userData}) {
    const [bannerVisibility, setBannerVisibility] = useState(false);
    console.log(bannerVisibility);
    return(
        <div className='networkProfileCard'>
            {bannerVisibility && <ConnectionBanner/>}
            <span style={{position: "absolute", right: "3%", fontSize: "smaller"}} className="seeProfile">See Profile</span>
            <div className='basicInfo'>
                <div>
                    <VscAccount size = {80} className='cardPfp'/>
                </div>
                <div className='cardNameDescription'>
                    <span className='cardName'>Name Tittel</span>
                    <span className='cardDescription'> Short description</span>
                </div>   
            </div>
            <div className='userInfo'>
                <span>Current position (if applicable): ...</span>
                <span>Expertise (if applicable): ... </span>
            </div>
            <button className='userCardBtnConnect'> 
                <div>
                    <SlLink size={15}/> Connect
                </div> 
            </button>
        </div>
    )
}