import './profilemodal.css';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import { IoCloseOutline } from "react-icons/io5";
import SideNav from '../Sidenav/SideNav';
import { useState, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa6';
import OrganizationProfile from '../Organizationprofile/OrganizationProfile';
import ConnectModal from '../Connectmodal/ConnectModal';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Loading from '../LoadingAnimation/Loading';
import { displayFieldsOfInterest, lowerAndCapitalize } from '../../services/userProfileServices';

export default function ProfileCard({userId, visibility, onClose, top, onConnectClick}) {

    // TODO: currently localStorage, transition to database IMPORTANT
    const userType = "Professional";
    const userName = "Shuja Gupta";
    const userHasAboutMe = true;
    const userAboutMe = "ewofioerfi ewife ofiefo iewofi eoifoei ofiwo fieifi eifeufue fueuf yfeyfy ywye fyy fyefy ywfyeu fuye yfye yfe fyewf. weyfyuef yeyf yfeyf yfyef ef e f."
    const userPdfUrl = null;
    const resumePublicity = "Public";
    const userAvailability = ["Brug", "Sug", "Mug"];
    const [userData, setUserData] = useState(null);
    const [opportunityData, setOpportunityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [opportunityLoading, setOpportunityLoading] = useState(false);
    const [basicInfoContent, setBasicInfoContent] = useState(null);

    useEffect(()=>{
        const getUserData = async () => {
            setLoading(true);
            const userSnap = await getDoc(doc(db, "users", userId));
            if (userSnap.exists()) {
                setUserData(userSnap.data());
              } else {
                console.log("No such document!");
              }
            setLoading(false);
        }

        const getOpportunityData = async () => {
            setOpportunityLoading(true);
            const opportunitiesRef = collection(db, "opportunities");
            const userOpportunityQuery = query(opportunitiesRef, where("createdBy", "==", userId));

            const opportunitySnapshot = await getDocs(userOpportunityQuery)
            opportunitySnapshot.forEach((doc) => {
                setOpportunityData(doc.data());
              });
            setOpportunityLoading(false);
        }

        getUserData();
        getOpportunityData();
    },[visibility])

    // const tempUserOpportunity = {
    //     // initiative data format
    //     id: Math.random(10**5),
    //     organizationType: "Club",
    //     organizationName: "Financial Literacy Club",
    //     organizationHostStudent: "Juan Gallo Bonilla",
    //     organizationMission: "Description Description Description Description Description Description",
    //     organizationTags: ["engineering", "fortnite"],
    //     learnMore: '',
    //     apply: '',
    //     organizationLogo: null,
    //     organizationLogoPreview: '',
    // }
    
    const descType = () => {
        switch(userType){
            case "High Schooler":
                return "Dream Colleges";
            case "Alumni":
                return "Attending College";
            case "Professional":
                return "Current Position";
            default:
                return "poo";
        }
    }

    useEffect(()=>{
        if(userData){
            setBasicInfoContent({userPreface: userType === "Professional" ? `${userData.yearsOfExperience}+ Years of Experience in ${userData.fieldsOfExpertise[0]}`
                : userType === "Alumni" ? `Graduated in ${userData.graduationYear}, ${userData.sectionAttending}`
                : `Class of ${userData.graduationYear}, ${userData.sectionAttending}`,
                userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${userData.areasOfInterest ? displayFieldsOfInterest(userData.areasOfInterest) : displayFieldsOfInterest(userData.fieldsOfExpertise)}`,
                userSecondDesc: `${descType()}: ${userType === "Professional" ? lowerAndCapitalize(userData.industryPosition) : userType === "Alumni" ? userData.collegeAttending : userData.collegeInterestsOrDecision}`,
                acceptedColleges: `Accepted Colleges: ${userData.acceptedColleges}`,
            })
    }
    },[userData])

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
                    {(!loading && !opportunityLoading && userData) ?
                    <>
                    <header name="userIntro" style={{paddingBottom: "10px"}}>
                        <div className='basicInfo'>
                            <div>
                                <VscAccount size = {80} className='cardPfp'/>
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
                                {userData.acceptedColleges && <span>{basicInfoContent.acceptedColleges}</span>}
                            </div>
                        </div>
                        <button style={{width: "80%", borderRadius: "5px", margin: "0 auto"}} onClick={onConnectClick}> 
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                                <FaLink size={20}/>
                                <span style={{fontWeight: "550", fontSize: "larger"}}>Connect</span>
                            </div>
                        </button>
                    </header>
                    <hr style={{width: "95%"}}/>
                    <main style={{padding: "0px 8px"}}>
                        {opportunityData && <div>
                            <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", display: "flex", justifyContent: "center", paddingBottom: "10px"}}>{userName} is offering {opportunityData.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>&nbsp;{opportunityData.organizationType.toLowerCase()} opportunity!</span></span>
                            <OrganizationProfile location={"user_profile"} organizationData={opportunityData}/> </div>}
                        {userData.userAboutMe && <div name="userAboutMe" style={{paddingTop: "20px"}}>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName}'s About Me</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <div style={{background: "var(--neutral)", padding: "10px", borderRadius: "5px", boxShadow: "var(--shadowColor)", paddingTop: "15px"}}>
                                <span>{userAboutMe}</span>
                            </div>
                        </div>}
                        {(userData.userResumePreview && resumePublicity === "Public") && <div name="userResume">
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName}'s Resume</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <iframe src={userData.userResumePreview} frameborder="0" style={{width: "100%", height: "500px"}}></iframe></div>}
                        {userData.networkingLevel && userData.networkingLevel.length > 0 && <div>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1", paddingTop: "20px"}}>{userName}'s Commitment</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "30px", paddingTop: "10px"}}>
                                {userAvailability.map((availability)=>(
                                    <div key={availability} style={{background: "var(--neutral)", padding: "6px 11px", borderRadius: "5px"}}>
                                        <a href='/' style={{lineHeight: "1.5", fontSize: "22px", textDecoration: "underline"}}>{availability}</a>
                                    </div>
                                ))}
                            </div>
                    </div>}
                    </main>
                    </>  : <Loading/>}
                </div>
            </div>
        </>   
    )
}