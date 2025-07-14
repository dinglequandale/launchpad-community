import "./usercard.css";
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState, useEffect } from "react";
import { FaLink } from "react-icons/fa6";
import { displayColleges, displayFieldsOfInterest, displayShortenedName, getBasicUserDescription, lowerAndCapitalize } from "../../services/userProfileServices";
import DefaultIcon from "../DefaultIcon/DefaultIcon";
import ParentalConnectionModal from "../ParentalConnectionModal";
import { checkConnection } from "../../services/connectionService";

export default function UserCard({userData, onProfileClick, onConnectClick, refreshKey = 0}) {
    // todo: actual banner
    const [bannerVisibility, setBannerVisibility] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [isCheckingConnection, setIsCheckingConnection] = useState(true);

    // TODO: currently localStorage, transition to database
    const userType = userData.userType;

    const viewingUserType = JSON.parse(localStorage.getItem("basicUserInfo")).userType;

    const hideConnectBtn = (viewingUserType !== "High Schooler") && userType === "High Schooler";
    
    // Check connection status when component mounts or refreshKey changes
    useEffect(() => {
        const checkConnectionStatus = async () => {
            try {
                const schoolId = localStorage.getItem("schoolId");
                if (schoolId && userData.userId) {
                    const result = await checkConnection(schoolId, userData.userId);
                    setConnectionStatus(result.isConnected || null);
                }
            } catch (error) {
                console.error('Error checking connection status:', error);
            } finally {
                setIsCheckingConnection(false);
            }
        };
        
        checkConnectionStatus();
    }, [userData.userId, refreshKey]);

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
    
    // Determine button text and state based on connection status
    const getButtonState = () => {
        if (isCheckingConnection) {
            return { text: "Loading...", disabled: true, className: "btnConnect" };
        }
        
        if (connectionStatus) {
            return { text: "Contact", disabled: false, className: "btnConnect" };
        }

        // if (connectionStatus === 'pending') {
        //     return { text: "Pending", disabled: true, className: "btnConnect pending" };
        // }
        
        // if (connectionStatus === 'approved') {
        //     return { text: "Connected", disabled: true, className: "btnConnect connected" };
        // }
        
        if (disableActions) {
            return { text: "Connect", disabled: true, className: "btnConnect" };
        }
        
        return { text: "Connect", disabled: false, className: "btnConnect" };
    };

    const buttonState = getButtonState();

    // Handle profile click with connection status
    const handleProfileClick = () => {
        onProfileClick(userData.userId, connectionStatus);
    };

    return(
        <>
        <div className='networkProfileCard' style={{height: hideConnectBtn ? "120px" : "160px"}}>
            {bannerVisibility && <ConnectionBanner/>}
            <button style={{fontSize: "16px", position: "absolute", right: "3%"}} className="btnText" onClick={handleProfileClick}>
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
            {!hideConnectBtn && <button 
                className={buttonState.className}
                style={{
                    width: "88%", 
                    marginLeft: "auto", 
                    marginRight: "auto", 
                    left: "0", 
                    right: "0", 
                    bottom: "15px", 
                    position: "absolute", 
                    cursor: buttonState.disabled ? "not-allowed" : "pointer", 
                    opacity: buttonState.disabled ? 0.6 : 1
                }}
                disabled={buttonState.disabled}
                title={disableActions ? "Parent/guardian approval required" : 
                       connectionStatus === 'pending' ? "Connection request pending" :
                       connectionStatus === 'approved' ? "Already connected" : ""}
                onClick={() => { 
                    if (!buttonState.disabled) onConnectClick(userData.userId); 
                }}> 
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                    <FaLink size={22}/>
                    <span>{buttonState.text}</span>
                </div>
            </button>}
        </div>
        </>
    )
}