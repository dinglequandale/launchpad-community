import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./initiativemodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import { GrAdd } from 'react-icons/gr';
import { LuMessagesSquare } from 'react-icons/lu';
import { MdEmail } from 'react-icons/md';
import { CgWebsite } from 'react-icons/cg';


const InitiativeContext = createContext({
  organizationData: {},
  setOrganizationData: () => {},
  currentInitiativePage: 1,
  setCurrentInitiativePage: () => {},
  handleChange: () => {},
  organizationQuestionsConfig: {},
});

export default function InitiativeModal({visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentInitiativePage, setCurrentInitiativePage] = useState(1);
  const [showLast, setShowLast] = useState(false);

  const saveInitiativeData = () => {
    localStorage.setItem("userOrganizationData", JSON.stringify(organizationData));
    onClose();
  }
  

  useEffect(() => {
    const storedInitiativeData = localStorage.getItem("userOrganizationData");
    if (storedInitiativeData !== null) {
        setOrganizationData(JSON.parse(storedInitiativeData));
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
    organizationType: "",
    organizationName: "",
    organizationHostStudent: "",
    organizationMission: "",
    organizationTags: "",
    learnMore: '',
    apply: '',
    organizationLogo: null,
    organizationLogoPreview: '',
  });

  const organizationQuestionsConfig = [
    // Page 1
    {
      id: "organizationType",
      text: "Workplace Initiative Type:",
      type: "select",
      options: ["Select Type", "Club", "Nonprofit"],
      includers: ["Nonprofit", "Club", ""],
      required: true,
      page: 1, 
    },
    {
      id: "organizationName",
      text: "What is the name of your initiative?",
      type: "text",
      maxLength: 40,
      includers: ["Nonprofit", "Club", ""],
      required: true,
      placeholder: "E.g. 'Math Club'",
      page: 1, 
    },
    {
      id: "organizationHostStudent",
      text: "What is your position in the initiative?",
      type: "text",
      maxLength: 40,
      includers: ["Nonprofit", "Club", ""],
      required: true,
      page: 1,
      placeholder: "E.g. 'Founder'",
    },

    // Page 2
    {
      id: "organizationTags",
      text: "People interested in which career fields would benefit the most from participating in your club?",
      type: "text",
      maxLength: 40,
      placeholder: 'e.g. "data analytics, finance"',
      includers: ["Club", ""],
      required: true,
      page: 2, 
    },
    {
      id: "organizationMission",
      text: "Your Mission",
      type: "textarea",
      maxLength: 500,
      placeholder: `Summarize your ${organizationData.organizationType}'s mission and values in a few sentences.`,
      includers: ["Nonprofit", "Club", ""],
      required: true,
      page: 2, 
    },
  
    // Page 3
    {
      id: "learnMore",
      text: `Where would you like users to learn more about your ${organizationData.organizationType.toLowerCase()}?`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Nonprofit", "Club", ""],
      required: true,
      page: 3, 
    },
    {
      id: "apply",
      text: `How can students take part in your ${organizationData.organizationType.toLowerCase()}?`,
      type: "link",
      placeholder: "Paste a link here!",
      includers: ["Nonprofit", "Club", ""],
      required: true,
      page: 3, 
    },
    {
      id: "organizationLogo",
      text: `Upload a logo that embodies your ${organizationData.organizationType.toLowerCase()}! (optional)`,
      type: "file",
      accept: ".jpg",
      includers: ["Nonprofit", "Club", ""],
      required: false,
      page: 3, 
    },
  ];

  // fix this later
  useEffect(()=>{
    if(Object.values(organizationData).filter((data)=>(data !== '')).length = Object.values(organizationData).length){
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
      <InitiativeContext.Provider 
      value={{
        organizationData,
        setOrganizationData, 
        currentInitiativePage, 
        setCurrentInitiativePage,
        handleChange,
        organizationQuestionsConfig,
        }}> 
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Initiative Modal"
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
        >
          
          <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Initiative <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Make your voice heard.</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
          <ProgressBar numOfSections={4} currentPage={currentInitiativePage} setCurrentPage={setCurrentInitiativePage} showLast={showLast}/>
          </header>
          <main style={{paddingTop:"10px"}}>
          <form style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "750px"}}>
            {currentInitiativePage === 1 && <InitiativeType/>}
            {currentInitiativePage === 2 && <InitiativeMission/>}
            {currentInitiativePage === 3 && <FinalInfo/>}
            {currentInitiativePage === 4 && <PreviewOppportunityCard/>}
          </form>
          </main>
          <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
            <button onClick={
              ()=>setMakeChangesVisibility(true)
              } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Cancel</button>
            {currentInitiativePage === 4 && <button onClick={saveInitiativeData} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Save Changes</button>}
          </footer>
        </Modal>
      </InitiativeContext.Provider>
    </div>
  );
};

function InitiativeType(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(InitiativeContext);

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
                placeholder={question.placeholder}
              />
            );
          }
        })}
      </div>
    </main>
    </>
  )
}

