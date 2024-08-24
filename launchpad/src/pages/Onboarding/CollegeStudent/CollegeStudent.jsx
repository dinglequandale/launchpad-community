import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveCollegeStudent } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
    optional: true,
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

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const [collegeStudentData, setCollegeStudentData] = useState({
    userAboutMe: '',
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

  const handleSubmit = async () => {
    
    const loadingToast = toast.loading('Saving your information...');

    try {
      await saveCollegeStudent(
        currentUser, 
        collegeStudentData,
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

  if(isSubmitting){
    handleSubmit();
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

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo selectedOptions={collegeStudentData} questionsForPage={collegeStudentQuestionsConfig.filter((question)=>question.page === 1)} setSelectedOptions={setCollegeStudentData} handleChange={handleChange}/>
      case 2:
        return <CollegeInfo 
        selectedOptions={collegeStudentData}
        handleChange={handleChange} 
        collegeStudentData={collegeStudentData}/>;
      // case 3:
      //   return <ConnectionLevel selectedOptions={collegeStudentData} setSelectedOptions={setCollegeStudentData} />;
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

const CollegeInfo = ({ selectedOptions, handleChange, collegeStudentData }) => {
  return (
    <div className='onboardingQuestions' style={{width: "500px"}}>
      {collegeStudentQuestionsConfig.filter(question => question.page === 2)
        .map((question) => (
          question.id === 'collegeAttending' ? (
            <CollegeSearch
              key={question.id}
              question={question.text}
              selectedOption={selectedOptions['collegeAttending']}
              onChange={(label) => handleChange('collegeAttending', label)}
              type={question.type}
            />
          ) : question.id === 'sectionAttending' ? (
            (collegeStudentData.schoolAttending === "Awty International School") && <>
            <OnboardingDropdown
              key={question.id} // Add key for unique identification
              question={question.text}
              options={question.options}
              selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
              onChange={(label) => handleChange(question.id, label)}
              type={question.type}
            />
            </>
          )
          : <OnboardingDropdown
          key={question.id} // Add key for unique identification
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
