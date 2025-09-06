import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./initiativemodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import { GrAdd } from 'react-icons/gr';
import { LuMessagesSquare } from 'react-icons/lu';
import { MdEmail } from 'react-icons/md';
import { CgClose, CgWebsite } from 'react-icons/cg';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { saveOpportunity } from '../../../services/opportunityServices';
import { careerInterests } from '../../../pages/Onboarding/Options';
import OnboardingDropdown from '../../OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../CustomSelect/CustomSelect';
import SaveChanges from '../../Makechanges/SaveChanges';


const InitiativeContext = createContext({
  organizationData: {},
  setOrganizationData: () => {},
  organizationLogo: null,
  setOrganizationLogo: () => {},
  currentInitiativePage: 1,
  setCurrentInitiativePage: () => {},
  handleChange: () => {},
  handleDropdownChange: () => {},
  organizationQuestionsConfig: {},
  currentUser: null,
});

export default function InitiativeModal({visibility, onClose, opportunityData, isEditing, opportunityId}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentInitiativePage, setCurrentInitiativePage] = useState(1);
  const [showLast, setShowLast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  
  const [organizationLogo, setOrganizationLogo] = useState(null);

  const { currentUser } = useAuth();

  const publishInitiativeData = async () => {
    try {
      setIsSaving(true);
      await toast.promise(
        saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId),
        {
          loading: isEditing ? 'Updating initiative...' : 'Creating initiative...',
          success: isEditing ? 'Initiative updated successfully!' : 'Initiative created successfully!',
          error: (err) => `Failed to ${isEditing ? 'update' : 'create'} initiative: ${err.message}`,
        }
      );
      onClose();
      // await saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId);
    } catch (error) {
      console.error("Error saving initiative: ", error);
    }
    finally{
      setIsSaving(false);
    }
    }
  

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

  const [organizationData, setOrganizationData] = useState({
    organizationType: "",
    organizationName: "",
    organizationHostStudent: "",
    organizationMission: "",
    organizationTags: [],
    learnMore: 'Email',
    apply: 'Email',
    organizationLogoPreview: null,
    createdByUserName: "",
  });

  const {userName, userType} = JSON.parse(localStorage.getItem("basicUserInfo"));
  useEffect(() => {

    if (isEditing && opportunityData) {
        setOrganizationData({... opportunityData});
        return;
    }
    setOrganizationData({...organizationData, createdByUserName: userName});

    }, [visibility]);

  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Initiative Type:",
      type: "select",
      options: userType === "High Schooler" ? ["Select Type", "Club", "Nonprofit", "Business"] : ["Select Type", "Nonprofit", "Business"],
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      page: 1, 
    },
    {
      id: "organizationName",
      text: "What is the name of your initiative?",
      type: "text",
      maxLength: 40,
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      placeholder: "E.g. 'Math Club'",
      page: 1, 
    },
    {
      id: "organizationHostStudent",
      text: "What is your position in the initiative?",
      type: "text",
      maxLength: 40,
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      page: 1,
      placeholder: "E.g. 'Founder'",
    },

    // Page 2
    {
      id: "organizationTags",
      text: "People interested in what fields would benefit from your club?",
      type: "multi-select",
      maxLength: 40,
      placeholder: 'e.g. "data analytics, finance"',
      includers: ["Club", ""],
      options: careerInterests,
      required: true,
      page: 2, 
    },
    {
      id: "organizationMission",
      text: "Your Mission",
      type: "textarea",
      maxLength: 500,
      placeholder: `Describe your ${organizationData.organizationType ? organizationData.organizationType.toLowerCase() : "initiative"}. Summarize your mission and values in a few sentences, and invite others to join or learn more.`,
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      page: 2, 
    },
  
    // Page 3
    {
      id: "learnMore",
      text: `Where would you like users to learn more about your ${organizationData.organizationType.toLowerCase() ?? "initiative"}?`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      page: 3, 
    },
    {
      id: "apply",
      text: `How can students take part in your ${organizationData.organizationType.toLowerCase() ?? "initiative"}?`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Nonprofit", "Club", "Business", ""],
      required: true,
      page: 3, 
    },
    {
      id: "organizationLogoPreview",
      text: `Upload a logo that embodies your ${organizationData.organizationType.toLowerCase() ?? "initiative"}! (optional)`,
      type: "file",
      accept: ".jpg",
      includers: ["Nonprofit", "Club", "Business", ""],
      required: false,
      page: 3, 
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

  const handleDropdownChange = (id, label) => {
    setOrganizationData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setOrganizationData({
      ...organizationData,
      [name]: type === 'file' ? files[0] : value
    });
    setChangesMade(true);
  };

  const saveInitiativeData = () => {
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

  const renderPage = () => {
    switch(currentInitiativePage){
      case 1:
        return <InitiativeType/>;
      case 2:
        return <InitiativeMission/>;
      case 3:
        return <FinalInfo/>;
      case 4:
        return <PreviewOppportunityCard/>;
      default:
        return null;
    }
  }

  return (
    <>
    {/* <Toaster
    position="bottom-right"
    reverseOrder={false}/> */}
    <div>
      <SaveChanges visibility={makeChangesVisibility} onCancel={ ()=>{
        // saveInitiativeData();
        setMakeChangesVisibility(false);
        onClose();
      }} onVerify={() => {
          saveInitiativeData();
          setMakeChangesVisibility(false);
          onClose();
        }}/>
      <InitiativeContext.Provider 
      value={{
        organizationData,
        setOrganizationData, 
        organizationLogo,
        setOrganizationLogo,
        currentInitiativePage, 
        setCurrentInitiativePage,
        handleChange,
        organizationQuestionsConfig,
        handleDropdownChange,
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
                <h2 className="v0-modal-title">Your Initiative</h2>
                <p className="v0-modal-subtitle">Make your voice heard. Garner support from alumni and parents.</p>
                {currentInitiativePage < 4 && (
                  <div className="v0-estimated-time">
                    Est. Time: {4 - currentInitiativePage} minute{currentInitiativePage < 3 ? "s" : ""}
                  </div>
                )}
              </div>
              
              <div className="v0-modal-content">
                <div className="v0-step-section">
                  <ProgressBar numOfSections={4} currentPage={currentInitiativePage} setCurrentPage={setCurrentInitiativePage} showLast={showLast} showArrows={false}/>
                </div>
                <div className="v0-form-section">
                  <form className="v0-modal-form">
                    {renderPage()}
                  </form>
                </div>
              </div>
              
              <div className="v0-modal-footer">
                <div className="v0-modal-navigation">
                  {currentInitiativePage > 1 && (
                    <button 
                      className="v0-btn-secondary" 
                      onClick={() => setCurrentInitiativePage(currentInitiativePage - 1)}
                    >
                      Previous
                    </button>
                  )}
                  {currentInitiativePage < 4 && (
                    <button 
                      className="v0-btn-primary" 
                      onClick={() => setCurrentInitiativePage(currentInitiativePage + 1)}
                    >
                      Next
                    </button>
                  )}
                  {currentInitiativePage === 4 && (
                    <button 
                      className="v0-btn-primary" 
                      onClick={publishInitiativeData}
                      disabled={isSaving}
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </InitiativeContext.Provider>
    </div>
    </>
  );
};

function InitiativeType(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(InitiativeContext);

  const questionsForPage = organizationQuestionsConfig.filter((question) => (question.page === 1));

  return(
    <>
    <h2 className="v0-modal-page-title">We need some general information first.</h2>
    <hr className="v0-modal-page-divider"/>
    <main>
      <div className="v0-modal-form">
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
                  placeholder={question.placeholder}
                  name={question.id}
                  value={organizationData[question.id] ?? ''}
                  onChange={handleChange}
                  type="text"
                  className="v0-modal-form-input"
                  maxLength={question.maxLength}
                />)}
          </div>
        ))}
      </div>
    </main>
    </>
  )
}

