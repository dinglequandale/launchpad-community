import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

function SafetyWarning({isShortened = true}) {
  const [isExpanded, setIsExpanded] = useState(isShortened);

  return(
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#856404',
      position: 'relative',
      maxHeight: (!isExpanded && isShortened) ? "100px" : "none",
      overflow: "hidden",
      transition: "all 0.3s ease-in-out"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <FaExclamationTriangle style={{ marginRight: '10px' }} />
        <h3 style={{ margin: 0, flex: 1 }}>Important Safety Guidelines</h3>
        {isShortened && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#856404',
              padding: '5px'
            }}
          >
            {isExpanded ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
          </button>
        )}
      </div>
      <div style={{
        opacity: (!isExpanded && isShortened) ? 0.7 : 1,
        transition: "opacity 0.3s ease-in-out"
      }}>
        <p>As a high school student using Launchpad, please remember:</p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Always maintain professional communication with adults</li>
          <li>Never share personal contact information outside the platform</li>
          <li>Report any inappropriate behavior immediately</li>
          <li>Keep all interactions focused on academic and career development</li>
          <li>If you feel uncomfortable with any interaction, contact your school administrator</li>
        </ul>
        <p style={{ margin: 0, fontSize: '0.9em', fontWeight: "550" }}>By continuing, you acknowledge these guidelines and agree to follow them.</p>
      </div>
      {!isExpanded && isShortened && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(transparent, #fff3cd)',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  )
}

const highSchoolQuestionsConfig = [
  // Page 1
  {
    id: "userName",
    text: "What's your full name?",
    type: "text",
    placeholder: "E.g. Peffrey Jage",
    page: 1
  },
  {
    id: "userPfpPreview",
    text: "Upload a profile picture:",
    type: "file",
    optional: true,
    page: 1
  },
  {
    id: "areasOfInterest",
    text: "What are you interested in?",
    type: "multi-select",
    options: careerInterests,
    page: 1,
  },
  {
    id: "userResume",
    text: "Attach your resume to show professionals and alumni what you're about:",
    type: "file",
    optional: true,
    page: 1
  },
  {
    id: "linkedinLink",
    optional: true,
    page: 1
  },
  // Page 2
  {
    id: "schoolAttending",
    text: "What school do you go to?",
    type: "select",
    options: highSchools,
    page: 2,
  },
  {
    id: "email",
    optional: true
  },
  {
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 2,
  },
  // {
  //   id: "sectionAttending",
  //   text: "Are you part of the French or International Section?",
  //   type: "select",
  //   optional: true,
  //   options: ["French", "International"].map(option => ({ value: option, label: option })),
  //   page: 2,
  // },

  // Page 3
  {
    id: "collegeDecision",
    text: "Have you decided on a college yet?",
    type: "select",
    options: ["Yes", "No"].map(option => ({ value: option, label: option })),
    page: 3
  },
  {
    id: "collegeInterestsOrDecision",
    text: (collegeChosen) => `${collegeChosen ? "What college will you be attending?" : "What colleges are you interested in attending?"}`,
    type: (collegeChosen) => `${collegeChosen ? "select" : "multi-select"}`,
    options: [], // Will fill this in later from Firebase
    page: 3  
  },
];

export default function HighSchooler({currentPage, isSubmitting, setCanSubmit, schoolInfo}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const getEmail = httpsCallable(getFunctions(), 'getEmail');
  const [loginEmail,setLoginEmail] = useState("");

  const [highSchoolerData, setHighSchoolerData] = useState({
    userAboutMe: '',
    userName: '',
    schoolAttending: schoolInfo.schoolDisplayName,
    schoolId: schoolInfo.schoolId,
    graduationYear: '',
    // sectionAttending: '',
    areasOfInterest: [],
    userSkills: [],
    collegeDecision: '',
    collegeInterestsOrDecision: [],
    userResume: null,
    userResumePreview: "",
    email: "",
    // isPublic: false,
    userType: "High Schooler",
    userPfpPreview: "",
    userPfp: null,
    linkedinLink:'',
  });

  const handleSubmit = async () => {
    
    const loadingToast = toast.loading('Saving your information...');

    try {
      await saveHighSchooler(
        currentUser, 
        highSchoolerData,
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
    if(requiredQuestionsAnswered(highSchoolQuestionsConfig,highSchoolerData)){
      setCanSubmit(true);
    }
  },[highSchoolerData])

  if(isSubmitting){
    handleSubmit();
  }

  const handleChange = (id, label) => {
    setHighSchoolerData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  useEffect(() => {
    const getUserEmail = async () => {
      const result = await getEmail();
      handleChange("email",result.data.email);
    }
    getUserEmail();
  },[]);

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <SafetyWarning isShortened={false}/>
            <BasicUserInfo 
              questionsForPage={highSchoolQuestionsConfig.filter((question)=>(question.page === 1))} 
              setSelectedOptions={setHighSchoolerData} 
              selectedOptions={highSchoolerData} 
              handleChange={handleChange}
            />
          </>
        );
      case 2:
        return (
          <>
            <SafetyWarning isShortened={true}/>
            <SchoolInfo selectedOptions={highSchoolerData} handleChange={handleChange} highSchoolerData={highSchoolerData}/>
          </>
        );
      case 3:
        return (
          <>
            <SafetyWarning isShortened={true}/>
            <HSCollegeInfo selectedOptions={highSchoolerData} handleChange={handleChange} />
          </>
        );
      // case 4:
      //   return <EmailConfirmation selectedOptions={highSchoolerData} handleChange={handleChange} loginEmail={loginEmail}/>
      default:
        return null;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
};
  
const SchoolInfo = ({ selectedOptions, handleChange, highSchoolerData }) => {

  const questionsForPage = highSchoolQuestionsConfig.filter(question => question.page === 2);

  return (
    <div className='onboardingQuestions' style={{width: "500px"}}>
      {questionsForPage.map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(label) => handleChange(question.id, label)}
          type={question.type}
        />
      ))}
    </div>
  );
};

const HSCollegeInfo = ({ selectedOptions, handleChange }) => {
  const questions = highSchoolQuestionsConfig.filter(question => question.page === 3);
  
  const collegeChosen = selectedOptions['collegeDecision'] === "Yes";

  return (
    <div className='onboardingQuestions' style={{width: "500px"}}>
      <OnboardingDropdown
        question={questions[0].text}
        options={questions[0].options}
        selectedOption={selectedOptions['collegeDecision'] || ''}
        onChange={(label) => handleChange('collegeDecision', label)}
        type={questions[0].type}
      />

    <CollegeSearch
        question={questions[1].text(collegeChosen)}
        selectedOption={selectedOptions['collegeInterestsOrDecision']}
        onChange={(label) => handleChange('collegeInterestsOrDecision', label)}
        type={questions[1].type(collegeChosen)}
      />
    </div>
  );
};
