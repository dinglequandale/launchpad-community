import { useEffect, useState } from "react";
import "./ProfileStrength.css";
import { useNavigate } from "react-router-dom";
import { displayShortenedName } from "../../services/userProfileServices";
import DefaultIcon from "../DefaultIcon/DefaultIcon";

export default function ProfileStrength({userData}){

    const [profileProgress, setProfileProgress] = useState(0);

    useEffect(()=>{
        const loadedProgress = localStorage.getItem("userProfileProgress");
        setProfileProgress(loadedProgress);
    },[]);

    const navigate = useNavigate();

    return(
        <>
            {/* <div style={{borderBottomStyle: "solid", paddingBottom: "5px", borderColor: "#C0C0C0", borderWidth: "1px",
                display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                <span style={
                        {fontWeight: "750", textDecoration: "underline", fontSize: "22px", color: "var(--secondary)"}
                        }>
                        Complete your profile
                </span>
                <span style={{fontWeight:"400", fontSize: "20px"}}>Before Networking</span>
            </div> */}
                
            <div className="v0-profile-strength">
                {userData && <ProfileIcon userData={userData}/>}
                <div className="v0-progress-section">
                    <ProfileBar profileProgress={profileProgress}/>
                    <span className="v0-progress-text">Your profile is {profileProgress * 100}% completed!</span>
                </div>
                <button
                className="v0-profile-btn"
                onClick={()=>{navigate("/profile", { state: '/' })}}>
                    {profileProgress === 1 ? "View Profile" : "Complete your profile"}
                </button>
            </div>
        </>
    )
}

function ProfileBar({profileProgress}){
    const progressBarWidth = `${profileProgress * 100}%`;

    return (
        <div className="v0-progress-container">
            <div
                className={`v0-progress-bar ${profileProgress > 0.8 ? "purple" : profileProgress > 0.6 ? "green" : profileProgress > 0.4 ? "orange" : "red"}`}
                style={{ width: progressBarWidth }}
                role="progressbar" 
                aria-valuenow={profileProgress * 100}
                aria-valuemin="0"
                aria-valuemax="100"
            >
                &nbsp;
            </div>
        </div>
    )
}

function ProfileIcon({userData}){
    console.log(userData.userPfpPreview);
    return(
        <div className="v0-profile-icon">
            <div className="v0-avatar-container">
                {userData.userPfpPreview ? <img src={userData.userPfpPreview} alt="" className="v0-avatar-img"/> : <DefaultIcon length={"70px"} size={50}/>}
            </div>
            <div className="v0-user-info">
                <span className="v0-user-name">{displayShortenedName(userData.userName)}</span>
                <span className="v0-user-description">{userData.userShortDescription}</span>
            </div>
        </div>
    )
}