function InitiativeMission(){
  const { organizationData, handleChange, organizationQuestionsConfig, handleDropdownChange } = useContext(InitiativeContext);

  const questionsForPage = organizationQuestionsConfig.filter((question) => (question.page === 2 && question.includers.includes(organizationData.organizationType)));

  return(
    <>
    <h2 className="v0-modal-page-title">Time to get down to business. What sets you apart?</h2>
    <hr className="v0-modal-page-divider"/>
    <main className="v0-modal-form">
      {questionsForPage.map((question) => (
        <div key={question.id} className="v0-modal-form-group">
          <label htmlFor={question.id} className="v0-modal-form-label">{question.text}</label>
          {question.type !== "textarea" ? 
            <OnboardingDropdown
              showQuestion={false}
              key={question.id}
              question={question.text}
              options={question.options}
              selectedOption={organizationData[question.id] || (question.type === 'multi-select' ? [] : '')}
              onChange={(label) => handleDropdownChange(question.id, label)}
              type={question.type}
            /> : 
            <textarea
              className="v0-modal-form-textarea"
              key={question.id}
              id={question.id}
              name={question.id}
              value={organizationData[question.id] ?? ''}
              onChange={handleChange}
              type={question.type}
              maxLength={question.maxLength}
              placeholder={question.placeholder}
            />
          }
        </div>
      ))}
    </main>
    </>
  )
}


