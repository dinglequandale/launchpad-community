import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../../components/CustomSelect';
import { highSchools, careerInterests, graduationYears, CollegeSearch, HighSchoolSearch } from './../Options';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaShieldAlt } from 'react-icons/fa';

// Move getEmail function creation outside component to prevent recreation on every render
const getEmail = httpsCallable(getFunctions(), 'getEmail');

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
    text: "What are your fields of study?",
    type: "multi-select",
    options: careerInterests,
    page: 1,
  },
  // {
  //   id: "userResume",
  //   text: "Feel free to attach a resume:",
  //   type: "file",
  //   optional: true,
  //   page: 1
  // },

  {
    id: "linkedinLink",
    text: "Link your Linkedin to make it easy for others to learn about you.",
    optional: true,
    page: 1
  },

  {
    id: "email",
    text: "Email (optional)",
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
    id: "openToCrossSchoolConnections",
    text: "Do you want to connect with students from your school community only, or are you open to connecting with students from other schools as well?",
    type: "select",
    options: [
      { value: "no", label: "My school community only" },
      { value: "yes", label: "I'm open to connecting with students from any school" },
    ],
    placeholder: "Select your preference",
    page: 2,
  },
  // {
  //   id: "sectionAttending",
  //   text: "Were you part of the French or International Section?",
  //   type: "select",
  //   optional: true,
  //   options: ["French", "International"].map(option => ({ value: option, label: o })),
  //   page: 2,
  // },

  // Page 3
  {
    id: "userSkills",
    text: "List out skills that make you standout to professionals:",
    page: 3,
    optional: true,
  },
  // Page 4
  {
    id: "collegeStudentEmails",
    text: "Invite Fellow Students to Join Launchpad",
    type: "multi-email",
    optional: true,
    page: 4
  },
];


