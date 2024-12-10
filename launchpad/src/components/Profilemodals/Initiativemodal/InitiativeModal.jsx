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
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { saveOpportunity } from '../../../services/opportunityServices';
import { careerInterests } from '../../../pages/Onboarding/Options';
import OnboardingDropdown from '../../OnboardingDropdown/OnboardingDropdown';


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
});

export default function InitiativeModal({visibility, onClose, opportunityData, isEditing, opportunityId}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentInitiativePage, setCurrentInitiativePage] = useState(1);
  const [showLast, setShowLast] = useState(false);
  
  const [organizationLogo, setOrganizationLogo] = useState(null);

  const { currentUser } = useAuth();

  const saveInitiativeData = async () => {
    try {
      await toast.promise(
        saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId),
        {
          loading: isEditing ? 'Updating initiative...' : 'Creating initiative...',
          success: isEditing ? 'Initiative updated successfully!' : 'Initiative created successfully!',
          error: (err) => `Failed to ${isEditing ? 'update' : 'create'} initiative: ${err.message}`,
        }
      );
      // await saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId);
    } catch (error) {
      console.error("Error saving initiative: ", error);
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
      zIndex: "3",
    }
  };

  const [organizationData, setOrganizationData] = useState({
    organizationType: "",
    organizationName: "",
    organizationHostStudent: "",
    organizationMission: "",
    organizationTags: [],
    learnMore: 'Messages',
    apply: 'Messages',
    organizationLogoPreview: null,
    createdByUserName: "",
  });

  useEffect(() => {
    if (opportunityData) {
        setOrganizationData({... opportunityData});
        return;
    }

    const {userName} = JSON.parse(localStorage.getItem("basicUserInfo"));
    setOrganizationData({...organizationData, createdByUserName: userName});

    }, [visibility]);

  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Initiative Type:",
      type: "select",
      options: ["Select Type", "Club", "Nonprofit", "Business"],
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
      placeholder: `Summarize your ${organizationData.organizationType ?? "initiative"}'s mission and values in a few sentences. ${(organizationData.organizationType === "Business" || organizationData.organizationType === "Nonprofit") && "Invite students and parents to reach out!"}`,
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
  };

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
    <Toaster
    position="bottom-right"
    reverseOrder={false}/>
    <div>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
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
        }}> 
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Initiative Modal"
          // shouldCloseOnOverlayClick={false}
          // shouldCloseOnEsc={false}
        >
          
          <header>
          <button className='btnClose' onClick={()=>setMakeChangesVisibility(true)} style={{background:"none"}}><CgClose size={25}/></button>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Initiative <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Make your voice heard. Garner support from Awty alumni and parents.</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
          <ProgressBar numOfSections={4} currentPage={currentInitiativePage} setCurrentPage={setCurrentInitiativePage} showLast={showLast}/>
          </header>
          <main style={{paddingTop:"10px"}}>
          <form style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "750px"}}>
            {renderPage()}
          </form>
          </main>
          <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
            {/* <button onClick={
              ()=>setMakeChangesVisibility(true)
              } className='btnUnfilled' style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Cancel</button> */}
            {currentInitiativePage === 4 && <button onClick={saveInitiativeData} type='submit' className="btnSaveChanges" style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Save Changes</button>}
          </footer>
        </Modal>
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
    <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>We need some general information first.</h2>
    <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
    <main style={{ display: "flex", paddingTop: "1rem"}}>
      <div style={{ display: "flex", flexDirection: "column", gap: "25px", width: "100%" }}>
        {questionsForPage.map((question) => (
          <div key={question.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <label htmlFor={question.id}>
              {question.text}
            </label>
            {question.type === "select" ?
                (<select
                  id={question.id}
                  name={question.id}
                  value={organizationData[question.id]}
                  onChange={handleChange}
                  style={{width: "45%"}}
                >
                  {question.options.map((option) => (
                    <option key={option} value={option === "Select Type" ? "" : option}>
                      {option}
                    </option>
                  ))}
                </select>)
            :
                (<input
                  key={question.id}
                  id={question.id}
                  placeholder={question.placeholder}
                  name={question.id}
                  value={organizationData[question.id] ?? ''}
                  onChange={handleChange}
                  type="text"
                  style={{width: "42.8%"}}
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
    <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>Time to get down to business. What sets you apart?</h2>
    <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
    <main style={{ display: "flex", alignItems: "center", justifyContent: "space-around", paddingTop: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {questionsForPage.map((question) => (
          <div style={{display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", alignItems: "center", textAlign: "center"}}>
            <label htmlFor={question.id}>{question.text}</label>
            {question.type !== "textarea" ? <div style={{width: "460px", textAlign: "left"}}><OnboardingDropdown
                    showQuestion={false}
                    key={question.id}
                    question={question.text}
                    options={question.options}
                    selectedOption={organizationData[question.id] || (question.type === 'multi-select' ? [] : '')}
                    onChange={(label) => handleDropdownChange(question.id, label)}
                    type={question.type}
                  /> </div> : 
            <textarea
            className='initiativeMission'
            key={question.id}
            id={question.id}
            name={question.id}
            value={organizationData[question.id] ?? ''}
            onChange={handleChange}
            type={question.type}
            maxLength={question.maxLength}
            placeholder={question.placeholder}
            />}
          </div>
        ))}
      </div>
    </main>
    </>
  )
}


function FinalInfo(){
  const { organizationData, setOrganizationData, organizationQuestionsConfig, setOrganizationLogo } = useContext(InitiativeContext);
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
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>You're almost done! Just a few more things.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* First two questions (link inputs) */}
          <div style={{ display: "flex", gap: "10px", flexDirection: "column", textAlign: "center"}}> 
            {questionsForPage
              .filter(question => question.type === "link")
              .map(question => (
                <div key={question.id} style={{position: "relative"}}>
                  <label htmlFor={question.id}>{question.text}</label>
                  <div style={{display: "flex", justifyContent: "center", gap: "25px", paddingTop: "10px"}}>
                  {learnMoreAndApplyOptions.map((option)=>(
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: "100px"}}>
                      <button key={option[0]} style={{padding: "10px"}}  className={`btnSaveChanges btnCircle ${(option[0] === (question.id === "learnMore" ? learnMoreType : applyType)) ? "selected" : ""}`} onClick={(event) => handleOptionClick(event, option[0], question.id)}>
                        {option[1]}
                      </button>
                      <span>{option[0] === "Messages" ? "Message Me" : option[0] === "Email" ? "Email Me" : "Website"}</span>
                    </div>)
                  )}
                  </div>
                  {learnMoreInputVisibility && question.id === "learnMore" &&
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", color: "var(--secondary)"}}>
                    <span style={{fontWeight: "600"}} htmlFor={`${question.id} Input`}>Input your desired {learnMoreType === "Email" ? "email" : "website link"}:</span>
                    <input 
                    type={learnMoreType === "Email" ? "email" : "url"} 
                    id={question.id}
                    name={question.id}
                    value={organizationData[question.id].split(": ")[1]}
                    onChange={handleChange}
                    />
                  </div>}
                  {(applyInputVisibility && !applyDisabled && question.id === "apply") &&
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", color: "var(--secondary)"}}>
                    <span style={{fontWeight: "600"}} htmlFor={`${question.id} Input`}>Input your desired {applyType === "Email" ? "email" : "website link"}:</span>
                    <input
                    type={applyType === "Email" ? "email" : "url"} 
                    id={question.id}
                    name={question.id}
                    onChange={handleChange}
                    value={organizationData[question.id].split(": ")[1]}/>
                  </div>}
                  <div style={{zIndex: "10", height: "100px", top: "6px", opacity: ".6", backgroundColor: "white", display: (question.id === "apply" && applyDisabled) ? "" : "none", position: "absolute", left: "0", right: "0", leftMargin: "auto", rightMargin: "auto"}}>
                  </div>
                  {(question.id === "apply") && (
                    <button className='btnText' onClick={handleNoApplyClick} style={{fontSize: "18px", opacity: ".75", marginTop: "10px", color: applyDisabled ? "var(--highlight)" : ""}}>
                      I don't want students to apply.
                    </button>
                  )}
                </div>
              ))}
          </div>
          {/* Logo upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questionsForPage
              .filter(question => question.type === "file")
              .map(question => (
                <div key={question.id} className="questionItem">
                  <label htmlFor={question.id}>{question.text}</label>
                  <div style={{display: "flex", position: "relative", alignItems: "center", justifyContent: "center", width: "40%", paddingTop: "15px"}}>
                    <button className='btnSaveChanges' style={{borderRadius: "50%", boxShadow: "var(--shadowColor)", padding: "15px"}} onClick={(e)=>{
                      logoRef.current.click();
                      e.preventDefault();}}><GrAdd size={30}/></button>
                    <input
                        type="file"
                        id="organizationLogo"
                        name="organizationLogo"
                        onChange={handleFileChange}
                        style={{display: "none"}}
                        ref={logoRef}
                        accept=".jpg,.png"
                    />
                    {organizationData.organizationLogoPreview && <div style={{display: "flex", flexDirection: "column", position: "absolute", alignItems: "center", justifyContent: "center", right: "-100px"}}>
                      <span style={{color: "var(--secondary)", fontWeight: "bolder"}}>Logo Preview:</span>
                      <img src={organizationData.organizationLogoPreview} alt="Logo" style={{width: "70px", height: "70px", overflow: "hidden", borderRadius: "50%", objectFit: "cover"}}/>
                    </div>}
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
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>You're all set! Here's a preview of your card:</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "10px"}}>
        <OrganizationProfile organizationData={organizationData} location={"opportunity_popup"}/>
      </div>
    </main>
    </>
  )
}