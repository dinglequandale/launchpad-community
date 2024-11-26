import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
    text: "Attach your resume to show Awty professionals and alumni what you're about:",
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
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 2,
  },
  {
    id: "sectionAttending",
    text: "Are you part of the French or International Section?",
    type: "select",
    optional: true,
    options: ["French", "International"].map(option => ({ value: option, label: option })),
    page: 2,
  },

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

export default function HighSchooler({currentPage, isSubmitting, setCanSubmit}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const getEmail = httpsCallable(getFunctions(), 'getEmail');
  const [loginEmail,setLoginEmail] = useState("");
  const getUserEmail = async () => {
    const result = await getEmail();
    setLoginEmail(result.data.email);
  }
  getUserEmail();

  const [highSchoolerData, setHighSchoolerData] = useState({
    userAboutMe: '',
    userName: '',
    schoolAttending: '',
    graduationYear: '',
    sectionAttending: '',
    areasOfInterest: [],
    userSkills: [],
    collegeDecision: '',
    collegeInterestsOrDecision: [],
    userResume: null,
    userResumePreview: "",
    email: loginEmail,
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

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo questionsForPage={highSchoolQuestionsConfig.filter((question)=>(question.page === 1))} setSelectedOptions={setHighSchoolerData} selectedOptions={highSchoolerData} handleChange={handleChange}/>;
      case 2:
        return <SchoolInfo selectedOptions={highSchoolerData} handleChange={handleChange} highSchoolerData={highSchoolerData}/>;
      case 3:
        return <HSCollegeInfo selectedOptions={highSchoolerData} handleChange={handleChange} />;
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
        (question.id === "sectionAttending") ?
        highSchoolerData.schoolAttending === "Awty International School" &&
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(label) => handleChange(question.id, label)}
          type={question.type}
        />
        : <OnboardingDropdown
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
