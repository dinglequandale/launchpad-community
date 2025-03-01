import { useEffect, useState } from "react";
import "./profilestrength.css";
import { useNavigate } from "react-router-dom";
import { displayShortenedName } from "../../services/userProfileServices";

export default function ProfileStrength({userData}){

    const [profileProgress, setProfileProgress] = useState(0);

    useEffect(()=>{
        const loadedProgress = localStorage.getItem("userProfileProgress");
        setProfileProgress(loadedProgress);
    },[]);

    const navigate = useNavigate();

    return(
        <>
            <div style={{borderBottomStyle: "solid", paddingBottom: "5px", borderColor: "#C0C0C0", borderWidth: "1px",
                display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                <span style={
                        {fontWeight: "750", textDecoration: "underline", fontSize: "22px", color: "var(--secondary)"}
                        }>
                        Complete your profile
                </span>
                <span style={{fontWeight:"400", fontSize: "20px"}}>Before Networking</span>
            </div>
                
            <div style={{ height: "330px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative"}}>
                <div style={{width: "100%", display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "30px"}}>
                {userData && <ProfileIcon userData={userData}/>}
                <div style={{width: "100%", display: 'flex', flexDirection: "column", gap: "7px", justifyContent: "center", alignItems: "center"}}>
                    <ProfileBar profileProgress={profileProgress}/>
                    <span style={{paddingTop: "4px", paddingBottom: "15px", color: "var(--secondary)", fontSize: "17.5px"}}>Your profile is {profileProgress * 100}% completed!</span>
                </div>
                </div>
                {/* {nullValues[0] !== 0 && <span style={{fontWeight: "bolder", color: "rgb(223, 93, 93)"}}> {nullValues[0]} mandatory field{nullValues[0] > 1 ? "s" : ""} missing! </span>}
                {nullValues[1] !== 0 && <span style={{fontWeight: "bolder", color: "rgb(255, 178, 35)"}}> {nullValues[1]} optional field{nullValues[1] > 1 ? "s" : ""} missing! </span>} */}
                <button
                className="btnViewProfile"
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
        <div style={{borderRadius: "20px", height: "17px", width: "70%", overflow: "hidden",
        background: "#D4D4D4", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}}>
            <div
                className={`progressBar ${profileProgress > 0.8 ? "purple" : profileProgress > 0.6 ? "green" : profileProgress > 0.4 ? "orange" : "red"}`}
                style={{ width: progressBarWidth , height: "17px", borderRadius: "10px"}}
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
        <div style={{display: "flex", gap: "10px", alignItems: "center", paddingTop: "20px", paddingBottom: "20px", maxWidth: "340px"}}>
            <div>
                {userData.userPfpPreview ? <img src={userData.userPfpPreview} alt="" style={
            {width: "80px", height: "80px", borderRadius: "50%", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}/> : <img className="pfpImage" src="/assets/placeholder_pfp.png" alt="" style={
                {width: "80px", height: "80px"}}/>}
            </div>
            <div>
                <span style={{fontWeight: "bolder", fontSize: "22px"}}>{displayShortenedName(userData.userName)}</span> <br />
                <span style={{fontWeight: "300"}}>{userData.userShortDescription}</span>
            </div>
        </div>
    )
}