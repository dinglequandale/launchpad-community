import React, { createContext, useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { careerInterests, highSchools } from './../Options';
import { requiredQuestionsAnswered, saveProfessional } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmailConfirmation from '../EmailConfirmation';

const professionalQuestionsConfig = [
  // Page 1
  {
    id: "userName",
    text: "Enter your full name:",
    placeholder: "E.g. Jimmy Fallon",
    type: "text",
    page: 1
  },
  {
    id: "userPfpPreview",
    text: "Upload a profile picture: ",
    type: "file",
    optional: true,
    page: 1
  },
  {
    id: "areasOfInterest",
    text: "What are your main fields of expertise?",
    type: "multi-select",
    options: careerInterests,
    page: 1
  },
  // {
  //   id: "userResume",
  //   text: "Upload your resume for student insight:",
  //   type: "file",
  //   optional: true,
  //   page: 1
  // },
  {
    id: "linkedinLink",
    // text: "Link your LinkedIn profile to verify your professional status:",
    text: "Link your LinkedIn profile:",
    placeholder: "https://www.linkedin.com/in/your-profile",
    type: "text",
    page: 1
  },
  {
    id: "schoolAttending",
    // TODO: change to affiliatedSchools
    text: "What Houston school are you connected to? (e.g. as a parent)",
    type: "select",
    options: highSchools,
    placeholder: "N/A",
    // page: 1
  },
  // Page 2
  {
    id: "retiredStatus",
    text: "Are you currently retired?",
    type: "select",
    optional: true,
    options: ["Yes", "No"].map(option => ({ value: option, label: option })),
    page: 2,
  },

  // Page 3
  // If yes
  {
    id: "industryPosition",
    text: "What was the last position you held?",
    type: "text-box",
    placeholder: "E.g. financial analyst",
    retired: true,
    options: null,
    page: 3,
  },
  {
    id: "companyName",
    text: "Where did you work last?",
    placeholder: "Company name ...",
    type: "text-box",
    options: null,
    retired: true,
    page: 3
  },
  {
    id: "yearsOfExperience",
    text: "How many years of experience do you have?",
    type: "text-box",
    placeholder: "E.g. 10",
    retired: true,
    options: null,
    retired: true,
    page: 3,
  },
  // If no
  {
    id: "industryPosition",
    text: "What is your current position?",
    type: "text-box",
    placeholder: "E.g. financial analyst",
    options: null,
    retired: false,
    page: 3
  },
  {
    id: "companyName",
    text: "Where do you currently work?",
    placeholder: "E.g ExxonMobil",
    type: "text-box",
    retired: false,
    options: null,
    page: 3
  },
  {
    id: "yearsOfExperience",
    text: "How many years of experience do you have?",
    type: "text-box",
    placeholder: "E.g. 10",
    retired: false,
    options: null,
    page: 3,
  },
  {
    id: "email",
    page: 4,
  },
  // Page 4
  // TODO: add descriptions to the options
  {
    id: "networkingLevel",
    text: "You're knowledge and mentorship is a valuable reasource for students on this app.  \
          Roughly assess your level of commitment:",
    type: "multi-select",
    options: [
        "Casual Connections",
        "General Inquires",
        "Short Interviews / Coffee Chats",
        "Guest Speaking",
        "Project Support",
        "Mentorship",
        "Workplace Opportunities"
    ].map(option => ({ value: option, label: option })),
    page: 4
  },
];

export default function Professional({currentPage, isSubmitting, setCanSubmit, schoolInfo}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const getEmail = httpsCallable(getFunctions(), 'getEmail');
  const [loginEmail,setLoginEmail] = useState("");

  const [professionalData, setProfessionalData] = useState({
    retiredStatus: false,
    industryPosition: '',
    companyName: '',
    areasOfInterest: [],
    networkingLevel: [],
    schoolAttending: schoolInfo.schoolDisplayName,
    linkedinLink: "",
    userType: "Professional",
    userPfpPreview: "",
    yearsOfExperience: "",
    userName: "",
    email: loginEmail,
    // isPublic: false,
    // userAboutMe: "",
    userPfp: null,
    schoolId: schoolInfo.schoolId
  });

  const handleSubmit = async () => {
    
    // const loadingToast = toast.loading('Saving your information...');

    try {
      await saveProfessional(
        currentUser, 
        professionalData,
        () => {
          // Success callback
          // toast.success('Information saved successfully!', {
          //   id: loadingToast,
          // });
          toast.success('Information saved successfully!')
          navigate("/Home");
        }
      );
    } catch (error) {
      // Error callback
      toast.error('Failed to save information. Please try again.', {
        id: loadingToast,
      });
    } finally {
      // setIsSubmitting(false);
    }
  };

  useEffect(()=>{
    console.log("STUFF: ", professionalData);
    if(requiredQuestionsAnswered(professionalQuestionsConfig,professionalData)){
      console.log("Can submit");
      setCanSubmit(true);
    }
    // console.log(professionalData);
  },[professionalData])

  if(isSubmitting){
    handleSubmit();
  }

  const handleChange = (id, label) => {
    setProfessionalData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const getUserEmail = async () => {
    const result = await getEmail();
    console.log("result:", result);
    handleChange("email", result.data.email);
  }
  useEffect(()=>{
    getUserEmail();
  },[]);
  

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo selectedOptions={professionalData} questionsForPage={professionalQuestionsConfig.filter((question)=>question.page === 1)} setSelectedOptions={setProfessionalData} handleChange={handleChange}/>
      case 2:
        return <RetiredStatus selectedOptions={professionalData} handleChange={handleChange} />;
      case 3:
        return <WorkDetails selectedOptions={professionalData} handleChange={handleChange} />;
      case 4:
        return <ConnectionLevel selectedOptions={professionalData} setSelectedOptions={setProfessionalData} />;
      // case 5:
      //   return <EmailConfirmation selectedOptions={professionalData} handleChange={handleChange} loginEmail={loginEmail}/>
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page">
      {renderPage()}
    </div>
  );
};

const RetiredStatus = ({ selectedOptions, handleChange }) => {
  const questionsForPage = professionalQuestionsConfig.filter((question)=>question.page === 2);
  return (
    <div className="form-section">
      <h2 className="page-title">Professional Status</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            <OnboardingDropdown
              question={question.text}
              options={question.options}
              selectedOption={(selectedOptions[question.id] ? "Yes" : "No") || ''}
              onChange={(label) => handleChange(question.id, label === "Yes")}
              type={question.type}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkDetails = ({selectedOptions, handleChange}) => {
  const isRetired = selectedOptions.retiredStatus;
  const questionsForPage = professionalQuestionsConfig.filter((question)=>(question.page === 3 && question.retired === isRetired));
  return (
    <div className="form-section">
      <h2 className="page-title">{isRetired ? "Previous Work Experience" : "Current Work Experience"}</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            {question.type === 'text-box' ? (
              <>
                <label className="form-label">{question.text}</label>
                <input
                  type={`${question.id === "yearsOfExperience" ? "number" : "text"}`}
                  value={selectedOptions[question.id] || ''}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  className="form-input form-shorter-input"
                  placeholder={question.placeholder}
                />
              </>
            ) : (
              <OnboardingDropdown
                question={question.text}
                options={question.options}
                selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
                onChange={(label) => handleChange(question.id, label)}
                type={question.type}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
  const ConnectionLevel = ({ selectedOptions, setSelectedOptions }) => {

    const OptionalLabel = () => (
      <span className="optional-label">(Optional)</span>
    );
  
    const handleOptionChange = (event) => {
      const value = event.target.value;
      setSelectedOptions(prevState => ({
        ...prevState,
        networkingLevel: selectedOptions.networkingLevel.includes(value)
          ? selectedOptions.networkingLevel.filter(option => option !== value)
          : [...selectedOptions.networkingLevel, value]
      }));
    };
    
    const availabilityOptionsConfig = [
      { 
          id: "casualConnection",
          text: "Answer occasional messages and questions regarding your career field",
          value: "Casual Connection",
      },
      { 
          id: "generalInquiries",
          text: "Entertain student inquiries about any opportunities you know of in your field",
          value: "General Inquiries",
      },
      { 
          id: "informationalInterview",
          text: "Discuss your career path with high schoolers or undergrads over a short interview",
          value: "Short Interview",
      },
      { 
          id: "workplaceOpportunities",
          text: "Occasionally offer shadowing / internship / volunteer opportunities",
          value: "Workplace Opportunities",
      },
    ];
  
    return (
        <div className="form-section">
          <h2 className="page-title">Your Commitment Level</h2>
          <div className="parent-notice">
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div className="parent-notice-content">
                <h3>Your knowledge and experiences</h3>
                <p>are invaluable resources to the Awty community.</p>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Please roughly assess your commitment:
              <div className="onboarding-optional-label-container">
                <OptionalLabel />
              </div>
            </label>
          </div>
          <div className="contact-sharing-container">
            {availabilityOptionsConfig.map((option) => (
              <div className="radio-option" key={option.id}>
                <label className="radio-label">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedOptions.networkingLevel.includes(option.value)}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="radio-custom"></div>
                  <div className="option-text">
                    <strong>{option.value}:</strong> {option.text}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
    );
  };
  

const FinalTouches = ({ selectedOptions, handleChange }) => {

  const OptionalLabel = () => (
    <span className="optional-label" style={{fontSize: "15px"}}>(Optional)</span>
  );



  return (
    <div className='onboardingQuestions'>
      <div style={{position: "relative"}}>
      <label className='onboardingQuestion' style={{textAlign: "center"}}>Optionally, feel free to write a little blurb about yourself to help students and other professionals understand what you do.</label>
      <div style={{position: "absolute", width: "100%", bottom: "-13px", transform: "translateX(44%)"}}>
            <OptionalLabel />
      </div>
      </div>
      <div style={{margin: "0 auto", marginTop: "10px"}}>
        <textarea 
        style={{width: "460px", height: "160px"}} 
        placeholder='Introduce yourself to prospective students and other professionals' 
        onChange={(e) => handleChange("userAboutMe",e.target.value)} 
        value={selectedOptions["userAboutMe"]}></textarea>
      </div>
    </div>
  );
};

// const EmailConfirmation = ({ selectedOptions, handleChange, loginEmail }) => {
//   const [btnSelected,setBtnSelected] = useState("");
//   return (
//     <div className='onboardingQuestions'>
//       <div className='onboardingQuestion' style={{textAlign: "center"}}>
//         <label>Last thing! Please confirm whether you are comfortable with students contacting you via the following email:</label>
//         <br />
//         <span style={{color: "black", fontSize: "23px"}}>{loginEmail}</span>
//       </div>
//       <div style={{display: "flex", justifyContent: "space-around"}}>
//         <button className={btnSelected === "y" ? "btnSaveChanges" : 'btnUnfilled'} onClick={()=>{
//           setBtnSelected("y");
//           handleChange("email", loginEmail);
//         }} style={{borderRadius: "20px", padding: "9px", fontSize: "17px"}}>Yes, I confirm.</button>
//         <button className={btnSelected === "n" ? "btnSaveChanges" : 'btnUnfilled'} onClick={()=>setBtnSelected("n")} style={{borderRadius: "20px", padding: "9px", fontSize: "17px"}}>No, I prefer another email.</button>
//       </div>
//       {btnSelected === "n" && 
//       <>
//         <label className='onboardingQuestion' style={{textAlign: "center"}}>Input a more suitable email:</label>
//         <input className="onboardingInput" type="email" value={selectedOptions["email"]} onChange={(e) => handleChange("email", e.target.value)}/>
//       </>}
//     </div>
//   );
// };

