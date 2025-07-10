import "./usercard.css";
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState } from "react";
import { FaLink } from "react-icons/fa6";
import { displayColleges, displayFieldsOfInterest, displayShortenedName, getBasicUserDescription, lowerAndCapitalize } from "../../services/userProfileServices";
import DefaultIcon from "../DefaultIcon/DefaultIcon";
import ParentalConnectionModal from "../ParentalConnectionModal";

export default function UserCard({userData, onProfileClick, onConnectClick}) {
    // todo: actual banner
    const [bannerVisibility, setBannerVisibility] = useState(false);

    // TODO: currently localStorage, transition to database
    const userType = userData.userType;

    const viewingUserType = JSON.parse(localStorage.getItem("basicUserInfo")).userType;

    const hideConnectBtn = (viewingUserType !== "High Schooler") && userType === "High Schooler";
    
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
    const basicInfoContent = {
        userPreface: userType === "Alumni" ? getBasicUserDescription(userData) :  getBasicUserDescription(userData).split(' in ')[0],
        userFirstDesc: {
            label: userType !== "Professional" ? "Interests" : "Expertise",
            content: (userData.areasOfInterest && userData.areasOfInterest.length > 0) 
                ? displayFieldsOfInterest(userData.areasOfInterest, "shorter") 
                : displayFieldsOfInterest(userData.areasOfInterest, "shorter")
        },
        userSecondDesc: {
            label: descType(),
            content: userType === "Professional" 
                ? (userData.industryPosition ? userData.industryPosition : "None")
                : userType === "Alumni" 
                    ? displayColleges([userData.collegeAttending], "shorter")
                    : (Array.isArray(userData.collegeInterestsOrDecision) 
                        ? displayColleges([...userData.collegeInterestsOrDecision], "shorter")
                        : displayColleges([userData.collegeInterestsOrDecision]))
        }
    }

    const userBasicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
    const disableActions = userBasicInfo && userBasicInfo.userType === "High Schooler" && !userBasicInfo.parentVerified;
  

    return(
        <>
        <div className='networkProfileCard' style={{height: hideConnectBtn ? "120px" : "160px"}}>
            {bannerVisibility && <ConnectionBanner/>}
            <button style={{fontSize: "16px", position: "absolute", right: "3%"}} className="btnText" onClick={onProfileClick}>
                See Profile
            </button>
            <div className='basicInfo'>
                <div>
                {userData.userPfpPreview ? (
                    <img 
                        className="pfpImage" 
                        src={userData.userPfpPreview} 
                        alt="" 
                    />
                ) : (
                    <DefaultIcon size={37}/>
                )}
                </div>
                <div className='cardNameDescription'>
                    <span className='cardName'>{displayShortenedName(userData.userName)}</span>
                    <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                </div>
            </div>
            <div style={{display: "flex", marginTop: !userData.userPfpPreview ? "10px" : ""}}>
            <div className='userInfo' style={{fontSize: "16px"}}>
                <span style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "270px", display: "block"}}><strong>{basicInfoContent.userFirstDesc.label}</strong>: {basicInfoContent.userFirstDesc.content}</span>
                <span style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "270px", display: "block"}}><strong>{basicInfoContent.userSecondDesc.label}</strong>: {basicInfoContent.userSecondDesc.content}</span>
            </div>
            </div>
            {!hideConnectBtn && <button className="btnConnect" 
                style={{width: "88%", marginLeft: "auto", marginRight: "auto", left: "0", right: "0", bottom: "15px", position: "absolute", cursor: disableActions ? "not-allowed" : "pointer", opacity: disableActions ? 0.6 : 1}}
                disabled={disableActions}
                title={disableActions ? "Parent/guardian approval required" : ""}
                onClick={() => { if (!disableActions) onConnectClick(userData.userId); }}> 
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                    <FaLink size={22}/>
                    <span>Connect</span>
                </div>
            </button>}
        </div>
        </>
    )
}