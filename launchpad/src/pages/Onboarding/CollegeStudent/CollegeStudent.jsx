import React, { useState, useMemo, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';
import { requiredQuestionsAnswered, saveCollegeStudent } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const collegeStudentQuestionsConfig = [
  {
    id: "userName",
    text: "What's your full name?",
    placeholder: "E.g. John Cena",
    type: "text",
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
    text: "What are you're fields of study?",
    type: "multi-select",
    options: careerInterests,
    page: 1,
  },
  {
    id: "userResume",
    text: "Feel free to attach a resume:",
    type: "file",
    optional: true,
    page: 1
  },

  // Page 2
  {
    id: "collegeAttending",
    text: "What college do you go to?",
    type: "select",
    options: [],
    page: 2,
  },
  {
    id: "schoolAttending",
    text: "What high school did you attend?",
    type: "select",
    options: highSchools,
    page: 2,
  },
  {
    id: "graduationYear",
    text: "What year did you graduate high school?",
    type: "select",
    options: graduationYears,
    page: 2,
  },
  {
    id: "sectionAttending",
    text: "Were you part of the French or International Section?",
    type: "select",
    options: ["French", "International"].map(option => ({ value: option, label: option })),
    page: 2,
  },
  {
    id: "networkingLevel",
    text: "Your knowledge and mentorship is a valuable reasource for students on this app.  \
          Please roughly assess your level of commitment:",
    type: "multi-select",
    options: [
        "Casual Connections",
        "General Inquires",
        "Short Interviews / Coffee Chats",
        "Mentorship",
    ].map(option => ({ value: option, label: option })),
    page: 3,
    optional: true,
  },
];


export default function CollegeStudent({currentPage, isSubmitting, setCanSubmit}) {
  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);
  const {currentUser} = useAuth();

  const navigate = useNavigate();

  const [collegeStudentData, setCollegeStudentData] = useState({
    userName: '',
    collegeAttending: '',
    schoolAttending: '',
    graduationYear: '',
    sectionAttending: '',
    areasOfInterest: [],
    networkingLevel: [],
    userResume: null,
    userResumePreview: "",
    userType: "Alumni",
    userPfpPreview: "",
    userPfp: null,
  });

  if(isSubmitting){
    saveCollegeStudent(currentUser, collegeStudentData, navigate("/Home"));
  }

  const handleChange = (id, label) => {
    setCollegeStudentData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  useEffect(()=>{
    if(requiredQuestionsAnswered(collegeStudentQuestionsConfig,collegeStudentData)){
      console.log("Can submit")
      setCanSubmit(true);
    }
  },[collegeStudentData])

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo selectedOptions={collegeStudentData} questionsForPage={collegeStudentQuestionsConfig.filter((question)=>question.page === 1)} setSelectedOptions={setCollegeStudentData} handleChange={handleChange}/>
      case 2:
        return <CollegeInfo 
        selectedOptions={collegeStudentData}
        handleChange={handleChange}
        pageNum={currentPage}
        colleges={cachedColleges}
        onSearchQueryChange={handleSearchQueryChange} />;
      case 3:
        return <ConnectionLevel selectedOptions={collegeStudentData} setSelectedOptions={setCollegeStudentData} />;
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

const CollegeInfo = ({ selectedOptions, handleChange, pageNum, colleges, onSearchQueryChange }) => {
  return (
    <div className='onboardingQuestions'>
      {collegeStudentQuestionsConfig.filter(question => question.page === 2)
                .map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.id === 'collegeAttending' ? colleges : question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(label) => handleChange(question.id, label)}
          type={question.type}
          onSearchQueryChange={question.id === 'collegeAttending' ? onSearchQueryChange : null}
        />
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
        text: "Occasional messages and casual networking regarding your career field",
        value: "Casual Connection",
    },
    { 
        id: "generalInquiries",
        text: "Entertain student inquiries about any opportunities you know of in your field",
        value: "General Inquiries",
    },
    { 
        id: "informationalInterview",
        text: "Interview with the student to discuss your career path and field",
        value: "Informational Interview",
    },
    {
        id: "resumeReview",
        text: "Review student resumes and provide feedback",
        value: "Resume Review",
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
