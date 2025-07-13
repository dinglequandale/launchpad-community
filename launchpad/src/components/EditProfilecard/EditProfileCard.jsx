import './editprofilecard.css';
import React, { createContext, useContext } from 'react';
import { useState, useEffect, useRef } from 'react';
import { IoAdd } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { deletePfp, displayColleges, displayFieldsOfInterest, displayShortenedLinkedin, editUserData, getBasicUserDescription, handleUserProfileUpdate, handleUserResumeUpdate, lowerAndCapitalize } from '../../services/userProfileServices';
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi';
import SkillModal from '../SkillsModal/SkillModal';
// import LinkedinModal from '../Profilemodals/LinkedInModal/LinkedinModal';
import ContactInfoModal from '../Profilemodals/ContactInfoModal/ContactInfoModal';
import { FaRegEdit } from 'react-icons/fa';
import AllConnectionsModal from '../AllConnectionsModal';
import { useModal } from '../../contexts/ModalContext';
import { FaUserFriends } from "react-icons/fa";

const ProfileContext = createContext({
    currentUser: null,
    userData: {},
  });

export default function EditProfileCard() {
    const navigate = useNavigate();
    const location = useLocation();
    const prevPath = location.state?.pathName;

    const [userData, setUserData] = useState(null);
    const [showConnectionsModal, setShowConnectionsModal] = useState(false);

    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const { openProfileModal } = useModal();
    
    const [opportunitiesData, setOpportunitiesData] = useState([]);
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
    const [opportunityModalVisibility, setOpportunityModalVisibility] = useState(false);

    const [incompleteOpportunitiesData, setIncompleteOpportunitiesData] = useState(null);

    const [edittingOpportunity, setEdittingOpportunity] = useState(null);

    useEffect(()=>{
        console.log(showConnectionsModal);
    },[showConnectionsModal]);

    useEffect(() => {
        setIncompleteOpportunitiesData(localStorage.getItem("savedOrganizationData") ?
        JSON.parse(localStorage.getItem("savedOrganizationData")) 
       : []);
    },[opportunityModalVisibility]);

    useEffect(() => {
        let unsubscribe;
        setLoading(true);

        if (currentUser) {
            const userDocRef = doc(db, 'tenants', localStorage.getItem("schoolId"), 'users', currentUser.uid);
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

    const deleteOpportunity = async (opportunityId) => {
        setOpportunitiesData(opportunitiesData.filter((opportunity) => (opportunity.id !== opportunityId)));
        await handleDeleteOpportunity(opportunityId);
    }

    const deleteIncompleteOpportunity = (opportunityId) => {
        localStorage.setItem("savedOrganizationData", JSON.stringify(incompleteOpportunitiesData.filter(opportunity => opportunity.id !== opportunityId)));
        setIncompleteOpportunitiesData(incompleteOpportunitiesData.filter(opportunity => opportunity.id !== opportunityId));

    }

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
            case "Staff":
                return "Role at School";
            default:
                return "";
        }
    }

    // Handler to open profile modal from connections modal
    const handleViewProfile = (user) => {
        openProfileModal({ userData: user });
    };

    return(
        <>
        {/* Connections Modal */}
        {showConnectionsModal && (
            <AllConnectionsModal
                onClose={() => setShowConnectionsModal(false)}
                onViewProfile={handleViewProfile}
            />
        )}
        <div name="opportunityModal" style={{position: "relative"}}>
            {userData && userData.userType === "Professional" ? (
                <OpportunityModal 
                    onClose={()=>setOpportunityModalVisibility(false)}
                    visibility={opportunityModalVisibility} 
                    opportunityData={edittingOpportunity} 
                    isEditing={edittingOpportunity !== null} 
                    opportunityId={edittingOpportunity ? edittingOpportunity.id : ""}/>
            ) : userData && userData.userType !== "Staff" ? (
                <InitiativeModal 
                    onClose={()=>setOpportunityModalVisibility(false)} 
                    visibility={opportunityModalVisibility}
                    opportunityData={edittingOpportunity} 
                    isEditing={edittingOpportunity !== null} 
                    opportunityId={edittingOpportunity ? edittingOpportunity.id : ""}/>
            ) : null}
        </div>
            <ProfileContext.Provider value={{currentUser, userData}}>
            <div className='editprofileCard'>
                <div style={{position: "relative"}}>
                {/* Elegant See My Connections button */}
                <div className='return' 
                        style={{position: "absolute", display: "flex", gap: "5px", alignItems: "center", paddingBottom: "5px", cursor: "pointer", fontWeight: "bolder"}}
                        onClick={() => {prevPath ? navigate(prevPath) : navigate("/Home")}}>
                        <RiArrowGoBackFill size={25}/>
                        <span style={{fontSize: "17px"}}>Go Back</span>
                    </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px'}}>
                    <button
                        className="see-connections-btn"
                        onClick={() => setShowConnectionsModal(true)}
                    >
                        <FaUserFriends style={{marginRight: 8, fontSize: 20, verticalAlign: 'middle'}} />
                        My Connections
                    </button>
                </div>
                {(!loading && userData) ? <>
                <div style={{ marginTop: "15px", borderBottomStyle: "solid", borderColor: "#C0C0C0", borderWidth: "1.7px", paddingBottom: "5px"}}>
                    <BasicInfoCard descType={descType()}/>
                </div>
                <div style={{marginBottom: "15px"}}><ContactInformation/></div>
                <hr style={{width:"100%"}}/>
                
                <div>
                    {userData.userType !== "Staff" && (
                        <>
                        {incompleteOpportunitiesData && incompleteOpportunitiesData.length > 0 && (
                            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                                {incompleteOpportunitiesData.map((opportunityData, index)=>(
                                    <OpportunityPopup 
                                        opportunityData={opportunityData} 
                                        isPublished={false}
                                        key={index}
                                        opportunitiesOptions={opportunitiesOptions} 
                                        setOpportunityModalVisibility={setOpportunityModalVisibility}
                                        setEdittingOpportunity={setEdittingOpportunity}
                                        deleteOpportunity={deleteIncompleteOpportunity}
                                    />
                                ))}
                            </div> )}
                        {(!opportunitiesLoading && opportunitiesData.length > 0) ? 
                            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                                {opportunitiesData.map((opportunityData, index)=>(
                                    <OpportunityPopup 
                                        opportunityData={opportunityData} 
                                        key={index}
                                        opportunitiesOptions={opportunitiesOptions} 
                                        setOpportunityModalVisibility={setOpportunityModalVisibility}
                                        setEdittingOpportunity={setEdittingOpportunity}
                                        deleteOpportunity={deleteOpportunity}
                                    />
                                ))}
                            </div>
                        : (opportunitiesLoading) ? 
                            <div style={{marginTop: "40px"}}><Loading/></div>
                        :
                            <div style={{marginTop: "20px"}}>
                                <OpportunityPopup opportunityData={null}  opportunitiesOptions={opportunitiesOptions} 
                                setOpportunityModalVisibility={setOpportunityModalVisibility}/>
                            </div>
                        }
                        </>
                    )}
                </div>
                {userData.userType !== "Staff" && (!opportunitiesLoading && opportunitiesData.length > 0) && <div className="addOne" onClick={()=>{
                    setEdittingOpportunity(null);
                    setOpportunityModalVisibility(true);
                }}>
                    <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add another {userData.userType === "Professional" ? "opportunity" : "initiative"}!</span>
                </div>}
                <AboutMeDisplay/>
                {(userData && userData.userType !== "Professional" && userData.userType !== "Staff") && <div name="skills" style={{marginTop: "20px"}}>
                    <span style={{fontSize: "20px", fontWeight: "bolder", paddingTop: "15px", paddingBottom: "10px"}}>{userData.userName.split(" ")[0]}'s Skills </span>
                    <SkillBase/>
                </div>}
                <div className={`userResume ${userData.userType === "High Schooler" ? "no_border" : ""}`} style={{paddingBottom: "20px", marginTop: "10px"}}>
                    <ResumeUpload/>
                </div>
                {(userData.userType === "Professional" || userData.userType === "Alumni") && <hr style={{width: "100%"}}/>}
                {(userData.userType === "Professional") && <div className='networkingCommitment' style={{textAlign: "center", paddingTop: "10px"}}>
                    <ConnectionAvailability/>
                </div>}
                </>
                :
                <Loading/>}
            </div>
            </div>
            </ProfileContext.Provider>
        </>
    );
}

function EditInformation({onEdit, isAnswered, isOpportunity=false}){
    return(
        <>
        {isAnswered && <div style={{position: "absolute", display: "flex", 
        justifyContent: "center", alignItems: "center", right: "10px", top: "0", 
        background: isOpportunity ? "var(--secondaryHighlight)" : "", 
        borderRadius: isOpportunity ? "50%" : "",
        padding: isOpportunity ? "8px" : "",
        }}
            onClick={onEdit}>
            <FaRegEdit size={25}/>
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
                    <div className='addOne' style={{position: "absolute", right: "0", top: "0"}}>
                        <EditInformation isAnswered={true} questionName={"Skills"} onEdit={()=>setSkillModalVisibility(true)}/>
                    </div>
                </div>
            )
            : <div className="addOne" onClick={()=>setSkillModalVisibility(true)}>
                <IoAdd size={25} />
                <span style={{textDecoration: "underline"}}>Add your skills!</span>
            </div>}
        </>
    )
}

