import './editprofilecard.css';
import React, { createContext, useContext } from 'react';
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
import { useAuth } from '../../contexts/auth/AuthContext';
import { handleDeleteOpportunity, loadOpportunities } from '../../services/opportunityServices';
import Loading from '../LoadingAnimation/Loading';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { deletePfp, displayColleges, displayFieldsOfInterest, editUserData, getBasicUserDescription, handleUserProfileUpdate, handleUserResumeUpdate, lowerAndCapitalize } from '../../services/userProfileServices';
import { BiEdit, BiTrash } from 'react-icons/bi';
import SkillModal from '../SkillsModal/SkillModal';

const ProfileContext = createContext({
    currentUser: null,
    userData: {},
  });

export default function EditProfileCard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userData, setUserData] = useState(null);

    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [opportunitiesData, setOpportunitiesData] = useState([]);
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
    const [opportunityModalVisibility, setOpportunityModalVisibility] = useState(false);
    const [newOpportunityModalVisibility, setNewOpportunityModalVisibility] = useState(false);

    useEffect(() => {
        let unsubscribe;
        setLoading(true);

        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data());
                } else {
                    console.log("No such document!");
                    setUserData(null);
                }
            });
        } else {
            setUserData(null);
        }
        setLoading(false);
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser]);

    useEffect(() => {
        setOpportunitiesLoading(true);
        const unsubscribe = loadOpportunities(currentUser, setOpportunitiesLoading, setOpportunitiesData);
        return () => unsubscribe();
      }, [currentUser]);

    console.log(userData)

    const opportunitiesOptions = {highSchool: 
    <span style={{color: "#006876", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead a <span style={{fontWeight: "bolder"}}>school club</span> or an <span style={{fontWeight: "bolder"}}> out-of-school student initative</span>, such as a nonprofit?</span>,
    alum:
    <span style={{color: "#006876", textAlign: "center", }}> <span style={{fontWeight: "bolder"}}>Do you</span> currently lead an <span style={{fontWeight: "bolder"}}>out-of-school student initative</span>, such as a nonprofit?</span>,
    professional:
    <span style={{color: "#006876", textAlign: "center"}}> <span style={{fontWeight: "bolder"}}>Do you</span> currently have an available <span style={{fontWeight: "bolder"}}>workplace opportunity</span> at your organization for high school or college students?</span>
};
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
    return(
        <>
        <div name="opportunityModal" style={{position: "relative"}}>
            {userData && userData.userType === "Professional" ? <OpportunityModal 
                onClose={()=>setNewOpportunityModalVisibility(false)}
                visibility={newOpportunityModalVisibility} 
                opportunityData={null} 
                isEditing={false} 
                opportunityId={""}/>
            
            : <InitiativeModal 
                onClose={()=>setNewOpportunityModalVisibility(false)} 
                visibility={newOpportunityModalVisibility}
                opportunityData={null} 
                isEditing={false} 
                opportunityId={""}/>}
        </div>
            <ProfileContext.Provider value={{currentUser, userData}}>
            <div className='editprofileCard'>
                {(!loading && userData) ? <>
                <div style={{borderBottomStyle: "solid", borderColor: "#C0C0C0", borderWidth: "1.7px", paddingBottom: "5px"}}>
                    <div className='return' style={{display: "flex", gap: "5px", alignItems: "center", paddingBottom: "5px", cursor: "pointer", fontWeight: "bolder"}}
                    onClick={() => {location.state ? navigate(location.state) : navigate("/")}}>
                        <RiArrowGoBackFill size={20}/>
                        <span>Go Back</span>
                    </div>
                    <BasicInfoCard descType={descType()}/>
                </div>
                <div>
                    {(!opportunitiesLoading && opportunitiesData.length > 0) ? 
                    
                    (
                        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                            {opportunitiesData.map((opportunityData, index)=>(
                                <OpportunityPopup 
                                    opportunityData={opportunityData} 
                                    key={index}
                                    opportunitiesOptions={opportunitiesOptions} 
                                    opportunityModalVisibility={opportunityModalVisibility} 
                                    setOpportunityModalVisibility={setOpportunityModalVisibility}
                                />
                            ))}
                        </div> )
                        :
                    (opportunitiesLoading) ? 
                    <div style={{marginTop: "40px"}}><Loading/></div>
                     :
                    <div style={{marginTop: "20px"}}>
                        <OpportunityPopup opportunityData={null}  opportunitiesOptions={opportunitiesOptions} opportunityModalVisibility={opportunityModalVisibility} 
                        setOpportunityModalVisibility={setOpportunityModalVisibility}/>
                    </div>
                    }
                </div>
                {(!opportunitiesLoading && opportunitiesData.length > 0) && <div className="addOne" onClick={()=>setNewOpportunityModalVisibility(true)}>
                    <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add another opportunity!</span>
                </div>}
                <AboutMeDisplay/>
                {(userData && userData.userType !== "Professional") && <div name="skills" style={{marginTop: "20px"}}>
                    <span style={{fontSize: "20px", fontWeight: "bolder", paddingTop: "15px", paddingBottom: "10px"}}>{userData.userName.split(" ")[0]}'s Skills ...</span>
                    <SkillBase/>
                </div>}
                <div className={`userResume ${userData.userType === "High Schooler" ? "no_border" : ""}`} style={{paddingBottom: "20px", marginTop: "10px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", position: "relative"}} id="Resume">
                        <span style={{fontSize: "20px", fontWeight: "bolder", paddingTop: "15px", paddingBottom: "10px"}}>{userData.userName.split(" ")[0]}'s Resume ...</span>
                        <div style={{position: "absolute", right: "0", top: "17px"}}>
                            <PublicPrivateDropdown/>
                        </div>
                    </div>
                    <ResumeUpload/>
                </div>
                {(userData.userType === "Professional" || userData.userType === "Alumni") && <hr style={{width: "100%"}}/>}
                {(userData.userType === "Professional" || userData.userType === "Alumni") && <div className='networkingCommitment' style={{textAlign: "center", paddingTop: "10px"}}>
                    <h style={{color: "var(--secondary)", fontSize: "30px", fontWeight: "300"}}><span style={{borderBottomStyle: "solid"}}>{userData.userName.split(" ")[0]}</span> is <span style={{fontWeight: "450"}}>open to</span> ... </h>
                    <ConnectionAvailability/>
                </div>}
                </>
                :
                <Loading/>}
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
            
            <MdEdit size={30} className='editInfoIcon'/>
            <span style={{textDecoration: "underline"}}>
                Edit {questionName}
            </span>
        </div>}
        </>
    )
}

