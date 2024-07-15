import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./opportunitymodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import { GrAdd } from 'react-icons/gr';
import { LuMessagesSquare } from 'react-icons/lu';
import { MdEmail } from 'react-icons/md';
import { CgWebsite } from 'react-icons/cg';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { saveOpportunity } from '../../../services/opportunityServices';

const OpportunityContext = createContext({
  organizationData: {},
  setOrganizationData: () => {},
  organizationLogo: null,
  setOrganizationLogo: () => {},
  currentOpportunityPage: 1,
  setCurrentOpportuntityPage: () => {},
  handleChange: () => {},
  organizationQuestionsConfig: {},
});

export default function OpportunityModal({visibility, onClose, opportunityData, isEditing, opportunityId}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentOpportunityPage, setCurrentOpportuntityPage] = useState(1);
  const [showLast, setShowLast] = useState(false);

  const { currentUser } = useAuth();

  const [organizationData, setOrganizationData] = useState({
    organizationType: '',
    organizationHostCompany: '',
    applicantFieldOfWork: '',
    applicantPosition: '',
    applicantExpectations: '',
    isPaid: 'Unpaid',
    applicants: 'Either One',
    workLocation: 'On-site',
    timeFrame: 'One Week',
    learnMore: 'Messages',
    apply: 'Messages',
    organizationLogoPreview: null,
  });

  const [organizationLogo,setOrganizationLogo] = useState(null);


