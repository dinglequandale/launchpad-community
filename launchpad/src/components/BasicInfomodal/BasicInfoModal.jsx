import { useState, useEffect, useMemo } from "react"
import "./BasicInfoModal.css"
import Modal from "react-modal"
import MakeChanges from "../Makechanges/MakeChanges";
import toast, { Toaster } from "react-hot-toast";
import OptionalNotice from "../Optionalnotice/OptionalNotice";
import { careerInterests, CollegeSearch } from "../../pages/Onboarding/Options";
import OnboardingDropdown from "../OnboardingDropdown/OnboardingDropdown";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { CgClose } from "react-icons/cg";

export default function BasicInfoModal({visibility,onClose,userType,userData}){

  const {currentUser} = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);


  // Add safety check for userData
  const safeUserData = userData || {};

  const [basicInfoContent, setBasicInfoContent] = useState(
    {
    areasOfInterest: safeUserData.areasOfInterest ?? [],
    // TODO: fix
    collegeInterestsOrDecision: safeUserData.collegeInterestsOrDecision ?? [],
    acceptedColleges: safeUserData.acceptedColleges ?? [],
    collegeAttending: safeUserData.collegeAttending ?? [],
    yearsOfExperience: safeUserData.yearsOfExperience ?? "",
    // industryOfExperience: safeUserData.industryOfExperience ?? "",
    industryPosition: safeUserData.industryPosition ?? "",
    graduationYear: safeUserData.graduationYear ?? "",
    schoolRole: safeUserData.schoolRole ?? "",
    sponsoredClubs: safeUserData.sponsoredClubs ?? "",
  });

  // console.log("userData.collegeInterestsOrDecision", userData.collegeInterestsOrDecision)

  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const basicInfoQuestionsConfig = [
    {
      id: "graduationYear",
      text: "What year do you graduate?",
      type: "number",
      userTypeIncluders: ["High Schooler"],
      required: true,
      placeholder: "E.g. 2026",
    },
    {
      id: "graduationYear",
      text: "What year did you graduate high school?",
      type: "number",
      userTypeIncluders: ["Alumni"],
      required: true,
      placeholder: "E.g. 2026",
    },
    {
      id: "areasOfInterest",
      text: "What are your areas of interest?",
      type: "multi-select",
      userTypeIncluders: ["High Schooler", "Alumni"],
      options: careerInterests,
      required: true,
    },
    {
      id: "areasOfInterest",
      text: "What are your fields of expertise?",
      type: "multi-select",
      options: careerInterests,
      userTypeIncluders: ["Professional", "Staff"],
      required: true,
    },
    {
      id: "collegeInterestsOrDecision",
      text: (() => {
        // Check if user already has a college decision
        const currentValue = safeUserData.collegeInterestsOrDecision;
        if (currentValue && typeof currentValue === 'string' && currentValue.trim() !== '') {
          // User already committed to a college
          return "What college will you attend?";
        } else if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
          // User has college interests
          return "What colleges are you interested in?";
        } else {
          // Default case - check collegeDecision field
          return safeUserData.collegeDecision === "No" ? "What colleges are you interested in?" : "What college will you attend?";
        }
      })(),
      type: (() => {
        // Determine type based on current value and user's decision
        const currentValue = safeUserData.collegeInterestsOrDecision;
        if (currentValue && typeof currentValue === 'string' && currentValue.trim() !== '') {
          // User already committed to a college - make it single select
          return "select";
        } else if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
          // User has college interests - keep as multi-select
          return "multi-select";
        } else {
          // Default case - check collegeDecision field
          return safeUserData.collegeDecision === "No" ? "multi-select" : "select";
        }
      })(),
      options: [],
      userTypeIncluders: ["High Schooler"],
      required: true,
    },
    // {
    //   id: "acceptedColleges",
    //   text: "What colleges have you been accepted into?",
    //   type: "multi-select",
    //   options: [],
    //   userTypeIncluders: ["High Schooler", "Alumni"],
    //   required: false,
    // },
    {
      id: "collegeAttending",
      text: "What college are you attending?",
      type: "select",
      // change this later to an actual searchable list
      options: [],
      userTypeIncluders: ["Alumni"],
      required: true,
    },
    // {
    //   id: "industryOfExperience",
    //   text: "Primary industry of work:",
    //   type: "text",
    //   userTypeIncluders: ["Professional"],
    //   required: true,
    //   placeholder: "",
    // },
    {
      id: "yearsOfExperience",
      text: "Years of experience:",
      type: "number",
      placeholder: "E.g. '40'",
      userTypeIncluders: ["Professional"],
      required: true,
    },
    {
      id: "industryPosition",
      text: "What is your current or most recent position?",
      type: "text",
      placeholder: "",
      userTypeIncluders: ["Professional"],
      required: true,
    },
    {
      id: "schoolRole",
      text: "What is your position at the school?",
      placeholder: "E.g. History Teacher, IT Admin",
      type: "text",
      userTypeIncluders: ["Staff"],
    },
    {
      id: "sponsoredClubs",
      type: "text",
      text: "Sponsored clubs, if any (separate by commas):",
      placeholder: "E.g. Math Club, Environmental Club",
      userTypeIncluders: ["Staff"]
    },
  ]


  // Add safety check for userType
  const safeUserType = userType || "High Schooler"; // Default fallback

  const questionsForUser = basicInfoQuestionsConfig.filter((question) => question.userTypeIncluders.includes(safeUserType));
  
  // Debug logging for college question
  const collegeQuestion = questionsForUser.find(q => q.id === "collegeInterestsOrDecision");
  if (collegeQuestion) {
    console.log("College question config:", {
      text: collegeQuestion.text,
      type: collegeQuestion.type,
      currentValue: safeUserData.collegeInterestsOrDecision,
      collegeDecision: safeUserData.collegeDecision
    });
  }

  const isEmpty = () => {
    return (questionsForUser.filter((question) => {
      if (!question.required) return false;
      
      const value = basicInfoContent[question.id];
      if (question.type === "multi-select") {
        // For multi-select, check if array is empty
        return !Array.isArray(value) || value.length === 0;
      } else {
        // For other types, check if string is empty
        return value === "" || value === null || value === undefined;
      }
    })).length > 0;
  }
  const saveBasicInfo = async () => {
    setIsSubmitting(true);
    if(!isEmpty()){
      const filteredBasicInfo = Object.entries(basicInfoContent).reduce((acc, [key, value]) => {
        console.log(`Desired questions for ${key}, ${value}:`, questionsForUser.filter((question)=>question.id === key))
        if (questionsForUser.filter((question)=>question.id === key).length > 0) {
          // Check if the value is meaningful based on the question type
          const question = questionsForUser.find(q => q.id === key);
          if (question) {
            if (question.type === "multi-select") {
              // For multi-select, check if array has meaningful content
              if (Array.isArray(value) && value.length > 0 && value.some(item => item && item.trim() !== "")) {
                acc[key] = value;
              }
            } else {
              // For other types, check if string is not empty
              if (value !== "" && value !== null && value !== undefined) {
                acc[key] = value;
              }
            }
          }
        }
        return acc;
      }, {});

      console.log("Filtered:", filteredBasicInfo)

      
      const loadingToast = toast.loading('Making your changes...');
  
      try {
        await editUserData(filteredBasicInfo, currentUser, userData);
        toast.success('Changes made successfully!', { id: loadingToast });

        new Promise( res => setTimeout(res, 500) );

        onClose();

      } catch (error) {
          toast.error(`Failed to make changes!`, { id: loadingToast });
          console.error('Error changing skills:', error);
          setIsSubmitting(false);
      }
      onClose();
    }
    else{
      toast.error("Please fill out the required questions!")
    }
    setIsSubmitting(false)
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
    
  const handleDropdownChange = (id, label) => {
    setBasicInfoContent(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  return(
    <>
      {/* <Toaster position="bottom-right" reverseOrder={false} /> */}
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      {visibility && (
        <div className="v0-modal-overlay" onClick={onClose}>
          <div className="v0-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="v0-modal-header">
              <button className="v0-modal-close-btn" onClick={onClose}>
                <CgClose size={20} />
              </button>
              <h2 className="v0-modal-title">My Introduction</h2>
              <p className="v0-modal-subtitle">
                Enlighten us with your {safeUserType==="Professional" ? "expertise" : "interests"} and {safeUserType==="Professional" ? "work experience" : safeUserType==="Alumni" ? "education" : "dream colleges"}!
              </p>
            </div>
            
            <div className="v0-modal-content">
              <form className="v0-modal-form">
                {questionsForUser.map((question, index) => (
                  <div key={question.id} className="v0-form-group">
                    <label className="v0-form-label">
                      {question.text}
                      {question.required && <span className="v0-required-indicator">*</span>}
                    </label>
                    {/* {!question.required && <OptionalNotice/>} */}
                    
                    {(question.type !== "multi-select" && question.type !== "select") ? (
                      <input 
                        id={question.id}
                        type={question.type}
                        name={question.id}
                        value={basicInfoContent[question.id]}
                        placeholder={question.placeholder}
                        onChange={handleOnChange}
                        className="v0-form-input"
                      />
                    ) : question.id !== "collegeInterestsOrDecision" ? (
                      question.id.toLowerCase().includes("college") ? (
                        <CollegeSearch
                          showQuestion={false}
                          question={question.text}
                          selectedOptions={basicInfoContent}
                          handleChange={handleDropdownChange}
                          isMultiSelect={question.type === "multi-select"}
                          field={question.id}
                        />
                      ) : (
                        <>
                          <OnboardingDropdown
                            showQuestion={false}
                            key={question.id}
                            question={question.text}
                            options={question.options}
                            selectedOption={basicInfoContent[question.id] || (question.type === 'multi-select' ? [] : '')}
                            onChange={(label) => handleDropdownChange(question.id, label)}
                            type={question.type}
                          />
                          {question.id === "areasOfInterest" && (
                            <div className="v0-field-suggestion">
                              <p className="v0-field-suggestion-text">
                                Can't find a field of interest? 
                                <a 
                                  href="https://forms.gle/your-google-form-link" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="v0-field-suggestion-link"
                                >
                                  Let us know how to add it here
                                </a>
                              </p>
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      <>
                        <CollegeSearch
                          showQuestion={false}
                          question={""}
                          selectedOptions={basicInfoContent}
                          handleChange={handleDropdownChange}
                          isMultiSelect={question.type === "multi-select"}
                        />
                      </>
                    )}
                  </div>
                ))}
              </form>
            </div>
            
            <div className="v0-modal-footer">
              <button 
                className="v0-btn-secondary" 
                onClick={() => setMakeChangesVisibility(true)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="v0-btn-primary" 
                onClick={saveBasicInfo}
                disabled={isSubmitting}
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