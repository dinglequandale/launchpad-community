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
            includers: ["High Schooler", "College Student", "Professional"]
        },
        { 
            id: "generalInquiries",
            text: "Entertain student inquiries about opportunities you know of within your career field",
            value: "General Inquiries",
            includers: ["College Student", "Professional"]
        },
        { 
            id: "informationalInterview",
            text: "Occasionally hold short discussions about your career experiences with students or school clubs",
            value: "Short Interview",
            includers: ["College Student", "Professional"]
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
            text: "Conduct mock interviews to help alumni entering similar career fields", 
            value: "Mock Interview", 
            includers: ["Professional"] 
        },
        { 
            id: "workplaceOpportunities",
            text: "Offer shadow, internship, job, or volunteer opportunities for students or alumni at your company",
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
          maxHeight: "600px",
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "4",
        }
      };
    
    return(
        <>
            <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
            {visibility && (
                <div className="v0-modal-overlay" onClick={onClose}>
                    <div className="v0-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="v0-modal-header">
                            <button className="v0-modal-close-btn" onClick={onClose}>
                                <CgClose size={20} />
                            </button>
                            <h2 className="v0-modal-title">Your Commitment</h2>
                            <p className="v0-modal-subtitle">Connect. Inspire. Empower.</p>
                        </div>
                        
                        <div className="v0-modal-content">
                            <div className="v0-availability-intro">
                                <h3 className="v0-availability-title">
                                    {userType !== "Professional" ? "High schoolers" : "High schoolers and college students"} will have the opportunity to connect with you via Launchpad.
                                </h3>
                                <p className="v0-availability-subtitle">What are you open to doing for these students?</p>
                            </div>
                            
                            <div className="v0-availability-options">
                                {userAvailabilityOptions.map((option) => (
                                    <div key={option.id} className="v0-availability-option">
                                        <label className="v0-checkbox-label">
                                            <input 
                                                type="checkbox"
                                                value={option.value}
                                                checked={selectedOptions.includes(option.value)}
                                                onChange={handleOptionChange}
                                                className="v0-checkbox"
                                            />
                                            <div className="v0-checkbox-content">
                                                <span className="v0-option-title">{option.value}</span>
                                                <span className="v0-option-description">{option.text}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="v0-modal-footer">
                            <button 
                                className="v0-btn-secondary" 
                                onClick={() => setMakeChangesVisibility(true)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="v0-btn-primary" 
                                onClick={saveAvailabilityData}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}