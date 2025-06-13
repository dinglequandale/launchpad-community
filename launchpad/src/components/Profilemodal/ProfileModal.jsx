import './profilemodal.css';
import React from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { FaFlag } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa6';
import OrganizationProfile from '../Organizationprofile/OrganizationProfile';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Loading from '../LoadingAnimation/Loading';
import { displayColleges, displayFieldsOfInterest, displaySchools, displayShortenedLinkedin, getBasicUserDescription, getVerificationStatus } from '../../services/userProfileServices';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import DefaultIcon from '../DefaultIcon/DefaultIcon';
import { CgClose } from 'react-icons/cg';
import { BiFlag } from 'react-icons/bi';
import toast from 'react-hot-toast';

export default function ProfileCard({userData, visibility, onClose, top, onConnectClick, handleReferalClick}) {

    const userType = userData.userType;
    const viewingUserType = JSON.parse(localStorage.getItem("basicUserInfo")).userType;

    const userName = userData.userName;
    const [opportunitiesData, setOpportunitiesData] = useState([]);
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);

    const {currentUser} = useAuth();

    const basicUserInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
    const isProfessional = basicUserInfo.userType === "Professional";

    const location = useLocation();
    const currentPath = location.pathname;

    const [reportVisibility, setReportVisibility] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(()=>{

        const getOpportunityData = async () => {
            setOpportunitiesLoading(true);
            try{
            const opportunitiesRef = collection(db, "tenants", basicUserInfo.schoolId ?? 'awty', "opportunities");
            const userOpportunityQuery = query(opportunitiesRef, where("createdBy", "==", userData.userId));

            const opportunitySnapshot = await getDocs(userOpportunityQuery);
            setOpportunitiesData(opportunitySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })));
            }
            catch{
                console.log("error")
            }
            finally{
                setOpportunitiesLoading(false);
            }
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
    userFirstDesc: {desc1: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}`, desc2: `${(userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest, "longer") : displayFieldsOfInterest(userData.areasOfInterest, "longer")}`},
    userSecondDesc: {desc1: `${descType()}`, desc2: `${userType === "Professional" ? (userData.industryPosition + " at " + userData.companyName) : userType === "Alumni" ? displayColleges([userData.collegeAttending]) : Array.isArray(userData.collegeInterestsOrDecision) ? displayColleges([...userData.collegeInterestsOrDecision]) : displayColleges([userData.collegeInterestsOrDecision])}`},
    acceptedColleges: {desc1: `Accepted Colleges`, desc2: `${userData.acceptedColleges}`},
    affiliatedSchools: {desc1: `Affiliated School`, desc2: userData.schoolAttending ? `${displaySchools(userData.schoolAttending)}` : ""}
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

    const handleReport = async () => {
        if (!reportReason.trim()) {
            toast.error('Please provide a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        try {
            const mailtoLink = `mailto:launchpadhelpline@gmail.com?subject=Report for User: ${userData.userName}&body=Report Reason: ${reportReason}%0D%0A%0D%0AReported User ID: ${userData.userId}%0D%0AReported User Name: ${userData.userName}`;
            window.location.href = mailtoLink;
            
            toast.success('Report submitted successfully');
            
            setTimeout(() => {
                setReportVisibility(false);
                setReportReason('');
            }, 2000);
        } catch (error) {
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <>
            <div className='blurOverlay'>
                <div className='profileModalContent' style={{ top: top }} ref={menuRef}>
                    <div style={{position:"absolute", right: "10px", top: "9px"}}>
                        <div className="modal-right-header">
                            <BiFlag 
                                className='reportProfileModal' 
                                size={25} 
                                onClick={() => setReportVisibility(true)}
                            />
                            <IoCloseOutline 
                                className='closeProfileModal' 
                                size={30} 
                                onClick={onClose}
                            />
                        </div>
                    </div>
                    {reportVisibility && (
                        <div className="reportDialogContainer">
                            <button className='btnClose' onClick={() => setReportVisibility(false)} style={{background:"none"}}><CgClose size={25}/></button>
                            <div className="reportDialog">
                                <h3>Report User</h3>
                                <textarea
                                    placeholder="Please provide a reason for reporting this user..."
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <div className="reportActions">
                                    <button 
                                        className='btnUnfilled' 
                                        onClick={() => setReportVisibility(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className='btnSaveChanges' 
                                        onClick={handleReport}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <>
                    <header name="userIntro" style={{paddingBottom: "10px"}}>
                        <div className='basicInfo' style={{marginBottom: !userData.userPfpPreview ? "10px" : ""}}>
                            <div>
                                {userData.userPfpPreview ? <img src={userData.userPfpPreview} alt="" className='pfpImage' style={
                            {width: "80px", height: "80px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}/> : <><DefaultIcon size={50} length={"70px"}/></>}
                            </div>
                            <div className='cardNameDescription'>
                                <span className='cardName'>{userData.userName}</span>
                                <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                            </div>   
                        </div>
                        <div style={{display: "flex", marginBottom: "15px"}}>
                            <div className='userInfo' style={{fontSize: "16px"}}>
                                <span><span style={{fontWeight: "500"}}>{basicInfoContent.userFirstDesc.desc1}</span>: {basicInfoContent.userFirstDesc.desc2}</span>
                                <span><span style={{fontWeight: "500"}}>{basicInfoContent.userSecondDesc.desc1}</span>: {basicInfoContent.userSecondDesc.desc2}</span>
                                {userData.acceptedColleges && userData.acceptedColleges.length > 0 && <><span><span style={{fontWeight: "bolder"}}>{basicInfoContent.acceptedColleges.desc1}</span>: {basicInfoContent.acceptedColleges.desc2}</span></>}
                                {userData.userType === "Professional" && userData.schoolAttending && <><span><span style={{fontWeight: "bolder"}}>{basicInfoContent.affiliatedSchools.desc1}</span>: {basicInfoContent.affiliatedSchools.desc2}</span></>}
                                {userData.userType === "Professional" && (
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginTop: "8px"
                                  }}>
                                    <span style={{fontWeight: "500"}}>Verification Status:</span>
                                    <div style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "14px",
                                      backgroundColor: getVerificationStatus(userData) === "pending" ? "#FFA500" : 
                                                    getVerificationStatus(userData) === "verified" ? "#4CAF50" : "#FF0000",
                                      color: "white"
                                    }}>
                                      {getVerificationStatus(userData).charAt(0).toUpperCase() + getVerificationStatus(userData).slice(1)}
                                    </div>
                                  </div>
                                )}
                            </div>
                        </div>
                        {viewingUserType !== "Professional" && <button className='btnConnect' style={{width: "95%", borderRadius: "5px",  margin: "0 auto"}} onClick={() => onConnectClick(currentPath === "/Organizations" ? userData : userData.id)}> 
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                                <FaLink size={20}/>
                                <span style={{fontWeight: "550", fontSize: "larger"}}>Connect</span>
                            </div>
                        </button>}
                    </header>
                    <hr style={{width: "95%"}}/>
                    <main style={{padding: "0px 8px"}}>
                    {(!opportunitiesLoading && opportunitiesData.length > 0) ? 
                        
                        (
                            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                                {opportunitiesData.map((opportunityData, index)=>(
                                    <>
                                    <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", paddingBottom: ".5rem", textAlign: "center"}}>{userName.split(" ")[0]} is {opportunityData.organizationType === "Business" ? "running" : "offering"} {opportunityData.organizationType === "Internship" ? "an" : "a"}<span style={{fontWeight: "bold"}}>&nbsp;{opportunityData.organizationType.toLowerCase()}{opportunityData.organizationType !== "Business" && " opportunity"}!</span></span>
                                    <OrganizationProfile 
                                        location={"user_profile_public"} 
                                        key={index} 
                                        organizationData={opportunityData} 
                                        handleReferalClick={handleReferalClick}
                                    />
                                    </>
                                ))}
                            </div> )
                            : opportunitiesLoading ?
                        <div style={{marginTop: "40px"}}><Loading/></div> :
                        null}
                        {(userData.userAboutMe || userData.linkedinLink) && <div name="userAboutMe" style={{paddingTop: "20px"}}>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName.split(" ")[0]}'s About Me</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            {userData.userAboutMe && <div style={{background: "var(--neutral)", borderRadius: "5px", display: "flex", alignItems: "center", padding: "10px"}}>
                                <span>{userData.userAboutMe}</span>
                            </div>}
                            {userData.linkedinLink && <div className="linkedInDisplay" style={{display: "flex", justifyContent: "center", padding: "10px"}}>
                                <span>LinkedIn Profile: <Link onClick={() => window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer')}>{displayShortenedLinkedin(userData.linkedinLink)}</Link></span>
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