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

export default function ProfileCard({user, onClose, top, onConnectClick}) {

    // TODO: currently localStorage, transition to database IMPORTANT
    const userType = "Professional";
    const userName = "Shuja Gupta";
    const userHasOpportunity = true;
    const userHasAboutMe = true;
    const userAboutMe = "ewofioerfi ewife ofiefo iewofi eoifoei ofiwo fieifi eifeufue fueuf yfeyfy ywye fyy fyefy ywfyeu fuye yfye yfe fyewf. weyfyuef yeyf yfeyf yfyef ef e f."
    const userPdfUrl = null;
    const resumePublicity = "Public";
    const userAvailability = ["Brug", "Sug", "Mug"];


    const tempUserOpportunity = {
        // initiative data format
        id: Math.random(10**5),
        organizationType: "Club",
        organizationName: "Financial Literacy Club",
        organizationHostStudent: "Juan Gallo Bonilla",
        organizationMission: "Description Description Description Description Description Description",
        organizationTags: ["engineering", "fortnite"],
        learnMore: '',
        apply: '',
        organizationLogo: null,
        organizationLogoPreview: '',
    }
    
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

    const [basicInfoData, setBasicInfoData] = useState({});

    const basicInfoContent = {userPreface: userType === "Professional" ? `${basicInfoData.yearsOfExperience} years of experience in ${basicInfoData.industryOfExperience}`
    : userType === "Alumni" ? `Graduated with Class of [...]`
    : `[...], Class of [...]`,
    userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${basicInfoData.areasOfInterest ?? basicInfoData.fieldsOfExpertise}`,
    userSecondDesc: `${descType()}: ${userType === "Professional" ? basicInfoData.industryPosition : userType === "Alumni" ? basicInfoData.attendingCollege : basicInfoData.dreamColleges}`,
    acceptedColleges: `Accepted Colleges: ${basicInfoData.acceptedColleges}`,
}

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
                    <header name="userIntro" style={{paddingBottom: "10px"}}>
                        <div className='basicInfo'>
                            <div>
                                <VscAccount size = {80} className='cardPfp'/>
                            </div>
                            <div className='cardNameDescription'>
                                <span className='cardName'>{userName}</span>
                                <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                            </div>   
                        </div>
                        <div style={{display: "flex"}}>
                            <div className='userInfo' style={{fontSize: "16px"}}>
                                <span>{basicInfoContent.userFirstDesc}</span>
                                <span>{basicInfoContent.userSecondDesc}</span>
                                {basicInfoData.acceptedColleges && <span>{basicInfoContent.acceptedColleges}</span>}
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
                        {userHasOpportunity && <div>
                            <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", display: "flex", justifyContent: "center", paddingBottom: "10px"}}>{userName} is offering {tempUserOpportunity.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>&nbsp;{tempUserOpportunity.organizationType.toLowerCase()} opportunity!</span></span>
                            <OrganizationProfile location={"user_profile"} organizationData={tempUserOpportunity}/> </div>}
                        {userHasAboutMe && <div name="userAboutMe" style={{paddingTop: "20px"}}>
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName}'s About Me</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <div style={{background: "var(--neutral)", padding: "10px", borderRadius: "5px", boxShadow: "var(--shadowColor)", paddingTop: "15px"}}>
                                <span>{userAboutMe}</span>
                            </div>
                        </div>}
                        {(userPdfUrl && resumePublicity === "Public") && <div name="userResume">
                            <span style={{fontSize: "20px", fontWeight: "bolder", display: "flex", justifyContent: "center", color: "var(--secondary)", lineHeight: "1"}}>{userName}'s Resume</span>
                            <hr style={{borderColor: "var(--secondary)", width: "70%"}}/>
                            <iframe src={pdfUrl} frameborder="0" style={{width: "100%", height: "500px"}}></iframe></div>}
                        {userAvailability && <div>
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
                </div>
            </div>
        </>   
    )
}