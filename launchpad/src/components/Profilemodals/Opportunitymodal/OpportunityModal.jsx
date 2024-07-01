import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./opportunitymodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import { GrAdd } from 'react-icons/gr';


const OpportunityContext = createContext({
  organizationData: {},
  setOrganizationData: () => {},
  currentOpportunityPage: 1,
  setCurrentOpportuntityPage: () => {},
  handleChange: () => {},
  organizationQuestionsConfig: {},
});

export default function OpportunityModal({visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentOpportunityPage, setCurrentOpportuntityPage] = useState(1);
  const [showLast, setShowLast] = useState(false);

  const saveOpportunityData = () => {
    localStorage.setItem("userOpportunityData", JSON.stringify(organizationData));
    onClose();
  }
  

  useEffect(() => {
    const storedOpportunityData = localStorage.getItem("userOpportunityData");
    if (storedOpportunityData !== null) {
        setOrganizationData(JSON.parse(storedOpportunityData));
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

  const [organizationData, setOrganizationData] = useState({
    organizationType: '',
    host: '',
    applicantFieldOfWork: '',
    applicantPosition: '',
    applicantExpectations: '',
    isPaid: 'Unpaid',
    applicants: 'Either One',
    workLocation: 'On-site',
    timeFrame: 'One Week',
    learnMore: '',
    apply: '',
    organizationLogo: null,
    organizationLogoPreview: '',
    applyTextActivation: false,
    learnMoreTextActivation: false,
  });

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
  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Workplace Opportunity Type:",
      type: "select",
      options: ["Select Type", "Shadowing", "Internship", "Job", "Community Service"],
      required: true,
      page: 1, 
    },
    {
      id: "host",
      text: "Host Company / Organization:",
      type: "text",
      maxLength: 40,
      required: true,
      page: 1, 
    },
  
    // Page 2
    {
      id: "applicantFieldOfWork",
      text: `${getApplicantType()} Field of Work`,
      type: "text",
      maxLength: 40,
      placeholder: 'e.g. "finance"',
      required: true,
      page: 2, 
    },
    {
      id: "applicantPosition",
      text: `${getApplicantType()} Position`,
      type: "text",
      maxLength: 40,
      placeholder: 'e.g. "data analytics"',
      required: (orgType) => orgType !== "Community Service",
      page: 2, 
    },
    {
      id: "applicantExpectations",
      text: `${getApplicantType()} Expectations`,
      type: "textarea",
      maxLength: 500,
      placeholder: `Briefly describe the tools and knowledge the ${getApplicantType().toLowerCase()} will need to succeed throughout this ${organizationData.organizationType && organizationData.organizationType.toLowerCase()} opportunity.`,
      required: true,
      page: 2, 
    },
  
    // Page 3
    {
      id: "isPaid",
      text: "Is this opportunity paid or unpaid?",
      type: "select",
      options: ["Paid", "Unpaid"],
      required: true,
      page: 3, 
    },
    {
      id: "workLocation",
      text: "What is the format of the opportunity?",
      type: "select",
      options: ["On-site", "Remote", "Hybrid"],
      required: true,
      page: 3, 
    },
    {
      id: "applicants",
      text: "What is the level of education?",
      type: "select",
      options: ["High School / College", "High School", "College"],
      required: true,
      page: 3, 
    },
    {
      id: "timeFrame",
      text: "What is opportunity timeframe?",
      type: "select",
      options: ["One Week", "Two Weeks", "Three Weeks", ],
      required: true,
      page: 3, 
    },
  
    // Page 4
    {
      id: "learnMore",
      text: "Where would you like users to learn more about this opportunity?",
      type: "link",
      placeholder: "Paste a link here!",
      required: true,
      page: 4, 
    },
    {
      id: "apply",
      text: "Where can students apply for this opportunity?",
      type: "link",
      placeholder: "Paste a link here!",
      required: true,
      page: 4, 
    },
    {
      id: "organizationLogo",
      text: "Upload a logo that embodies your opportunity!",
      type: "file",
      accept: ".jpg",
      required: false,
      page: 4, 
    },
  ];

  useEffect(()=>{
    if(Object.values(organizationData).filter((data)=>(data !== '')).length === Object.values(organizationData).length){
      setShowLast(true)
    }
    else{
      setShowLast(false)
    }
  },[organizationData])

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setOrganizationData({
      ...organizationData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  return (
    <div>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      <OpportunityContext.Provider 
      value={{
        organizationData,
        setOrganizationData, 
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
            {currentOpportunityPage === 1 && <OpportunityType/>}
            {currentOpportunityPage === 2 && <ApplicantInfo/>}
            {currentOpportunityPage === 3 && <BasicLogistics/>}
            {currentOpportunityPage === 4 && <FinalInfo/>}
            {currentOpportunityPage === 5 && <PreviewOppportunityCard/>}
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
                value={organizationData[question.id]}
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
  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 2));

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>Explain what you need from your applicants.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center"}}>
            {questionsForPage
              .filter(
                (question) =>
                  question.id === "applicantFieldOfWork" ||
                  question.id === "applicantPosition"
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
  const { organizationData, setOrganizationData, organizationQuestionsConfig } = useContext(OpportunityContext);
  const logoRef = useRef();
  const [logoPreviewURL, setLogoPreviewUrl] = useState(null);


  // logic to load the preview image when user opens tab
  useEffect(()=>{
    // if(organizationData.learnMoreTextActivation){
    //   setLearnMoreTextActivation(true);
    // }
    // if(organizationData.apply === " "){
    //   setApplyTextActivation(true);
    // }
    if(organizationData.organizationLogo){
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result);
      };
      try{reader.readAsDataURL(organizationData.organizationLogo);}catch{}
      // TODO: what the flip is going on here
    }
  },[])

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];

      // Create a URL for the preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file); // Read the file for preview

      setOrganizationData({
        ...organizationData,
        [name]: file, // Store the File object
      });

      setOrganizationData({
        ...organizationData,
        organizationLogoPreview: logoPreviewURL,
      })
    } else {
      setOrganizationData({
        ...organizationData,
        [name]: value,
      });
    }
  };

  const handleTextClick = (event) => {
    event.preventDefault();
    if(event.target.name==="learnMoreTextActivation"){
      setOrganizationData({ ...organizationData,
        learnMoreTextActivation : !organizationData.learnMoreTextActivation
      })
    }
    else if(event.target.name==="applyTextActivation"){
      setOrganizationData({ ...organizationData,
        applyTextActivation : !organizationData.applyTextActivation
      })
    }
  }


  const questionsForPage = organizationQuestionsConfig.filter((question=>(question.page===4)));

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>You're almost done. Just a few more details.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}> {/* Main container for flexbox */}
          {/* First two questions (link inputs) */}
          <div style={{ display: "flex", gap: "10px", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}> 
            {questionsForPage
              .filter(question => question.type === "link")
              .map(question => (
                <div key={question.id}> 
                  <label htmlFor={question.id}>{question.text}</label>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"}}>
                    <input
                      type={question.type}
                      id={question.id}
                      name={question.id}
                      value={organizationData[question.id]}
                      onChange={handleChange}
                      placeholder={question.placeholder}
                      style={{
                        width: "500px", 
                        backgroundColor: organizationData[`${question.id}TextActivation`] && 'lightgray',
                        opacity: organizationData[`${question.id}TextActivation`] ? 0.7 : 1,
                        borderColor: organizationData[`${question.id}TextActivation`] && "darkgray", 
                        cursor: organizationData[`${question.id}TextActivation`] && "default"
                      }}
                    />
                    <button 
                      className={`btnText ${organizationData[`${question.id}TextActivation`] ? "activated" : ""}`} 
                      name={`${question.id}TextActivation`} 
                      onClick={handleTextClick}
                    >
                      Or by sending a text
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {/* Logo upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}> {/* Wrap logo upload in a flexbox container */}
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
                        onChange={handleChange}
                        style={{display: "none"}}
                        ref={logoRef}
                        accept=".jpg"
                    />
                    {logoPreviewURL && <div style={{display: "flex", flexDirection: "column", position: "absolute", alignItems: "center", justifyContent: "center", right: "-100px"}}>
                      <span style={{color: "var(--secondary)", fontWeight: "bolder"}}>Logo Preview:</span>
                      <img src={logoPreviewURL} alt="Logo" style={{width: "70px", height: "70px", overflow: "hidden", borderRadius: "50%", objectFit: "cover"}}/>
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

  const questionsForPage = organizationQuestionsConfig.filter((question)=>(question.page === 3))

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>Tell us some basic information about your opportunity.</h2>
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