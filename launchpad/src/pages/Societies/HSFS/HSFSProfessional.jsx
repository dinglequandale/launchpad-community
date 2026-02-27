import React, { useState, useEffect } from 'react';
import CustomSelect from '../../../components/CustomSelect';
import { HSFS_INDUSTRIES } from '../../../utils/hsfsConstants';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaShieldAlt } from 'react-icons/fa';
import { BiTrash } from 'react-icons/bi';

const getEmail = httpsCallable(getFunctions(), 'getEmail');

const hsfsProQuestionsConfig = [
  // Page 1 - Basic Information
  {
    id: "userName",
    text: "Enter your full name:",
    placeholder: "E.g. Neil deGrasse Tyson",
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
    text: "What industry/industries do you specialize in?",
    type: "multi-select",
    options: HSFS_INDUSTRIES,
    page: 1
  },
  {
    id: "linkedinLink",
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
  // Page 1 continued - Biography
  {
    id: "biography",
    text: "In 2-3 sentences, describe your experience in the finance industry:",
    type: "textarea",
    placeholder: "Share your background, expertise, and what motivates you to mentor students...",
    page: 1
  },
  // Page 2 - Professional Status
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
    page: 2,
  },
  // Page 3 - Work Details (non-retired)
  {
    id: "industryPosition",
    text: "What is your current position or role?",
    type: "text-box",
    placeholder: "E.g. Senior Financial Analyst, Portfolio Manager",
    retired: false,
    page: 3,
  },
  {
    id: "companyName",
    text: "Where do you currently work?",
    placeholder: "E.g. Goldman Sachs, JP Morgan Chase",
    type: "text-box",
    retired: false,
    page: 3
  },
  {
    id: "yearsOfExperience",
    text: "How many years of professional experience do you have?",
    type: "text-box",
    placeholder: "E.g. 15",
    retired: false,
    page: 3,
  },
  // Page 3 - Work Details (retired)
  {
    id: "industryPosition",
    text: "What was your last position or role?",
    type: "text-box",
    placeholder: "E.g. CEO, Managing Director",
    retired: true,
    page: 3,
  },
  {
    id: "companyName",
    text: "Where did you work last?",
    placeholder: "E.g. Goldman Sachs, JP Morgan Chase",
    type: "text-box",
    retired: true,
    page: 3
  },
  {
    id: "yearsOfExperience",
    text: "How many years of professional experience did you have?",
    placeholder: "E.g. 25",
    retired: true,
    page: 3,
  },
  // Page 4 - Networking Level & Invitations
  {
    id: "networkingLevel",
    text: "Your knowledge and mentorship are valuable resources for students. Please select the types of support you're willing to provide:",
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
    page: 4
  },
  {
    id: "professionalEmails",
    text: "Invite Colleagues and Fellow Professionals to Join HSFS",
    type: "multi-email",
    optional: true,
    page: 5
  },
];

