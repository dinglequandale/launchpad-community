import { useState } from "react";
import LoginIcon from "../Loginicon/LoginIcon";
import "./profilestrength.css";
import ProfileCard from "../Profilecard/ProfileCard";

export default function ProfileStrength({userData}){

    const profileProgress = .9;
    const userProfile = [{highImportance: ["...", null, null, "...", "..."]}, {lowImportance: ["...", "...","...",null]}];
    const nullValues = [userProfile[0].highImportance.filter((e)=>(e===null)).length, userProfile[1].lowImportance.filter((e)=>(e===null)).length]

    const [ProfileVisibility, setProfileVisibility] = useState(false);

    return(
        <>
            {ProfileVisibility && <ProfileCard userData={userData}/>}
            <div style={{borderBottomStyle: "solid", paddingBottom: "5px", borderColor: "#C0C0C0", borderWidth: "1px",
                display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                <span style={
                        {fontWeight: "600", fontSize: "20px", color: "#4d73be"}
                        }>
                        Complete your profile
                </span>
                <span style={{fontWeight:"400", fontSize: "20px"}}>Before Networking</span>
            </div>
                
            <div style={{ height: "330px", display: "flex", flexDirection: "column",  alignItems: "center", position: "relative"}}>
                <ProfileIcon/>
                <>
                    <ProfileBar profileProgress={profileProgress}/>
                    <span style={{paddingTop: "10px", paddingBottom: "15px"}}>Your profile is {profileProgress * 100}% completed!</span>
                </>
                {nullValues[0] !== 0 && <span style={{fontWeight: "bolder", color: "rgb(223, 93, 93)"}}> {nullValues[0]} mandatory field{nullValues[0] > 1 ? "s" : ""} missing! </span>}
                {nullValues[1] !== 0 && <span style={{fontWeight: "bolder", color: "rgb(255, 178, 35)"}}> {nullValues[1]} optional field{nullValues[1] > 1 ? "s" : ""} missing! </span>}
                <button style={{position: "absolute", bottom: "30px", padding: "10px", color: "white",
                 fontSize: "20px", width: "60%", fontWeight: "bolder", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}}
                onClick={()=>{setProfileVisibility(true)}}>
                    Complete Profile
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

function ProfileIcon(){
    return(
        <div style={{display: "flex", gap: "10px", alignItems: "center", paddingTop: "20px", paddingBottom: "20px"}}>
            <img src="https://purepng.com/public/uploads/large/big-chungus-jkg.png" alt="" style={
                {width: "80px", height: "80px", borderRadius: "50%", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}/>
            <div>
                <span style={{fontWeight: "bolder", fontSize: "22px"}}>Juan Gallo</span> <br />
                <span style={{fontWeight: "300"}}>Class of 2026, International</span>
            </div>
        </div>
    )
}

function ProfilePercentage({profileQuestionData}){
    const numQuestions = profileQuestionData.length;
    const numUnanswered = (profileQuestionData.filter((question)=>(question.answer === null))).length;
    return numUnanswered/numQuestions;
}

function ProfileMissing({profileQuestionData}){
    const numMandatoryQuestions = (profileQuestionData.filter((question)=>((question.answer === null) && (question.importance === "mandatory")))).length;
    const numOptionQuestions = (profileQuestionData.filter((question)=>((question.answer === null) && (question.importance === "optional")))).length;
    return [numMandatoryQuestions, numOptionQuestions];
}