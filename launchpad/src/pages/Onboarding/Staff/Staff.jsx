import React, { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools } from './../Options';
import { careerInterests } from './../Options';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveStaff } from '../../../services/onboardingServices';

// Questions for school staff/admin onboarding
const staffQuestionsConfig = [
  {
    id: "userName",
    text: "Enter your full name:",
    placeholder: "E.g. Jamie Smith",
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
    id: "schoolAttending",
    text: "Which school are you an administrator/staff at?",
    type: "select",
    options: highSchools,
    placeholder: "N/A",
    page: 1
  },
  {
    id: "schoolRole",
    text: "What is your role/position at the school?",
    placeholder: "E.g. Principal, Counselor, IT Admin",
    type: "text",
    page: 2
  },
  {
    id: "areasOfInterest",
    text: "What are your main fields of interest or expertise?",
    type: "multi-select",
    options: careerInterests,
    page: 2
  },
  {
    id: "personalEmail",
    text: "Enter your personal email: (optional)",
    // placeholder: "your.name@school.org",
    type: "text",
    optional: true,
    page: 2
  },
//   {
//     id: "phoneNumber",
//     text: "Phone number (optional):",
//     placeholder: "E.g. (555) 123-4567",
//     type: "text",
//     optional: true,
//     page: 2
//   },
  {
    id: "linkedinLink",
    text: "LinkedIn profile (optional):",
    placeholder: "https://www.linkedin.com/in/your-profile",
    type: "text",
    optional: true,
    page: 2
  },
  {
    id: "sponsoredClubs",
    type: "text",
    text: "Sponsored clubs, if any (separate by commas):",
    placeholder: "E.g. Math Club, Environmental Club",
    optional: true,
    page: 3,
  },
  {
    id: "userAboutMe",
    text: "Short bio (optional):",
    placeholder: "Tell us a bit about your background and your role at the school...",
    type: "textarea",
    optional: true,
    page: 3
  },
];

export default function Staff({ currentPage, isSubmitting, setCanSubmit, schoolInfo }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const getEmail = httpsCallable(getFunctions(), 'getEmail');

  // Pre-fill school if provided
  const [staffData, setStaffData] = useState({
    userName: '',
    userPfpPreview: '',
    schoolAttending: schoolInfo?.schoolDisplayName || '',
    schoolId: schoolInfo?.schoolId || '',
    schoolRole: '',
    personalEmail: '',
    // phoneNumber: '',
    linkedinLink: '',
    userAboutMe: '',
    areasOfInterest: [],
    userPfp: null,
    userType: 'Staff',
    sponsoredClubs: '',
    email: '', // login email
  });

  // Fetch login email for reference
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const result = await getEmail();
        setStaffData(prev => ({ ...prev, email: result.data.email }));
      } catch (e) {
        // fallback: do nothing
      }
    };
    fetchEmail();
  }, [getEmail]);

  // Validation: require name, school, role, work email, and areasOfInterest
  useEffect(() => {
    const required = staffData.userName && staffData.schoolAttending && staffData.schoolRole && staffData.areasOfInterest && staffData.areasOfInterest.length > 0;
    setCanSubmit(!!required);
  }, [staffData, setCanSubmit]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      // TODO: Replace with saveStaff service
      await saveStaff(currentUser, staffData, () => {
        // Success callback
        toast.success('Information saved successfully!');
        navigate("/Home");
    });
    } catch (error) {
      toast.error('Failed to save information. Please try again.');
    }
  };

  useEffect(() => {
    if (isSubmitting) {
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [isSubmitting]);

  // Handle field changes
  const handleChange = (id, value) => {
    setStaffData(prev => ({ ...prev, [id]: value }));
  };

  // Render logic for each page
  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <BasicUserInfo
            selectedOptions={staffData}
            questionsForPage={staffQuestionsConfig.filter(q => q.page === 1)}
            setSelectedOptions={setStaffData}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <div className='onboardingQuestions' style={{ width: "460px" }}>
            {staffQuestionsConfig.filter(q => q.page === 2).map(question => (
              <div key={question.id} className="form-group">
                <label className='onboardingQuestion'>{question.id !== "areasOfInterest" && question.text}</label>
                {question.type === 'text' ? (
                  <input
                    type="text"
                    value={staffData[question.id] || ''}
                    onChange={e => handleChange(question.id, e.target.value)}
                    className='onboardingInput'
                    placeholder={question.placeholder}
                  />
                ) : question.type === 'multi-select' ? (
                  <OnboardingDropdown
                    question={question.text}
                    options={question.options}
                    selectedOption={staffData[question.id] || []}
                    onChange={selected => handleChange(question.id, selected)}
                    type={question.type}
                  />
                ) : (
                  <input
                    type="text"
                    value={staffData[question.id] || ''}
                    onChange={e => handleChange(question.id, e.target.value)}
                    className='onboardingInput'
                    placeholder={question.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className='onboardingQuestions' style={{ width: "460px" }}>
            {staffQuestionsConfig.filter(q => q.page === 3).map(question => (
              <div key={question.id} className="form-group">
                <label className='onboardingQuestion'>{question.text}</label>
                <textarea
                  value={staffData[question.id] || ''}
                  onChange={e => handleChange(question.id, e.target.value)}
                  className='onboardingInput'
                  placeholder={question.placeholder}
                  style={{ minHeight: 100 }}
                />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return <div>{renderPage()}</div>;
}