export default function HSFSProfessional({ currentPage, isSubmitting, setCanSubmit, setUserData }) {
  const { currentUser } = useAuth();

  const getInitialData = () => {
    const saved = localStorage.getItem('tempHSFSProfessionalInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          userPfp: null,
          userPfpPreview: parsed.userPfpPreview || null,
        };
      } catch (e) {
        console.error('Error parsing saved HSFS professional data:', e);
      }
    }
    return {
      userName: "",
      userPfp: null,
      userPfpPreview: null,
      areasOfInterest: [],
      linkedinLink: "",
      email: "",
      biography: "",
      userType: "Professional",
      retiredStatus: "",
      industryPosition: "",
      companyName: "",
      yearsOfExperience: "",
      networkingLevel: [],
      professionalEmails: [],
    };
  };

  const [professionalData, setProfessionalData] = useState(getInitialData());

  const isRetired = (status) => {
    return status === "Retired but active" || status === "Retired and not working";
  };

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(professionalData);
  }, [professionalData, setUserData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      ...professionalData,
      userPfp: null,
    };
    localStorage.setItem('tempHSFSProfessionalInfo', JSON.stringify(dataToSave));
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
    const canSubmit = requiredQuestionsAnswered(hsfsProQuestionsConfig, professionalData);
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
        return (
          <div className="form-section">
            <h2 className="page-title">Basic Information</h2>
            <BasicUserInfo
              selectedOptions={professionalData}
              questionsForPage={hsfsProQuestionsConfig.filter(q => q.page === 1 && q.id !== 'biography')}
              setSelectedOptions={setProfessionalData}
              handleChange={handleChange}
            />
            <div className="onboardingQuestions" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Biography<span className="required">*</span>
                </label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  In 2-3 sentences, describe your experience in the finance industry:
                </p>
                <textarea
                  className="form-input"
                  style={{ width: '95%', height: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Share your background, expertise, and what motivates you to mentor students..."
                  onChange={(e) => handleChange("biography", e.target.value)}
                  value={professionalData.biography || ''}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return <RetiredStatus selectedOptions={professionalData} handleChange={handleChange} />;
      case 3:
        return <WorkDetails selectedOptions={professionalData} handleChange={handleChange} />;
      case 4:
        return <NetworkingAndInvitations selectedOptions={professionalData} handleChange={handleChange} setProfessionalData={setProfessionalData} />;
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

const RetiredStatus = ({ selectedOptions, handleChange }) => {
  const questionsForPage = hsfsProQuestionsConfig.filter(q => q.page === 2);
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
            <CustomSelect
              options={question.options}
              value={selectedOptions[question.id] || ''}
              onChange={(label) => handleChange(question.id, label)}
              placeholder="Select an option"
              isMulti={false}
              isSearchable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkDetails = ({ selectedOptions, handleChange }) => {
  const retired = selectedOptions.retiredStatus === "Retired but active" || selectedOptions.retiredStatus === "Retired and not working";
  const questionsForPage = hsfsProQuestionsConfig.filter(q => q.page === 3 && q.retired === retired);
  return (
    <div className="form-section">
      <h2 className="page-title">{retired ? "Previous Work Experience" : "Current Work Experience"}</h2>
      <div className="onboardingQuestions">
        {questionsForPage.map((question) => (
          <div className="form-group" key={question.id}>
            <label className="form-label">
              {question.text}
              {!question.optional && <span className="required">*</span>}
            </label>
            <input
              type={question.id === "yearsOfExperience" ? "number" : "text"}
              value={selectedOptions[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className="form-input form-shorter-input"
              placeholder={question.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkingAndInvitations = ({ selectedOptions, handleChange, setProfessionalData }) => {
  const networkingQuestion = hsfsProQuestionsConfig.find(q => q.id === 'networkingLevel');

  const handleOptionChange = (event) => {
    const value = event.target.value;
    setProfessionalData(prevState => ({
      ...prevState,
      networkingLevel: selectedOptions.networkingLevel.includes(value)
        ? selectedOptions.networkingLevel.filter(option => option !== value)
        : [...selectedOptions.networkingLevel, value]
    }));
  };

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
      <h2 className="page-title">Your Commitment Level</h2>

      {networkingQuestion && (
        <div className="form-group">
          <label className="form-label">
            {networkingQuestion.text}
            <div className="onboarding-optional-label-container">
              <span className="optional-label">(Optional)</span>
            </div>
          </label>
          <div className="contact-sharing-container">
            {Array.isArray(networkingQuestion.options) && networkingQuestion.options.map((option) => (
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
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <h2 className="page-title">Invite Your Network</h2>
        <div className="onboardingQuestions">
          <div className="parent-notice" style={{ background: '#e8f5e9', border: '1px solid #81c784' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <FaShieldAlt className="parent-notice-icon" style={{ color: '#388e3c' }} />
              <div className="parent-notice-content">
                <h3>Grow the HSFS Community</h3>
                <p>
                  Help expand the HSFS network! Invite colleagues and fellow professionals who can mentor students and contribute to the finance community.
                </p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Addresses</label>
            {professionalEmails.length === 0 ? (
              <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                Click "Add Email" below to invite colleagues to join HSFS
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
                  </div>
                  <div style={{ alignItems: "center" }}>
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
    </div>
  );
};

export { hsfsProQuestionsConfig };
