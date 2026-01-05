import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./OpportunityModal.css";
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import ProfilePictureCropModal from '../../ProfilePictureCropModal/ProfilePictureCropModal';
import { GrAdd } from 'react-icons/gr';
import { LuMessagesSquare } from 'react-icons/lu';
import { MdEmail } from 'react-icons/md';
import { CgClose, CgWebsite } from 'react-icons/cg';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { saveOpportunity } from '../../../services/opportunityServices';
import OnboardingDropdown from '../../OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../CustomSelect/CustomSelect';
import { careerInterests, CitySearch } from '../../../pages/Onboarding/Options';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SaveChanges from '../../Makechanges/SaveChanges';

const OpportunityContext = createContext({
  organizationData: {},
  setOrganizationData: () => {},
  organizationLogo: null,
  setOrganizationLogo: () => {},
  currentOpportunityPage: 1,
  setCurrentOpportuntityPage: () => {},
  handleChange: () => {},
  organizationQuestionsConfig: {},
  currentUser: null,
});

export default function OpportunityModal({visibility, onClose, opportunityData, isEditing, opportunityId, isPublished}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentOpportunityPage, setCurrentOpportuntityPage] = useState(1);
  const [showLast, setShowLast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [changesMade, setChangesMade] = useState(false);

  const { currentUser } = useAuth();
  // console.log("Opportunity data:", opportunityData);

  const [organizationData, setOrganizationData] = useState({
    organizationType: '',
    organizationHostCompany: '',
    organizationTags: [],
    applicantPosition: '',
    applicantExpectations: '',
    isPaid: 'Unpaid',
    applicants: 'High Schoolers/College Students',
    workLocation: 'On-site',
    location: '',
    timeFrame: 'One Week',
    learnMore: 'Email',
    apply: 'Email',
    organizationLogoPreview: null,
    createdByUserName: "",
    collaborators: [], // Array of {name: string, email: string} objects
  });

  const [organizationLogo,setOrganizationLogo] = useState(null);


const publishOpportunityData = async () => {
  try {
    setIsSaving(true);
    await toast.promise(
      saveOpportunity(Object.fromEntries(
        Object.entries(organizationData).filter(([key, value]) => key !== "id")
      ), organizationLogo, currentUser, isEditing, opportunityId),
      {
        loading: isEditing ? 'Updating opportunity...' : 'Creating opportunity...',
        success: isEditing ? 'Opportunity updated successfully!' : 'Opportunity created successfully!',
        error: (err) => `Failed to ${isEditing ? 'update' : 'create'} opportunity: ${err.message}`,
      }
    );
    onClose();

  } catch (error) {
    console.error("Error saving opportunity: ", error);
  }
  finally{
    setIsSaving(false);
  }

  // onClose();
  }

  const saveOpportunityData = () => {
    const currentOpportunityData = localStorage.getItem("savedOrganizationData") ? JSON.parse(localStorage.getItem("savedOrganizationData")) : [];
    if(!isEditing){
      localStorage.setItem("savedOrganizationData", JSON.stringify([...currentOpportunityData, {...organizationData, id: Math.floor(Math.random() * 10000)}]));
    }
    else{
      const orgId = opportunityData.id;
      localStorage.setItem("savedOrganizationData", JSON.stringify([...currentOpportunityData.filter(opportunity => opportunity.id !== orgId), {...organizationData, id: orgId}]));
    }
    toast.success("Opportunity saved!");
    // onClose();
  }

  useEffect(() => {
    if (opportunityData !== null && isEditing) {
        setOrganizationData({... opportunityData});
        return;
    }

    const {userName} = JSON.parse(localStorage.getItem("basicUserInfo"));
    setOrganizationData({
      organizationType: '',
      organizationHostCompany: '',
      organizationTags: [],
      applicantPosition: '',
      applicantExpectations: '',
      startDate: '',
      deadline: '',
      isPaid: 'Unpaid',
      applicants: 'High Schoolers/College Students',
      workLocation: 'On-site',
      location: '',
      timeFrame: 'One Week',
      learnMore: 'Email',
      apply: 'Email',
      applicantRequirements: [],
      organizationLogoPreview: null,
      createdByUserName: userName});

    }, [visibility]);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "5",
    }
  };

  console.log("organizationData:", organizationData)

  const getApplicantType = () => {
    switch(organizationData.organizationType){
      case "Internship":
        return "Intern";
      case "Job":
        return "Applicant";
      case "Community Service":
        return "Volunteer";
      case "Shadowing":
        return "Shadowee";
      default:
        return "Applicant"
    }
  }
  
  const getPositionTitlePlaceholder = () => {
    switch(organizationData.organizationType){
      case "Internship":
        return "Data Analyst Intern";
      case "Job":
        return "Waiter";
      case "Community Service":
        return "Fundraiser Volunteer";
      case "Shadowing":
        return "Cybersecurity Shadow";
      default:
        return ""
    }
  }


  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Workplace Opportunity Type:",
      type: "select",
      options: ["Select Type", "Shadowing", "Internship", "Community Service", "Job"],
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 1, 
    },
    {
      id: "deadline",
      text: "Workplace Opportunity Type:",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: false,
      // page: 1, 
    },
    {
      id: "startDate",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: false,
      // page: 1, 
    },
    {
      id: "organizationHostCompany",
      text: "Host company or organization:",
      type: "text",
      placeholder: "e.g., \"ExxonMobil\”",
      maxLength: 40,
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 1, 
    },
  
    // Page 2
    {
      id: "organizationTags",
      text: `${getApplicantType()}'s Field(s) of Work`,
      type: "multi-select",
      includers: ["Internship", "Shadowing", "Job", ""],
      required: true,
      page: 2,
      options: careerInterests,
    },
    {
      id: "applicantPosition",
      text: `${organizationData.organizationType === "Community Service" ? "Volunteering" : organizationData.organizationType} Position Title`,
      type: "text",
      maxLength: 40,
      placeholder: organizationData.organizationType ? `e.g., "${getPositionTitlePlaceholder()}"` : "",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: (orgType) => orgType !== "Community Service",
      page: 2, 
    },
    {
      id: "applicantExpectations",
      text: `${organizationData.organizationType} Description, Requirements, and Expectations`,
      type: "textarea",
      maxLength: 500,
      placeholder: `Briefly describe what the ${getApplicantType().toLowerCase()}(s) will do and the experience needed to succeed throughout this ${`${organizationData.organizationType && organizationData.organizationType.toLowerCase()} `}opportunity. You’ll have a chance to share a link to more details later.`,
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 2, 
    },
  
    // Page 3
    {
      id: "isPaid",
      text: "Is this opportunity paid or unpaid?",
      type: "select",
      options: ["Paid", "Unpaid"],
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 3, 
    },
    {
      id: "workLocation",
      text: "What is the format of the opportunity?",
      type: "select",
      options: ["On-site", "Remote", "Hybrid"],
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 3,
    },
    {
      id: "location",
      text: "Where is this opportunity located?",
      type: "city",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: (orgData) => orgData.workLocation === "On-site" || orgData.workLocation === "Hybrid",
      page: 3,
    },
    {
      id: "applicants",
      text: "What type of students can apply?",
      type: "select",
      options: ["High Schoolers/College Students", "High Schoolers", "College Students"],
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 3,
    },
    {
      id: "timeFrame",
      text: "What is the opportunity’s duration?",
      type: "select",
      options: ["TBD","<1 Week", "1 Week", "2 Weeks", "3 Weeks", "4+ Weeks", "6+ Weeks", "Indefinite"],
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 3, 
    },
  
    // Page 4
    {
      id: "learnMore",
      text: "Students can find more information via:",
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 4, 
    },
    {
      id: "apply",
      text: `Students can ${organizationData.organizationType === "Community Service" ? "volunteer" : "apply"} via:`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: true,
      page: 4, 
    },
    {
      id: "organizationLogoPreview",
      text: "Upload a logo that embodies your opportunity: (optional)",
      type: "file",
      accept: ".jpg",
      includers: ["Job", "Internship", "Shadowing", "Community Service", ""],
      required: false,
      page: 4, 
    },
  ];

  // fix this later
  useEffect(()=>{
    const emptyQuestions = organizationQuestionsConfig.filter(question => (organizationData[question.id] === "" && question.includers.includes(organizationData.organizationType) && question.required === true));
    if(emptyQuestions.length === 0){
      console.log()
      setShowLast(true)
    }
    else{
      setShowLast(false)
    }
  },[organizationData])

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrganizationData({
      ...organizationData,
      [name]: value
    });
    setChangesMade(true);
  };

  const handleDropdownChange = (id, label) => {
    setOrganizationData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };


  const renderPage = () => {
    switch(currentOpportunityPage){
      case 1:
        return <OpportunityType/>;
      case 2:
        return <ApplicantInfo handleDropdownChange={handleDropdownChange}/>;
      case 3:
        return <BasicLogistics/>;
      case 4:
        return <FinalInfo/>;
      case 5:
        return <PreviewOppportunityCard/>;
      default:
        return null;
  }
}

  return (
    <>
    {/* <Toaster
    position="bottom-right"
    reverseOrder={false}
    style={{zIndex: 9999}}
    /> */}
    <div>
      <SaveChanges visibility={makeChangesVisibility} onCancel={ ()=>{
              // saveOpportunityData();
              setMakeChangesVisibility(false);
              onClose();
            }} onVerify={() => {
                saveOpportunityData();
                setMakeChangesVisibility(false);
                onClose();
              }}/>
      <OpportunityContext.Provider 
      value={{
        organizationData,
        setOrganizationData,
        organizationLogo,
        setOrganizationLogo,
        currentOpportunityPage, 
        setCurrentOpportuntityPage,
        handleChange,
        organizationQuestionsConfig,
        currentUser,
        }}> 
        {visibility && (
          <div className="v0-modal-overlay" onClick={() => {
            if(changesMade){
              setMakeChangesVisibility(true);
            }
            else{
              onClose();
            }
          }}>
            <div className="v0-modal-container opportunity-modal" onClick={(e) => e.stopPropagation()}>
              <div className="v0-modal-header">
                <button className="v0-modal-close-btn" onClick={() => {
                  if(changesMade){
                    setMakeChangesVisibility(true);
                  }
                  else{
                    onClose();
                  }
                }}>
                  <CgClose size={20} />
                </button>
                <div style={{marginTop: "30px"}}>
                  <h2 className="v0-modal-title">Your Workplace Opportunity</h2>
                  <p className="v0-modal-subtitle">Be the ember that lights a fire in young minds.</p>
                </div>
                {currentOpportunityPage < 5 && (
                  <div className="v0-estimated-time">
                    Est. Time: {5 - currentOpportunityPage} minute{currentOpportunityPage < 4 ? "s" : ""}
                  </div>
                )}
              </div>
              
              <div className="v0-modal-content">
                <div className="v0-step-section">
                  <ProgressBar numOfSections={5} currentPage={currentOpportunityPage} setCurrentPage={setCurrentOpportuntityPage} showLast={showLast} showArrows={false}/>
                </div>
                <div className="v0-form-section">
                  <form className="v0-modal-form">
                    {renderPage()}
                  </form>
                </div>
              </div>
              
              <div className="v0-modal-footer">
                <div className="v0-modal-navigation">
                  {currentOpportunityPage > 1 && (
                    <button
                      type="button"
                      className="v0-btn-secondary"
                      onClick={() => setCurrentOpportuntityPage(currentOpportunityPage - 1)}
                    >
                      Previous
                    </button>
                  )}
                  {currentOpportunityPage < 5 && (
                    <button
                      type="button"
                      className="v0-btn-primary"
                      onClick={() => setCurrentOpportuntityPage(currentOpportunityPage + 1)}
                    >
                      Next
                    </button>
                  )}
                  {currentOpportunityPage === 5 && (
                    <button
                      type="button"
                      className="v0-btn-primary"
                      onClick={publishOpportunityData}
                      disabled={isSaving}
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </OpportunityContext.Provider>
    </div>
    </>
  );
};

function OpportunityType(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(OpportunityContext);

  const questionsForPage = organizationQuestionsConfig.filter((question) => (question.page === 1));

  return(
    <>
    <span className="v0-modal-page-title">We need some general information first.</span>
    <hr className="v0-modal-page-divider"/>
    <main style={{ display: "flex"}}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
        {questionsForPage.map((question) => (
          <div key={question.id} className="v0-modal-form-group">
            <label htmlFor={question.id} className="v0-modal-form-label">
              {question.text}
            </label>
            {question.type === "select" ?
                (<CustomSelect
                  options={Array.isArray(question.options) ? question.options.filter(option => option !== "Select Type") : []}
                  value={organizationData[question.id] || ""}
                  onChange={(value) => handleChange({ target: { name: question.id, value } })}
                  placeholder="Select Type"
                  className="v0-modal-form-select-custom"
                />)
            :
                (<input
                  key={question.id}
                  id={question.id}
                  name={question.id}
                  value={organizationData[question.id] ?? ''}
                  onChange={handleChange}
                  type="text"
                  placeholder={question.placeholder}
                  className="v0-modal-form-input"
                  maxLength={question.maxLength}
                />)}
          </div>
        ))}
        <ApplicantionTimeline/>
      </div>
    </main>
    </>
  )
}

function ApplicantionTimeline() {
  const { organizationData, setOrganizationData, organizationQuestionsConfig } = useContext(OpportunityContext);

  const [ startDateDisabled, setStartDateDisabled ] = useState(organizationData.startDate === null);
  const [ deadlineDisabled, setDeadlineDisabled ] = useState(organizationData.deadline === null);
  

  const handleDatesChanged = (date, dateType) => {
    setOrganizationData({...organizationData, [dateType]: date.toLocaleDateString('en-US')});
  }

  const handleNoStartDate = (event) => {
    event.preventDefault();
    setStartDateDisabled(!startDateDisabled);
    setOrganizationData({...organizationData, startDate: startDateDisabled ? "" : null});
  }

  const handleNoDeadlineDisabled = (event) => {
    event.preventDefault();
    setDeadlineDisabled(!deadlineDisabled);
    setOrganizationData({...organizationData, deadline: deadlineDisabled ? "" : null});
  }

  return(
    <>
      <div className="v0-modal-date-layout">
        <div className="v0-modal-date-row">
          <div className="v0-modal-date-container">
            <label className="v0-modal-date-label">Application deadline:</label>
            <DatePicker 
              selected={organizationData.deadline} 
              onChange={(date)=>handleDatesChanged(date, "deadline")}
              placeholderText="Select a date"
              customInput={<input className="v0-modal-date-input" />}
            />
            <div className="v0-modal-date-overlay" style={{display: deadlineDisabled ? "" : "none"}}></div>
            <div className="v0-modal-date-toggle">
              <button type="button" className={`v0-modal-date-toggle-btn ${deadlineDisabled ? "active" : ""}`} onClick={handleNoDeadlineDisabled}>
                No deadline
              </button>
            </div>
          </div>
          <div className="v0-modal-date-container">
            <label className="v0-modal-date-label">Start date:</label>
            <DatePicker
              selected={organizationData.startDate}
              onChange={(date)=>handleDatesChanged(date, "startDate")}
              placeholderText="Select a date"
              customInput={<input className="v0-modal-date-input" />}
            />
            <div className="v0-modal-date-overlay" style={{display: startDateDisabled ? "" : "none"}}></div>
            <div className="v0-modal-date-toggle">
              <button type="button" className={`v0-modal-date-toggle-btn ${startDateDisabled ? "active" : ""}`} onClick={handleNoStartDate}>
                No set date
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ApplicantInfo({handleDropdownChange}){
  const { organizationData, setOrganizationData, handleChange, organizationQuestionsConfig } = useContext(OpportunityContext);
  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 2 && question.includers.includes(organizationData.organizationType)));

  // Requirements options
  const defaultRequirements = [
    { id: 'resume', label: 'Resume (PDF)' },
    { id: 'intro', label: 'Introduction' },
    { id: 'why', label: 'A concise answer to the question: "Why are you interested in this opportunity?"' },
  ];
  const [customRequirement, setCustomRequirement] = useState('');
  const requirements = organizationData.applicantRequirements || [];

  const handleRequirementChange = (id, checked) => {
    let updated = requirements.filter(r => !defaultRequirements.map(d => d.id).includes(r));
    if (checked) {
      updated = [...requirements, id];
    } else {
      updated = requirements.filter(r => r !== id);
    }
    setOrganizationData({ ...organizationData, applicantRequirements: updated });
  };

  const handleCustomRequirementChange = (e) => {
    e.preventDefault();
    setCustomRequirement(e.target.value);
  };

  const handleAddCustomRequirement = (e) => {
    e.preventDefault();
    if (customRequirement.trim() && !requirements.includes(customRequirement.trim())) {
      setOrganizationData({ ...organizationData, applicantRequirements: [...requirements, customRequirement.trim()] });
      setCustomRequirement('');
    }
  };

  return(
    <>
    <main>
      <h2 className="v0-modal-page-title">Explain what you need from your applicants.</h2>
      <hr className="v0-modal-page-divider"/>
      <div className="v0-modal-form">
        {/* Requirements checklist */}
        <div className="v0-modal-requirements-container">
          <div className="v0-modal-requirements-title">What do you want applicants to submit?</div>
          {defaultRequirements.map(req => (
            <label key={req.id} className="v0-checkbox-label">
              <input
                type="checkbox"
                className="v0-checkbox"
                checked={requirements.includes(req.id)}
                onChange={e => handleRequirementChange(req.id, e.target.checked)}
              />
              <div className="v0-checkbox-content">
                <span className="v0-option-title">{req.label}</span>
              </div>
            </label>
          ))}
          {/* Custom requirement */}
          <div className="v0-modal-custom-requirement">
            <input
              type="text"
              placeholder="Other (add your own)"
              value={customRequirement}
              onChange={handleCustomRequirementChange}
              className="v0-modal-form-input"
              maxLength={80}
            />
            <button type="button" className="v0-modal-add-btn" onClick={handleAddCustomRequirement}>
              <GrAdd size={16}/>
            </button>
          </div>
          {/* Show added custom requirements */}
          {requirements.filter(r => !defaultRequirements.map(d => d.id).includes(r)).length > 0 && (
            <div className="v0-modal-custom-requirements">
              <div className="v0-modal-custom-requirements-title">Custom requirements:</div>
              <ul className="v0-modal-custom-requirements-list">
                {requirements.filter(r => !defaultRequirements.map(d => d.id).includes(r)).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Form fields */}
        <div className="v0-modal-form-fields">
          {questionsForPage
            .filter(
              (question) =>
                (question.id === "organizationTags" && !question.includers.includes(question.id)) ||
                (question.id === "applicantPosition"  && !question.includers.includes(question.id))
            )
            .map((question) => (
              <div key={question.id} className="v0-modal-form-group" style={{width: "100%"}}>
                {question.required && (
                  <>
                    <label htmlFor={question.id} className="v0-modal-form-label">{question.text}</label>
                    {question.id === "organizationTags" ? 
                      <div className="v0-modal-dropdown-container">
                        <OnboardingDropdown
                          showQuestion={false}
                          key={question.id}
                          question={question.text}
                          options={question.options}
                          selectedOption={organizationData[question.id] || (question.type === 'multi-select' ? [] : '')}
                          onChange={(label) => handleDropdownChange(question.id, label)}
                          type={question.type}
                        /> 
                      </div> : 
                      <input
                        className="v0-modal-form-input"
                        id={question.id}
                        name={question.id}
                        value={organizationData[question.id]}
                        onChange={handleChange}
                        maxLength={question.maxLength}
                        placeholder={question.placeholder}
                      />
                    }
                  </>
                )}
              </div>
            ))}
        </div>
        
        {/* Expectations textarea */}
        <div className="v0-modal-form-group">
          {questionsForPage
            .filter((question) => question.id === "applicantExpectations")
            .map((question) => (
              <div key={question.id} className="v0-modal-textarea-container">
                <label htmlFor={question.id} className="v0-modal-form-label">{question.text}</label>
                <textarea
                  className="v0-modal-form-textarea"
                  id={question.id}
                  name={question.id}
                  value={organizationData[question.id]}
                  onChange={handleChange}
                  placeholder={question.placeholder}
                ></textarea>
              </div>
            ))}
        </div>
      </div>
    </main>
    </>
  )
}

function FinalInfo(){
  const { organizationData, setOrganizationData, organizationQuestionsConfig, setOrganizationLogo, currentUser } = useContext(OpportunityContext);
  const logoRef = useRef();
  
  const learnMoreAndApplyOptions = [["Website", <CgWebsite size={20}/>], ["Email", <MdEmail size={20}/>], ["Messages", <LuMessagesSquare size={20}/>]];
  
  const [learnMoreType, setLearnMoreType] = useState("");
  const [applyType, setApplyType] = useState("");
  const [learnMoreInputVisibility, setLearnMoreInputVisibility] = useState(false);
  const [applyInputVisibility, setApplyInputVisibility] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);

  useEffect(()=>{
    setLearnMoreType(organizationData.learnMore.split(": ")[0]);
    setApplyType(organizationData.apply.split(": ")[0]);
    
    // Auto-populate email inputs with current user's email
    if (currentUser?.email) {
      if (organizationData.learnMore.split(": ")[0] === "Email" && !organizationData.learnMore.split(": ")[1]) {
        setOrganizationData(prev => ({
          ...prev,
          learnMore: `Email: ${currentUser.email}`
        }));
      }
      if (organizationData.apply.split(": ")[0] === "Email" && !organizationData.apply.split(": ")[1]) {
        setOrganizationData(prev => ({
          ...prev,
          apply: `Email: ${currentUser.email}`
        }));
      }
    }
  },[]);
  useEffect(()=>{
    setApplyInputVisibility(applyType !== "Messages");
    setLearnMoreInputVisibility(learnMoreType !== "Messages");
  },[applyType,learnMoreType]);


  // revoke urls to clean up localStorage
  useEffect(() => {
    return () => {
      if (organizationData.logoPreviewURL) {
        URL.revokeObjectURL(organizationData.logoPreviewURL);
      }
    };
  }, [organizationData.logoPreviewURL]);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setSelectedLogoFile(file);
      setShowCropModal(true);
    }
  }

  const handleCroppedLogo = (croppedFile) => {
    setShowCropModal(false);
    setOrganizationData(prevData => ({
      ...prevData,
      organizationLogoPreview: URL.createObjectURL(croppedFile)
    }));
    setOrganizationLogo(croppedFile);
    setSelectedLogoFile(null);
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setOrganizationData({
      ...organizationData,
      [name]: name === "learnMore" ? `${learnMoreType}: ${value}` : `${applyType}: ${value}`,
    });
  }

  const handleOptionClick = (event, optionName, questionId) => {
    event.preventDefault();
    // setOrganizationData({...organizationData, learnMore: ""});
    // setOrganizationData({...organizationData, apply: ""});
    if(optionName !== "Messages" && questionId === "learnMore"){
      setLearnMoreType(optionName);
    }
    else if(optionName !== "Messages" && questionId === "apply"){
      setApplyType(optionName);
    }
    else if(optionName === "Messages" && questionId === "apply"){
      setApplyType(optionName);
      setOrganizationData({...organizationData, [questionId]: "Messages"});
    }
    else{
      setLearnMoreType(optionName);
      setOrganizationData({...organizationData, [questionId]: "Messages"})
    }
  }

  const questionsForPage = organizationQuestionsConfig.filter((question=>(question.page === 4 && question.includers.includes(organizationData.organizationType))));

  return(
    <>
    <main>
      <h2 className="v0-modal-page-title">You're almost done. Just a few more details.</h2>
      <hr className="v0-modal-page-divider"/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* First two questions (link inputs) */}
          <div style={{ display: "flex", gap: "10px", flexDirection: "column", textAlign: "center"}}> 
            {questionsForPage
              .filter(question => question.type === "link")
              .map(question => (
                <div key={question.id} className="v0-modal-link-container">
                  <label htmlFor={question.id} className="v0-modal-link-label">{question.text}</label>
                  <div className="v0-modal-link-options">
                  {learnMoreAndApplyOptions.map((option)=>(
                    <div key={option[0]} className="v0-modal-link-option">
                      <button className={`v0-modal-link-btn ${(option[0] === (question.id === "learnMore" ? learnMoreType : applyType)) ? "selected" : ""}`} onClick={(event) => handleOptionClick(event, option[0], question.id)}>
                        {option[1]}
                      </button>
                      <span className="v0-modal-link-text">{option[0] === "Messages" ? "Message Me" : option[0] === "Email" ? "Email Me" : "Website"}</span>
                    </div>)
                  )}
                  </div>
                  {learnMoreInputVisibility && question.id === "learnMore" &&
                  <div className="v0-modal-link-input-container">
                    <span className="v0-modal-link-input-label">Input your desired {learnMoreType === "Email" ? "email" : "website link"}:</span>
                    <input 
                    type={learnMoreType === "Email" ? "email" : "url"} 
                    id={question.id}
                    name={question.id}
                    value={organizationData[question.id].split(": ")[1]}
                    onChange={handleChange}
                    className="v0-modal-link-input"
                    />
                  </div>}
                  {(applyInputVisibility && question.id === "apply") &&
                  <div className="v0-modal-link-input-container">
                    <span className="v0-modal-link-input-label">Input your desired {applyType === "Email" ? "email" : "website link"}:</span>
                    <input
                    type={applyType === "Email" ? "email" : "url"} 
                    id={question.id}
                    name={question.id}
                    onChange={handleChange}
                    value={organizationData[question.id].split(": ")[1]}
                    className="v0-modal-link-input"
                    />
                  </div>}
                </div>
              ))}
          </div>

          {/* Collaborators Section */}
          <div className="v0-modal-collaborators-container">
            <label className="v0-modal-form-label">
              Collaborators (Optional)
              <span className="v0-modal-help-text">Add team members or cofounders who work with you on this opportunity</span>
            </label>
            {(organizationData.collaborators || []).map((collaborator, index) => (
              <div key={index} className="v0-modal-collaborator-item">
                <div className="v0-modal-collaborator-inputs">
                  <input
                    type="text"
                    placeholder="Name"
                    value={collaborator.name || ''}
                    onChange={(e) => {
                      const newCollaborators = [...(organizationData.collaborators || [])];
                      newCollaborators[index] = { ...newCollaborators[index], name: e.target.value };
                      setOrganizationData({ ...organizationData, collaborators: newCollaborators });
                    }}
                    className="v0-modal-collaborator-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={collaborator.email || ''}
                    onChange={(e) => {
                      const newCollaborators = [...(organizationData.collaborators || [])];
                      newCollaborators[index] = { ...newCollaborators[index], email: e.target.value };
                      setOrganizationData({ ...organizationData, collaborators: newCollaborators });
                    }}
                    className="v0-modal-collaborator-input"
                  />
                </div>
                <button
                  type="button"
                  className="v0-modal-collaborator-remove-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const newCollaborators = (organizationData.collaborators || []).filter((_, i) => i !== index);
                    setOrganizationData({ ...organizationData, collaborators: newCollaborators });
                  }}
                  title="Remove collaborator"
                >
                  <BiTrash size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="v0-modal-collaborator-add-btn"
              onClick={(e) => {
                e.preventDefault();
                const newCollaborators = [...(organizationData.collaborators || []), { name: '', email: '' }];
                setOrganizationData({ ...organizationData, collaborators: newCollaborators });
              }}
            >
              <GrAdd size={16} />
              <span>Add Collaborator</span>
            </button>
          </div>

          {/* Logo upload */}
          <div className="v0-modal-file-container">
            {questionsForPage
              .filter(question => question.type === "file")
              .map(question => (
                <div key={question.id} className="questionItem">
                  <label htmlFor={question.id} className="v0-modal-file-label">{question.text}</label>
                  <div className="v0-modal-file-upload">
                    {organizationData.organizationLogoPreview ? (
                      <div className="v0-modal-file-preview-container">
                        <img src={organizationData.organizationLogoPreview} alt="Logo" className="v0-modal-file-preview-img"/>
                        <div className="v0-modal-file-preview-actions">
                          <button
                            type="button"
                            className="v0-modal-file-edit-btn"
                            onClick={(e) => {
                              logoRef.current.click();
                              e.preventDefault();
                            }}
                            title="Change logo"
                          >
                            <BiEdit size={16}/>
                          </button>
                          <button
                            type="button"
                            className="v0-modal-file-remove-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              setOrganizationData(prev => ({
                                ...prev,
                                organizationLogoPreview: null
                              }));
                              setOrganizationLogo(null);
                            }}
                            title="Remove logo"
                          >
                            <BiTrash size={16}/>
                          </button>
                        </div>
                        <input
                          type="file"
                          id="organizationLogo"
                          name="organizationLogo"
                          onChange={handleFileChange}
                          className="v0-modal-file-input"
                          ref={logoRef}
                          accept=".jpg,.png"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="v0-modal-file-btn"
                        onClick={(e) => {
                          logoRef.current.click();
                          e.preventDefault();
                        }}
                      >
                        <GrAdd size={24}/>
                        <span>Upload Logo</span>
                      </button>
                    )}
                    <input
                      type="file"
                      id="organizationLogo"
                      name="organizationLogo"
                      onChange={handleFileChange}
                      className="v0-modal-file-input"
                      ref={logoRef}
                      accept=".jpg,.png"
                    />
                      </div>
                  </div>
              ))}
          </div>
        </div>
    </main>

    {/* Logo Crop Modal */}
    {showCropModal && selectedLogoFile && (
      <ProfilePictureCropModal
        imageFile={selectedLogoFile}
        onClose={() => {
          setShowCropModal(false);
          setSelectedLogoFile(null);
        }}
        onCropComplete={handleCroppedLogo}
        cropShape="rounded-rectangle"
        visibility={showCropModal}
      />
    )}
    </>
  )
}

