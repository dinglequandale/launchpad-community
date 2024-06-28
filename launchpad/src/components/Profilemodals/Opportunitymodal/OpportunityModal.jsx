import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Modal from 'react-modal';
import "./opportunitymodal.css";
import MakeChanges from '../../Makechanges/MakeChanges';
import OrganizationProfile from '../../Organizationprofile/OrganizationProfile';
import ProgressBar from '../../Progressbar/ProgressBar';
import { GrAdd } from 'react-icons/gr';


const OpportunityContext = createContext({
  opportunityData: {},
  setOpportunityData: () => {},
  currentOpportunityPage: 1,
  setCurrentOpportuntityPage: () => {},
  handleChange: () => {},
  opportunityQuestionsPossibilities: {},
});

export default function OpportunityModal({visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const [currentOpportunityPage, setCurrentOpportuntityPage] = useState(1);
  const [showLast, setShowLast] = useState(false);
  const [opportunityQuestions, setOpportunityQuestions] = useState(null);

  const opportunityQuestionsPossibilities = {"Shadowing": [1], "Intership": [1]};

//   const prevAboutMe =  localStorage.getItem("userAboutMe", "") ? localStorage.getItem("userAboutMe", "") : "";

  // later replace with logic tailored to FireStore

  const clearCache = () => {
    localStorage.setItem("userAboutMe", prevAboutMe);
  }

  const saveOpportunityData = () => {
    localStorage.setItem("userOpportunityData", opportunityData);
    onClose();
  }
  

//   useEffect(() => {
//     const storedOpportunityData = localStorage.getItem("userOpportunityData");
//     if (storedAboutMe || storedAboutMe === "") {
//         setOpportunityData(JSON.parse(storedOpportunityData));;
//     }
//     }, [visibility]);

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
      overflow: "hidden",
    }
  };

  const [opportunityData, setOpportunityData] = useState({
    workplaceOpportunityType: '',
    hostCompany: '',
    internFieldOfWork: '',
    internPosition: '',
    internExpectations: '',
    isPaid: 'Unpaid',
    applicants: 'Either One',
    workLocation: 'On-site',
    timeFrame: 'One Week',
    learnMoreLink: '',
    applyLink: '',
    organizationLogo: null,
  });

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setOpportunityData({
      ...opportunityData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  return (
    <div>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose} clearCache={clearCache}/>
      <OpportunityContext.Provider 
      value={{
        opportunityData,
        setOpportunityData, 
        currentOpportunityPage, 
        setCurrentOpportuntityPage,
        handleChange,
        opportunityQuestionsPossibilities,
        }}> 
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Opportunity Modal"
          shouldCloseOnOverlayClick={false}
        >
          
          <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Workplace Opportunity <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Be the ember that lights a fire in young minds.</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
          <ProgressBar numOfSections={5} currentPage={currentOpportunityPage} setCurrentPage={setCurrentOpportuntityPage} showLast={showLast}/>
          </header>
          <main style={{paddingTop:"10px"}}>
          <form onSubmit={saveOpportunityData} style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "750px"}}>
            {currentOpportunityPage === 1 && <OpportunityType/>}
            {currentOpportunityPage === 2 && <InternInfo/>}
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
  const { opportunityData, handleChange, opportunityQuestionsPossibilities } = useContext(OpportunityContext);

  return(
    <>
    <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>We need some general information first.</h2>
    <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
    <main style={{display: "flex", alignItems: "center", justifyContent: "space-around", paddingTop: "1rem"}}>
      <div style={{display: "flex", flexDirection: "column", gap: "30px"}}>
        <label htmlFor="workplaceOpportunityType">Workplace Opportunity Type:</label>
        <label htmlFor="hostCompany">Host Company / Organization:</label>
      </div>
      <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", width: "50%", gap: "30px"}}>
        <select
            id="workplaceOpportunityType"
            name="workplaceOpportunityType"
            value={opportunityData.workplaceOpportunityType}
            onChange={handleChange}
        >
            <option value="">Select Type</option>
            <option value="Shadowing">Shadowing</option>
            <option value="Internship">Internship</option>
            <option value="Community Service">Community Service</option>
        </select>
        <input
            id="hostCompany"
            name="hostCompany"
            value={opportunityData.hostCompany}
            onChange={handleChange}
            type='text'
            maxLength={40}
        />
      </div>
    </main>
    </>
  )
}

function InternInfo(){
  const { opportunityData, handleChange, opportunityQuestionsPossibilities } = useContext(OpportunityContext);

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>Explain what you need from your interns.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{display: "flex", justifyContent: "space-around", paddingBottom: "20px"}}>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px"}}>
              <label htmlFor="internFieldOfWork">Intern Field of Work</label>
              <input
                  id="internFieldOfWork"
                  name="internFieldOfWork"
                  value={opportunityData.internFieldOfWork}
                  onChange={handleChange}
                  type='text'
                  maxLength={40}
                  placeholder='e.g. “finance”'
              />
          </div>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px"}}>
              <label htmlFor="internPosition">Intern Position</label>
              <input
                  id="internPosition"
                  name="internPosition"
                  value={opportunityData.internPosition}
                  onChange={handleChange}
                  type='text'
                  maxLength={40}
                  placeholder='e.g. "data analytics"'
              />
          </div>
      </div>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px"}}>
        <label htmlFor="internExpectations">Intern Expectations</label>
        <textarea 
            className='internExpectations'
            id="internExpectations"
            name="internExpectations"
            value={opportunityData.internExpectations}
            onChange={handleChange}
            maxLength={500}
            placeholder='Briefly describe the tools and knowledge interns will need to succeed throughout internship.'>
        </textarea>
      </div>
    </main>
    </>
  )
}

