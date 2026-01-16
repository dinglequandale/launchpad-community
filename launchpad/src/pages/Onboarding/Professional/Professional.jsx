import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../../components/CustomSelect';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveProfessional } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaShieldAlt } from 'react-icons/fa';

// Move getEmail function creation outside component to prevent recreation on every render
const getEmail = httpsCallable(getFunctions(), 'getEmail');

const professionalQuestionsConfig = [
  // Page 1
  {
    id: "userName",
    text: "Enter your full name:",
    placeholder: "E.g. Neil deGrasse Tyson",
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
    id: "schoolAttending",
    text: "What Houston school are you connected to? (e.g. as a parent)",
    type: "select",
    options: highSchools,
    placeholder: "N/A",
    page: 2
  },
  {
    id: "openToCrossSchoolConnections",
    text: "Are you open to having high schoolers from schools other than your affiliated school reach out to you?",
    type: "select",
    options: [
      { value: "yes", label: "Yes, I'm open to connecting with students from any school" },
      { value: "no", label: "No, I prefer to connect only with students from my affiliated school" },
      { value: "not_applicable", label: "Not applicable / No school affiliation" }
    ].map(option => option),
    placeholder: "Select your preference",
    page: 2
  },
  // Page 3
  {
    id: "retiredStatus",
    text: "What is your current professional status?",
    type: "select",
    options: [
      "Currently employed full-time",
      "Currently employed part-time",
      "Self-employed/Entrepreneur",
      "Freelancer/Consultant",
      "Retired but active",
      "Retired and not working",
      "Student pursuing advanced degree",
      "Other"
    ].map(option => ({ value: option, label: option })),
    page: 3,
  },

  // Page 4
  // For currently employed or active professionals
  {
    id: "industryPosition",
    text: "What is your current position or role?",
    type: "text-box",
    placeholder: "E.g. Senior Software Engineer, Marketing Director, Financial Analyst",
    retired: false,
    options: null,
    page: 4,
  },
  {
    id: "companyName",
    text: "Where do you currently work?",
    placeholder: "E.g. ExxonMobil, Self-employed, University of Houston",
    type: "text-box",
    options: null,
    retired: false,
    page: 4
  },
  {
    id: "yearsOfExperience",
    text: "How many years of professional experience do you have?",
    type: "text-box",
    placeholder: "E.g. 15",
    retired: false,
    options: null,
    page: 4,
  },
  // For retired professionals
  {
    id: "industryPosition",
    text: "What was your last position or role?",
    type: "text-box",
    placeholder: "E.g. CEO, Professor, Senior Manager",
    retired: true,
    options: null,
    page: 4,
  },
  {
    id: "companyName",
    text: "Where did you work last?",
    placeholder: "E.g. ExxonMobil, University of Houston, Self-employed",
    type: "text-box",
    options: null,
    retired: true,
    page: 4
  },
  {
    id: "yearsOfExperience",
    text: "How many years of professional experience did you have?",
    placeholder: "E.g. 25",
    retired: true,
    options: null,
    page: 4,
  },
  // Page 5
  {
    id: "networkingLevel",
    text: "Your knowledge and mentorship are valuable resources for students on this platform. Please select the types of support you're willing to provide:",
    type: "multi-select",
    options: [
        "Casual Connections - General networking and introductions",
        "General Inquiries - Answering questions about your field",
        "Short Interviews / Coffee Chats - Brief conversations about careers",
        "Guest Speaking - Speaking at events or classes",
        "Project Support - Helping with specific student projects",
        "Mentorship - Ongoing guidance and support",
        "Workplace Opportunities - Internships, job shadowing, or entry-level positions"
    ].map(option => ({ value: option.split(' - ')[0], label: option })),
    optional: true,
    page: 5
  },
  // Page 6
  {
    id: "professionalEmails",
    text: "Invite Colleagues and Fellow Professionals to Join Launchpad",
    type: "multi-email",
    optional: true,
    page: 6
  },
];

