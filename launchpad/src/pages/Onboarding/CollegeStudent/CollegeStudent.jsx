import React, { useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import { highSchools, careerInterests, graduationYears, getColleges } from './../Options';

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
  const colleges = getColleges();

  const numOfSections = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [collegeStudentData, setCollegeStudentData] = useState({
    whatCollege: '',
    whatSchool: '',
    graduationYer: '',
    whatSection: '',
    dreamCareer: []
  });

  const handleDropdownChange = (id, value) => {
    setCollegeStudentData(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <div>
      <ProgressBar
          numOfSections={numOfSections}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          showLast={true}
      />
      <FirstPage selectedOptions={collegeStudentData} handleChange={handleDropdownChange} pageNum={currentPage} colleges={colleges} />
    </div>
  );
};

const FirstPage = ({ selectedOptions, handleChange, pageNum, colleges }) => {
    return (
      <div>
        {collegeStudentQuestionsConfig.filter(question => question.page === pageNum)
                  .map((question) => (
          <OnboardingDropdown
            key={question.id}
            question={question.text}
            options={question.id === 'whatCollege' ? colleges : question.options}
            selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
            onChange={(value) => handleChange(question.id, value)}
            type={question.type}
          />
        ))}
      </div>
    );
};