export default function CollegeStudent({currentPage, isSubmitting, setCanSubmit, schoolInfo, setUserData}) {

  const {currentUser} = useAuth();

  // Initialize from localStorage if available
  const getInitialCollegeStudentData = () => {
    const saved = localStorage.getItem('tempCollegeStudentInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userPfp: null, // Files can't be stored in localStorage
          userPfpPreview: parsed.userPfpPreview || null,
        };
      } catch (e) {
        console.error('Error parsing saved college student data:', e);
      }
    }
    return {
      userName: "",
      userPfp: null,
      userPfpPreview: null,
      areasOfInterest: [],
      linkedinLink: "",
      email: "",
      // collegeInterestsOrDecision: "",
      schoolAttending: "",
      collegeAttending: "",
      graduationYear: "",
      openToCrossSchoolConnections: "", // No default - user should choose
      userSkills: [],
      collegeStudentEmails: [],
      userType: "College Student",
    };
  };

  const [collegeStudentData, setCollegeStudentData] = useState(getInitialCollegeStudentData());

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(collegeStudentData);
  }, [collegeStudentData, setUserData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      ...collegeStudentData,
      userPfp: null, // Exclude file object
    };
    localStorage.setItem('tempCollegeStudentInfo', JSON.stringify(dataToSave));
  }, [collegeStudentData]);

  // Fetch user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const result = await getEmail({ uid: currentUser.uid });
        if (result.data && result.data.email) {
          setCollegeStudentData(prev => ({
            ...prev,
            email: result.data.email
          }));
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    if (currentUser) {
      getUserEmail();
    }
  }, [currentUser]);

  // Check if all required questions are answered
  useEffect(() => {
    const canSubmit = requiredQuestionsAnswered(collegeStudentQuestionsConfig, collegeStudentData);
    setCanSubmit(canSubmit);
  }, [collegeStudentData, setCanSubmit]);

  // Remove the old handleSubmit function since it's now handled by the parent
  // Remove the old save logic and navigation

  const handleChange = (id, label) => {
    setCollegeStudentData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <BasicUserInfo selectedOptions={collegeStudentData} questionsForPage={collegeStudentQuestionsConfig.filter((question)=>question.page === 1)} setSelectedOptions={setCollegeStudentData} handleChange={handleChange}/>
      case 2:
        return <CollegeInfo
        selectedOptions={collegeStudentData}
        handleChange={handleChange}
        collegeStudentData={collegeStudentData}/>;
      case 3:
        return <UserSkills selectedOptions={collegeStudentData} setSelectedOptions={setCollegeStudentData} />;
      case 4:
        return <CollegeStudentInvitationPage selectedOptions={collegeStudentData} handleChange={handleChange} />;
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

const CollegeInfo = ({ selectedOptions, handleChange, collegeStudentData }) => {
  return (
    <div className="form-section">
      <h2 className="page-title">College Information</h2>
      <div className="onboardingQuestions">
        {collegeStudentQuestionsConfig.filter(question => question.page === 2)
          .map((question) => {
            if (question.id === 'collegeAttending') {
              return (
                <div className="form-group" key={question.id}>
                  <label className="form-label">
                    {question.text}
                    {!question.optional && <span className="required">*</span>}
                  </label>
                  <CollegeSearch
                    selectedOptions={selectedOptions}
                    handleChange={handleChange}
                    field="collegeAttending"
                    isMultiSelect={false}
                  />
                </div>
              );
            } else if (question.id === 'schoolAttending') {
              return (
                <div className="form-group" key={question.id}>
                  <label className="form-label">
                    {question.text}
                    {!question.optional && <span className="required">*</span>}
                  </label>
                  <HighSchoolSearch
                    selectedOptions={selectedOptions}
                    handleChange={handleChange}
                    field="schoolAttending"
                  />
                </div>
              );
            } else {
              return (
                <div className="form-group" key={question.id}>
                  <label className="form-label">
                    {question.text}
                    {!question.optional && <span className="required">*</span>}
                  </label>
                  <OnboardingDropdown
                    question={question.text}
                    options={question.options}
                    selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
                    onChange={(label) => handleChange(question.id, label)}
                    type={question.type}
                    showQuestion={false}
                  />
                </div>
              );
            }
          })}
      </div>
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
        <label className='onboardingQuestion'>Roughly assess your commitment:</label>
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


const UserSkills = ({ selectedOptions, setSelectedOptions }) => {

  const OptionalLabel = () => (
    <span className="optional-label">(Optional)</span>
  );

  const [skillData,setSkillData] = useState(selectedOptions.userSkills.length > 0 ? selectedOptions.userSkills : [{id: 0, skillCategory: "", skillDescription: ""}]);

  useEffect(() => {
    setSelectedOptions({... selectedOptions, userSkills: skillData});
  },[skillData])

  const handleInputChange = (key, value, index) => {
      setSkillData([...skillData.map((skill) => (skill.id === index ? {id: index, ... skillData[index], [key]: value} : skill))]);
    }

  const handleAddSkill = () => {
    setSkillData([...skillData, {id: skillData.length, skillCategory: "", skillDescription: ""}]);
  };

  const handleRemoveSkill = (index) => {
      const updatedSkills = skillData.filter((_, i) => i !== index);
      setSkillData(updatedSkills);
  };

  return (
      <div className="form-section">
        <h2 className="page-title">Your Skills</h2>
        <div className="form-group">
          <label className="form-label">
            Professionals in your school community may have workplace opportunities for you. List some of your skills to show them what you are about:
            <div className="onboarding-optional-label-container">
              <OptionalLabel />
            </div>
          </label>
        </div>

        <div className="skills-container">
          {selectedOptions.userSkills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="skill-header">
                <h3 className="skill-title">Skill {index + 1}</h3>
                {index > 0 && (
                  <button className="action-button remove-button" onClick={() => handleRemoveSkill(index)}>
                    <BiTrash size={18} />
                  </button>
                )}
              </div>
              <div className="form-group" style={{maxWidth: "470px"}}>
                <input
                  type="text"
                  placeholder="Skill"
                  value={skill.skillCategory}
                  onChange={(e) => handleInputChange("skillCategory", e.target.value, index)}
                  className="form-input form-shorter-input"
                />
              </div>
              <div className="form-group" style={{maxWidth: "470px"}}>
                <input
                  type="text"
                  placeholder="Brief Description"
                  value={skill.skillDescription}
                  onChange={(e) => handleInputChange("skillDescription", e.target.value, index)}
                  className="form-input form-shorter-input"
                />
              </div>
            </div>
          ))}
        </div>

        <button className="request-btn skill-add-button" onClick={handleAddSkill}>
          <BiPlus size={18} /> Add Skill
        </button>
      </div>
  );
};

const CollegeStudentInvitationPage = ({ selectedOptions, handleChange }) => {
  const [collegeStudentEmails, setCollegeStudentEmails] = useState(selectedOptions.collegeStudentEmails || []);
  const [errors, setErrors] = useState({});

  const validateEmail = (email, index) => {
    if (!email || email.trim() === '') {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, [index]: 'Please enter a valid email address' });
      return false;
    }
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
    return true;
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...collegeStudentEmails];
    newEmails[index] = value;
    setCollegeStudentEmails(newEmails);
    handleChange('collegeStudentEmails', newEmails);
  };

  const addEmailField = () => {
    setCollegeStudentEmails([...collegeStudentEmails, '']);
    handleChange('collegeStudentEmails', [...collegeStudentEmails, '']);
  };

  const removeEmailField = (index) => {
    const newEmails = collegeStudentEmails.filter((_, i) => i !== index);
    setCollegeStudentEmails(newEmails);
    handleChange('collegeStudentEmails', newEmails);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  return (
    <div className="form-section">
      <h2 className="page-title">Invite Your Network</h2>
      <div className="onboardingQuestions">
        <div className="parent-notice" style={{ background: '#fff3e0', border: '1px solid #ffb74d' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaShieldAlt className="parent-notice-icon" style={{ color: '#f57c00' }} />
            <div className="parent-notice-content">
              <h3>Grow the Community</h3>
              <p>
                Help expand the Launchpad network! Invite fellow students, classmates, and friends to join the community.
                We'll send them invitation emails when you complete your onboarding.
              </p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Email Addresses
          </label>
          {collegeStudentEmails.length === 0 ? (
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
              Click "Add Email" below to invite fellow students to join Launchpad
            </div>
          ) : (
            collegeStudentEmails.map((email, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder={`Email ${index + 1}`}
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    onBlur={() => validateEmail(email, index)}
                    style={{ width: '93%' }}
                  />
                  {errors[index] && (
                    <div className="error-message" style={{ marginTop: '4px' }}>
                      {errors[index]}
                    </div>
                  )}
                  {/* {email && !errors[index] && email.trim() !== '' && (
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#4caf50' }}>
                      ✓ Will send invitation to {email}
                    </div>
                  )} */}
                </div>
                <div style={{alignItems: "center"}}>
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  style={{
                    padding: '8px',
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                >
                  <BiTrash size={18} />
                </button>
              </div>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={addEmailField}
            style={{
              padding: '10px 16px',
              background: '#f57c00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Add Email
          </button>
        </div>
      </div>
    </div>
  );
};

