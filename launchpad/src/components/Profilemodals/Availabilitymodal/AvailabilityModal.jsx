import { useEffect, useState } from "react";
import Modal from "react-modal";
import MakeChanges from "../../Makechanges/MakeChanges";
import { editUserData } from "../../../services/userProfileServices";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { CgClose } from "react-icons/cg";

export default function AvailabilityModal({visibility, onClose, userData, availabilityData}){

    const [selectedOptions, setSelectedOptions] = useState(availabilityData ?? []);
    console.log("Options:", selectedOptions)
    const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);

    const {currentUser} = useAuth();

    const userType = userData.userType;

    const saveAvailabilityData = async () => {
        await editUserData({networkingLevel: selectedOptions}, currentUser, userData);
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
            text: "Answer occasional questions from students regarding your career fields",
            value: "Casual Connection",
            includers: ["High Schooler", "Alumni", "Professional"]
        },
        { 
            id: "generalInquiries",
            text: "Entertain student inquiries about opportunities you know of within your career field",
            value: "General Inquiries",
            includers: ["Alumni", "Professional"]
        },
        { 
            id: "informationalInterview",
            text: "Occasionally hold short discussions about your career experiences with students or school clubs",
            value: "Short Interview",
            includers: ["Alumni", "Professional"]
        },
        // {
        //     id: "generalAdvice",
        //     text: "Occasional short interviews to suggest extracurriculars that worked for you",
        //     value: "General Advice",
        //     includers: ["High Schooler"]
        // },
        // {
        //     id: "longTermMentorship",
        //     text: "Take them under your wing! Consistently be on top of any questions and offer strong advice.",
        //     value: "Long-Term Mentorship",
        //     includers: ["High Schooler"]
        // },
        {
            id: "projectSupport",
            text: "Support certain student businesses, nonprofits, or fundraisers you identify with",
            value: "Project Support",
            includers: ["Professional"]
        },
        { 
            id: "mockInterview",
            text: "Conduct mock interviews to help Awty alumni entering similar career fields", 
            value: "Mock Interview", 
            includers: ["Professional"] 
        },
        { 
            id: "workplaceOpportunities",
            text: "Offer shadow, internship, job, or volunteer opportunities for Awty students or alumni at your company",
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
                    <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
                    <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Your Commitment <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Connect. Inspire. Empower.</span></h2>
                    <hr style={{borderColor: "var(--secondary)"}}/>
                </header>
                <main style={{width: "850px"}}>
                <div style={{textAlign: "center"}}>
                    <span style={{color: "black", fontSize: "30px", fontWeight: "450", lineHeight: "1.3"}}> {userType !== "Professional" ? "High schoolers" : "High schoolers and college students"} will have the opportunity to connect with you via Launchpad. <br /> <span style={{fontSize: "smaller", fontWeight: "350", color: "var(--secondary)"}}>What are you open to doing for these students?</span></span>
                    <div style={{padding: "2% 5%"}}>
                    <div style={{textAlign: "left", boxShadow: "var(--shadowColor)", padding: "13px 20px", backgroundColor: "var(--neutral)", borderRadius: "15px"}}>
                        <div style={{display: "flex", flexDirection: "column", gap: "25px"}}>
                        {userAvailabilityOptions.map((option)=>(
                        <div style={{fontSize: "larger", lineHeight: ".7", display: "flex"}}>
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
                
                    </div>
                </main>
                <footer style={{bottom: "0px", paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
                    <button onClick={
                        ()=>setMakeChangesVisibility(true)
                        } className="btnUnfilled" style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger"}}>
                        Cancel
                    </button>
                    <button onClick={saveAvailabilityData} type='submit' className="btnSaveChanges" style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white"}}>
                        Save Changes
                    </button>
                </footer>
            </Modal>
        </div>
    )
}