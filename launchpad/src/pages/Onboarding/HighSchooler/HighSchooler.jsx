import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../../components/CustomSelect';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { parentVerificationInitialTemplate } from '../../../utils/parentVerificationTemplates';

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
    id: "parentEmail",
    text: "Parent/Guardian Email",
    type: "text",
    page: 4
  },
  // Page 5
  {
    id: "parentRequested",
    text: "Parent Verification Requested",
    optional: true,
    page: 5
  },
]

export default function HighSchooler({ schoolInfo, currentPage, isSubmitting, setCanSubmit, setUserData }) {
  
  const tempStudentInfo = (() => {
    const stored = localStorage.getItem('tempStudentInfo');
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to parse tempStudentInfo from localStorage:', error);
      return {};
    }
  })();
  const [highSchoolerData, setHighSchoolerData] = useState({
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
    schoolAttending: schoolInfo?.schoolDisplayName || "",
    schoolId: schoolInfo?.schoolId || "",
    parentEmail: "",
    parentRequested: false,
    parentVerified: false,
    userType: "High Schooler",
  });

  const { currentUser } = useAuth();

  // const tempStudentInfo = JSON.parse(localStorage.getItem('tempStudentInfo') || '{}');

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(highSchoolerData);
  }, [highSchoolerData, setUserData]);

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
              handleChange={handleChange}
              questionsForPage={highSchoolQuestionsConfig.filter(q => q.page === 1)}
            />
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h2 className="page-title">Graduation Information</h2>
            <OnboardingDropdown
              question={highSchoolQuestionsConfig.find(q => q.id === 'graduationYear')}
              options={graduationYears}
              selectedOption={highSchoolerData.graduationYear}
              onChange={(value) => handleChange('graduationYear', value)}
              type="select"
            />
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
            <h2 className="page-title">Parent Verification</h2>
            <ParentEmailPage 
              selectedOptions={highSchoolerData}
              handleChange={handleChange}
              currentUser={currentUser}
              schoolInfo={schoolInfo}
            />
          </div>
        );
      case 5:
        return (
          <div className="form-section">
            <h2 className="page-title">Email Confirmation</h2>
            <EmailConfirmation />
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

const ParentEmailPage = ({ selectedOptions, handleChange, currentUser, schoolInfo }) => {
  const [parentEmail, setParentEmail] = useState(selectedOptions.parentEmail || '');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  const validateParentEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!parentEmail) {
      setError('Parent email is required');
      return false;
    }
    if (!emailRegex.test(parentEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleRequestAccess = async () => {
    if (!validateParentEmail()) return;

    // Validate that we have the required school information
    if (!schoolInfo || !schoolInfo.schoolId) {
      toast.error('School information is missing. Please refresh the page and try again.');
      console.error('Missing school information in handleRequestAccess:', schoolInfo);
      return;
    }

    setIsRequesting(true);
    try {

      const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
      const verificationLinkResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: "verify_account",
        schoolId: schoolInfo.schoolId, // Use schoolInfo prop instead of localStorage
      });

      // Extract the verification link from the result
      const verificationLink = verificationLinkResult.data;

      const sendSESEmail = httpsCallable(getFunctions(), 'sendSESEmail');
      await sendSESEmail({
        recipient: [parentEmail],
        subject: "Verify Your Student's Launchpad Account",
        htmlTemplate: parentVerificationInitialTemplate({
          studentName: selectedOptions.userName ? selectedOptions.userName.split(" ")[0] : "",
          parentName: "",
          verificationLink: verificationLink,
        }),
        emailType: "parent_verification"
      });

      setRequestSent(true);
      handleChange('parentEmail', parentEmail);
      handleChange('parentRequested', true);
      toast.success('Parent verification email sent successfully!');
    } catch (error) {
      console.error('Error sending parent verification email:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="onboardingQuestions">
      <div className="parent-notice">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <FaExclamationTriangle className="parent-notice-icon" />
          <div className="parent-notice-content">
            <h3>Parent/Guardian Verification Required</h3>
            <p>
              As a high school student, we require parent/guardian verification to ensure your safety and compliance with our platform guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Parent/Guardian Email Address
        </label>
        <div className="input-group">
          <input
            type="email"
            className="form-input form-shorter-input"
            placeholder="Enter parent/guardian email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            onBlur={validateParentEmail}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <button
        className={`request-btn ${requestSent ? 'success' : ''}`}
        onClick={handleRequestAccess}
        disabled={isRequesting || requestSent}
      >
        {isRequesting ? (
          <>
            <div className="spinner"></div>
            Sending Request...
          </>
        ) : requestSent ? (
          'Request Sent Successfully!'
        ) : (
          'Send Verification Request'
        )}
      </button>

      {requestSent && (
        <div className="success-message">
          ✓ Verification email sent to {parentEmail}
        </div>
      )}
    </div>
  );
};
