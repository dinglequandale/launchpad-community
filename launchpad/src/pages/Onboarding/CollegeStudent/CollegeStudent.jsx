import React, { useState, useEffect } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, CollegeSearch } from './../Options';
import { requiredQuestionsAnswered, saveCollegeStudent } from '../../../services/onboardingServices';
import BasicUserInfo from '../../../components/OnboardingComponents/BasicUserInfo';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EmailConfirmation from '../EmailConfirmation';

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
    text: "What Houston high school did you attend?",
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
  // {
  //   id: "sectionAttending",
  //   text: "Were you part of the French or International Section?",
  //   type: "select",
  //   optional: true,
  //   options: ["French", "International"].map(option => ({ value: option, label: option })),
  //   page: 2,
  // },

  // Page 3
  {
    id: "userSkills",
    text: "List out skills that make you standout to professionals:",
    page: 3,
    optional: true,
  },
];


export default function CollegeStudent({currentPage, isSubmitting, setCanSubmit, schoolInfo}) {

  const navigate = useNavigate();

  const {currentUser} = useAuth();

  const getEmail = httpsCallable(getFunctions(), 'getEmail');

  const [collegeStudentData, setCollegeStudentData] = useState({
    userAboutMe: '',
    userName: '',
    collegeAttending: '',
    schoolAttending: schoolInfo.schoolDisplayName,
    schoolId: schoolInfo.schoolId,
    graduationYear: '',
    // sectionAttending: '',
    areasOfInterest: [],
    userSkills: [],
    networkingLevel: [],
    userResume: null,
    userResumePreview: "",
    linkedinLink: "",
    email: "",
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
      // if(collegeStudentData.userSkills[0] && collegeStudentData.userSkills[0].skillDescription === "" && collegeStudentData.userSkills[0].skillCategory === ""){setCollegeStudentData({...collegeStudentData, userSkills: []})};
      console.log("Can submit")
      setCanSubmit(true);
    }
  },[collegeStudentData]);

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
        return <BasicUserInfo selectedOptions={collegeStudentData} questionsForPage={collegeStudentQuestionsConfig.filter((question)=>question.page === 1)} setSelectedOptions={setCollegeStudentData} handleChange={handleChange}/>
      case 2:
        return <CollegeInfo 
        selectedOptions={collegeStudentData}
        handleChange={handleChange} 
        collegeStudentData={collegeStudentData}/>;
      case 3:
        return <UserSkills selectedOptions={collegeStudentData} setSelectedOptions={setCollegeStudentData} />;
      case 4:
        return <EmailConfirmation selectedOptions={collegeStudentData} handleChange={handleChange} loginEmail={loginEmail}/>
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
          ) 
          // : question.id === 'sectionAttending' ? (
          //   (collegeStudentData.schoolAttending === "Awty International School") && <>
          //   <OnboardingDropdown
          //     key={question.id} // Add key for unique identification
          //     question={question.text}
          //     options={question.options}
          //     selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          //     onChange={(label) => handleChange(question.id, label)}
          //     type={question.type}
          //   />
          //   </>
          // )
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
    <span className="optional-label" style={{fontSize: "15px"}}>(Optional)</span>
  );



  const [skillData,setSkillData] = useState(selectedOptions.userSkills.length > 0 ? selectedOptions.userSkills : [{id: 0, skillCategory: "", skillDescription: ""}]);


  useEffect(() => {
    setSelectedOptions({... selectedOptions, userSkills: skillData});
  },[skillData])

  const handleInputChange = (key, value, index) => {
      // setSkillData([...skillData.map((skill) => (skill.id === index ? {id: index, ... skillData[index], [key]: value} : skill))]);
      console.log(skillData);
      // setSelectedOptions({... selectedOptions, userSkills: [...skillData.map((skill) => (skill.id === index ? {id: index, ... skillData[index], [key]: value} : skill))]});
      setSkillData([...skillData.map((skill) => (skill.id === index ? {id: index, ... skillData[index], [key]: value} : skill))]);
    }

  const handleAddSkill = () => {
    setSkillData([...skillData, {id: skillData.length, skillCategory: "", skillDescription: ""}]);
    console.log(skillData, "skilldata");
  };
  
  const handleRemoveSkill = (index) => {
      const updatedSkills = skillData.filter((_, i) => i !== index);
      setSkillData(updatedSkills);
  };

  return (
      <div className='onboardingQuestions'>
        {/* <div style={{border: "solid 1.5px var(--secondary)", textAlign: "center", padding: "8px 0px", background: "var(--neutral)"}}>
          <span style={{ fontSize: "20px"}}><span style={{fontSize: "25px", fontWeight: "550"}}>Your knowledge and mentorship</span> <br /> is a valuable reasource for students on this app.</span></div> */}
        <div style={{position: "relative"}}>
        <label className='onboardingQuestion'>Professionals in your school community may have workplace opportunities for you. List some of your skills to show them what you are about:</label>
        <div style={{position: "absolute", bottom: "-13px"}}>
            <OptionalLabel />
            </div>
        </div>
            <div className="skills-modal-container" style={{maxHeight: "300px", width: "500px"}}>
            {selectedOptions.userSkills.map((skill, index) => (
                <div key={index} className="skill-item">
                <div className="skill-header">
                    <h3>Skill {index + 1}</h3>
                    {index > 0 && (
                    <button className="btnText remove-button" onClick={() => handleRemoveSkill(index)}>
                        <BiTrash size={22} />
                    </button>
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Skill"
                    value={skill.skillCategory}
                    onChange={(e) => handleInputChange("skillCategory", e.target.value, index)}
                />
                <input
                    type="text"
                    placeholder="Brief Description"
                    value={skill.skillDescription}
                    onChange={(e) => handleInputChange("skillDescription", e.target.value, index)}
                />
                </div>
            ))}
            </div>
            
            <button className="btnUnfilled skill-add-button" style={{marginTop: "2px"}} onClick={handleAddSkill}>
            <BiPlus size={20} /> Add Skill
            </button>
        
    </div>
  );
};