function BasicLogistics(){
  const { organizationData, setOrganizationData, handleChange, organizationQuestionsConfig } = useContext(OpportunityContext);

  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 3 && question.includers.includes(organizationData.organizationType)))

  const handleLocationChange = (fieldId, value) => {
    setOrganizationData(prevState => ({
      ...prevState,
      [fieldId]: value,
    }));
  };

  return(
    <>
    <main>
      <h2 className="v0-modal-page-title">Tell us some basic information about your opportunity.</h2>
      <hr className="v0-modal-page-divider"/>
      <div className="v0-modal-logistics-container">
          {questionsForPage.map((question) => (
            <div key={question.id} className="v0-modal-logistics-item">
              <label htmlFor={question.id} className="v0-modal-logistics-label">{question.text}</label>
              {question.type === "city" ? (
                <CitySearch
                  selectedOptions={organizationData}
                  handleChange={handleLocationChange}
                  field="location"
                  showQuestion={false}
                />
              ) : (
                <CustomSelect
                  options={Array.isArray(question.options) ? question.options : []}
                  value={organizationData[question.id] || ""}
                  onChange={(value) => handleChange({ target: { name: question.id, value } })}
                  placeholder="Select option"
                  className="v0-modal-logistics-select-custom"
                />
              )}
            </div>
          ))}
        </div>
    </main>
    </>
  )
}

function PreviewOppportunityCard(){
  const { organizationData } = useContext(OpportunityContext);
 
  return(
    <>
    <main>
      <h2 className="v0-modal-page-title">You're all set! Here's a preview of your card:</h2>
      <hr className="v0-modal-page-divider"/>
      <div className="v0-modal-preview-container">
        <OrganizationProfile organizationData={organizationData} location={"opportunity_popup"} isPreview={true}/>
      </div>
    </main>
    </>
  )
}