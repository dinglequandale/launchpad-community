import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../../components/CustomSelect';
import { highSchools, careerInterests, graduationYears, CollegeSearch, HighSchoolSearch } from './../Options';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { parentInvitationTemplate } from '../../../utils/parentVerificationTemplates';
import Loading from '../../../components/LoadingAnimation/Loading';
import { BiTrash } from 'react-icons/bi';

// Move getEmail function creation outside component to prevent recreation on every render
const getEmail = httpsCallable(getFunctions(), 'getEmail');

function SafetyWarning({isShortened = true}) {
  const [isExpanded, setIsExpanded] = useState(isShortened);

  return(
    <div className={`safety-notice ${(!isExpanded && isShortened) ? 'collapsed' : ''}`}>
      <div className="safety-notice-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="safety-notice-title">
          <FaShieldAlt className="safety-icon" />
          <h3>Important Safety Guidelines</h3>
        </div>
        {isShortened && (
          <button className="safety-toggle">
            {isExpanded ? <IoIosArrowUp size={18} /> : <IoIosArrowDown size={18} />}
          </button>
        )}
      </div>
      <div className="safety-notice-content">
        <p>As a high school student using Launchpad, please remember:</p>
        <ul>
          <li>Always maintain professional communication with adults</li>
          <li>Never share personal contact information outside the platform</li>
          <li>Report any inappropriate behavior immediately</li>
          <li>Keep all interactions focused on academic and career development</li>
          <li>If you feel uncomfortable with any interaction, contact your school administrator</li>
        </ul>
        <p className="safety-acknowledgment">
          By continuing, you acknowledge these guidelines and agree to follow them.
        </p>
      </div>
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
    text: "Attach your resume (optional):",
    type: "file",
    optional: true,
    page: 1
  },
  {
    id: "linkedinLink",
    text: "LinkedIn Profile (optional)",
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
    text: "What high school do you attend?",
    type: "select",
    options: highSchools,
    page: 2
  },
  {
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 2
  },
  // Page 3
  {
    id: "collegeDecision",
    text: "Have you decided on a college yet?",
    type: "select",
    options: ['Yes', 'No'].map(o => ({ value: o, label: o })),
    page: 3
  },
  {
    id: "collegeInterestsOrDecision",
    text: (collegeChosen) => collegeChosen ? 'What college will you be attending?' : 'What colleges are you interested in?',
    type: (collegeChosen) => collegeChosen ? 'select' : 'multi-select',
    options: [],
    page: 3,
    optional: true
  },
  // Page 4
  {
    id: "parentEmails",
    text: "Invite Parents, Guardians, or Mentors to Join Launchpad",
    type: "multi-email",
    optional: true,
    page: 4
  },
]

