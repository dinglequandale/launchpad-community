import React, { useState, useMemo } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';
import { saveCollegeStudent } from '../../../services/onboardingServices';

const collegeStudentQuestionsConfig = [
  // Page 1
  {
    id: "collegeAttending",
    text: "What college do you go to?",
    type: "select",
    options: [], // Fill this in later
    page: 1,
  },
  {
    id: "schoolAttending",
    text: "What high school did you attend?",
    type: "select",
    options: highSchools,
    page: 1,
  },
  {
    id: "graduationYear",
    text: "What year did you graduate high school?",
    type: "select",
    options: graduationYears,
    page: 1,
  },
  {
    id: "sectionAttending",
    text: "Were you part of the French or International Section?",
    type: "select",
    options: ["French", "International"].map(option => ({ value: option, label: option })),
    page: 1,
  },

  // Page 2
  {
    id: "areasOfInterest",
    text: "What is your fields of interest? (select up to 4)",
    type: "multi-select",
    options: careerInterests,
    page: 2,
  },
];

export default function CollegeStudent({currentPage, isSubmitting}) {
  // Fetch college list from Firebase
  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);

  const [collegeStudentData, setCollegeStudentData] = useState({
    collegeAttending: '',
    schoolAttending: '',
    graduationYear: '',
    sectionAttending: '',
    areasOfInterest: []
  });

  if(isSubmitting){
    saveCollegeStudent(collegeStudentData);
  }

  const handleDropdownChange = (id, label) => {
    setCollegeStudentData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  return (
      <FirstPage 
        selectedOptions={collegeStudentData}
        handleChange={handleDropdownChange}
        pageNum={currentPage}
        colleges={cachedColleges}
        onSearchQueryChange={handleSearchQueryChange}
      />
  );
};

const FirstPage = ({ selectedOptions, handleChange, pageNum, colleges, onSearchQueryChange }) => {
  return (
    <div className='onboardingQuestions'>
      {collegeStudentQuestionsConfig.filter(question => question.page === pageNum)
                .map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.id === 'whatCollege' ? colleges : question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(label) => handleChange(question.id, label)}
          type={question.type}
          onSearchQueryChange={question.id === 'whatCollege' ? onSearchQueryChange : null}
        />
      ))}
    </div>
  );
};