function FinalInfo(){
  const { organizationData, setOrganizationData, organizationQuestionsConfig, setOrganizationLogo, currentUser } = useContext(InitiativeContext);
  const logoRef = useRef();
  
  const learnMoreAndApplyOptions = [["Messages", <LuMessagesSquare size={20}/>],["Email", <MdEmail size={20}/>],["Website", <CgWebsite size={20}/>]];
  
  const [learnMoreType, setLearnMoreType] = useState("");
  const [applyType, setApplyType] = useState("");
  const [learnMoreInputVisibility, setLearnMoreInputVisibility] = useState(false);
  const [applyInputVisibility, setApplyInputVisibility] = useState(false);
  const [applyDisabled, setApplyDisabled] = useState(false);

  useEffect(()=>{
    setLearnMoreType(organizationData.learnMore.split(": ")[0]);

    if(organizationData.apply === "NOAPPLY"){
      setApplyDisabled(true);
      return;
    }

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
      console.log(file)
      setOrganizationData(prevData => ({
        ...prevData,
        organizationLogoPreview: URL.createObjectURL(file)
      }));
      setOrganizationLogo(file);
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setOrganizationData({
      ...organizationData,
      [name]: name === "learnMore" ? `${learnMoreType}: ${value}` : `${applyType}: ${value}`,
    });
  }

  const handleNoApplyClick = (e) => {
    e.preventDefault();
    if(!applyDisabled){

      setOrganizationData({
        ...organizationData,
        apply: "NOAPPLY",
      });
    }
    else{
      setApplyType("Messages")
      setOrganizationData({
        ...organizationData,
        apply: "Messages",
      });
    }
    setApplyDisabled(!applyDisabled);
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

  const questionsForPage = organizationQuestionsConfig.filter((question=>(question.page === 3 && question.includers.includes(organizationData.organizationType))));

  return(
    <>
    <main>
      <h2 className="v0-modal-page-title">You're almost done! Just a few more things.</h2>
      <hr className="v0-modal-page-divider"/>
      <div className="v0-modal-form">
          {/* First two questions (link inputs) */}
          <div className="v0-modal-form-group"> 
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
                  {(applyInputVisibility && !applyDisabled && question.id === "apply") &&
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
                  <div className="v0-modal-date-overlay" style={{display: (question.id === "apply" && applyDisabled) ? "" : "none", height: "100px"}}>
                  </div>
                  {(question.id === "apply") && (
                    <button className="v0-modal-no-apply-btn" onClick={handleNoApplyClick}>
                      I don't want other students to participate.
                    </button>
                  )}
                </div>
              ))}
          </div>
          {/* Logo upload */}
          <div className="v0-modal-file-container">
            {questionsForPage
              .filter(question => question.type === "file")
              .map(question => (
                <div key={question.id} className="v0-modal-form-group">
                  <label htmlFor={question.id} className="v0-modal-file-label">{question.text}</label>
                  <div className="v0-modal-file-upload">
                    {organizationData.organizationLogoPreview ? (
                      <div className="v0-modal-file-preview-container">
                        <img src={organizationData.organizationLogoPreview} alt="Logo" className="v0-modal-file-preview-img"/>
                        <div className="v0-modal-file-preview-actions">
                          <button 
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
    </>
  )
}

function PreviewOppportunityCard(){
  const { organizationData } = useContext(InitiativeContext);
 
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