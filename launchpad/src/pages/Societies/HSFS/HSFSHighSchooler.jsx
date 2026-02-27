import React, { useState, useEffect } from 'react';
import CustomSelect from '../../../components/CustomSelect';
import { graduationYears } from '../../Onboarding/Options';
import { HSFS_INDUSTRIES, HSFS_SCHOOLS } from '../../../utils/hsfsConstants';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaShieldAlt } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

const getEmail = httpsCallable(getFunctions(), 'getEmail');

function SafetyWarning({ isShortened = true }) {
  const [isExpanded, setIsExpanded] = useState(isShortened);

  return (
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
        <p>As a high school student using HSFS on Launchpad, please remember:</p>
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
  );
}

const hsfsHighSchoolQuestionsConfig = [
  // Page 1 - Basic Information
  {
    id: "userName",
    text: "What's your full name?",
    type: "text",
    placeholder: "E.g. John Smith",
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
    text: "What area of finance interests you most?",
    type: "multi-select",
    options: HSFS_INDUSTRIES,
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
  // Page 2 - School & Finance Info
  {
    id: "schoolAttending",
    text: "Which high school do you attend?",
    type: "select",
    options: HSFS_SCHOOLS,
    page: 2
  },
  {
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 2
  },
];

export default function HSFSHighSchooler({ currentPage, isSubmitting, setCanSubmit, setUserData }) {
  const { currentUser } = useAuth();

  const getInitialData = () => {
    const saved = localStorage.getItem('tempHSFSHighSchoolerInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userPfp: null,
          userResume: null,
          userPfpPreview: parsed.userPfpPreview || null,
          userResumePreview: parsed.userResumePreview || null,
        };
      } catch (e) {
        console.error('Error parsing saved HSFS high schooler data:', e);
      }
    }
    return {
      userName: "",
      userPfp: null,
      userPfpPreview: null,
      areasOfInterest: [],
      userResume: null,
      userResumePreview: null,
      linkedinLink: "",
      email: "",
      graduationYear: "",
      schoolAttending: "",
      userType: "High Schooler",
    };
  };

  const [highSchoolerData, setHighSchoolerData] = useState(getInitialData());

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(highSchoolerData);
  }, [highSchoolerData, setUserData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      ...highSchoolerData,
      userPfp: null,
      userResume: null,
    };
    localStorage.setItem('tempHSFSHighSchoolerInfo', JSON.stringify(dataToSave));
  }, [highSchoolerData]);

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

  const handleChange = (id, label) => {
    setHighSchoolerData(prev => ({
      ...prev,
      [id]: label
    }));
  };

  useEffect(() => {
    const canSubmit = requiredQuestionsAnswered(hsfsHighSchoolQuestionsConfig, highSchoolerData);
    setCanSubmit(canSubmit);
  }, [highSchoolerData, currentPage, setCanSubmit]);

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="form-section">
            <h2 className="page-title">Basic Information</h2>
            <SafetyWarning isShortened={true} />
            <BasicUserInfo
              selectedOptions={highSchoolerData}
              setSelectedOptions={setHighSchoolerData}
              handleChange={handleChange}
              questionsForPage={hsfsHighSchoolQuestionsConfig.filter(q => q.page === 1)}
            />
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h2 className="page-title">School & Finance Information</h2>
            <div className="onboardingQuestions">
              <div className="form-group">
                <label className="form-label">
                  Which high school do you attend?<span className="required">*</span>
                </label>
                <CustomSelect
                  options={HSFS_SCHOOLS}
                  value={highSchoolerData.schoolAttending ? { label: highSchoolerData.schoolAttending, value: highSchoolerData.schoolAttending } : ''}
                  onChange={(selected) => handleChange('schoolAttending', selected?.label || selected || '')}
                  placeholder="Select your high school..."
                  isMulti={false}
                  isSearchable={true}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  What year do you graduate?<span className="required">*</span>
                </label>
                <CustomSelect
                  options={graduationYears}
                  value={highSchoolerData.graduationYear ? { value: highSchoolerData.graduationYear, label: highSchoolerData.graduationYear.toString() } : ''}
                  onChange={(selected) => handleChange('graduationYear', selected?.value || selected || '')}
                  placeholder="Select graduation year..."
                  isMulti={false}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page">
      {renderPage()}
    </div>
  );
}

export { hsfsHighSchoolQuestionsConfig };
