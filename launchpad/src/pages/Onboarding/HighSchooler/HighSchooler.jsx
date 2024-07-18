import React, { useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import { highSchools, careerInterests, graduationYears } from './../Options';

const highSchoolQuestionsConfig = [
  // Page 1
  {
    id: "whatSchool",
    text: "What school do you go to?",
    type: "select",
    options: highSchools,
    page: 1,
  },
  {
    id: "graduationYear",
    text: "What year do you graduate?",
    type: "select",
    options: graduationYears,
    page: 1,
  },
  {
    id: "whatSection",
    text: "Are you part of the French or International Section?",
    type: "select",
    options: ["French", "International"],
    page: 1,
  },

  // Page 2
  {
    id: "dreamCareer",
    text: "What is your dream career field? (Select up to 4)",
    type: "multi-select",
    options: careerInterests,
    page: 2,
  },

  // Page 3
  {
    id: "collegeDecision",
    text: "Have you decided what college you will attend after highschool?",
    type: "select",
    options: ["Yes", "No"],
    page: 3
  },
  {
    id: "collegeInterests",
    text: "What colleges are you interested in attending after highschool?",
    type: "multi-select",
    options: [
        "Harvard",
        "Yale",
        "UT Austin"
    ],
    page: 3  
  },
  {
    id: "collegeAttending",
    text: "What college will you be attending?",
    type: "select",
    options: [
        "Harvard",
        "Yale",
        "UT Austin"
    ],
    page: 3  
  }
];

export default function HighSchooler() {
  const numOfSections = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [highSchoolerData, setHighSchoolerData] = useState({
    whatSchool: '',
    graduationYear: '',
    whatSection: '',
    dreamCareer: [],
    collegeDecision: '',
    collegeInterests: [],
    collegeAttending: ''
  });

  const handleDropdownChange = (id, value) => {
    setHighSchoolerData(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <FirstPage selectedOptions={highSchoolerData} handleChange={handleDropdownChange} pageNum={1} />;
      case 2:
        return <FirstPage selectedOptions={highSchoolerData} handleChange={handleDropdownChange} pageNum={2} />;
      case 3:
        return <LastPage selectedOptions={highSchoolerData} handleChange={handleDropdownChange} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <ProgressBar
          numOfSections={numOfSections}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showLast={true}
      />
      {renderPage()}
    </div>
  );
};
  
const FirstPage = ({ selectedOptions, handleChange, pageNum }) => {
  return (
    <div>
      {highSchoolQuestionsConfig.filter(question => question.page === pageNum)
                .map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(value) => handleChange(question.id, value)}
          type={question.type}
        />
      ))}
    </div>
  );
};

const LastPage = ({ selectedOptions, handleChange }) => {
  const questions = highSchoolQuestionsConfig.filter(question => question.page === 3);

  const collegeDecision = selectedOptions['collegeDecision'];

  return (
    <div>
      <OnboardingDropdown
        question={questions[0].text}
        options={questions[0].options}
        selectedOption={selectedOptions['collegeDecision'] || ''}
        onChange={(value) => handleChange('collegeDecision', value)}
        type={questions[0].type}
      />
      {collegeDecision === 'Yes' && (
        <OnboardingDropdown
          question={questions[1].text}
          options={questions[1].options}
          selectedOption={selectedOptions['collegeInterests'] || []}
          onChange={(value) => handleChange('collegeInterests', value)}
          type={questions[1].type}
        />
      )}
      {collegeDecision === 'No' && (
        <OnboardingDropdown
          question={questions[2].text}
          options={questions[2].options}
          selectedOption={selectedOptions['collegeAttending'] || ''}
          onChange={(value) => handleChange('collegeAttending', value)}
          type={questions[2].type}
        />
      )}
    </div>
  );
};
