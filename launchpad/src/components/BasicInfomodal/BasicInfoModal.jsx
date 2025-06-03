import { useState, useEffect, useMemo } from "react"
import "./basicinfomodal.css"
import Modal from "react-modal"
import MakeChanges from "../Makechanges/MakeChanges";
import toast, { Toaster } from "react-hot-toast";
import OptionalNotice from "../Optionalnotice/OptionalNotice";
import { careerInterests, CollegeSearch, getColleges } from "../../pages/Onboarding/Options";
import OnboardingDropdown from "../OnboardingDropdown/OnboardingDropdown";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { CgClose } from "react-icons/cg";

export default function BasicInfoModal({visibility,onClose,userType,userData}){

  const {currentUser} = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const [basicInfoContent, setBasicInfoContent] = useState(
    {
    areasOfInterest: userData.areasOfInterest ?? [],
    // TODO: fix
    collegeInterestsOrDecision: userData.collegeInterestsOrDecision ?? [],
    acceptedColleges: userData.acceptedColleges ?? [],
    collegeAttending: userData.collegeAttending ?? [],
    yearsOfExperience: userData.yearsOfExperience ?? "",
    // industryOfExperience: userData.industryOfExperience ?? "",
    industryPosition: userData.industryPosition ?? "",
    graduationYear: userData.graduationYear ?? "",
  });

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
      userTypeIncluders: ["Professional"],
      required: true,
    },
    {
      id: "collegeInterestsOrDecision",
      text: userData.collegeDecision === "No" ? "What colleges are you interested in?" : "What college will you attend?",
      type: userData.collegeDecision === "No" ? "multi-select" : "select",
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
  ]

  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);

  const questionsForUser = basicInfoQuestionsConfig.filter((question) => question.userTypeIncluders.includes(userType));

  const isEmpty = () => {
    return (questionsForUser.filter((question)=>(question.required && (basicInfoContent[question.id] === "")))).length > 0;
  }
  const saveBasicInfo = async () => {
    setIsSubmitting(true);
    if(!isEmpty()){
      const filteredBasicInfo = Object.entries(basicInfoContent).reduce((acc, [key, value]) => {
        console.log(`Desired questions for ${key}, ${value}:`, questionsForUser.filter((question)=>question.id === key))
        if (value !== "" && questionsForUser.filter((question)=>question.id === key).length > 0) {  // Filter out empty and unapplicable values values
          acc[key] = value; 
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
      <div>
      <div>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
      </div>
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Basic Info Modal"
      >
        <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
        <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "10px",  lineHeight: "1.2"}}> My Introduction <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Enlighten us with your {userType==="Professional" ? "expertise" : "interests"} and {userType==="Professional" ? "work experience" : userType==="Alumni" ? "education" : "dream colleges"}!</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{paddingTop: "20px"}}>
          <form style={{width: "800px", display: "flex", gap: "20px", flexDirection: "column"}}>
            {questionsForUser.map((question,index) => (
                <div key={question.id} style={{display: "flex", justifyContent: "space-between"}}>
                  <div style={{position: "relative"}}>
                    <label>{question.text}</label>
                    {!question.required && <OptionalNotice/>}
                  </div>
                  {(question.type !== "multi-select" && question.type !== "select") ? 
                  <input 
                  id={question.id}
                  type={question.type}
                  name={question.id}
                  value={basicInfoContent[question.id]}
                  placeholder={question.placeholder}
                  onChange={handleOnChange}
                  style={{width: "42.8%"}}/> 
                  : question.id !== "collegeInterestsOrDecision" ?
                  <div style={{width: "45%"}}><OnboardingDropdown
                    showQuestion={false}
                    key={question.id}
                    question={question.text}
                    options={question.id.toLowerCase().includes("college") ? cachedColleges : question.options}
                    selectedOption={basicInfoContent[question.id] || (question.type === 'multi-select' ? [] : '')}
                    onChange={(label) => handleDropdownChange(question.id, label)}
                    type={question.type}
                    onSearchQueryChange={question.id.toLowerCase().includes("college") ? handleSearchQueryChange : null}
                  />
                  </div>
                  :
                  <CollegeSearch
                  showQuestion={false}
                  question={""}
                  selectedOption={basicInfoContent['collegeInterestsOrDecision']}
                  onChange={(label) => handleDropdownChange('collegeInterestsOrDecision', label)}
                  type={"multi-select"}
                />
                  }
                </div>
            ))}
          </form>
        </main>
        <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button disabled={isSubmitting} onClick={
            ()=>setMakeChangesVisibility(true)
            } className="btnUnfilled" style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Cancel</button>
          <button disabled={isSubmitting} onClick={saveBasicInfo} className="btnSaveChanges" type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Save Changes</button>
        </footer>
      </Modal>
    </div>
  )
}