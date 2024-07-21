import React, { useState, useMemo } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';
import { saveCollegeStudent } from '../../../services/onboardingServices';

const collegeStudentQuestionsConfig = [
  // Page 1
  {
    id: "whatCollege",
    text: "What college do you go to?",
    type: "select",
    options: [], // Fill this in later
    page: 1,
  },
  {
    id: "whatSchool",
    text: "What high school did you attend?",
    type: "select",
    options: highSchools,
    page: 1,
  },
  {
    id: "graduationYer",
    text: "What year did you graduate high school?",
    type: "select",
    options: graduationYears,
    page: 1,
  },
  {
    id: "whatSection",
    text: "Were you part of the French or International Section?",
    type: "select",
    options: ["French", "International"].map(option => ({ value: option, label: option })),
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
];

export default function CollegeStudent() {
  // Fetch college list from Firebase
  const [searchQuery, setSearchQuery] = useState('');
  const colleges = getColleges(searchQuery);
  const cachedColleges = useMemo(() => colleges, [colleges]);

  const numOfSections = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [collegeStudentData, setCollegeStudentData] = useState({
    whatCollege: '',
    whatSchool: '',
    graduationYer: '',
    whatSection: '',
    dreamCareer: []
  });

  const handleDropdownChange = (id, label) => {
    setCollegeStudentData(prevState => ({
      ...prevState,
      [id]: label,
    }));
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCollegeStudent(collegeStudentData);
    alert('Data saved successfully');
  };

  return (
    <div>
      <ProgressBar
          numOfSections={numOfSections}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showLast={true}
      />
      <FirstPage 
        selectedOptions={collegeStudentData} 
        handleChange={handleDropdownChange} 
        pageNum={currentPage} 
        colleges={cachedColleges} 
        onSearchQueryChange={handleSearchQueryChange} 
      />
      {currentPage == numOfSections && (
        <button type="button" onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', fontSize: '16px' }}>
          Submit
        </button>
      )}
    </div>
  );
};

const FirstPage = ({ selectedOptions, handleChange, pageNum, colleges, onSearchQueryChange }) => {
  return (
    <div>
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