function FinalInfo(){
  const { opportunityData, setOpportunityData, opportunityQuestionsPossibilities } = useContext(OpportunityContext);
  const logoRef = useRef();
  const [logoPreviewURL, setLogoPreviewUrl] = useState(null);
  const [learnMoreTextActivation, setLearnMoreTextActivation] = useState(false);
  const [applyTextActivation, setApplyTextActivation] = useState(false);

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

      setOpportunityData({
        ...opportunityData,
        [name]: file, // Store the File object
      });
    } else {
      setOpportunityData({
        ...opportunityData,
        [name]: value,
      });
    }
  };

  const handleTextClick = (event) => {
    event.preventDefault();
    if(event.target.name==="learnMoreText"){
      setLearnMoreTextActivation(!learnMoreTextActivation);
    }
    else if(event.target.name === "applyText"){
      setApplyTextActivation(!applyTextActivation);
    }
  }

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>You're almost done. Just a few more details.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div className='questionItem' style={{paddingTop: "15px"}}>
        <div className='questionItem' style={{width: "100%"}}>
          <label htmlFor="learnMoreLink">Where would you like users to learn more about your opportunity?</label>
          <div style={{width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <input
                type="link"
                id="learnMoreLink"
                name="learnMoreLink"
                value={opportunityData.learnMoreLink}
                onChange={handleChange}
                placeholder='Paste a link here!'
                style={{width: "60%", 
                  backgroundColor: learnMoreTextActivation && 'lightgray',
                  opacity: learnMoreTextActivation ? 0.7 : 1,
                  borderColor: learnMoreTextActivation && "darkgray", cursor: learnMoreTextActivation && "default"}}
            />
            <button className={`btnText ${learnMoreTextActivation ? "activated" : ""}`} name="learnMoreText" onClick={handleTextClick}>Or by sending a text</button>
          </div>
        </div>
        <br />
        <div className='questionItem' style={{width: "100%"}}>
          <label htmlFor="applyLink">Where can students apply?</label>
          <div style={{width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <input
                type="link"
                id="applyLink"
                name="applyLink"
                value={opportunityData.applyLink}
                onChange={handleChange}
                placeholder='Paste a link here!'
                style={{width: "60%", 
                  backgroundColor: applyTextActivation && 'lightgray',
                  opacity: applyTextActivation ? 0.7 : 1,
                  borderColor: applyTextActivation && "darkgray", cursor: applyTextActivation && "default"}}
            />
            <button className={`btnText ${applyTextActivation ? "activated" : ""}`} name="applyText" onClick={handleTextClick}>Or by sending a text</button>
          </div>
        </div>
        <br />
        <div className='questionItem'>
          <label htmlFor="organizationLogo">Upload a logo of your organization or an image that embodies your opportunity.</label>
          <button style={{borderRadius: "50%", boxShadow: "var(--shadowColor)", padding: "15px"}} onClick={(e)=>{
            logoRef.current.click();
            e.preventDefault();}}><GrAdd size={30}/></button>
          <input
              type="file"
              id="organizationLogo"
              name="organizationLogo"
              // value={opportunityData.organizationLogo}
              onChange={handleChange}
              style={{display: "none"}}
              ref={logoRef}
              accept=".jpg"
          />
          {logoPreviewURL && <img src={logoPreviewURL} alt="Logo" style={{width: "100px",overflow: "hidden", borderRadius: "50%"}}/>}
        </div>
      </div>
    </main>
    </>
  )
}

function BasicLogistics(){
  const { opportunityData, handleChange, opportunityQuestionsPossibilities } = useContext(OpportunityContext);

  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>Tell us some basic information about your opportunity.</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{display: "flex", flexWrap: "wrap", justifyContent:"space-evenly", alignItems: "center", paddingTop: "10px", gap: "15px"}} className='basicLogistics'>
          <div className='logisticsQuestion'>
              <label htmlFor="isPaid">Is this opportunity paid or unpaid?</label>
              <select
                  id="isPaid"
                  name="isPaid"
                  value={opportunityData.isPaid}
                  onChange={handleChange}>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
              </select>
          </div>
          <div className='logisticsQuestion'>
              <label htmlFor="workLocation">What is the format of the opportunity?</label>
              <select
                  id="workLocation"
                  name="workLocation"
                  value={opportunityData.workLocation}
                  onChange={handleChange}>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
              </select>
          </div>
          <div className='logisticsQuestion'>
              <label htmlFor="applicants">What is the level of education?</label>
              <select
                  id="applicants"
                  name="applicants"
                  value={opportunityData.applicants}
                  onChange={handleChange}>
                      <option value="Either One">Either one</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
              </select>
          </div>
          <div className='logisticsQuestion'>
              <label htmlFor="timeFrame">What is the timeframe of the opportunity?</label>
              <select
                  id="timeFrame"
                  name="timeFrame"
                  value={opportunityData.timeFrame}
                  onChange={handleChange}>
                      <option value="One Week">One Week</option>
                      <option value="Two Weeks">Two Weeks</option>
                      <option value="Three Weeks">Three Weeks</option>
                      <option value="Custom">Custom</option>
              </select>
          </div>
      </div>
    </main>
    </>
  )
}

function PreviewOppportunityCard(){
  const { opportunityData } = useContext(OpportunityContext);
 
  return(
    <>
    <main>
      <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "1.2px", color: "var(--secondary)", paddingBottom: "2px"}}>You're all set! Here's a preview of your card:</h2>
      <hr style={{width: "30%", borderColor: "var(--secondary)", borderWidth: "1.5px"}}/>
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "10px"}}>
        <OrganizationProfile organizationData={opportunityData} location={"opportunity_popup"}/>
      </div>
    </main>
    </>
  )
}