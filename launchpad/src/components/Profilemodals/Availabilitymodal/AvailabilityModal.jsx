import { useEffect, useState } from "react";
import Modal from "react-modal";
import MakeChanges from "../../Makechanges/MakeChanges";

export default function AvailabilityModal({visibility, onClose, userType}){

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);

    useEffect(()=>{
        const storedAvailabilityData = localStorage.getItem("userAvailabilityData");
        if(storedAvailabilityData !== null){
            setSelectedOptions(JSON.parse(storedAvailabilityData));
        }
    }, [])

    const saveAvailabilityData = () => {
        localStorage.setItem("userAvailabilityData", JSON.stringify(selectedOptions));
        onClose();
    }

    const handleOptionChange = (event) => {
      const value = event.target.value;
      setSelectedOptions(prevOptions => 
        prevOptions.includes(value)
          ? prevOptions.filter(option => option !== value) // Remove if selected
          : [...prevOptions, value] // Add if not selected
      );
    };

    const availabilityOptionsConfig = [
        { 
            id: "casualConnection",
            text: "Occasional messages and casual networking regarding your career field",
            value: "Casual Connection",
            includers: ["High Schooler", "Alumni", "Professional"]
        },
        { 
            id: "generalInquiries",
            text: "Entertain student inquiries about any opportunities you know of in your field",
            value: "General Inquiries",
            includers: ["Alumni", "Professional"]
        },
        { 
            id: "informationalInterview",
            text: "30-minute informational interview to discuss your career path and field",
            value: "Informational Interview",
            includers: ["Alumni", "Professional"]
        },
        {
            id: "generalAdvice",
            text: "Occasional short interviews to suggest extracurriculars that worked for you",
            value: "General Advice",
            includers: ["High Schooler"]
        },
        {
            id: "longTermMentorship",
            text: "Take them under your wing! Consistently be on top of any questions and offer strong advice.",
            value: "Long-Term Mentorship",
            includers: ["High Schooler"]
        },
        {
            id: "resumeReview",
            text: "Review student resumes and provide feedback",
            value: "Resume Review",
            includers: ["Alumni", "Professional"] 
        },
        { 
            id: "mockInterview",
            text: "Conduct a mock interview to help students prepare for job applications", 
            value: "Mock Interview", 
            includers: ["Professional"] 
        },
        { 
            id: "workplaceOpportunities",
            text: "Offering job shadowing, internships, job, or volunteer opportunities to college or high school students at your organization",
            value: "Workplace Opportunities",
            includers: ["Professional"]
        },
      ];
    
    const userAvailabilityOptions = availabilityOptionsConfig.filter((option) => (option.includers.includes(userType)));
    
    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          zIndex: "5",
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "4",
        }
      };
    
    return(
        <div>
            <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
            <Modal
            isOpen={visibility}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Availability Modal"
            >
                <header>
                    <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Commitment <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Connect. Inspire. Empower.</span></h2>
                    <hr style={{borderColor: "var(--secondary)"}}/>
                </header>
                <main style={{width: "850px"}}>
                <div style={{textAlign: "center"}}>
                    <span style={{color: "black", fontSize: "30px", fontWeight: "450", lineHeight: "1.3"}}> In this app, {userType !== "Professional" ? "high schoolers" : "high schoolers and college students"} will have <br />  the opportunity to connect with you. <br /> <span style={{fontSize: "smaller", fontWeight: "600", color: "var(--secondary)"}}>What are you able and open to do for these students?</span></span>
                    <div style={{paddingLeft: "2%", paddingRight: "2%", paddingTop: "5px"}}>
                    <div style={{textAlign: "left", border: "1px solid var(--secondary)", paddingBottom: "20px", paddingLeft: "20px", paddingRight: "20px", backgroundColor: "var(--neutral)", borderRadius: "20px"}}>
                        {userAvailabilityOptions.map((option)=>(
                        <div style={{paddingTop: "12px", fontSize: "larger", lineHeight: ".7"}}>
                            <label htmlFor={option.id}>
                            <input 
                                type="checkbox"
                                value={option.value}
                                checked={selectedOptions.includes(option.value)}
                                onChange={handleOptionChange}
                            />
                            <span style={{fontSize: "22px", fontWeight: "bolder", color: "var(--secondary)"}}>{option.value}:</span> <span style={{fontWeight: "300"}}>{option.text}</span>
                            </label>
                        </div>))}
                    </div>
                    </div>
                
                    </div>
                </main>
                <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
                    <button onClick={
                        ()=>setMakeChangesVisibility(true)
                        } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                        Cancel
                    </button>
                    <button onClick={saveAvailabilityData} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                        Save Changes
                    </button>
                </footer>
            </Modal>
        </div>
    )
}