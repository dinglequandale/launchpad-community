import './editprofilecard.css';
import React, { createContext, useContext } from 'react';
import { VscAccount } from "react-icons/vsc";
import { useState, useEffect, useRef } from 'react';
import { IoAdd } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { useLocation, useNavigate } from 'react-router-dom';
import { RiArrowGoBackFill } from "react-icons/ri";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import AboutMeModal from '../Profilemodals/AboutMemodal/AboutMeModal';
import OpportunityModal from '../Profilemodals/Opportunitymodal/OpportunityModal';
import OrganizationProfile from '../Organizationprofile/OrganizationProfile';
import BasicInfoModal from '../BasicInfomodal/BasicInfoModal';
import InitiativeModal from '../Profilemodals/Initiativemodal/InitiativeModal';
import DeleteWarningModal from '../DeleteWarningmodal/DeleteWarningModal';
import AvailabilityModal from '../Profilemodals/Availabilitymodal/AvailabilityModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/auth/AuthContext';

const ProfileContext = createContext({
    currentUser: null
  });

export default function EditProfileCard({userData}) {
    const navigate = useNavigate();
    const location = useLocation();
    // temporary data
    const userType = "Professional";
    const userName = "Shuja Gupta";

    const { currentUser } = useAuth();
    
    const opportunitiesOptions = {highSchool: 
    <span style={{color: "var(--secondary)", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead a <span style={{fontWeight: "bolder"}}>school club</span> or an <span style={{fontWeight: "bolder"}}> out-of-school student initative</span>, such as a nonprofit?</span>,
    alum:
    <span style={{color: "var(--secondary)", textAlign: "center", }}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead an <span style={{fontWeight: "bolder"}}>out-of-school student initative</span>, such as a nonprofit?</span>,
    professional:
    <span style={{color: "var(--secondary)", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently have an available <span style={{fontWeight: "bolder"}}>workplace opportunity</span> at your organization for high school or college students?</span>
};
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
    return(
        <>
            <ProfileContext.Provider value={{currentUser}}>
            <div className='editprofileCard'>
                <div style={{borderBottomStyle: "solid", borderColor: "#C0C0C0", borderWidth: "1.7px", paddingBottom: "5px"}}>
                    <div className='return' style={{display: "flex", gap: "5px", alignItems: "center", paddingBottom: "5px", cursor: "pointer", fontWeight: "bolder"}}
                    onClick={() => {location.state ? navigate(location.state) : navigate("/")}}>
                        <RiArrowGoBackFill size={20}/>
                        <span>Go Back</span>
                    </div>
                    <BasicInfoCard userName={userName} userType={userType} descType={descType()}/>
                </div>
                <div style={{paddingTop: "20px"}}>
                    <OpportunityPopup userName={userName} userType={userType} opportunitiesOptions={opportunitiesOptions}/>
                </div>
                <AboutMeDisplay/>
                <div className={`userResume ${userType === "High Schooler" ? "no_border" : ""}`} style={{paddingBottom: "20px"}}>
                    <div style={{display: "flex", justifyContent: "space-between"}} id="Resume">
                        <span style={{fontSize: "20px", fontWeight: "bolder", paddingTop: "15px"}}>{userName}'s Resume ...</span>
                        <PublicPrivateDropdown/>
                    </div>
                    <ResumeUpload/>
                </div>
                {(userType === "Professional" || userType === "Alumni") && <hr style={{width: "100%"}}/>}
                {(userType === "Professional" || userType === "Alumni") && <div className='networkingCommitment' style={{textAlign: "center", paddingTop: "10px"}}>
                    <h style={{color: "var(--secondary)", fontSize: "30px", fontWeight: "300"}}><span style={{borderBottomStyle: "solid"}}>{userName}</span> is <span style={{fontWeight: "450"}}>open to</span> ... </h>
                    <ConnectionAvailability userType={userType}/>
                </div>}
            </div>
            </ProfileContext.Provider>
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
    const [selectedPublicity, setSelectedPublicity] = useState("Public");
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
            <div style={{display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between", gap:"5px"}} className="filterTop" onClick={handleClick}>
                {selectedPublicity === "Public" ? <TbWorld size={23}/> : <IoLockClosedOutline size={20}/>}
                <span style={{fontWeight: "550"}}>{selectedPublicity}</span>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {options.map(([option,icon],index)=>(<div className='dropdownOption' style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "5px", padding: "5px", cursor: "pointer"}} key={index} onClick={()=>{
                            setSelectedPublicity(option);
                            setDropdownVisibility(false);
                            }}>
                     <PrivacyComponent icon={icon} privacy={option}/>
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
    // IMPORTANT TODO: files funky with localStorage, need to adjust when transition to database
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
    <>
        {!pdfUrl && <span style={{fontWeight: "250", fontSize: "15px"}}>Upload a resume so others can understand more about your experiences.</span>} 
        <div className="pdf-viewer-container" style={{paddingTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative"}}>
            {pdfUrl ? 
            <>
            <iframe src={pdfUrl} frameborder="0" style={{width: "100%", height: "500px"}}></iframe>
            <div className='addOne' style={{position: "absolute", right: "0"}}>
                <EditInformation isAnswered={true} questionName={"Resume"} onEdit={()=>inputRef.current.click()}/>
            </div>
            </>
            : 
            <button onClick={handleUploadClick} className='btnUpload'>Upload Your&nbsp;<span style={{fontWeight: "bolder"}}>Resume</span></button>}
            <input type="file" accept=".pdf" onChange={onFileChange} style={{ display: 'none' }} ref={inputRef} />
        </div>
    </>
    );
}
function BasicInfoCard({userType, userName, descType}){

    const [basicInfoData, setBasicInfoData] = useState({});
    const [basicInfoModalVisibility, setBasicInfoModalVisibility] = useState(null);
    useEffect(() => {
        const storedBasicInfoData = localStorage.getItem("userBasicInfo");
        if (storedBasicInfoData !== null) {
          setBasicInfoData(JSON.parse(storedBasicInfoData));
        }
        else{
        }
      }, [basicInfoModalVisibility,]);

    const basicInfoContent = {userPreface: userType === "Professional" ? `${basicInfoData.yearsOfExperience} years of experience in ${basicInfoData.industryOfExperience}`
    : userType === "Alumni" ? `Graduated with Class of [...]`
    : `[...], Class of [...]`,
    userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${basicInfoData.areasOfInterest ?? basicInfoData.fieldsOfExpertise}`,
    userSecondDesc: `${descType}: ${userType === "Professional" ? basicInfoData.industryPosition : userType === "Alumni" ? basicInfoData.attendingCollege : basicInfoData.dreamColleges}`,
    acceptedColleges: `Accepted Colleges: ${basicInfoData.acceptedColleges}`,
}

    return(
        <>
        <BasicInfoModal onClose={()=>setBasicInfoModalVisibility(false)} visibility={basicInfoModalVisibility} userType={userType}/>
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
    const [deleteWarningVisibility, setDeleteWarningVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useContext(ProfileContext);

    useEffect(() => {
        async function loadOpportunities() {
          try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "opportunities"));
            setOpportunityData({...querySnapshot.docs[0].data()});
            setShowOrganizationProfile(true);
            console.log(opportunityData);
          } catch (error) {
            console.log(error)
          } finally {
            setLoading(false);
          }
        }
    
        loadOpportunities();
      }, [showOrganizationProfile, opportunityModalVisibility]);
    
    const handleDeleteOpportunity = () => {
        setShowOrganizationProfile(false);
        setOpportunityData(null);
        localStorage.removeItem("userOrganizationData");
    }
    return(
        <>
        <div name="deleteWarning">
            {deleteWarningVisibility && <DeleteWarningModal onCancel={()=>setDeleteWarningVisibility(false)} onVerify={handleDeleteOpportunity} visibility={deleteWarningVisibility}
                objectOfDeletation={opportunityData.organizationType}/>}
        </div>
        <div name="opportunityModal" style={{position: "relative"}}>
            {userType === "Professional" ? <OpportunityModal onClose={()=>setOpportunityModalVisibility(false)} visibility={opportunityModalVisibility} opportunityData={opportunityData}/> : <InitiativeModal onClose={()=>setOpportunityModalVisibility(false)} visibility={opportunityModalVisibility}/>}
        </div>
        <div style={{position: "relative"}}>
            { showOrganizationProfile ? <>
            <span style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)", alignItems: "center", justifyContent: "center", lineHeight: "2"}}>{userName} is offering {opportunityData.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>{opportunityData.organizationType.toLowerCase()} opportunity!</span></span>
            <button className='btnCircle' onClick={()=>setDeleteWarningVisibility(true)} style={{position: "absolute", right: "-13px", top: "28px", background: "red", zIndex: "2"}}>
                <MdDeleteOutline size={30}/>
            </button>
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
        </div>
        <div className='addOne' style={{transform: "translate(0,-120px)"}}>
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

function ConnectionAvailability({userType}){
    const [availabilityModalVisibility, setAvailabilityModalVisibility] = useState(false);
    const [availabilityData, setAvailabilityData] = useState(null);

    useEffect(()=>{
        const storedAvailabilityData = localStorage.getItem("userAvailabilityData");
        if(storedAvailabilityData !== null){
            setAvailabilityData(JSON.parse(storedAvailabilityData));
        }
    },[availabilityModalVisibility,])

    return(
        <>
            {availabilityModalVisibility && <AvailabilityModal visibility={availabilityModalVisibility} onClose={()=>setAvailabilityModalVisibility(false)} userType={userType}/>}
            <div>
                {!availabilityData && <span style={{fontWeight: "250", fontSize: "15px"}}>How are you open to assisting prospective students?</span>}
                {!availabilityData && <div className='addOne' onClick={()=>setAvailabilityModalVisibility(true)}>
                     <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add Your Availability</span>
                </div>}
                {availabilityData && <div style={{position: "relative", paddingTop: "10px", alignItems: "center"}}>
                    <div className='addOne' style={{position: "absolute", right: "0"}}>
                        <EditInformation isAnswered={true} questionName={"Availability"} onEdit={()=>setAvailabilityModalVisibility(true)}/>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "30px"}}>
                        {availabilityData.map((availability)=>(
                            <div key={availability} style={{background: "var(--neutral)", padding: "6px 11px", borderRadius: "5px"}}>
                                <a href='/' style={{lineHeight: "1.5", fontSize: "22px", textDecoration: "underline"}}>{availability}</a>
                            </div>
                        ))}
                    </div>
                </div>}
            </div>
        </>
    )
}