export default function Professional({currentPage, isSubmitting, setCanSubmit, schoolInfo, setUserData}) {

  const {currentUser} = useAuth();

  const [loginEmail,setLoginEmail] = useState("");

  // Initialize from localStorage if available
  const getInitialProfessionalData = () => {
    const saved = localStorage.getItem('tempProfessionalInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userPfp: null, // Files can't be stored in localStorage
          userPfpPreview: parsed.userPfpPreview || null,
        };
      } catch (e) {
        console.error('Error parsing saved professional data:', e);
      }
    }
    return {
      userName: "",
      userPfp: null,
      userPfpPreview: null,
      areasOfInterest: [],
      linkedinLink: "",
      email: "",
      schoolAttending: schoolInfo?.schoolDisplayName || "",
      schoolId: schoolInfo?.schoolId || "",
      openToCrossSchoolConnections: "", // No default - user should choose
      userType: "Professional",
      // Professional status and work details
      retiredStatus: "",
      // Work experience (current or previous based on retired status)
      industryPosition: "",
      companyName: "",
      yearsOfExperience: "",
      // Networking commitment
      networkingLevel: [],
      // Invitations
      professionalEmails: [],
    };
  };

  const [professionalData, setProfessionalData] = useState(getInitialProfessionalData());

  // Helper function to determine if user is retired based on status
  const isRetired = (status) => {
    return status === "Retired but active" || status === "Retired and not working";
  };

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(professionalData);
  }, [professionalData, setUserData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    // Don't save file objects to localStorage, just the data
    const dataToSave = {
      ...professionalData,
      userPfp: null, // Exclude file object
    };
    localStorage.setItem('tempProfessionalInfo', JSON.stringify(dataToSave));
  }, [professionalData]);

  // Fetch user email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const result = await getEmail({ uid: currentUser.uid });
        if (result.data && result.data.email) {
          setProfessionalData(prev => ({
            ...prev,
            email: result.data.email
          }));
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    if (currentUser) {
      fetchUserEmail();
    }
  }, [currentUser]);

  // Check if required questions are answered
  useEffect(() => {
    const canSubmit = requiredQuestionsAnswered(professionalQuestionsConfig, professionalData);
    setCanSubmit(canSubmit);
  }, [professionalData, setCanSubmit]);

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
        return <SchoolAffiliation selectedOptions={professionalData} handleChange={handleChange} />;
      case 3:
        return <RetiredStatus selectedOptions={professionalData} handleChange={handleChange} />;
      case 4:
        return <WorkDetails selectedOptions={professionalData} handleChange={handleChange} />;
      case 5:
        return <ProfessionalInvitationPage selectedOptions={professionalData} handleChange={handleChange} />;
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

