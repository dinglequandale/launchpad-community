import './profilemodal.css';
import React from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa6';
import OrganizationProfile from '../Organizationprofile/OrganizationProfile';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Loading from '../LoadingAnimation/Loading';
import { displayColleges, displayFieldsOfInterest, getBasicUserDescription } from '../../services/userProfileServices';
import { Link } from 'react-router-dom';

export default function ProfileCard({userData, visibility, onClose, top, onConnectClick, handleReferalClick}) {

    const userType = userData.userType;
    const userName = userData.userName;
    const [opportunityData, setOpportunityData] = useState(null);
    // const [loading, setLoading] = useState(false);
    const [opportunityLoading, setOpportunityLoading] = useState(false);
    
    const isProfessional = JSON.parse(localStorage.getItem("basicUserInfo")).userType === "Professional";
    useEffect(()=>{

        const getOpportunityData = async () => {
            setOpportunityLoading(true);
            const opportunitiesRef = collection(db, "opportunities");
            const userOpportunityQuery = query(opportunitiesRef, where("createdBy", "==", userData.userId));

            const opportunitySnapshot = await getDocs(userOpportunityQuery)
            opportunitySnapshot.forEach((doc) => {
                setOpportunityData(doc.data());
              });
            setOpportunityLoading(false);
        }

        getOpportunityData();
    },[visibility])
    
    const descType = () => {
        switch(userData.userType){
            case "High Schooler":
                return userData.collegeDecision === "No" ? "Dream Colleges" : "Committed College";
            case "Alumni":
                return "Attending College";
            case "Professional":
                return "Current Position";
            default:
                return "";
        }
    }

    const basicInfoContent = {userPreface: getBasicUserDescription(userData, false),
    userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${(userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest) : displayFieldsOfInterest(userData.areasOfInterest)}`,
    userSecondDesc: `${descType()}: ${userType === "Professional" ? (userData.industryPosition + " at " + userData.companyName) : userType === "Alumni" ? displayColleges([userData.collegeAttending]) : displayColleges([...userData.collegeInterestsOrDecision])}`,
    acceptedColleges: `Accepted Colleges: ${userData.acceptedColleges}`,
};

    const menuRef = useRef();

    useEffect(() => {
      let onClickOutside = (e) => {
          if(!menuRef.current.contains(e.target)){
            onClose();
          }
      }
      document.addEventListener("mousedown", onClickOutside)
  })

    useEffect(() => {
        const modalOverlay = document.querySelector('.blurOverlay');
        const pageHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        if (modalOverlay) {
          modalOverlay.style.height = `${pageHeight}px`;
        }
    }, []);

    return(
        <>
            <div className='blurOverlay'>
                <div className='profileModalContent' style={{ top: top }} ref={menuRef}>
                    <IoCloseOutline className='closeProfileModal' size={30} onClick={onClose}/>
                    <>
                    <header name="userIntro" style={{paddingBottom: "10px"}}>
                        <div className='basicInfo'>
                            <div>
                                {userData.userPfpPreview ? <img src={userData.userPfpPreview} alt="" style={
                            {width: "80px", height: "80px", borderRadius: "50%", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}/> : <img className="pfpImage" src="/assets/placeholder_pfp.png" alt="" style={
                                {width: "80px", height: "80px"}}/>}
                            </div>
                            <div className='cardNameDescription'>
                                <span className='cardName'>{userData.userName}</span>
                                <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                            </div>   
                        </div>
                        <div style={{display: "flex"}}>
                            <div className='userInfo' style={{fontSize: "16px"}}>
                                <span>{basicInfoContent.userFirstDesc}</span>
                                <span>{basicInfoContent.userSecondDesc}</span>
                                {(userData.acceptedColleges && userData.acceptedColleges.length > 0) && <span>{basicInfoContent.acceptedColleges}</span>}
                            </div>
                        </div>
                        <button className='btnConnect' style={{width: "80%", borderRadius: "5px", margin: "0 auto"}} onClick={() => onConnectClick(userData.userId)}> 
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                                <FaLink size={20}/>
                                <span style={{fontWeight: "550", fontSize: "larger"}}>Connect</span>
                            </div>
                        </button>
                    </header>
                    <hr style={{width: "95%"}}/>
                    <main style={{padding: "0px 8px"}}>
                        {(!opportunityLoading && opportunityData) ? <div>
                            <div style={{textAlign: "center", marginBottom: ".6rem"}}>
                            <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", paddingBottom: "3rem"}}>{userName.split(" ")[0]} is offering {opportunityData.organizationType === "Internship" ? "an" : "a"}<span style={{fontWeight: "bold"}}>&nbsp;{opportunityData.organizationType.toLowerCase()} opportunity!</span></span>
                            </div>
                            <OrganizationProfile location={"user_profile_public"} organizationData={opportunityData} handleReferalClick={handleReferalClick}/> </div> : opportunityLoading ? <Loading/> : null}
                        {(userData.userAboutMe || userData.linkedinLink) && <div name="userAboutMe" style={{paddingTop: "20px"}}>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName.split(" ")[0]}'s About Me</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            {userData.userAboutMe && <div style={{background: "var(--neutral)", borderRadius: "5px", display: "flex", alignItems: "center", padding: "10px"}}>
                                <span>{userData.userAboutMe}</span>
                            </div>}
                            {userData.linkedinLink && <div className="linkedInDisplay" style={{display: "flex", justifyContent: "center", padding: "10px"}}>
                                <span>LinkedIn Profile: <Link onClick={() => window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer')}>{userData.linkedinLink}</Link></span>
                            </div>}
                        </div>}
                        {(userData.userSkills && userData.userSkills.length > 0) && 
                        <div>
                            <span style={{marginTop: "20px", fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName.split(" ")[0]}'s Career-Ready Skills</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <div className="skills-container" style={{position: "relative"}}>
                                {Object.entries(
                                    userData.userSkills.reduce((acc, skill) => {
                                    if (!acc[skill.skillCategory]) {
                                        acc[skill.skillCategory] = [];
                                    }
                                    acc[skill.skillCategory].push(skill.skillDescription);
                                    return acc;
                                    }, {})
                                ).map(([category, skills]) => (
                                    <div key={category} className="skill-category">
                                    <span>{category}</span>
                                    <ul>
                                        {skills.map((skill, index) => (
                                        <li key={index}>{skill}</li>
                                        ))}
                                    </ul>
                                    </div>
                                ))}
                                </div>
                        </div>}
                        {(userData.userResumePreview && ((userData.userResumePreview.split(" ")[0]) !== "private" || isProfessional)) && <div name="userResume" style={{marginTop: "20px"}}>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName.split(" ")[0]}'s Resume</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <iframe src={userData.userResumePreview.split(" ")[userData.userResumePreview.split(" ").length - 1]} frameborder="0" style={{width: "100%", height: "500px"}}></iframe></div>}
                        {userData.networkingLevel && userData.networkingLevel.length > 0 && <div>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1", paddingTop: "20px"}}>{userName.split(" ")[0]}'s Commitment</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "30px", paddingTop: "10px"}}>
                                {userData.networkingLevel.map((availability)=>(
                                    <div key={availability} style={{background: "var(--neutral)", padding: "6px 11px", borderRadius: "5px"}}>
                                        <span style={{lineHeight: "1.5", fontSize: "22px", color: "var(--secondary)"}}>{availability}</span>
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </main>
                    </>
                </div>
            </div>
        </>   
    )
}