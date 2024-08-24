import React, { createContext, useEffect, useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { careerInterests } from './../Options';
import { requiredQuestionsAnswered, saveProfessional } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const professionalQuestionsConfig = [
  // Page 1
  {
    id: "userName",
    text: "Please enter your full name:",
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
  {
    id: "userResume",
    text: "Upload your resume for student insight:",
    type: "file",
    optional: true,
    page: 1
  },
  // Page 2
  {
    id: "retiredStatus",
    text: "Are you currently retired?",
    type: "select",
    options: ["Yes", "No"].map(option => ({ value: option, label: option })),
    page: 2,
  },

  // Page 3
  // If yes
  {
    id: "industryPosition",
    text: "What was the last position you held?",
    type: "text-box",
    placeholder: "E.g. 'financial analyst'",
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
    text: "How many years of experience do you currently have?",
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
    placeholder: "E.g. 'financial analyst'",
    options: null,
    retired: false,
    page: 3
  },
  {
    id: "companyName",
    text: "Where do you currently work?",
    placeholder: "Company name ...",
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
  // Page 4
  // TODO: add descriptions to the options
  {
    id: "networkingLevel",
    text: "You're knowledge and mentorship is a valuable reasource for students on this app.  \
          Please roughly assess your level of commitment:",
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

export default function Professional({currentPage, isSubmitting, setCanSubmit}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const [professionalData, setProfessionalData] = useState({
    retiredStatus: false,
    industryPosition: '',
    companyName: '',
    areasOfInterest: [],
    networkingLevel: [],
    userResume: null,
    userResumePreview: "",
    userType: "Professional",
    userPfpPreview: "",
    yearsOfExperience: "",
    userName: "",
    userAboutMe: "",
    userPfp: null,
  });

  const handleSubmit = async () => {
    
    const loadingToast = toast.loading('Saving your information...');

    try {
      await saveProfessional(
        currentUser, 
        professionalData,
        () => {
          // Success callback
          toast.success('Information saved successfully!', {
            id: loadingToast,
          });
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
    if(requiredQuestionsAnswered(professionalQuestionsConfig,professionalData)){
      console.log("Can submit")
      setCanSubmit(true);
    }
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
      case 5:
        return <FinalTouches selectedOptions={professionalData} handleChange={handleChange}/>
      default:
        return null;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

const RetiredStatus = ({ selectedOptions, handleChange }) => {
  const questionsForPage = professionalQuestionsConfig.filter((question)=>question.page === 2);
  // These questions are identical except for the question asked (past vs present tense)
  return (
    <div className='onboardingQuestions' style={{width: "460px", textAlign: "center"}}>
      {questionsForPage.map((question)=>(<OnboardingDropdown
        question={question.text}
        options={question.options}
        selectedOption={(selectedOptions[question.id] ? "Yes" : "No") || ''}
        onChange={(label) => handleChange(question.id, label === "Yes")}
        type={question.type}
      />))}
    </div>
  );
};

const WorkDetails = ({selectedOptions, handleChange}) => {
  // These questions are identical except for the question asked (past vs present tense)
  const isRetired = selectedOptions.retiredStatus;
  const questionsForPage = professionalQuestionsConfig.filter((question)=>(question.page === 3 && question.retired === isRetired));
  return (
    <div className='onboardingQuestions' style={{width: "460px"}}>
      {questionsForPage.map((question) => (
        question.type === 'text-box' ? (
          <div key={question.id} className="form-group">
            <label className='onboardingQuestion'>{question.text}</label>
            <input
              type={`${question.id === "yearsOfExperience" ? "number" : "text"}`}
              value={selectedOptions[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className='onboardingInput'
              placeholder={question.placeholder}
            />
          </div>
        ) : (
          <OnboardingDropdown
            key={question.id}
            question={question.text}
            options={question.options}
            selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
            onChange={(label) => handleChange(question.id, label)}
            type={question.type}
          />
        )
      ))}
    </div>
    );
  };
  const ConnectionLevel = ({ selectedOptions, setSelectedOptions }) => {

    const OptionalLabel = () => (
      <span className="optional-label" style={{fontSize: "15px"}}>(Optional)</span>
    );
  
    // const questionsForPage = collegeStudentQuestionsConfig.filter((question)=>question.page === 3);
  
    const handleOptionChange = (event) => {
      const value = event.target.value;
      setSelectedOptions(prevState => ({
        ...prevState,
        networkingLevel: selectedOptions.networkingLevel.includes(value)
          ? selectedOptions.networkingLevel.filter(option => option !== value) // Remove if selected
          : [...selectedOptions.networkingLevel, value] // Add if not selected
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
          text: "Discuss your career path with high schoolers or undergrads over a 15-minute interview",
          value: "Short Interview",
      },
      { 
          id: "workplaceOpportunities",
          text: "Open to applicants interested in shadowing / volunteering / job opportunities",
          value: "Workplace",
      },
    ];
  
    return (
        <div className='onboardingQuestions'>
          <div style={{border: "solid 1.5px var(--secondary)", textAlign: "center", padding: "8px 0px", background: "var(--neutral)"}}>
            <span style={{ fontSize: "20px"}}><span style={{fontSize: "25px", fontWeight: "550"}}>Your knowledge and mentorship</span> <br /> is a valuable reasource for students on this app.</span></div>
          <div style={{position: "relative"}}>
          <label className='onboardingQuestion'>Please roughly assess your commitment:</label>
          <div style={{position: "absolute", bottom: "-13px"}}>
              <OptionalLabel />
              </div>
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: "25px"}}>
            {availabilityOptionsConfig.map((option)=>(
            <div style={{fontSize: "larger", lineHeight: ".6", display: "flex"}}>
                <label htmlFor={option.id}>
                <input 
                    type="checkbox"
                    value={option.value}
                    checked={selectedOptions.networkingLevel.includes(option.value)}
                    onChange={(e) => {
                      handleOptionChange(e);
                    }}
                />
                <span style={{fontSize: "20px", fontWeight: "bolder", color: "var(--secondary)"}}>{option.value}:</span> <span style={{fontWeight: "300"}}>{option.text}</span>
                </label>
            </div>))}
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