const SchoolAffiliation = ({ selectedOptions, handleChange }) => {
  const questionsForPage = professionalQuestionsConfig.filter((question)=>question.page === 2);
  return (
    <div className="form-section">
      <h2 className="page-title">School Affiliation</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            <label className="form-label">
              {question.text}
              {!question.optional && <span className="required">*</span>}
              {question.optional && (
                <div className="onboarding-optional-label-container">
                  <span className="optional-label">(Optional)</span>
                </div>
              )}
            </label>
            <CustomSelect
              options={question.options}
              value={selectedOptions[question.id] || ''}
              onChange={(label) => handleChange(question.id, label)}
              placeholder={question.placeholder || "Select an option"}
              isMulti={false}
              isSearchable={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RetiredStatus = ({ selectedOptions, handleChange }) => {
  const questionsForPage = professionalQuestionsConfig.filter((question)=>question.page === 3);
  return (
    <div className="form-section">
      <h2 className="page-title">Professional Status</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            <label className="form-label">
              {question.text}
              {!question.optional && <span className="required">*</span>}
            </label>
            {question.type === "text-box" ? (
              <input
                type="text"
                value={selectedOptions[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className="form-input"
              />
            ) : (
              <CustomSelect
                options={question.options}
                value={selectedOptions[question.id] || ''}
                onChange={(label) => handleChange(question.id, label)}
                placeholder="Select an option"
                isMulti={false}
                isSearchable={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkDetails = ({selectedOptions, handleChange}) => {
  const isRetired = selectedOptions.retiredStatus === "Retired but active" || selectedOptions.retiredStatus === "Retired and not working";
  const questionsForPage = professionalQuestionsConfig.filter((question)=>(question.page === 4 && question.retired === isRetired));
  return (
    <div className="form-section">
      <h2 className="page-title">{isRetired ? "Previous Work Experience" : "Current Work Experience"}</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            <label className="form-label">
              {question.text}
              {!question.optional && <span className="required">*</span>}
            </label>
            {question.type === 'text-box' ? (
              <input
                type={`${question.id === "yearsOfExperience" ? "number" : "text"}`}
                value={selectedOptions[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="form-input form-shorter-input"
                placeholder={question.placeholder}
              />
            ) : (
              <CustomSelect
                options={question.options}
                value={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
                onChange={(label) => handleChange(question.id, label)}
                placeholder="Select an option"
                isMulti={question.type === 'multi-select'}
                isSearchable={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
  const ConnectionLevel = ({ selectedOptions, setSelectedOptions }) => {
    const questionsForPage = professionalQuestionsConfig.filter((question) => question.page === 5);
    
    const handleOptionChange = (event) => {
      const value = event.target.value;
      setSelectedOptions(prevState => ({
        ...prevState,
        networkingLevel: selectedOptions.networkingLevel.includes(value)
          ? selectedOptions.networkingLevel.filter(option => option !== value)
          : [...selectedOptions.networkingLevel, value]
      }));
    };
  
    return (
        <div className="form-section">
          <h2 className="page-title">Your Commitment Level</h2>
          {/* <div className="parent-notice">
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div className="parent-notice-content">
                <h3>Your knowledge and experiences</h3>
                <p>are invaluable resources to the Awty community.</p>
              </div>
            </div>
          </div> */}
          
          {questionsForPage.map((question) => (
            <div key={question.id} className="form-group">
              <label className="form-label">
                {question.text}
                <div className="onboarding-optional-label-container">
                  <span className="optional-label">(Optional)</span>
                </div>
              </label>
              
              {question.type === 'multi-select' && (
                <div className="contact-sharing-container">
                  {Array.isArray(question.options) && question.options.map((option) => (
                    <div className="radio-option" key={option.value}>
                      <label className="radio-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={selectedOptions.networkingLevel.includes(option.value)}
                          onChange={handleOptionChange}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            accentColor: '#1976d2',
                            margin: '0',
                            cursor: 'pointer'
                          }}
                        />
                        <div className="option-text" style={{ flex: 1, lineHeight: '1.4' }}>
                          <strong>{option.value}:</strong> {option.label.split(' - ')[1] || option.label}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
    );
  };
  

const ProfessionalInvitationPage = ({ selectedOptions, handleChange }) => {
  const [professionalEmails, setProfessionalEmails] = useState(selectedOptions.professionalEmails || []);
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
    const newEmails = [...professionalEmails];
    newEmails[index] = value;
    setProfessionalEmails(newEmails);
    handleChange('professionalEmails', newEmails);
  };

  const addEmailField = () => {
    setProfessionalEmails([...professionalEmails, '']);
    handleChange('professionalEmails', [...professionalEmails, '']);
  };

  const removeEmailField = (index) => {
    const newEmails = professionalEmails.filter((_, i) => i !== index);
    setProfessionalEmails(newEmails);
    handleChange('professionalEmails', newEmails);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  return (
    <div className="form-section">
      <h2 className="page-title">Invite Your Network</h2>
      <div className="onboardingQuestions">
        <div className="parent-notice" style={{ background: '#e8f5e9', border: '1px solid #81c784' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <FaShieldAlt className="parent-notice-icon" style={{ color: '#388e3c' }} />
            <div className="parent-notice-content">
              <h3>Grow the Community</h3>
              <p>
                Help expand the Launchpad network! Invite colleagues and fellow professionals who can mentor students and contribute to the community.
                We'll send them invitation emails when you complete your onboarding.
              </p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Email Addresses
          </label>
          {professionalEmails.length === 0 ? (
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
              Click "Add Email" below to invite colleagues and fellow professionals to join Launchpad
            </div>
          ) : (
            professionalEmails.map((email, index) => (
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
                    padding: '13px',
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
              background: '#388e3c',
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