export default function HighSchooler({ schoolInfo, currentPage, isSubmitting, setCanSubmit, setUserData }) {

  const tempStudentInfo = localStorage.getItem('tempStudentInfo') ? JSON.parse(localStorage.getItem('tempStudentInfo')) : {};

  // Initialize from localStorage if available, otherwise use tempStudentInfo defaults
  const getInitialHighSchoolerData = () => {
    const saved = localStorage.getItem('tempHighSchoolerInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userPfp: null, // Files can't be stored in localStorage
          userResume: null,
          userPfpPreview: parsed.userPfpPreview || null,
          userResumePreview: parsed.userResumePreview || null,
        };
      } catch (e) {
        console.error('Error parsing saved high schooler data:', e);
      }
    }
    return {
      userName: tempStudentInfo.full_name ?
        tempStudentInfo.full_name.split(', ')[1] + ' ' + tempStudentInfo.full_name.split(', ')[0] : '',
      userPfp: null,
      userPfpPreview: null,
      areasOfInterest: [],
      userResume: null,
      userResumePreview: null,
      linkedinLink: "",
      email: "",
      graduationYear: tempStudentInfo.graduation_year,
      collegeDecision: "",
      collegeInterestsOrDecision: [],
      schoolAttending: "",
      schoolId: "",
      parentEmails: [],
      userType: "High Schooler",
    };
  };

  const [highSchoolerData, setHighSchoolerData] = useState(getInitialHighSchoolerData());

  const { currentUser } = useAuth();

  
  console.log("tempStudentInfo: ", JSON.parse(localStorage.getItem('tempStudentInfo') || '{}'));

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(highSchoolerData);
  }, [highSchoolerData, setUserData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      ...highSchoolerData,
      userPfp: null, // Exclude file objects
      userResume: null,
    };
    localStorage.setItem('tempHighSchoolerInfo', JSON.stringify(dataToSave));
  }, [highSchoolerData]);

  const transformFullName = (name) => {
    if (!name) return '';
    
    const parts = name.split(', ');
    if (parts.length >= 2) {
      return parts[1] + ' ' + parts[0];
    }
    return name;
  };

  const handleChange = (id, label) => {
    setHighSchoolerData(prev => ({
      ...prev,
      [id]: label
    }));
  };

  // Fetch user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const result = await getEmail({ uid: currentUser.uid });
        if (result.data) {
          setHighSchoolerData(prev => ({
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

  const renderPage = () => {
    switch(currentPage) {
      case 1:
        return (
          <div className="form-section">
            <h2 className="page-title">Basic Information</h2>
            <SafetyWarning isShortened={true} />
            <BasicUserInfo 
              selectedOptions={highSchoolerData}
              setSelectedOptions={setHighSchoolerData}
              handleChange={handleChange}
              questionsForPage={highSchoolQuestionsConfig.filter(q => q.page === 1)}
            />
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h2 className="page-title">High School Information</h2>
            <div className="onboardingQuestions">
              <div className="form-group">
                <label className="form-label">
                  What high school do you attend?
                </label>
                <HighSchoolSearch
                  selectedOptions={highSchoolerData}
                  handleChange={handleChange}
                  field="schoolAttending"
                />
              </div>
              <div className="form-group">
                <OnboardingDropdown
                  question={highSchoolQuestionsConfig.find(q => q.id === 'graduationYear')}
                  options={graduationYears}
                  selectedOption={highSchoolerData.graduationYear}
                  onChange={(value) => handleChange('graduationYear', value)}
                  type="select"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h2 className="page-title">College Information</h2>
            <HSCollegeInfo 
              selectedOptions={highSchoolerData}
              handleChange={handleChange}
            />
          </div>
        );
      case 4:
        return (
          <div className="form-section">
            <h2 className="page-title">Invite Your Parent</h2>
            <ParentInvitationPage
              selectedOptions={highSchoolerData}
              handleChange={handleChange}
              currentUser={currentUser}
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const canSubmit = requiredQuestionsAnswered(highSchoolQuestionsConfig, highSchoolerData);
    setCanSubmit(canSubmit);
  }, [highSchoolerData, currentPage, setCanSubmit]);

  return (
    <div className="onboarding-page">
      {renderPage()}
    </div>
  );
}

const SchoolInfo = ({ selectedOptions, handleChange, highSchoolerData }) => {
  return (
    <div className="form-group">
      <label className="form-label">
        School Information
      </label>
      <div className="form-input" style={{ background: '#f9fafb', color: '#6b7280' }}>
        {highSchoolerData.schoolAttending}
      </div>
    </div>
  );
};

const HSCollegeInfo = ({ selectedOptions, handleChange }) => {
  const [collegeChosen, setCollegeChosen] = useState(selectedOptions.collegeDecision === 'Yes');

  const handleCollegeDecisionChange = (value) => {
    setCollegeChosen(value === 'Yes');
    handleChange('collegeDecision', value);
    handleChange('collegeInterestsOrDecision', []);
  };

  return (
    <div className="onboardingQuestions">
      <div className="form-group">
        <label className="form-label">
          Have you decided on a college yet?
        </label>
        <div className="input-group">
          <CustomSelect
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' }
            ]}
            value={selectedOptions.collegeDecision || ''}
            onChange={handleCollegeDecisionChange}
            placeholder="Select an option"
            isMulti={false}
            isSearchable={false}
          />
        </div>
      </div>

      {collegeChosen && (
        <div className="form-group">
          <label className="form-label">
            What college will you be attending?
          </label>
          <CollegeSearch 
            selectedOptions={selectedOptions}
            handleChange={handleChange}
            isMultiSelect={false}
          />
        </div>
      )}

      {!collegeChosen && (
        <div className="form-group">
          <label className="form-label">
            What colleges are you interested in?
          </label>
          <CollegeSearch 
            selectedOptions={selectedOptions}
            handleChange={handleChange}
            isMultiSelect={true}
          />
        </div>
      )}
    </div>
  );
};

const ParentInvitationPage = ({ selectedOptions, handleChange, currentUser }) => {
  const [parentEmails, setParentEmails] = useState(selectedOptions.parentEmails || []);
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
    const newEmails = [...parentEmails];
    newEmails[index] = value;
    setParentEmails(newEmails);
    handleChange('parentEmails', newEmails);
  };

  const addEmailField = () => {
    setParentEmails([...parentEmails, '']);
    handleChange('parentEmails', [...parentEmails, '']);
  };

  const removeEmailField = (index) => {
    const newEmails = parentEmails.filter((_, i) => i !== index);
    setParentEmails(newEmails);
    handleChange('parentEmails', newEmails);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  return (
    <div className="onboardingQuestions">
      <div className="parent-notice" style={{ background: '#e3f2fd', border: '1px solid #90caf9' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <FaShieldAlt className="parent-notice-icon" style={{ color: '#1976d2' }} />
          <div className="parent-notice-content">
            <h3>Invite Parents, Guardians, or Mentors</h3>
            <p>
              Help grow the Launchpad community! Invite parents, guardians, or mentors who are professionals to join and mentor other students.
              We'll send them invitation emails when you complete your onboarding.
            </p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Email Addresses
        </label>
        {parentEmails.length === 0 ? (
          <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
            Click "Add Email" below to invite parents, guardians, or mentors to join Launchpad
          </div>
        ) : (
          parentEmails.map((email, index) => (
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
            background: '#1976d2',
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
  );
};