function PublicPrivateDropdown() {
    const dropdownRef = useRef();

    const { userData,currentUser } = useContext(ProfileContext);

    const [selectedPublicity, setSelectedPublicity] = useState( (userData.userResumePreview && userData.userResumePreview.split(" ").length > 1) ? "Professionals Only" : "Public");
    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    
    const options = [
      { value: "Public", icon: <TbWorld size={23} /> },
      { value: "Professionals Only", icon: <IoLockClosedOutline size={20} /> }
    ];
  
    const toggleDropdown = () => setDropdownVisibility(!dropdownVisibility);
    
    const handleOnPubPrivDropdownSelect = async (privSelected) => {
        setSelectedPublicity(privSelected);
        setDropdownVisibility(false);
        try{
            const newUserResume = {userResumePreview: `${privSelected === "Professionals Only" ? "private " : ""}` + userData.userResumePreview.split(" ")[userData.userResumePreview.split(" ").length - 1]};
            await editUserData(newUserResume, currentUser, userData);
        }catch{console.log("Dropdown Component Error!")}
    }

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownVisibility(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return (
      <div className="dropdown-container" ref={dropdownRef}>
        <div className="dropdown-header" onClick={toggleDropdown}>
          {options.find(option => option.value === selectedPublicity).icon}
          <span>{selectedPublicity}</span>
        </div>
        {dropdownVisibility && (
          <div className="dropdown-menu">
            {options.map((option) => (
              <PrivacyOption
                key={option.value}
                option={option}
                isSelected={selectedPublicity === option.value}
                onSelect={() => handleOnPubPrivDropdownSelect(option.value)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
function PrivacyOption({ option, isSelected, onSelect }) {
    return (
        <div className={`dropdown-option ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
        {option.icon}
        <span>{option.value}</span>
        </div>
    );
}


function SkillBase() {
    const [skillModalVisibility, setSkillModalVisibility] = useState(false);

    const { userData } = useContext(ProfileContext);

    const userSkills = userData.userSkills;
    // [{skillCategory: "Leadership", skillDescription: "I became a leader of blah blah blah..."},{skillCategory: "Community", skillDescription: "I became a leader of blah blah blah..."},{skillCategory: "Leadership", skillDescription: "I became a leader of blah blah blah..."}];
    

    return(
        <>
            {skillModalVisibility && <SkillModal visibility={skillModalVisibility} userData={userData} onClose={() => setSkillModalVisibility(false)}/>}
            {(userSkills && (userSkills.length > 0)) ? 
            (
                <div className="skills-container" style={{position: "relative"}}>
                  {Object.entries(
                    userSkills.reduce((acc, skill) => {
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
                    <div className='addOne' style={{position: "absolute", right: "0", top: "0", bottom: "0", marginTop: "auto", marginBottom: "auto"}}>
                        <EditInformation isAnswered={true} questionName={"Skills"} onEdit={()=>setSkillModalVisibility(true)}/>
                    </div>
                </div>
            )
            : <div className="addOne" onClick={()=>setNewOpportunityModalVisibility(true)}>
                <IoAdd size={25} />
                <span style={{textDecoration: "underline"}}>Add your skills!</span>
            </div>}
        </>
    )
}
    
  

function ResumeUpload(){
    const inputRef = useRef();

    const { userData, currentUser } = useContext(ProfileContext);

    const handleUploadClick = () => {
        inputRef.current.click();
    }

    const currentResumePfpUrl = userData.userResumePreview ? userData.userResumePreview.split(" ")[userData.userResumePreview.split(" ").length - 1] : null;
    console.log("currentresume:", userData.userResumePreview)
    const currentPrivacy = (userData.userResumePreview && userData.userResumePreview.split(" ")[0] === "private") ? "private" : "";

    const [pdfUrl, setPdfUrl] = useState(currentResumePfpUrl);
    useEffect(() => {
        return () => {
          if (pdfUrl) {
            // TODO: Check this:
            URL.revokeObjectURL(pdfUrl);
          }
        };
      }, [pdfUrl]); 

    async function onFileChange(event) {
        const file = event.target.files[0];
        const userResumePreview = await handleUserResumeUpdate(userData, file, currentUser, currentPrivacy);
        setPdfUrl(userResumePreview);
        // setPdfUrl(URL.createObjectURL(file));
  }
  
    return (
    <>
        {!pdfUrl && <span style={{fontWeight: "250", fontSize: "15px"}}>Upload a resume so others can understand more about your experiences.</span>} 
        <div className="pdf-viewer-container" style={{paddingTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative"}}>
            {pdfUrl ? 
            <>
            <iframe src={pdfUrl} frameborder="0" style={{width: "100%", height: "500px"}}></iframe>
            <div className='addOne' style={{position: "absolute", right: "0", top: "0", bottom: "0", marginTop: "auto", marginBottom: "auto"}}>
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
function BasicInfoCard({descType}){
    // const [basicInfoData, setBasicInfoData] = useState({});
    const [basicInfoModalVisibility, setBasicInfoModalVisibility] = useState(null);

    const { userData,currentUser } = useContext(ProfileContext);

    const userType = userData.userType;
    
    const [basicInfoContent, setBasicInfoContent] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [pfpEditVisibility, setPfpEditVisibility] = useState(false);

    const [pfpUrl, setPfpUrl] = useState(userData.userPfpPreview);
    console.log("pfpUrl", userData.userPfpPreview)

    const pfpInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const handleFileChange = async (event, fileType) => {
        setIsUploading(true);
        const file = event.target.files[0];
        if (file) {
          if (fileType === 'pfp' && !file.type.startsWith('image/')) {
            // setPfpError('Please upload an image file.');
            return;
          }
          if (fileType === 'resume' && file.type !== 'application/pdf') {
            // setResumeError('Please upload a PDF file.');
            return;
          }
    
        //   setSelectedOptions(prevData => ({
        //     ...prevData,
        //     [fileType === 'pfp' ? 'userPfpPreview' : 'userResumePreview']: URL.createObjectURL(file),
        //     [fileType === 'pfp' ? 'userPfp' : 'userResume']: file
        //   }));
        
        const newUserPfp = await handleUserProfileUpdate(userData, file, currentUser);
        setPfpUrl(newUserPfp);
        setIsUploading(false);
    
          // if (fileType === 'pfp') setPfpError(null);
          // else setResumeError(null);
        }
      }
    
    const triggerFileInput = (inputRef) => {
    inputRef.current.click();
    }
    
    const removeFile = async (fileType) => {
        setPfpUrl(null);
        // Create a reference to the file to delete
        await deletePfp(userData, currentUser);

    }

    useEffect(()=>{
        setBasicInfoContent({userPreface: getBasicUserDescription(userData),
        userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${(userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest) : displayFieldsOfInterest(userData.areasOfInterest)}`,
        userSecondDesc: `${descType}: ${userType === "Professional" ? userData.industryPosition : userType === "Alumni" ? displayColleges([userData.collegeAttending]) : displayColleges([...userData.collegeInterestsOrDecision])}`,
        acceptedColleges: `Accepted Colleges: ${userData.acceptedColleges}`,
    })
    },[userData])

    return(
        <>
        {basicInfoModalVisibility && <BasicInfoModal onClose={()=>setBasicInfoModalVisibility(false)} visibility={basicInfoModalVisibility} userData={userData} userType={userType}/>}
        {basicInfoContent && <>
        <div className='basicInfo'>
            {/* <div>
                {userData.userPfpPreview ? <img src={userData.userPfpPreview} alt="" style={
                {width: "80px", height: "80px", borderRadius: "50%", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}/> : <img className="pfpImage" src="/assets/placeholder_pfp.png" alt="" style={
                    {width: "80px", height: "80px"}}/>}
            </div> */}
            <div className="file-upload-container" 
                onMouseEnter={() => setPfpEditVisibility(true)}
                onMouseLeave={() => setPfpEditVisibility(false)}
                style={{display: "flex", alignItems: "center"}}>
            <div className="file-upload-preview" style={{display: "flex", justifyContent: "center", width: "100%"}}>
                {pfpUrl ? (
                <div className="preview-container">
                    { isUploading ? <div className='btnCircle' style={{width: "60px", height: "60px", border: "2.5px solid var(--neutral)", boxShadow: "var(--shadowColor)"}}><div><Loading/></div></div> 
                    :
                     <img src={pfpUrl} alt="Profile Preview" className="file-preview" style={{width: "70px", height: "70px", borderRadius: "50%"}} />}
                    <div className="preview-actions" style={{top: "-15px", visibility: (!pfpEditVisibility || isUploading) ? "hidden" : ""}}>
                    <button onClick={() => triggerFileInput(pfpInputRef)} className="action-button">
                        <BiEdit size={20} />
                    </button>
                    <button onClick={() => removeFile('pfp')} className="action-button">
                        <BiTrash size={20} />
                    </button>
                    </div>
                </div>
                ) : (
                    <button 
                    className="btnCircle btnFileUpload"
                    style={{width: "70px", height: "70px"}}
                    onClick={() => triggerFileInput(pfpInputRef)}
                    >
                    {isUploading ? <Loading/> : <IoAdd size={50}/>}
                    </button>
                    )}
            </div>
            <input 
            type="file"
            ref={pfpInputRef}
            onChange={(e) => handleFileChange(e, 'pfp')}
            accept="image/*"
            style={{display: 'none'}}
            />
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
                {userData.acceptedColleges && userData.acceptedColleges.length > 0 && <span>{basicInfoContent.acceptedColleges}</span>}
            </div>
        </div>
        <div className='addOne' style={{transform: "translate(0,-70px)"}}>
                <EditInformation isAnswered={true} questionName={"Intro"} onEdit={()=>setBasicInfoModalVisibility(true)}/>
            </div>
        </>}
        </>
    )
}

function OpportunityPopup({opportunitiesOptions, opportunityData, opportunityModalVisibility, setOpportunityModalVisibility}){

    const { currentUser, userData } = useContext(ProfileContext);

    const [currentOpportunityData, setCurrentOpportunityData] = useState(opportunityData);

    // const [opportunityModalVisibility, setOpportunityModalVisibility] = useState(false);
    const [deleteWarningVisibility, setDeleteWarningVisibility] = useState(false);
    const [opportunityId, setOpportunityId] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing,setIsEditing] = useState(false);
    

    // useEffect(() => {
    //     setLoading(true);
    //     const unsubscribe = loadOpportunities(currentUser, setLoading, setOpportunityData);
    //     return () => unsubscribe();
    //   }, [currentUser]);

    
    useEffect(()=>{
        if(currentOpportunityData){
            setOpportunityId(currentOpportunityData.id);
        }
    },[currentOpportunityData]);

    const deleteOpportunity = (opportunityId) => {
        handleDeleteOpportunity(opportunityId);
        setCurrentOpportunityData(null);
    }

    console.log(currentOpportunityData)
    console.log(opportunityModalVisibility, "opportunity modal vis")

    return(
        <>
        <div name="deleteWarning">
            {deleteWarningVisibility && <DeleteWarningModal onCancel={()=>setDeleteWarningVisibility(false)} onVerify={() => deleteOpportunity(opportunityId)} visibility={deleteWarningVisibility}
                objectOfDeletation={currentOpportunityData.organizationType}/>}
        </div>
        <div name="opportunityModal" style={{position: "relative"}}>
            {userData.userType === "Professional" ? <OpportunityModal 
                onClose={()=>setOpportunityModalVisibility(false)}
                visibility={opportunityModalVisibility} 
                opportunityData={currentOpportunityData} 
                isEditing={isEditing} 
                opportunityId={opportunityId}/>
            
            : <InitiativeModal 
                onClose={()=>setOpportunityModalVisibility(false)} 
                visibility={opportunityModalVisibility}
                opportunityData={currentOpportunityData} 
                isEditing={isEditing} 
                opportunityId={opportunityId}/>}
        </div>
        <div style={{position: "relative"}}>
            { (currentOpportunityData && !loading) ? <>
            <div style={{textAlign: "center", marginBottom: "12px"}}>
            <span
            style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)"}}>
                {userData.userName.split(" ")[0]} is {userData.userType === "Professional" ? "offering" : "hosting"} {currentOpportunityData.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>{opportunityData.organizationType.toLowerCase()}{userData.userType === "Professional" && " opportunity"}!</span>
            </span>
            </div>
            <button className='btnCircle' onClick={()=>setDeleteWarningVisibility(true)} style={{position: "absolute", right: "-13px", top: "28px", background: "red", zIndex: "2"}}>
                <MdDeleteOutline size={30}/>
            </button>
            <OrganizationProfile location={"user_profile"} organizationData={currentOpportunityData}/>
            </> : loading ?
            <div>
                <Loading/>
            </div>
            :
            <div className="initiativeOrOpportunity" style={{backgroundColor: "#7ed5d770", borderRadius: "20px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px"}}>
                {userData.userType === "High Schooler" ? opportunitiesOptions.highSchool : userData.userType === "Alumni" ? opportunitiesOptions.alum : opportunitiesOptions.professional}
                <hr style={{width:"50%", borderColor: "var(--accent)"}}/>
                <div className="addOne" style={{color: "#006876"}} onClick={()=>setOpportunityModalVisibility(true)}>
                    <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add one!</span>
                </div>
            </div>}
            <div className='addOne' style={{position: "absolute", right: "0", top: "0", bottom: "0", marginTop: "auto", marginBottom: "auto"}}>
                <EditInformation isAnswered={currentOpportunityData} questionName={"Opportunity"} onEdit={()=>{
                    setOpportunityModalVisibility(true);
                    setIsEditing(true);
                    }}/>
            </div>
        </div>
        </>
    )
}

function AboutMeDisplay(){
    // editting functionality
    const { userData } = useContext(ProfileContext);
    const [aboutMe, setAboutMe] = useState("");

    useEffect(()=>{
        setAboutMe(userData.userAboutMe);
    },[userData])

    const [aboutMeModalVisibility, setAboutMeModalVisibility] = useState(false);
    const onModalClose = () => {
        setAboutMeModalVisibility(false);
    }
    return(
        <>
        <AboutMeModal visibility={aboutMeModalVisibility} onClose={onModalClose} userData={userData}/>
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

function ConnectionAvailability(){
    const [availabilityModalVisibility, setAvailabilityModalVisibility] = useState(false);
    const [availabilityData, setAvailabilityData] = useState(null);

    const { userData } = useContext(ProfileContext);

    useEffect(()=>{
        const storedAvailabilityData = userData.networkingLevel;
        if(!Array.isArray(storedAvailabilityData)){
            return;
        }
        if(storedAvailabilityData.length !== 0){
            setAvailabilityData(storedAvailabilityData);
            return;
        }
        setAvailabilityData(null);
    },[userData]);

    return(
        <>
            {availabilityModalVisibility && <AvailabilityModal visibility={availabilityModalVisibility} availabilityData={availabilityData} onClose={()=>setAvailabilityModalVisibility(false)} userData={userData}/>}
            <div>
                {!availabilityData && <span style={{fontWeight: "250", fontSize: "15px"}}>How are you open to assisting prospective students?</span>}
                {!availabilityData && <div className='addOne' onClick={()=>setAvailabilityModalVisibility(true)}>
                     <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add Your Availability</span>
                </div>}
                {availabilityData && <div style={{position: "relative", paddingTop: "10px", alignItems: "center"}}>
                    <div className='addOne' style={{position: "absolute", top: "0", bottom: "0", marginTop: "auto", marginBottom: "auto", right: "0"}}>
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