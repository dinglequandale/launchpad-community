import React, { useState, useMemo, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const highSchoolQuestionsConfig = [
  // Page 1
  {
    id: "userName",
    text: "What's your full name?",
    type: "text",
    placeholder: "E.g. Quandale Dingle",
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
    text: "If you have a resume, feel free to attach it:",
    type: "file",
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
  // Fetch college list from Firebase
  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);
  const [highSchoolerData, setHighSchoolerData] = useState({
    userName: '',
    schoolAttending: '',
    graduationYear: '',
    sectionAttending: '',
    areasOfInterest: [],
    collegeDecision: '',
    collegeInterestsOrDecision: [],
    userResume: null,
    userResumePreview: "",
    userType: "Alumni",
    userPfpPreview: "",
    userPfp: null,
  });

  useEffect(()=>{
    if(requiredQuestionsAnswered(highSchoolQuestionsConfig,highSchoolerData)){
      console.log("Can submit")
      setCanSubmit(true);
    }
  },[highSchoolerData])

  if(isSubmitting){
    saveHighSchooler(currentUser, highSchoolerData, () => {navigate("/Home")});
  }

  const handleChange = (id, label) => {
    setHighSchoolerData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo questionsForPage={highSchoolQuestionsConfig.filter((question)=>(question.page === 1))} setSelectedOptions={setHighSchoolerData} selectedOptions={highSchoolerData} handleChange={handleChange}/>;
      case 2:
        return <SchoolInfo selectedOptions={highSchoolerData} handleChange={handleChange}/>;
      case 3:
        return <HSCollegeInfo selectedOptions={highSchoolerData} handleChange={handleChange} colleges={cachedColleges}
        onSearchQueryChange={handleSearchQueryChange} />;
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
  
const SchoolInfo = ({ selectedOptions, handleChange }) => {

  const questionsForPage = highSchoolQuestionsConfig.filter(question => question.page === 2);

  return (
    <div className='onboardingQuestions'>
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

const HSCollegeInfo = ({ selectedOptions, handleChange, colleges, onSearchQueryChange }) => {
  const questions = highSchoolQuestionsConfig.filter(question => question.page === 3);
  
  const collegeChosen = selectedOptions['collegeDecision'] === "Yes";

  return (
    <div className='onboardingQuestions' style={{width: "460px"}}>
      <OnboardingDropdown
        question={questions[0].text}
        options={questions[0].options}
        selectedOption={selectedOptions['collegeDecision'] || ''}
        onChange={(label) => handleChange('collegeDecision', label)}
        type={questions[0].type}
      />

      <OnboardingDropdown
          question={questions[1].text(collegeChosen)}
          options={colleges}
          selectedOption={selectedOptions['collegeInterestsOrDecision'] || []}
          onChange={(label) => handleChange('collegeInterestsOrDecision', label)}
          type={questions[1].type(collegeChosen)}
          onSearchQueryChange={onSearchQueryChange}
        />
    </div>
  );
};
