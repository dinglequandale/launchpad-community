import "./usercard.css";
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState } from "react";
import { FaLink } from "react-icons/fa6";
import { displayColleges, displayFieldsOfInterest, displayShortenedName, getBasicUserDescription, lowerAndCapitalize } from "../../services/userProfileServices";

export default function UserCard({userData, onProfileClick, onConnectClick}) {
    // todo: actual banner
    const [bannerVisibility, setBannerVisibility] = useState(false);

    // TODO: currently localStorage, transition to database
    const userType = userData.userType;
    
    const descType = () => {
        switch(userData.userType){
            case "High Schooler":
                return userData.collegeDecision === "No" ? "Dream Colleges" : "Committed College";
            case "Alumni":
                return "Attending College";
            case "Professional":
                return "Job";
            default:
                return "";
        }
    }

    // TODO: change to userData

    const basicInfoContent ={userPreface:getBasicUserDescription(userData),
    userFirstDesc: `${userType !== "Professional" ? "Interests" : "Expertise"}: ${(userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest, "shorter") : displayFieldsOfInterest(userData.areasOfInterest, "shorter")}`,
    userSecondDesc: `${descType()}: ${userType === "Professional" ? (userData.industryPosition ? (userData.industryPosition) : "None") : userType === "Alumni" ? displayColleges([userData.collegeAttending], "shorter") : (Array.isArray(userData.collegeInterestsOrDecision) ? displayColleges([...userData.collegeInterestsOrDecision], "shorter") : displayColleges([userData.collegeInterestsOrDecision]))}`,
}

    return(
        <>
        <div className='networkProfileCard'>
            {bannerVisibility && <ConnectionBanner/>}
            <button style={{fontSize: "16px", position: "absolute", right: "3%"}} className="btnText" onClick={onProfileClick}>
                See Profile
            </button>
            <div className='basicInfo'>
                <div>
                    {userData.userPfpPreview ? <img className="pfpImage" src={userData.userPfpPreview} alt="" style={
                {width: "60px", height: "60px"}}/> : <img className="pfpImage" src="/assets/placeholder_pfp.png" alt="" style={
                    {width: "60px", height: "60px"}}/>}
                </div>
                <div className='cardNameDescription'>
                    <span className='cardName'>{displayShortenedName(userData.userName)}</span>
                    <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                </div>
                </div>
                <div style={{display: "flex"}}>
                <div className='userInfo' style={{fontSize: "16px"}}>
                    <span>{basicInfoContent.userFirstDesc}</span>
                    <span>{basicInfoContent.userSecondDesc}</span>
                </div>
            </div>
            <button className="btnConnect" style={{width: "80%", marginLeft: "auto", marginRight: "auto", left: "0", right: "0", bottom: "10px", position: "absolute"}} onClick={() => onConnectClick(userData.userId)}> 
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                    <FaLink size={22}/>
                    <span>Connect</span>
                </div>
            </button>
        </div>
        </>
    )
}