const saveOpportunityData = async () => {
  try {
    await toast.promise(
      saveOpportunity(organizationData, organizationLogo, currentUser, isEditing, opportunityId),
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

  onClose();
  }
  

  useEffect(() => {
    if (opportunityData) {
        setOrganizationData({... opportunityData});
    }
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
      zIndex: "3",
    }
  };

  const getApplicantType = () => {
    switch(organizationData.organizationType){
      case "Internship":
        return "Intern";
      case "Job":
        return "Applicant";
      case "Volunteering":
        return "Volunteer";
      case "Shadowing":
        return "Shadowee";
      default:
        return "Applicant"
    }
  }
  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Workplace Opportunity Type:",
      type: "select",
      options: ["Select Type", "Shadowing", "Internship", "Job", "Volunteering"],
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 1, 
    },
    {
      id: "organizationHostCompany",
      text: "Host Company / Organization:",
      type: "text",
      maxLength: 40,
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 1, 
    },
  
    // Page 2
    {
      id: "applicantFieldOfWork",
      text: `${organizationData.organizationType} Field of Work`,
      type: "text",
      maxLength: 40,
      placeholder: 'e.g. "finance"',
      includers: ["Internship", "Shadowing", ""],
      required: true,
      page: 2, 
    },
    {
      id: "applicantPosition",
      text: `${organizationData.organizationType} Position`,
      type: "text",
      maxLength: 40,
      placeholder: 'e.g. "data analytics"',
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: (orgType) => orgType !== "Volunteering",
      page: 2, 
    },
    {
      id: "applicantExpectations",
      text: `${organizationData.organizationType} Expectations`,
      type: "textarea",
      maxLength: 500,
      placeholder: `Briefly describe the tools and knowledge the ${getApplicantType().toLowerCase()}(s) will need to succeed throughout this ${organizationData.organizationType && organizationData.organizationType.toLowerCase()} opportunity.`,
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 2, 
    },
  
    // Page 3
    {
      id: "isPaid",
      text: "Is this opportunity paid or unpaid?",
      type: "select",
      options: ["Paid", "Unpaid"],
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 3, 
    },
    {
      id: "workLocation",
      text: "What is the format of the opportunity?",
      type: "select",
      options: ["On-site", "Remote", "Hybrid"],
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 3, 
    },
    {
      id: "applicants",
      text: "What is the level of education?",
      type: "select",
      options: ["High School / College", "High School", "College"],
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 3, 
    },
    {
      id: "timeFrame",
      text: "What is the opportunity timeframe?",
      type: "select",
      options: ["One Week", "Two Weeks", "Three Weeks"],
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 3, 
    },
  
    // Page 4
    {
      id: "learnMore",
      text: "Where would you like users to learn more about this opportunity?",
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 4, 
    },
    {
      id: "apply",
      text: `Where can students ${organizationData.organizationType === "Volunteering" ? "volunteer" : "apply"} for this opportunity?`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: true,
      page: 4, 
    },
    {
      id: "organizationLogo",
      text: "Upload a logo that embodies your opportunity! (optional)",
      type: "file",
      accept: ".jpg",
      includers: ["Job", "Internship", "Shadowing", "Volunteering", ""],
      required: false,
      page: 4, 
    },
  ];

  // fix this later
  useEffect(()=>{
    if(Object.values(organizationData).filter((data)=>(data !== '')).length === Object.values(organizationData).length){
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
  };

  const renderPage = () => {
    switch(currentOpportunityPage){
      case 1:
        return <OpportunityType/>;
      case 2:
        return <ApplicantInfo/>;
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
    <Toaster
    position="bottom-right"
    reverseOrder={false}
    />
    <div>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
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
        }}> 
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Opportunity Modal"
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
        >
          
          <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Workplace Opportunity <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Be the ember that lights a fire in young minds.</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
          <ProgressBar numOfSections={5} currentPage={currentOpportunityPage} setCurrentPage={setCurrentOpportuntityPage} showLast={showLast}/>
          </header>
          <main style={{paddingTop:"10px"}}>
          <form style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "750px"}}>
            {renderPage()}
          </form>
          </main>
          <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
            <button onClick={
              ()=>setMakeChangesVisibility(true)
              } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Cancel</button>
            {currentOpportunityPage === 5 && <button onClick={saveOpportunityData} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Save Changes</button>}
          </footer>
        </Modal>
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
    <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>We need some general information first.</h2>
    <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
    <main style={{ display: "flex", alignItems: "center", justifyContent: "space-around", paddingTop: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {questionsForPage.map((question) => (
          <label key={question.id} htmlFor={question.id}>
            {question.text}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "50%", gap: "30px" }}>
        {questionsForPage.map((question) => {
          if (question.type === "select") {
            return (
              <select
                key={question.id}
                id={question.id}
                name={question.id}
                value={organizationData[question.id]}
                onChange={handleChange}
              >
                {question.options.map((option) => (
                  <option key={option} value={option === "Select Type" ? "" : option}>
                    {option}
                  </option>
                ))}
              </select>
            );
          } else if (question.type === "text") {
            return (
              <input
                key={question.id}
                id={question.id}
                name={question.id}
                value={organizationData[question.id] ?? ''}
                onChange={handleChange}
                type="text"
                maxLength={question.maxLength}
              />
            );
          }
        })}
      </div>
    </main>
    </>
  )
}

function ApplicantInfo(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(OpportunityContext);
  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 2 && question.includers.includes(organizationData.organizationType)));

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>Explain what you need from your applicants.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center"}}>
            {questionsForPage
              .filter(
                (question) =>
                  (question.id === "applicantFieldOfWork" && !question.includers.includes(question.id)) ||
                  (question.id === "applicantPosition"  && !question.includers.includes(question.id))
              )
              .map((question) => (
                <div key={question.id} style={{ flex: 1, marginRight: "10px" }}>
                  {question.required && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", justifyContent: "center" }}>
                      <label htmlFor={question.id}>{question.text}</label>
                      <input
                        id={question.id}
                        name={question.id}
                        value={organizationData[question.id]}
                        onChange={handleChange}
                        type="text"
                        maxLength={question.maxLength}
                        placeholder={question.placeholder}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>

          {questionsForPage
            .filter((question) => question.id === "applicantExpectations")
            .map((question) => (
              <div key={question.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <label htmlFor={question.id}>{question.text}</label>
                <textarea
                  className="applicantExpectations"
                  id={question.id}
                  name={question.id}
                  value={organizationData[question.id]}
                  onChange={handleChange}
                  maxLength={question.maxLength}
                  placeholder={question.placeholder}
                ></textarea>
              </div>
            ))}
        </div>
    </main>
    </>
  )
}

function FinalInfo(){
  const { organizationData, setOrganizationData, organizationQuestionsConfig, organizationLogo, setOrganizationLogo } = useContext(OpportunityContext);
  const logoRef = useRef();
  
  const learnMoreAndApplyOptions = [["Messages", <LuMessagesSquare size={20}/>],["Email", <MdEmail size={20}/>],["Website", <CgWebsite size={20}/>]];

  const [learnMoreType, setLearnMoreType] = useState("");
  const [applyType, setApplyType] = useState("");
  const [learnMoreInputVisibility, setLearnMoreInputVisibility] = useState(false);
  const [applyInputVisibility, setApplyInputVisibility] = useState(false);

  useEffect(()=>{
    setApplyType(organizationData.apply.split(": ")[0]);
    setLearnMoreType(organizationData.learnMore.split(": ")[0]);
  },[])

  useEffect(()=>{
    console.log(applyType, learnMoreType)
    setApplyInputVisibility(applyType !== "Messages");
    setLearnMoreInputVisibility(learnMoreType !== "Messages");
  },[applyType,learnMoreType])


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
      [name]: `${name === "learnMore" ? learnMoreType : applyType}: ${value}`,
    });
  };

  const handleOptionClick = (event, optionName, questionId) => {
    event.preventDefault();
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
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>You're almost done. Just a few more details.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* First two questions (link inputs) */}
          <div style={{ display: "flex", gap: "10px", flexDirection: "column", textAlign: "center"}}> 
            {questionsForPage
              .filter(question => question.type === "link")
              .map(question => (
                <div key={question.id}> 
                  <label htmlFor={question.id}>{question.text}</label>
                  <div style={{display: "flex", justifyContent: "center", gap: "25px", paddingTop: "10px"}}>
                  {learnMoreAndApplyOptions.map((option)=>(
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: "100px"}}>
                      <button key={option[0]} style={{padding: "10px"}} className={`btnCircle ${option[0] === (question.id === "learnMore" ? learnMoreType : applyType) ? "selected" : ""}`} onClick={(event) => handleOptionClick(event, option[0], question.id)}>
                        {option[1]}
                      </button>
                      <span>{option[0]}</span>
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
                  {applyInputVisibility && question.id === "apply" &&
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", color: "var(--secondary)"}}>
                    <span style={{fontWeight: "600"}} htmlFor={`${question.id} Input`}>Input your desired {applyType === "Email" ? "email" : "website link"}:</span>
                    <input
                    type={applyType === "Email" ? "email" : "url"} 
                    id={question.id}
                    name={question.id}
                    onChange={handleChange}
                    value={organizationData[question.id].split(": ")[1]}/>
                  </div>}
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
                    <button style={{borderRadius: "50%", boxShadow: "var(--shadowColor)", padding: "15px"}} onClick={(e)=>{
                      logoRef.current.click();
                      e.preventDefault();}}><GrAdd size={30}/></button>
                    <input
                        type="file"
                        id="organizationLogo"
                        name="organizationLogo"
                        onChange={handleFileChange}
                        style={{display: "none"}}
                        ref={logoRef}
                        accept=".jpg"
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

function BasicLogistics(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(OpportunityContext);

  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 3 && question.includers.includes(organizationData.organizationType)))

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "10px"}}>Tell us some basic information about your opportunity.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-evenly", alignItems: "center", paddingTop: "10px", gap: "15px" }} className='basicLogistics'>
          {questionsForPage.map((question) => (
            <div key={question.id} className='logisticsQuestion' style={{ flex: "1 1 40%", textAlign: "center"}}> {/* Flexbox for responsiveness */}
              <label htmlFor={question.id}>{question.text}</label>
              <select
                id={question.id}
                name={question.id}
                value={organizationData[question.id]}
                onChange={handleChange}
              >
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>You're all set! Here's a preview of your card:</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "10px"}}>
        <OrganizationProfile organizationData={organizationData} location={"opportunity_popup"}/>
      </div>
    </main>
    </>
  )
}