function InitiativeMission(){
  const { organizationData, handleChange, organizationQuestionsConfig } = useContext(InitiativeContext);

  const questionsForPage = organizationQuestionsConfig.filter((question) => (question.page === 2 && question.includers.includes(organizationData.organizationType)));

  return(
    <>
    <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>Time to get down to business. What sets you apart?</h2>
    <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
    <main style={{ display: "flex", alignItems: "center", justifyContent: "space-around", paddingTop: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {questionsForPage.map((question) => (
          <div style={{display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", alignItems: "center", textAlign: "center"}}>
            <label htmlFor={question.id}>{question.text}</label>
            {question.type !== "textarea" ? <input
            key={question.id}
            id={question.id}
            name={question.id}
            value={organizationData[question.id] ?? ''}
            onChange={handleChange}
            type={question.type}
            maxLength={question.maxLength}
            style={{width: "450px"}}
            placeholder={question.placeholder}
            /> : 
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
  const { organizationData, setOrganizationData, organizationQuestionsConfig } = useContext(InitiativeContext);
  const logoRef = useRef();
  const [logoPreviewURL, setLogoPreviewUrl] = useState(null);
  
  const learnMoreAndApplyOptions = [["In-Platform Messages", <LuMessagesSquare size={20}/>],["Email", <MdEmail size={20}/>],["Website", <CgWebsite size={20}/>]];
  
  // TODO: temporary way of discerning between email / link
  const [learnMoreType, setLearnMoreType] = useState(organizationData.learnMore.includes("@") ? "Email" : organizationData.learnMore === "Messages" ? "In-Platform Messages" : organizationData.learnMore ? "Website" : "");
  const [applyType, setApplyType] = useState(organizationData.apply.includes("@") ? "Email" : organizationData.apply === "Messages" ? "In-Platform Messages" : organizationData.apply ? "Website" : "");
  
  const [learnMoreInputVisibility, setLearnMoreInputVisibility] = useState((learnMoreType && learnMoreType !== "In-Platform Messages") ?? "");
  const [applyInputVisibility, setApplyInputVisibility] = useState((applyType && applyType !== "In-Platform Messages") ?? "");
  // logic to load the preview image when user opens tab, not working

  // IMPORTANT TODO: files funky with localStorage, need to adjust when transition to database

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
        [name]: file,
      });

      setOrganizationData({
        ...organizationData,
        organizationLogoPreview: logoPreviewURL,
      })
    } else {
      // TODO: different logic for messages, since user doesn't input anything
      setOrganizationData({
        ...organizationData,
        [name]: value,
      });
    }
  };

  const handleOptionClick = (event, optionName, questionId) => {
    event.preventDefault();
    setOrganizationData({...organizationData, [questionId]: ""})
    if(optionName !== "In-Platform Messages" && questionId === "learnMore"){
      setLearnMoreType(optionName);
      setLearnMoreInputVisibility(true);
    }
    else if(optionName !== "In-Platform Messages" && questionId === "apply"){
      setApplyType(optionName);
      setApplyInputVisibility(true);
    }
    else if(optionName === "In-Platform Messages" && questionId === "apply"){
      setApplyInputVisibility(false);
      setApplyType(optionName);
      setOrganizationData({...organizationData, [questionId]: "Messages"});
    }
    else{
      setLearnMoreInputVisibility(false);
      setLearnMoreType(optionName);
      setOrganizationData({...organizationData, [questionId]: "Messages"})
    }
  }

  const questionsForPage = organizationQuestionsConfig.filter((question=>(question.page === 3 && question.includers.includes(organizationData.organizationType))));

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>You're almost done! Just a few more things.</h2>
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
                    value={organizationData[question.id]}
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
                    value={organizationData[question.id]}/>
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

function PreviewOppportunityCard(){
  const { organizationData } = useContext(InitiativeContext);
 
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