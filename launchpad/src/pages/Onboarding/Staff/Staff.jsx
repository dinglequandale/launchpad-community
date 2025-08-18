import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../../components/CustomSelect';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';

// Move getEmail function creation outside component to prevent recreation on every render
const getEmail = httpsCallable(getFunctions(), 'getEmail');

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
  // {
  //   id: "schoolAttending",
  //   text: "Which school are you an administrator/staff at?",
  //   type: "select",
  //   options: highSchools,
  //   placeholder: "N/A",
  //   page: 1
  // },
  {
    id: "schoolRole",
    text: "What is your role/position at the school?",
    placeholder: "E.g. IB History Teacher",
    type: "text",
    page: 2
  },
  {
    id: "areasOfInterest",
    text: "What are your areas of expertise?",
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

export default function Staff({currentPage, isSubmitting, setCanSubmit, schoolInfo, setUserData}) {

  const {currentUser} = useAuth();

  const [staffData, setStaffData] = useState({
    userName: "",
    userPfp: null,
    userPfpPreview: null,
    areasOfInterest: [],
    linkedinLink: "",
    email: "",
    schoolRole: "",
    personalEmail: "",
    sponsoredClubs: "",
    userAboutMe: "",
    schoolId: schoolInfo?.schoolId || "",
    userType: "Staff",
  });

  // Update parent component with user data whenever it changes
  useEffect(() => {
    setUserData(staffData);
  }, [staffData, setUserData]);

  // Fetch user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const result = await getEmail({ uid: currentUser.uid });
        if (result.data) {
          setStaffData(prev => ({
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
    const canSubmit = requiredQuestionsAnswered(staffQuestionsConfig, staffData);
    setCanSubmit(canSubmit);
  }, [staffData, setCanSubmit]);

  // Remove the old save logic since it's now handled by the parent

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
          <div className="form-section">
            <h2 className="page-title">School Information</h2>
            <div className="onboardingQuestions">
              {staffQuestionsConfig.filter(q => q.page === 2).map(question => (
                <div key={question.id} className="form-group">
                  <label className="form-label">{question.id !== "areasOfInterest" && question.text}</label>
                  {question.type === 'text' ? (
                    <input
                      type="text"
                      value={staffData[question.id] || ''}
                      onChange={e => handleChange(question.id, e.target.value)}
                      className="form-input"
                      placeholder={question.placeholder}
                    />
                  ) : question.type === 'multi-select' ? (
                    <CustomSelect
                      options={question.options}
                      value={staffData[question.id] || []}
                      onChange={selected => handleChange(question.id, selected)}
                      placeholder="Type to search..."
                      isMulti={true}
                      isSearchable={true}
                    />
                  ) : (
                    <input
                      type="text"
                      value={staffData[question.id] || ''}
                      onChange={e => handleChange(question.id, e.target.value)}
                      className="form-input"
                      placeholder={question.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h2 className="page-title">Additional Information</h2>
            <div className="onboardingQuestions">
              {staffQuestionsConfig.filter(q => q.page === 3).map(question => (
                <div key={question.id} className="form-group">
                  <label className="form-label">{question.text}</label>
                  <textarea
                    value={staffData[question.id] || ''}
                    onChange={e => handleChange(question.id, e.target.value)}
                    className="form-input"
                    placeholder={question.placeholder}
                    style={{ minHeight: 100, resize: "vertical" }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="onboarding-page">{renderPage()}</div>;
}

