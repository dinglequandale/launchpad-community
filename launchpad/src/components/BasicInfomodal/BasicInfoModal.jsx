import { useState, useEffect } from "react"
import "./basicinfomodal.css"
import Modal from "react-modal"
import MakeChanges from "../Makechanges/MakeChanges";

export default function BasicInfoModal({visibility,onClose,userType}){
    const [basicInfoContent, setBasicInfoContent] = useState({areasOfInterest: "", fieldsOfExpertise: "", dreamColleges: "", acceptedColleges: "", yearsOfExperience: "", industryOfExperience: "", currentPosition: ""});
    const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
    
    const basicInfoQuestionsConfig = [
      {
        id: "areasOfInterest",
        text: "What is are your areas of interest?",
        type: "text",
        userTypeIncluders: ["High Schooler", "Alumni"],
        required: true,
      },
      {
        id: "fieldsOfExpertise",
        text: "What is are your fields of expertise?",
        type: "text",
        userTypeIncluders: ["Professional"],
        required: true,
      },
      {
        id: "dreamColleges",
        text: "What are your dream colleges?",
        type: "text",
        // change this later to an actual searchable list
        options: ["Carnegie", "Princton", "Stanford", "Harvard", "etc..."],
        userTypeIncluders: ["High Schooler"],
        required: false,
      },
    ]

    // later replace with logic tailored to FireStore
    // const checkEmpty = () => ((basicInfoContent.filter((answer) => {answer === ""})).length > 0);
  
    const saveBasicInfo = () => {
      localStorage.setItem("userBasicInfo", JSON.stringify(basicInfoContent));
      onClose();
    }
  
    useEffect(() => {
      const storedBasicInfo = localStorage.getItem("userBasicInfo");
      if (storedBasicInfo) {
        setBasicInfoContent(basicInfoContent);
      }},[visibility])

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

      const handleOnChange = (e) => {
        setBasicInfoContent({...basicInfoContent, [e.target.name] : e.target.value});
      }

    return(
        <div>
        <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Basic Info Modal"
          shouldCloseOnOverlayClick={false} 
          shouldCloseOnEsc={false}
        >
          <header>
            <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "10px", color: "var(--secondary)", lineHeight: "1.2"}}> My Introduction <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Enlighten us with your {userType==="Professional" ? "expertise" : "interests"} and {userType==="Professional" ? "work experience" : userType==="Alumni" ? "accepted colleges" : "dream colleges"}!</span></h2>
            <hr style={{borderColor: "var(--secondary)"}}/>
          </header>
          <main style={{paddingTop: "20px"}}>
            <form style={{width: "750px", display: "flex", gap: "20px", flexDirection: "column"}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="areasOfInterest">What is are your areas of {userType==="Professional" ? "expertise" : "interests"}?</label>
                    <input 
                    type="text"
                    name="areasOfInterest"
                    value={basicInfoContent.areasOfInterest}
                    placeholder="E.g. 'finance, data analytics'"
                    onChange={handleOnChange}/>
                </div>
                {userType !== "Professional" &&
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="colleges">What is are your areas of {userType==="Professional" ? "expertise" : "interests"}?</label>
                    <input 
                    type="text"
                    name="colleges"
                    value={basicInfoContent.colleges}
                    placeholder="E.g. 'Harvard, Yale, ...'"
                    onChange={handleOnChange}
                    />
                </div>}
                {userType === "Professional" && 
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="industryOfExperience"> In what industry have you worked in the longest? </label>
                    <input 
                    type="text"
                    name="industryOfExperience"
                    value={basicInfoContent.industryOfExperience}
                    placeholder=""
                    onChange={handleOnChange}/>
                </div>}
                {userType === "Professional" &&
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="yearsOfExperience"> How many years of experience do have? </label>
                    <input 
                    type="text"
                    name="yearsOfExperience"
                    value={basicInfoContent.yearsOfExperience}
                    placeholder="E.g. '30+', or '48'"
                    onChange={handleOnChange}/>
                </div>}


            </form>
          </main>
          <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
            <button onClick={
              ()=>setMakeChangesVisibility(true)
              } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Cancel</button>
            <button onClick={saveBasicInfo} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Save Changes</button>
          </footer>
        </Modal>
      </div>
    )
}