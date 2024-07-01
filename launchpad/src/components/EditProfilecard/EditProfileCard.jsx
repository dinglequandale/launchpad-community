import './editprofilecard.css';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { useState, useEffect, useRef } from 'react';
import { IoAdd } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { useLocation, useNavigate } from 'react-router-dom';
import { RiArrowGoBackFill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import AboutMeModal from '../Profilemodals/AboutMemodal/AboutMeModal';
import OpportunityModal from '../Profilemodals/Opportunitymodal/OpportunityModal';
import OrganizationProfile from '../Organizationprofile/OrganizationProfile';
import BasicInfoModal from '../BasicInfomodal/BasicInfoModal';


export default function EditProfileCard({userData}) {
    const navigate = useNavigate();
    const location = useLocation();

    // temporary data
    const userType = "Professional";
    const userName = "Shuja Gupta";
    const opportunitiesOptions = {highSchool: 
    <span style={{color: "var(--secondary)", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead a <span style={{fontWeight: "bolder"}}>school club</span> or an <span style={{fontWeight: "bolder"}}> out-of-school student initative</span>, such as a nonprofit?</span>,
    alum:
    <span style={{color: "var(--secondary)", textAlign: "center", }}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead an <span style={{fontWeight: "bolder"}}>out-of-school student initative</span>, such as a nonprofit?</span>,
    professional:
    <span style={{color: "var(--secondary)", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently have an available <span style={{fontWeight: "bolder"}}>workplace opportunity</span> at your organization for high school or college students?</span>
};
    const descType = () => {switch(userType){
        case "High Schooler":
            return "Colleges of Interest"
        case "Alumni":
            return "Attending College"
        case "Professional":
            return "Current Position"
    }
    }

    return(
        <>
            <div className='editprofileCard'>
                <div style={{borderBottomStyle: "solid", borderColor: "#C0C0C0", borderWidth: "1.7px", paddingBottom: "5px"}}>
                    <div className='return' style={{display: "flex", gap: "5px", alignItems: "center", paddingBottom: "5px", cursor: "pointer", fontWeight: "bolder"}}
                    onClick={() => {location.state ? navigate(location.state) : navigate("/")}}>
                        <RiArrowGoBackFill size={20}/>
                        <span>Go Back</span>
                    </div>
                    <BasicInfoCard userName={userName} userType={userType} descType={descType}/>
                </div>
                <div style={{paddingTop: "20px"}}>
                    <OpportunityPopup userName={userName} userType={userType} descType={descType} opportunitiesOptions={opportunitiesOptions}/>
                </div>
                <AboutMeDisplay/>
                <div className={`userResume ${userType === "High Schooler" ? "no_border" : ""}`} style={{paddingBottom: "20px"}}>
                    <div style={{display: "flex", justifyContent: "space-between"}} id="Resume">
                        <span style={{fontSize: "20px", fontWeight: "bolder", paddingTop: "15px"}}>{userName}'s Resume ...</span>
                        <PublicPrivateDropdown/>
                    </div>
                    <span style={{fontWeight: "250", fontSize: "15px"}}>Upload a resume so others can understand more about your experiences.</span> 
                    <ResumeUpload/>
                </div>
                {(userType === "Professional" || userType === "Alumni") && <hr style={{width: "100%"}}/>}
                {(userType === "Professional" || userType === "Alumni") && <div className='networkingCommitment' style={{textAlign: "center", paddingTop: "10px"}}>
                    <div style={{paddingBottom: "10px"}}>
                        <h style={{color: "var(--secondary)", fontSize: "30px", fontWeight: "300"}}><span style={{borderBottomStyle: "solid"}}>{userName}</span> is <span style={{fontWeight: "450"}}>open to</span> ... <br /></h>
                        <span style={{fontWeight: "250", fontSize: "15px"}}>What are you open to do for these students?</span>
                    </div>
                    <div className='addOne'>
                        <IoAdd size={25} />
                        <span style={{textDecoration: "underline"}}>Add Your Availability</span>
                        <EditInformation isAnswered={false} questionName={"Availability"}/>
                    </div>
                </div>}
            </div>
        </>
    )
}

function EditInformation({questionName, onEdit, isAnswered}){
    return(
        <>
        {isAnswered && <div style={{display: "flex", flexDirection: "column", alignItems:"center", justifyContent: "center", position: "absolute", width: "150px", right: "-180px"}}
            onClick={onEdit}>
            
            <MdEdit size={30} style={{background: "#DFECEF", borderRadius: "50%", padding: "5px"}}/>
            <span style={{textDecoration: "underline", color: "var(--secondary)"}}>
                Edit {questionName}
            </span>
        </div>}
        </>
    )
}

function PublicPrivateDropdown({userResumePublicity}){
    const dropdownRef = useRef();
    const [selectedPublicity, setSelectedPublicity] = useState(<PrivacyComponent icon={<TbWorld size={23}/>} privacy={"Public"}/>);
    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const options = [["Public",<TbWorld size={23}/>], ["Private", <IoLockClosedOutline size={20}/>]];
    

    const handleClick = () => {
        setDropdownVisibility(!dropdownVisibility);
    }
    useEffect(()=>{
        let onClickHandler = (e) => {
            if(!dropdownRef.current.contains(e.target)){
                setDropdownVisibility(false);
            }
        }

        document.addEventListener("mousedown", onClickHandler)
    })
    return(
        <div className="dropdownContainer" ref={dropdownRef}>
            <div style={{display: "flex", alignItems: "center", cursor: "pointer"}} className="filterTop" onClick={handleClick}>
                <span style={{fontWeight: "550"}}>{selectedPublicity}</span>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {options.map(([option,icon],index)=>(<div className='dropdownOption' style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "5px", cursor: "pointer"}} key={index} onClick={()=>{
                            setSelectedPublicity(<PrivacyComponent icon={icon} privacy={option}/>);
                            setDropdownVisibility(false);
                            }}> {icon}
                     <span>{option}</span>
                     </div>))}
            </div>
        </div>
    )
}

function PrivacyComponent({icon, privacy}){
    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"}}> 
            {icon} 
            <span>{privacy}</span>
        </div>
    )
}

function ResumeUpload(){
    const inputRef = useRef();

    const handleUploadClick = () => {
        inputRef.current.click();
    }

    const [pdfUrl, setPdfUrl] = useState(null);
    useEffect(() => {
        return () => {
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
        };
      }, [pdfUrl]); 

    function onFileChange(event) {
    const file = event.target.files[0];
    setPdfUrl(URL.createObjectURL(file));
  }
  
    return (
      <div className="pdf-viewer-container" style={{paddingTop: "20px", display: "flex", justifyContent: "center", alignItems: "center"}}>
        {pdfUrl ? <iframe src={pdfUrl} frameborder="0" style={{width: "100%", height: "500px"}}></iframe> : 
        <button onClick={handleUploadClick} className='btnUpload'>Upload Your&nbsp;<span style={{fontWeight: "bolder"}}>Resume</span></button>}
        <input type="file" accept=".pdf" onChange={onFileChange} style={{ display: 'none' }} ref={inputRef} />
      </div>
    );
}
function BasicInfoCard({userType, userName, descType}){
    const [basicInfoData, setBasicInfoData] = useState(null);
    const [basicInfoModalVisibility, setBasicInfoModalVisibility] = useState(false);
    
    useEffect(() => {
        const storedBasicInfoData = localStorage.getItem("userBasicInfo");
        if (storedBasicInfoData !== null) {
          setBasicInfoData(JSON.parse(storedBasicInfoData));
        }
      }, [basicInfoModalVisibility]);
    return(
        <>
        <BasicInfoModal onClose={()=>setBasicInfoModalVisibility(false)} visibility={basicInfoModalVisibility} userType={userType}/>
        <div className='basicInfo'>
            <div>
                <VscAccount size = {80} className='cardPfp'/>
            </div>
            <div className='cardNameDescription'>
                <span className='cardName'>{userName}</span>
                <span className='cardDescription'>30+ Years of Experience</span>
            </div>   
            </div>
            <div style={{display: "flex"}}>
            {basicInfoData && <div className='userInfo' style={{fontSize: "16px"}}>
                <span>Fields of {userType === "Professional" ? "Expertise" : "Interest"}: {basicInfoData.areasOfInterest && basicInfoData.areasOfInterest}</span>
                <span>{descType()}: {userType !== "Professional" ? basicInfoData.colleges : `${basicInfoData.yearsOfExperience} Years of Experience in ${basicInfoData.industryOfExperience}`}</span>
            </div>}
        </div>
        <div className='addOne' style={{transform: "translate(0,-70px)"}}>
                <EditInformation isAnswered={true} questionName={"Intro"} onEdit={()=>setBasicInfoModalVisibility(true)}/>
            </div>
        </>
    )
}

function OpportunityPopup({userType, userName, opportunitiesOptions}){
    const [opportunityModalVisibility, setOpportunityModalVisibility] = useState(false);
    const [opportunityData, setOpportunityData] = useState(null);
    const [showOrganizationProfile, setShowOrganizationProfile] = useState(false);

    useEffect(() => {
        const storedOpportunityData = localStorage.getItem("userOpportunityData");
        if (storedOpportunityData !== null) {
          setOpportunityData(JSON.parse(storedOpportunityData));
          setShowOrganizationProfile(true);
        }
      }, [opportunityModalVisibility]);
      

    return(
        <>
        <OpportunityModal onClose={()=>setOpportunityModalVisibility(false)} visibility={opportunityModalVisibility}/>
        { showOrganizationProfile ? <>
        <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", alignItems: "center", justifyContent: "center", lineHeight: "2"}}>{userName} is offering one <span style={{fontWeight: "bold"}}>{opportunityData.organizationType} opportunity</span>!</span>
        <OrganizationProfile location={"user_profile"} organizationData={opportunityData}/>
        </> : <div className="initiativeOrOpportunity" style={{backgroundColor: "var(--neutral)", borderRadius: "20px",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px"}}>
            {userType === "High Schooler" ? opportunitiesOptions.highSchool : userType === "Alumni" ? opportunitiesOptions.alum : opportunitiesOptions.professional}
            <hr style={{width:"50%", borderColor: "var(--accent)"}}/>
            <div className="addOne" onClick={()=>setOpportunityModalVisibility(true)}>
                <IoAdd size={25} />
                <span style={{textDecoration: "underline"}}>Add one!</span>
            </div>
        </div>}
        <div className='addOne' style={{transform: "translate(0,-100px)"}}>
            <EditInformation isAnswered={showOrganizationProfile} questionName={"Opportunity"} onEdit={()=>setOpportunityModalVisibility(true)}/>
        </div>
        </>
    )
}

function AboutMeDisplay(){
    // editting functionality
    const aboutMe = localStorage.getItem("userAboutMe");

    const [aboutMeModalVisibility, setAboutMeModalVisibility] = useState(false);
    const onModalClose = () => {
        setAboutMeModalVisibility(false);
    }
    return(
        <>
        <AboutMeModal visibility={aboutMeModalVisibility} onClose={onModalClose}/>
        <div className="aboutMe" style={{paddingTop: "20px"}}>
            <span style={{fontSize: "20px", fontWeight: "bolder"}}>About Me ...</span> <br />

            {!aboutMe && <span style={{fontWeight: "250", fontSize: "15px"}}>Share a little about yourself. Why and with who do you want to connect?</span>}
            <div className="addOne" id="About Me" onClick={()=>{setAboutMeModalVisibility(true)}}>
                
                {!aboutMe && <>
                <IoAdd size={25} />
                <span style={{textDecoration: "underline"}}>Add an About Me Description</span>
                </>}
                <EditInformation questionName={"About Me"} onEdit={()=>setAboutMeModalVisibility(true)} isAnswered={aboutMe}/>
            </div><span>{aboutMe}</span>
        </div>
        </>
    )
}