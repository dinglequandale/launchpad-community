import React, { useState, useMemo } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';
import { saveHighSchooler } from '../../../services/onboardingServices';

const highSchoolQuestionsConfig = [
  // Page 1
  {
    id: "schoolAttending",
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
    id: "sectionAttending",
    text: "Are you part of the French or International Section?",
    type: "select",
    options: ["French", "International"].map(option => ({ value: option, label: option })),
    page: 1,
  },

  // Page 2
  {
    id: "areasOfInterest",
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
    options: ["Yes", "No"].map(option => ({ value: option, label: option })),
    page: 3
  },
  {
    id: "collegeInterests",
    text: "What colleges are you interested in attending after highschool?",
    type: "multi-select",
    options: [], // Will fill this in later from Firebase
    page: 3  
  },
  {
    id: "collegeAttending",
    text: "What college will you be attending?",
    type: "select",
    options: [], // Will fill this in later from Firebase
    page: 3  
  }
];

export default function HighSchooler({currentPage, isSubmitting}) {
  // Fetch college list from Firebase
  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);
  const [highSchoolerData, setHighSchoolerData] = useState({
    schoolAttending: '',
    graduationYear: '',
    sectionAttending: '',
    areasOfInterest: [],
    collegeDecision: '',
    dreamColleges: [],
    collegeAttending: '',
    userType: "Alumni",
  });

  if(isSubmitting){
    saveHighSchooler(highSchoolerData);
  }

  const handleDropdownChange = (id, label) => {
    setHighSchoolerData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <FirstPage selectedOptions={highSchoolerData} handleChange={handleDropdownChange} pageNum={1} />;
      case 2:
        return <FirstPage selectedOptions={highSchoolerData} handleChange={handleDropdownChange} pageNum={2} />;
      case 3:
        return (
          <>
            <LastPage 
              selectedOptions={highSchoolerData} 
              handleChange={handleDropdownChange} 
              colleges={cachedColleges}
              onSearchQueryChange={handleSearchQueryChange} 
            />
          </>
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
  
const FirstPage = ({ selectedOptions, handleChange, pageNum }) => {
  return (
    <div className='onboardingQuestions'>
      {highSchoolQuestionsConfig.filter(question => question.page === pageNum)
                .map((question) => (
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

const LastPage = ({ selectedOptions, handleChange, colleges, onSearchQueryChange }) => {
  const questions = highSchoolQuestionsConfig.filter(question => question.page === 3);

  const collegeDecision = selectedOptions['collegeDecision'];

  return (
    <div className='onboadingQuestions'>
      <OnboardingDropdown
        question={questions[0].text}
        options={questions[0].options}
        selectedOption={selectedOptions['collegeDecision'] || ''}
        onChange={(label) => handleChange('collegeDecision', label)}
        type={questions[0].type}
      />
      {collegeDecision === 'No' && (
        <OnboardingDropdown
          question={questions[1].text}
          options={colleges}
          selectedOption={selectedOptions['collegeInterests'] || []}
          onChange={(label) => handleChange('collegeInterests', label)}
          type={questions[1].type}
          onSearchQueryChange={onSearchQueryChange}
        />
      )}
      {collegeDecision === 'Yes' && (
        <OnboardingDropdown
          question={questions[2].text}
          options={colleges}
          selectedOption={selectedOptions['collegeAttending'] || ''}
          onChange={(label) => handleChange('collegeAttending', label)}
          type={questions[2].type}
          onSearchQueryChange={onSearchQueryChange}
        />
      )}
    </div>
  );
};
