import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveHighSchooler } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { parentVerificationInitialTemplate } from '../../../utils/parentVerificationTemplates';

function SafetyWarning({isShortened = true}) {
  const [isExpanded, setIsExpanded] = useState(isShortened);

  return(
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      color: '#856404',
      position: 'relative',
      maxHeight: (!isExpanded && isShortened) ? "100px" : "none",
      overflow: "hidden",
      transition: "all 0.3s ease-in-out"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <FaExclamationTriangle style={{ marginRight: '10px' }} />
        <h3 style={{ margin: 0, flex: 1 }}>Important Safety Guidelines</h3>
        {isShortened && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#856404',
              padding: '5px'
            }}
          >
            {isExpanded ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
          </button>
        )}
      </div>
      <div style={{
        opacity: (!isExpanded && isShortened) ? 0.7 : 1,
        transition: "opacity 0.3s ease-in-out"
      }}>
        <p>As a high school student using Launchpad, please remember:</p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Always maintain professional communication with adults</li>
          <li>Never share personal contact information outside the platform</li>
          <li>Report any inappropriate behavior immediately</li>
          <li>Keep all interactions focused on academic and career development</li>
          <li>If you feel uncomfortable with any interaction, contact your school administrator</li>
        </ul>
        <p style={{ margin: 0, fontSize: '0.9em', fontWeight: "550" }}>By continuing, you acknowledge these guidelines and agree to follow them.</p>
      </div>
      {!isExpanded && isShortened && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(transparent, #fff3cd)',
          pointerEvents: 'none'
        }} />
      )}
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
    text: "Attach your resume to show professionals and alumni what you're about:",
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
    id: "email",
    optional: true
  },
  {
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 2,
  },
  // {
  //   id: "sectionAttending",
  //   text: "Are you part of the French or International Section?",
  //   type: "select",
  //   optional: true,
  //   options: ["French", "International"].map(option => ({ value: option, label: option })),
  //   page: 2,
  // },

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
  {
    id: "parentEmail",
    text: "Parent/Guardian Email (required for full access)",
    type: "text",
    page: 4
  },

  {
    id: "parentRequested",
    page: 5
  }
];

export default function HighSchooler({currentPage, isSubmitting, setCanSubmit, schoolInfo}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const getEmail = httpsCallable(getFunctions(), 'getEmail');
  const [loginEmail,setLoginEmail] = useState("");

  const [highSchoolerData, setHighSchoolerData] = useState({
    userAboutMe: '',
    userName: '',
    schoolAttending: schoolInfo.schoolDisplayName,
    schoolId: schoolInfo.schoolId,
    graduationYear: '',
    // sectionAttending: '',
    areasOfInterest: [],
    userSkills: [],
    collegeDecision: '',
    collegeInterestsOrDecision: [],
    userResume: null,
    userResumePreview: "",
    email: "",
    // isPublic: false,
    userType: "High Schooler",
    userPfpPreview: "",
    userPfp: null,
    linkedinLink:'',
    parentEmail: '',
    parentVerified: false,
    parentRequested: false,
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

  useEffect(() => {
    const getUserEmail = async () => {
      const result = await getEmail();
      handleChange("email",result.data.email);
    }
    getUserEmail();
  },[]);

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <SafetyWarning isShortened={false}/>
            <BasicUserInfo 
              questionsForPage={highSchoolQuestionsConfig.filter((question)=>(question.page === 1))} 
              setSelectedOptions={setHighSchoolerData} 
              selectedOptions={highSchoolerData} 
              handleChange={handleChange}
            />
          </>
        );
      case 2:
        return (
          <>
            <SafetyWarning isShortened={true}/>
            <SchoolInfo selectedOptions={highSchoolerData} handleChange={handleChange} highSchoolerData={highSchoolerData}/>
          </>
        );
      case 3:
        return (
          <>
            <SafetyWarning isShortened={true}/>
            <HSCollegeInfo selectedOptions={highSchoolerData} handleChange={handleChange} />
          </>
        );
      case 4:
        return (
          <ParentEmailPage selectedOptions={highSchoolerData} handleChange={handleChange} />
        );
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

const ParentEmailPage = ({ selectedOptions, handleChange }) => {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  const validateParentEmail = () => {
    const studentEmail = selectedOptions['email'] || '';
    const parentEmail = selectedOptions['parentEmail'] || '';
    if (!parentEmail) {
      setError('Parent/Guardian email is required.');
      return false;
    }
    if (studentEmail && parentEmail.trim().toLowerCase() === studentEmail.trim().toLowerCase()) {
      setError("Parent/Guardian email cannot be the same as your own email.");
      return false;
    }
    setError('');
    return true;
  };

  const handleRequestAccess = async () => {
    if (!validateParentEmail()) return;
    setRequesting(true);

    const sendSESEmail = httpsCallable(getFunctions(), "sendSESEmail");

    const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
      const verificationLinkResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: "verify_account",
        schoolId: localStorage.getItem("schoolId"),
      });

      // Extract the verification link from the result
      const verificationLink = verificationLinkResult.data;

    const result = await sendSESEmail({ 
      recipient: [ selectedOptions['parentEmail'] ],
      subject: "Verify Your Student's Account", 
      htmlTemplate: parentVerificationInitialTemplate({
        studentName: selectedOptions['userName'],
        parentName: "",
        verificationLink: verificationLink})});

    setRequesting(false);
    setRequested(true);
  };

  useEffect(() => {
    handleChange("parentRequested", requested);
  },[requested])

  return (
    <div className='onboardingQuestions' style={{ width: '500px' }}>
      {/* Note Card */}
      <div style={{
        background: '#f5f7fa',
        border: '1px solid #e0e3ea',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(60,72,88,0.07)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        <span style={{ fontSize: 28, color: '#1976d2', marginTop: 2 }}>👨‍👩‍👧‍👦</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 4 }}>Parental Consent Required</div>
          <div style={{ color: '#444', fontSize: '1em' }}>
            To ensure your safety and comply with our policies, we require a parent or guardian to approve your access to Launchpad. We'll send them a secure agreement form to review and sign. You can still explore the app, but full functionality will be unlocked once your parent or guardian approves.
          </div>
        </div>
      </div>
      <label className='onboardingQuestion' style={{ fontWeight: 500 }}>
        Parent/Guardian Email (required for full access)
      </label>
      <input
        type="email"
        value={selectedOptions['parentEmail'] || ''}
        onChange={e => handleChange('parentEmail', e.target.value)}
        placeholder="e.g. parent@email.com"
        style={{
          width: '97%',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginTop: 4,
          fontSize: '1em',
        }}
      />
      {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
      <button
        type="button"
        onClick={handleRequestAccess}
        className='btnSaveChanges'
        disabled={requesting || !selectedOptions['parentEmail']}
        style={{
          background: requested ? '#4caf50' : '',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 18px',
          fontWeight: 600,
          cursor: requesting ? 'not-allowed' : 'pointer',
          marginBottom: 8,
          marginTop: 12,
          opacity: requesting ? 0.7 : 1,
        }}
      >
        {requesting ? 'Requesting...' : (requested ? 'Requested!' : 'Request Access')}
      </button>
      {requested && (
        <div style={{ color: '#4caf50', fontWeight: 500, marginTop: 4 }}>
          Request sent! Your parent/guardian will receive an email to approve your access.
        </div>
      )}
    </div>
  );
};
