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

export default function EditProfileCard({ isSidebarCollapsed }) {
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
    const [basicInfoModalVisibility, setBasicInfoModalVisibility] = useState(false);
    const [contactModalVisibility, setContactModalVisibility] = useState(false);
    const [aboutMeModalVisibility, setAboutMeModalVisibility] = useState(false);
    const [skillModalVisibility, setSkillModalVisibility] = useState(false);
    const [availabilityModalVisibility, setAvailabilityModalVisibility] = useState(false);

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

    const opportunitiesOptions = {
        highSchool: "Do you currently lead a school club or an out-of-school student initiative, such as a nonprofit?",
        alum: "Do you currently lead an out-of-school student initiative, such as a nonprofit?",
        professional: "Do you currently have an available workplace opportunity at your organization for high school or college students?"
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
        
        {/* All Modals rendered at root level to avoid stacking context issues */}
        {basicInfoModalVisibility && <BasicInfoModal onClose={()=>setBasicInfoModalVisibility(false)} visibility={basicInfoModalVisibility} userData={userData} userType={userData?.userType}/>}
        {contactModalVisibility && <ContactInfoModal onClose={()=>setContactModalVisibility(false)} visibility={contactModalVisibility} userData={userData}/>}
        {aboutMeModalVisibility && <AboutMeModal onClose={()=>setAboutMeModalVisibility(false)} visibility={aboutMeModalVisibility} userData={userData}/>}
        {skillModalVisibility && <SkillModal onClose={()=>setSkillModalVisibility(false)} visibility={skillModalVisibility} userData={userData}/>}
        {availabilityModalVisibility && <AvailabilityModal onClose={()=>setAvailabilityModalVisibility(false)} visibility={availabilityModalVisibility} userData={userData}/>}
        
        <div className={`complete-profile-container ${isSidebarCollapsed ? 'complete-profile-container-sidebar-collapsed' : 'complete-profile-container-sidebar-expanded'}`}>
            <ProfileContext.Provider value={{currentUser, userData}}>
            <div className="v0-profile-container">
                {/* Header */}
                <div className="v0-profile-header">
                    <button 
                        className="v0-back-btn"
                        onClick={() => {prevPath ? navigate(prevPath) : navigate("/Home")}}
                    >
                        <RiArrowGoBackFill size={20} />
                        <span>Go Back</span>
                    </button>
                    <h1 className="v0-profile-title">My Profile</h1>
                    <button
                        className="v0-connections-btn"
                        onClick={() => setShowConnectionsModal(true)}
                    >
                        <FaUserFriends size={16} />
                        <span>My Connections</span>
                    </button>
                </div>

                {(!loading && userData) ? (
                    <div className="v0-profile-content">
                        {/* Basic Information Section */}
                        <div className="v0-profile-section">
                            <div className="v0-section-header">
                                <h3 className="v0-section-title">Basic Information</h3>
                                <button className="v0-edit-btn" onClick={() => setBasicInfoModalVisibility(true)}>
                                    <FaRegEdit size={16} />
                                </button>
                            </div>
                            <div className="v0-section-content">
                                <BasicInfoCard descType={descType()} basicInfoModalVisibility={basicInfoModalVisibility} setBasicInfoModalVisibility={setBasicInfoModalVisibility}/>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="v0-profile-section">
                            <div className="v0-section-header">
                                <h3 className="v0-section-title">Contact Information</h3>
                                <button className="v0-edit-btn" onClick={() => setContactModalVisibility(true)}>
                                    <FaRegEdit size={16} />
                                </button>
                            </div>
                            <div className="v0-section-content">
                                <ContactInformation 
                                    contactModalVisibility={contactModalVisibility}
                                    setContactModalVisibility={setContactModalVisibility}
                                />
                            </div>
                        </div>

                        {/* Opportunities/Initiatives Section */}
                        {userData.userType !== "Staff" && (
                            <div className="v0-profile-section">
                                <div className="v0-section-header">
                                    <h3 className="v0-section-title">
                                        {userData.userType === "Professional" ? "Workplace Opportunities" : "Student Initiatives"}
                                    </h3>
                                    <button 
                                        className="v0-add-btn"
                                        onClick={() => {
                                            setEdittingOpportunity(null);
                                            setOpportunityModalVisibility(true);
                                        }}
                                    >
                                        <IoAdd size={16} />
                                        <span>Add</span>
                                    </button>
                                </div>
                                <div className="v0-section-content">
                                    {incompleteOpportunitiesData && incompleteOpportunitiesData.length > 0 && (
                                        <div className="v0-opportunities-list">
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
                                        </div>
                                    )}
                                    {(!opportunitiesLoading && opportunitiesData.length > 0) ? (
                                        <div className="v0-opportunities-list">
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
                                    ) : opportunitiesLoading ? (
                                        <div className="v0-loading-container">
                                            <Loading/>
                                        </div>
                                    ) : (
                                        <div className="v0-empty-state">
                                            <OpportunityPopup 
                                                opportunityData={null}  
                                                opportunitiesOptions={opportunitiesOptions} 
                                                setOpportunityModalVisibility={setOpportunityModalVisibility}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About Me Section */}
                        <div className="v0-profile-section">
                            <div className="v0-section-header">
                                <h3 className="v0-section-title">About Me</h3>
                                <button className="v0-edit-btn" onClick={() => setAboutMeModalVisibility(true)}>
                                    <FaRegEdit size={16} />
                                </button>
                            </div>
                            <div className="v0-section-content">
                                <AboutMeDisplay 
                                    aboutMeModalVisibility={aboutMeModalVisibility}
                                    setAboutMeModalVisibility={setAboutMeModalVisibility}
                                />
                            </div>
                        </div>

                        {/* Skills Section */}
                        {(userData && userData.userType !== "Professional" && userData.userType !== "Staff") && (
                            <div className="v0-profile-section">
                                <div className="v0-section-header">
                                    <h3 className="v0-section-title">{userData.userName.split(" ")[0]}'s Skills</h3>
                                    <button className="v0-edit-btn" onClick={() => setSkillModalVisibility(true)}>
                                        <FaRegEdit size={16} />
                                    </button>
                                </div>
                                <div className="v0-section-content">
                                    <SkillBase 
                                        skillModalVisibility={skillModalVisibility}
                                        setSkillModalVisibility={setSkillModalVisibility}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Resume Section */}
                        <div className="v0-profile-section">
                            <div className="v0-section-header">
                                <h3 className="v0-section-title">{userData.userName.split(" ")[0]}'s Resume</h3>
                                <div className="v0-resume-controls">
                                    <PublicPrivateDropdown/>
                                </div>
                            </div>
                            <div className="v0-section-content">
                                <ResumeUpload/>
                            </div>
                        </div>

                        {/* Networking Availability Section */}
                        {(userData.userType === "Professional") && (
                            <div className="v0-profile-section">
                                <div className="v0-section-header">
                                    <h3 className="v0-section-title">Networking Availability</h3>
                                    <button className="v0-edit-btn" onClick={() => setAvailabilityModalVisibility(true)}>
                                        <FaRegEdit size={16} />
                                    </button>
                                </div>
                                <div className="v0-section-content">
                                    <ConnectionAvailability 
                                        availabilityModalVisibility={availabilityModalVisibility}
                                        setAvailabilityModalVisibility={setAvailabilityModalVisibility}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="v0-loading-container">
                        <Loading/>
                    </div>
                )}
            </div>
            </ProfileContext.Provider>
            </div>
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

function DreamUniversitiesPrivacyToggle() {
    const { userData, currentUser } = useContext(ProfileContext);
    const [isPrivate, setIsPrivate] = useState(userData.dreamUniversitiesPrivate || false);

    const handleToggle = async () => {
        const newPrivacy = !isPrivate;
        setIsPrivate(newPrivacy);
        try {
            await editUserData({ dreamUniversitiesPrivate: newPrivacy }, currentUser, userData);
        } catch (error) {
            console.error('Error updating dream universities privacy:', error);
            // Revert on error
            setIsPrivate(!newPrivacy);
        }
    };

    return (
        <div className="v0-dream-universities-privacy">
            <div className="v0-privacy-toggle-container">
                <label className="v0-toggle-label">
                    <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={handleToggle}
                        className="v0-privacy-checkbox"
                    />
                    <span className="v0-toggle-text">Keep dream universities private</span>
                </label>
                <p className="v0-privacy-description">
                    Inputting this information allows you to match up with alumni studying at your dream schools
                </p>
            </div>
        </div>
    );
}


function SkillBase({ skillModalVisibility, setSkillModalVisibility }) {
    const { userData } = useContext(ProfileContext);
    const userSkills = userData.userSkills;

    return(
        <>
            {(userSkills && (userSkills.length > 0)) ? (
                <div className="v0-skills-container">
                    {Object.entries(
                        userSkills.reduce((acc, skill) => {
                            if (!acc[skill.skillCategory]) {
                                acc[skill.skillCategory] = [];
                            }
                            acc[skill.skillCategory].push(skill.skillDescription);
                            return acc;
                        }, {})
                    ).map(([category, skills]) => (
                        <div key={category} className="v0-skill-category">
                            <h4 className="v0-skill-category-title">{category}</h4>
                            <div className="v0-skill-tags">
                                {skills.map((skill, index) => (
                                    <span key={index} className="v0-skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="v0-empty-state">
                    <button className="v0-add-btn" onClick={() => setSkillModalVisibility(true)}>
                        <IoAdd size={16} />
                        <span>Add your skills!</span>
                    </button>
                </div>
            )}
        </>
    )
}

function ContactInformation({ contactModalVisibility, setContactModalVisibility }){
    const { userData, currentUser } = useContext(ProfileContext);

    return(
        <>
        <div className="v0-contact-content">
            <div className="v0-contact-item">
                <div className="v0-contact-label">
                    {userData.userType === "Staff" ? "School Email:" : "Email:"}
                </div>
                <div className="v0-contact-value">
                    {userData.userType === "Staff" && !userData.personalEmail && (
                        <span className="v0-contact-missing">No Personal Email provided</span>
                    )}
                    {userData.userType === "Staff" && userData.personalEmail && (
                        <span className="v0-contact-email">{userData.personalEmail}</span>
                    )}
                    {userData.userType !== "Staff" && !userData.email && (
                        <span className="v0-contact-missing">No Email provided</span>
                    )}
                    {userData.userType !== "Staff" && userData.email && (
                        <span className="v0-contact-email">{userData.email}</span>
                    )}
                </div>
                {(userData.userType === "Staff" && !userData.personalEmail) || (userData.userType !== "Staff" && !userData.email) ? (
                    <button className="v0-add-btn" onClick={() => setContactModalVisibility(true)}>
                        <IoAdd size={16} />
                        <span>Add Email</span>
                    </button>
                ) : null}
            </div>
            
            <div className="v0-contact-item">
                <div className="v0-contact-label">LinkedIn Profile:</div>
                <div className="v0-contact-value">
                    {!userData.linkedinLink ? (
                        <span className="v0-contact-missing">No LinkedIn provided</span>
                    ) : (
                        <Link 
                            className="v0-contact-link"
                            onClick={() => window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer')}
                        >
                            {displayShortenedLinkedin(userData.linkedinLink)}
                        </Link>
                    )}
                </div>
                {!userData.linkedinLink && (
                    <button className="v0-add-btn" onClick={() => setContactModalVisibility(true)}>
                        <IoAdd size={16} />
                        <span>Add LinkedIn</span>
                    </button>
                )}
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
        if (file && file.type === 'application/pdf') {
            const userResumePreview = await handleUserResumeUpdate(userData, file, currentUser, currentPrivacy);
            setPdfUrl(userResumePreview);
        } else {
            alert('Please upload a PDF file only.');
        }
    }

    const handleDeleteResume = async () => {
        if (window.confirm('Are you sure you want to delete your resume?')) {
            try {
                // Set resume to null in user data
                const newData = { userResumePreview: null };
                await editUserData(newData, currentUser, userData);
                setPdfUrl(null);
            } catch (error) {
                console.error('Error deleting resume:', error);
                alert('Failed to delete resume. Please try again.');
            }
        }
    }
  
    return (
        <>
            {!pdfUrl ? (
                <div className="v0-empty-state">
                    <p className="v0-empty-text">
                        {userData.userType !== "Professional" 
                            ? "Showcase your experiences to make a good first impression." 
                            : "Add your resume so others can understand your experiences in depth."
                        }
                    </p>
                    <button onClick={handleUploadClick} className="v0-add-btn" style={{margin: "0 auto"}}>
                        <IoAdd size={16} />
                        <span>Upload Your Resume</span>
                    </button>
                </div>
            ) : (
                <div className="v0-resume-container">
                    <div className="v0-resume-header">
                        <button className="v0-edit-btn" onClick={handleUploadClick} title="Change resume">
                            <FaRegEdit size={16} />
                        </button>
                        <button className="v0-delete-btn" onClick={handleDeleteResume} title="Delete resume">
                            <BiTrash size={16} />
                        </button>
                    </div>
                    <div className="v0-resume-viewer">
                        <iframe 
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
                            frameBorder="0" 
                            className="v0-resume-iframe"
                            title="Resume Preview"
                        />
                    </div>
                </div>
            )}
            <input type="file" accept=".pdf" onChange={onFileChange} style={{ display: 'none' }} ref={inputRef} />
        </>
    );
}

function BasicInfoCard({descType, basicInfoModalVisibility, setBasicInfoModalVisibility}){
    // const [basicInfoData, setBasicInfoData] = useState({});
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
            userSecondDesc = {desc1: `${descType}`, desc2: `${userType === "Professional" ? userData.industryPosition : userType === "Alumni" ? (userData.collegeAttending ? displayColleges([userData.collegeAttending]) : "Not specified") : Array.isArray(userData.collegeInterestsOrDecision) ? (userData.collegeInterestsOrDecision && userData.collegeInterestsOrDecision.length > 0 ? displayColleges([...userData.collegeInterestsOrDecision]) : "Not specified") : (userData.collegeInterestsOrDecision ? displayColleges([userData.collegeInterestsOrDecision]) : "Not specified")}`};
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
            {/* <div className='addOne' style={{position: "absolute", right: "0",bottom: "0", top: "0"}}>
                <EditInformation isAnswered={true} questionName={"Intro"} onEdit={()=>setBasicInfoModalVisibility(true)}/>
            </div> */}
            </div>
            <div style={{display: "flex"}}>
            <div className='userInfo' style={{fontSize: "16px"}}>
                <span><span style={{fontWeight: "500"}}>{basicInfoContent.userFirstDesc.desc1}</span>: {basicInfoContent.userFirstDesc.desc2}</span>
                <div className="v0-college-info-container">
                    <span><span style={{fontWeight: "500"}}>{basicInfoContent.userSecondDesc.desc1}</span>: {basicInfoContent.userSecondDesc.desc2}</span>
                    {userData.userType === "High Schooler" && userData.collegeDecision === "No" && (
                        <DreamUniversitiesPrivacyToggle />
                    )}
                </div>
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
        <div style={{width: "100%"}}>
            { (opportunityData && !loading) ? <>
            {isPublished && <div style={{ textAlign: "center", marginBottom: "12px"}}>
            <span
            style={{fontWeight: "300", fontSize: "22px", color: "var(--secondary)"}}>
                {userData.userName.split(" ")[0]} is {userData.userType === "Professional" ? "offering" : "hosting"} {opportunityData.organizationType === "Internship" ? "an" : "a"} <span style={{fontWeight: "bold"}}>{opportunityData.organizationType.toLowerCase()}{userData.userType === "Professional" && " opportunity"}!</span>
            </span>
            </div>}
            <div 
                className="edit-profile-opportunity-card"
                onMouseEnter={() => setOpportunityEditVisibility(true)}
                onMouseLeave={() => setOpportunityEditVisibility(false)}
                style={{position: "relative"}}>
                <OrganizationProfile location={"user_profile"} organizationData={opportunityData} isPublished={isPublished} hideHeartButton={true}/>
                
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
        //     <div 
        //     className={`initiative-container ${isHovered ? 'hovered' : ''}`}
        //     onMouseEnter={() => setIsHovered(true)}
        //     onMouseLeave={() => setIsHovered(false)}
        //   >
        //     {getOpportunityOptions()}
            
        //     <hr className="divider" style={{width: "45%", marginTop: "6px",marginBottom: "6px"}}/>
            
        //     <div 
        //       className={`add-button ${isHovered ? 'subtle-hover' : ''}`}
        //       onClick={() => setOpportunityModalVisibility(true)}
        //     >
        //       <IoAdd size={25} />
        //       <span className="underline">Add one!</span>
        //     </div>
        //     </div>}
        <div className="v0-empty-state">
            <p className="v0-empty-text">{getOpportunityOptions()}</p>
            <button className="v0-add-btn" onClick={() => setOpportunityModalVisibility(true)}>
                <IoAdd size={16} />
                <span>Add an Opportunity</span>
            </button>
        </div>
                    }
            
        </div>
        </>
    )
}

function AboutMeDisplay({ aboutMeModalVisibility, setAboutMeModalVisibility }){
    const { userData } = useContext(ProfileContext);
    const [aboutMe, setAboutMe] = useState("");

    useEffect(()=>{
        setAboutMe(userData.userAboutMe);
    },[userData])

    return(
        <>
        <div className="v0-about-me-content">
            {!aboutMe ? (
                <div className="v0-empty-state">
                    <p className="v0-empty-text">Share a little about yourself. Why and with whom do you want to connect?</p>
                    <button className="v0-add-btn" onClick={() => setAboutMeModalVisibility(true)}>
                        <IoAdd size={16} />
                        <span>Add an About Me Description</span>
                    </button>
                </div>
            ) : (
                <div className="v0-about-me-text">
                    <p>{aboutMe}</p>
                </div>
            )}
        </div>
        </>
    )
}

function ConnectionAvailability({ availabilityModalVisibility, setAvailabilityModalVisibility }){
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
            <div className="v0-availability-content">
                {!availabilityData ? (
                    <div className="v0-empty-state">
                        <p className="v0-empty-text">How are you open to assisting prospective students?</p>
                        <button className="v0-add-btn" onClick={() => setAvailabilityModalVisibility(true)}>
                            <IoAdd size={16} />
                            <span>Add Your Availability</span>
                        </button>
                    </div>
                ) : (
                    <div className="v0-availability-tags">
                        {availabilityData.map((availability) => (
                            <span key={availability} className="v0-availability-tag">
                                {availability}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}