function ContactInformation(){
    const { userData, currentUser } = useContext(ProfileContext);

    const [contactModalVisibility, setContactModalVisibility] = useState(false);

    return(
        <>
        <div style={{marginTop: "10px", position: "relative"}}>
        <div className='addOne' style={{position: "absolute", right: "0",bottom: "0", top: "0"}}>
            <EditInformation isAnswered={userData.email} questionName={"Email"} onEdit={()=>setContactModalVisibility(true)}/>
        </div>
        <span style={{fontSize: "20px", fontWeight: "bolder"}}>Contact Information</span><br />
        <span style={{color: "#5a696e", fontWeight: "300", fontSize: "15px"}}>
            {userData.userType === "Staff" ? "Add your school email and LinkedIn so students and colleagues can reach you." : "Add an email or LinkedIn where students, alumni, and professionals can reach you. Link your LinkedIn so others can easily learn more about you."}
        </span>
        </div>
        {contactModalVisibility && <ContactInfoModal userData={userData} visibility={contactModalVisibility} onClose={() => setContactModalVisibility(false)}/>} 
        <div>
            <div className='emailSection' style={{marginTop: "10px"}}>
                <div>
                <span style={{fontWeight: "550"}}>
                    {userData.userType === "Staff" ? "School Email: " : "Email: "}
                    {userData.userType === "Staff" && !userData.personalEmail && <span style={{color: "red", fontWeight: "lighter"}}>No Personal Email provided</span>}
                    {userData.userType === "Staff" && userData.personalEmail && <span style={{color: "var(--secondary)"}}>{userData.personalEmail}</span>}
                    {userData.userType !== "Staff" && !userData.email && <span style={{color: "red", fontWeight: "lighter"}}>No Email provided</span>}
                    {userData.userType !== "Staff" && userData.email && <span style={{color: "var(--secondary)"}}>{userData.email}</span>}
                </span>
                </div>
                {userData.userType === "Staff" && !userData.personalEmail &&
                    <div className='emailUpload'>
                        <div className="addOne" onClick={()=>setContactModalVisibility(true)}>
                        <IoAdd size={25} />
                        <span style={{textDecoration: "underline"}}>Add your Personal Email</span>
                    </div>
                    </div>}
                {userData.userType !== "Staff" && !userData.email &&
                    <div className='emailUpload'>
                        <div className="addOne" onClick={()=>setContactModalVisibility(true)}>
                        <IoAdd size={25} />
                        <span style={{textDecoration: "underline"}}>Add your Email</span>
                    </div>
                    </div>}
            </div>
            <div className='linkedInSection' style={{marginTop: "10px"}}>
                <div style={{overflow: "hidden"}}>
                <span style={{fontWeight: "550"}}>Linkedin Profile: {!userData.linkedinLink && <span style={{color: "red", fontWeight: "lighter"}}>No Linkedin provided</span>}
                {userData.linkedinLink && <Link onClick={() => window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer')}>{displayShortenedLinkedin(userData.linkedinLink)}</Link>}
                </span>
                </div>
                {!userData.linkedinLink &&
                <div className='linkedInUpload'>
                    <div className="addOne" onClick={()=>setContactModalVisibility(true)}>
                    <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add your LinkedIn</span>
                </div>
                </div>}
                
            </div>
        </div>
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
        <div style={{display: "flex", justifyContent: "space-between", position: "relative"}} id="Resume">
            <div style={{position: "relative", display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "15px", paddingBottom: "10px"}}>
                <span style={{fontSize: "20px", fontWeight: "bolder"}}>{userData.userName.split(" ")[0]}'s Resume </span>
                <div className='addOne' style={{marginBottom: "20px", marginLeft: "40px"}}>
                    <EditInformation isAnswered={pdfUrl} questionName={"LinkedIn"} onEdit={handleUploadClick}/>
                </div>
            </div>
            
            <div style={{position: "absolute", right: "0", top: "17px"}}>
                <PublicPrivateDropdown/>
            </div>
        </div>
        {!pdfUrl && <span style={{fontWeight: "250", fontSize: "15px"}}>{userData.userType !== "Professional" ? "Showcase your experiences to make a good first impression." : "Add your resume so others can understand your experiences in depth."}</span>} 
        <div className="pdf-viewer-container" style={{paddingTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative"}}>
            {pdfUrl ? 
            <>
            <iframe src={pdfUrl} frameborder="0" style={{width: "100%", height: "500px"}}></iframe>
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
    // console.log("pfpUrl", userData.userPfpPreview)

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
        let userFirstDesc, userSecondDesc, sponsoredClubs;
        if (userType === "Staff") {
            userFirstDesc = {desc1: "Fields of Interest", desc2: (userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest, "longer") : ""};
            userSecondDesc = {desc1: "Role at School", desc2: userData.schoolRole || ""};
            sponsoredClubs = {desc1: "Sponsored Clubs", desc2: userData.sponsoredClubs}
        } else {
            userFirstDesc = {desc1: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}`, desc2: (userData.areasOfInterest && userData.areasOfInterest.length > 0) ? displayFieldsOfInterest(userData.areasOfInterest, "longer") : ""};
            userSecondDesc = {desc1: `${descType}`, desc2: `${userType === "Professional" ? userData.industryPosition : userType === "Alumni" ? displayColleges([userData.collegeAttending]) : Array.isArray(userData.collegeInterestsOrDecision) ? displayColleges([...userData.collegeInterestsOrDecision]) : displayColleges([userData.collegeInterestsOrDecision])}`};
        }
        setBasicInfoContent({
            userPreface: getBasicUserDescription(userData, false),
            userFirstDesc,
            userSecondDesc,
            acceptedColleges: {desc1: `Accepted Colleges`, desc2: `${userData.acceptedColleges}`},
        });
    },[userData])

    return(
        <>
        {basicInfoModalVisibility && <BasicInfoModal onClose={()=>setBasicInfoModalVisibility(false)} visibility={basicInfoModalVisibility} userData={userData} userType={userType}/>}
        {basicInfoContent && <>
        <div className='basicInfo' style={{position: "relative"}}>
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
                    { isUploading ? <div className='btnCircle btnFileUpload' style={{width: "70px", height: "70px"}}><div><Loading/></div></div> 
                    :
                     <img src={pfpUrl} alt="Profile Preview" className="file-preview" style={{width: "70px", height: "70px", borderRadius: "50%", border: "2px solid var(--dark)"}} />}
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
            <div className='addOne' style={{position: "absolute", right: "0",bottom: "0", top: "0"}}>
                <EditInformation isAnswered={true} questionName={"Intro"} onEdit={()=>setBasicInfoModalVisibility(true)}/>
            </div>
            </div>
            <div style={{display: "flex"}}>
            <div className='userInfo' style={{fontSize: "16px"}}>
                <span><span style={{fontWeight: "500"}}>{basicInfoContent.userFirstDesc.desc1}</span>: {basicInfoContent.userFirstDesc.desc2}</span>
                <span><span style={{fontWeight: "500"}}>{basicInfoContent.userSecondDesc.desc1}</span>: {basicInfoContent.userSecondDesc.desc2}</span>
                {userData.acceptedColleges && userData.acceptedColleges.length > 0 && <><span><span style={{fontWeight: "bolder"}}>{basicInfoContent.acceptedColleges.desc1}</span>: {basicInfoContent.acceptedColleges.desc2}</span></>}
                {userData.sponsoredClubs && <><span><span style={{fontWeight: "bolder"}}>{basicInfoContent.sponsoredClubs.desc1}</span>: {basicInfoContent.sponsoredClubs.desc2}</span></>}
            </div>
            
        </div>
        </>}
        </>
    )
}

function OpportunityPopup({opportunitiesOptions, opportunityData, setOpportunityModalVisibility, deleteOpportunity, setEdittingOpportunity, isPublished=true}){

    const { currentUser, userData } = useContext(ProfileContext);

    // const [currentOpportunityData, setCurrentOpportunityData] = useState(opportunityData);
    const [deleteWarningVisibility, setDeleteWarningVisibility] = useState(false);

    const [opportunityEditVisibility, setOpportunityEditVisibility] = useState(false);

    // TODO: Diagnose...
    const opportunityId = opportunityData ? opportunityData.id : "";
    const [loading, setLoading] = useState(false);
    const [isEditing,setIsEditing] = useState(false);
    
    const [isHovered, setIsHovered] = useState(false);

    const getOpportunityOptions = () => {
        if (userData.userType === "High Schooler") return opportunitiesOptions.highSchool;
        if (userData.userType === "Alumni") return opportunitiesOptions.alum;
        return opportunitiesOptions.professional;
    };


    return(
        <>
        <div name="deleteWarning">
            {deleteWarningVisibility && <DeleteWarningModal onCancel={()=>setDeleteWarningVisibility(false)} onVerify={() => deleteOpportunity(opportunityId)} visibility={deleteWarningVisibility}
                objectOfDeletation={opportunityData.organizationType}/>}
        </div>
        <div>
            { (opportunityData && !loading) ? <>
            {isPublished && <div style={{ textAlign: "center", marginBottom: "12px"}}>
            <span
            style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)"}}>
                {userData.userName.split(" ")[0]} is {userData.userType === "Professional" ? "offering" : "hosting"} {opportunityData.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>{opportunityData.organizationType.toLowerCase()}{userData.userType === "Professional" && " opportunity"}!</span>
            </span>
            </div>}
            <div 
                onMouseEnter={() => setOpportunityEditVisibility(true)}
                onMouseLeave={() => setOpportunityEditVisibility(false)}
                style={{position: "relative"}}>
                <OrganizationProfile location={"user_profile"} organizationData={opportunityData} isPublished={isPublished}/>
                
                {opportunityEditVisibility && <>
                <button className='btnCircle' onClick={()=>setDeleteWarningVisibility(true)} style={{position: "absolute", right: "70px", top: "-17px", background: "red", zIndex: "2"}}>
                    <MdDeleteOutline size={28}/>
                </button>
                <div className='addOne' style={{position: "absolute", right: "0", top: "-17px"}}>
                    <EditInformation isAnswered={opportunityData} isOpportunity={true} onEdit={()=>{
                        setEdittingOpportunity(opportunityData);
                        setOpportunityModalVisibility(true);
                        setIsEditing(true);
                        }}/>
                </div>
                </>}
            </div>
            </> : loading ?
            <div>
                <Loading/>
            </div>
            :
            <div 
            className={`initiative-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {getOpportunityOptions()}
            
            <hr className="divider" style={{width: "45%", marginTop: "6px",marginBottom: "6px"}}/>
            
            <div 
              className={`add-button ${isHovered ? 'subtle-hover' : ''}`}
              onClick={() => setOpportunityModalVisibility(true)}
            >
              <IoAdd size={25} />
              <span className="underline">Add one!</span>
            </div>
            </div>}
            
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
        <div className="aboutMe" style={{paddingTop: "20px", position: "relative"}}>
            <div style={{position: "absolute", top: "20px", right: "0"}} className='addOne'>
                    <EditInformation questionName={"About Me"} onEdit={()=>setAboutMeModalVisibility(true)} isAnswered={aboutMe}/>
            </div>
            <span style={{fontSize: "20px", fontWeight: "bolder"}}>About Me</span> <br />

            {!aboutMe && <span style={{fontWeight: "250", fontSize: "15px"}}>Share a little about yourself. Why and with whom do you want to connect?</span>}
            <div className="addOne" id="About Me" onClick={()=>{setAboutMeModalVisibility(true)}}>
                
                {!aboutMe && <>
                <IoAdd size={25} />
                <span style={{textDecoration: "underline"}}>Add an About Me Description</span>
                </>}
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
            <div style={{position: "relative"}}>
            <h style={{color: "var(--secondary)", fontSize: "30px", fontWeight: "300"}}><span style={{borderBottomStyle: "solid"}}>{userData.userName.split(" ")[0]}</span> is <span style={{fontWeight: "450"}}>open to</span>  </h>
                <div className='addOne' style={{position: "absolute", top: "10px", right: "0"}}>
                    <EditInformation isAnswered={true} questionName={"Availability"} onEdit={()=>setAvailabilityModalVisibility(true)}/>
                </div>
                {!availabilityData && <span style={{fontWeight: "250", fontSize: "15px"}}>How are you open to assisting prospective students?</span>}
                {!availabilityData && <div className='addOne' onClick={()=>setAvailabilityModalVisibility(true)}>
                     <IoAdd size={25} />
                    <span style={{textDecoration: "underline"}}>Add Your Availability</span>
                </div>}
                {availabilityData && <div style={{paddingTop: "10px", alignItems: "center"}}>
                    
                    <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "30px"}}>
                        {availabilityData.map((availability)=>(
                            <div key={availability} style={{background: "var(--neutral)", padding: "6px 11px", borderRadius: "5px"}}>
                                <span style={{lineHeight: "1.5", fontSize: "22px", color: "var(--secondary)"}}>{availability}</span>
                            </div>
                        ))}
                    </div>
                </div>}
            </div>
        </>
    )
}