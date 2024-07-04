import { useState, useEffect } from "react"
import "./basicinfomodal.css"
import Modal from "react-modal"
import MakeChanges from "../Makechanges/MakeChanges";
import toast, { Toaster } from "react-hot-toast";

export default function BasicInfoModal({visibility,onClose,userType}){
    const [basicInfoContent, setBasicInfoContent] = useState({areasOfInterest: "", fieldsOfExpertise: "", dreamColleges: "", acceptedColleges: "", collegeAttending: "", yearsOfExperience: "", industryOfExperience: "", industryPosition: ""});
    const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
    const basicInfoQuestionsConfig = [
      {
        id: "areasOfInterest",
        text: "What is are your areas of interest?",
        type: "text",
        userTypeIncluders: ["High Schooler", "Alumni"],
        required: true,
        placeholder: "E.g. 'finance, data analytics'",
      },
      {
        id: "fieldsOfExpertise",
        text: "What is are your fields of expertise?",
        type: "text",
        userTypeIncluders: ["Professional"],
        required: true,
        placeholder: "E.g. 'finance, data analytics'",
      },
      {
        id: "dreamColleges",
        text: "What are your dream colleges?",
        type: "select",
        // change this later to an actual searchable list
        options: ["Select Colleges", "Carnegie", "Princton", "Stanford", "Harvard", "etc..."],
        userTypeIncluders: ["High Schooler"],
        required: true,
      },
      {
        id: "acceptedColleges",
        text: "What colleges have you been accepted into?",
        type: "select",
        // change this later to an actual searchable list
        options: ["Select Colleges", "Carnegie", "Princton", "Stanford", "Harvard", "etc..."],
        userTypeIncluders: ["High Schooler", "Alumni"],
        required: false,
      },
      {
        id: "collegeAttending",
        text: "What college are you attending?",
        type: "select",
        // change this later to an actual searchable list
        options: ["Select College", "Carnegie", "Princton", "Stanford", "Harvard", "etc..."],
        userTypeIncluders: ["Alumni"],
        required: true,
      },
      {
        id: "industryOfExperience",
        text: "Primary industry of work:",
        type: "text",
        // change this later to an actual searchable list
        userTypeIncluders: ["Professional"],
        required: true,
        placeholder: "",
      },
      {
        id: "yearsOfExperience",
        text: "Years of experience:",
        type: "number",
        placeholder: "E.g. '40'",
        // change this later to an actual searchable list
        userTypeIncluders: ["Professional"],
        required: true,
      },
      {
        id: "industryPosition",
        text: "What is/was your highest position?",
        type: "text",
        placeholder: "",
        // change this later to an actual searchable list
        userTypeIncluders: ["Professional"],
        required: true,
      },
    ]

    useEffect(() => {
      const storedBasicInfo = JSON.parse(localStorage.getItem("userBasicInfo"));
      console.log(storedBasicInfo)
      if (storedBasicInfo) {
        setBasicInfoContent(storedBasicInfo);
      }},[visibility]);

    const questionsForUser = basicInfoQuestionsConfig.filter((question) => question.userTypeIncluders.includes(userType));

    const isEmpty = () => {
      return (questionsForUser.filter((question)=>(question.required && (basicInfoContent[question.id] === "")))).length > 0;
    }
    const saveBasicInfo = () => {
      if(!isEmpty()){
        const filteredBasicInfo = Object.entries(basicInfoContent).reduce((acc, [key, value]) => {
          if (value !== "") {  // Filter out empty values
            acc[key] = value; 
          }
          return acc;
        }, {});
        console.log(filteredBasicInfo)
        localStorage.setItem("userBasicInfo", JSON.stringify(filteredBasicInfo));
        onClose();
      }
      else{

        toast.error("Please fill out the required questions!")
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

      const handleOnChange = (e) => {
        setBasicInfoContent({...basicInfoContent, [e.target.name] : e.target.value});
      }
      
    return(
        <div>
        <div>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            className: '',
            style: {
              border: '1.2px solid var(--secondary)',
              padding: '16px',
              color: '#713200',
              backgroundColor: "var(--neutral)",
            },
          }}
        />
        </div>
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
            <form style={{width: "800px", display: "flex", gap: "20px", flexDirection: "column"}}>
              {questionsForUser.map((question,index) => (
                  <div key={question.id} style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "5px"}}>
                      <label htmlFor="areasOfInterest">{question.text}</label>
                      {!question.required &&<span style={{color: "var(--secondary)"}}>(optional)</span>}
                    </div>
                    {question.type !== "select" ? 
                    <input 
                    id={question.id}
                    type={question.type}
                    name={question.id}
                    value={basicInfoContent[question.id]}
                    placeholder={question.placeholder}
                    onChange={handleOnChange}
                    style={{width: "284px"}}/> :
                    
                    <select 
                    id={question.id}
                    name={question.id}
                    value={basicInfoContent[question.id]}
                    onChange={handleOnChange}
                    style={{width: "300px"}}>
                      {question.options.map((option) => (
                        <option value={(option === "Select College" || option === "Select Colleges") ? "" : option}>
                          {option}
                        </option>
                      ))}
                    </select>}
                  </div>
              ))}
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