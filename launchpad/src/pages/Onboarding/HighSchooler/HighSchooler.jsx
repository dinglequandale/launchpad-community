import React, { useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';

const highSchoolQuestionsConfig = [
  // Page 1
  {
      id: "whatSchool",
      text: "What school do you go to?",
      type: "select",
      options: ["The Awty International School"],
      page: 1,
  },
  {
      id: "graduationYear",
      text: "What year do you graduate?",
      type: "select",
      options: [1999, 2008],
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
      type: "select",
      options: [
          "Consumer Electronics",
          "Consumer Goods",
          "Consumer Services",
          "Cosmetics",
          "Business",
          "Education",
          "Healthcare",
          "Technology"
      ],
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
      type: "select",
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
]

export default function HighSchooler() {
  const numOfSections = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleDropdownChange = (id, value) => {
      setSelectedOptions(prevState => ({
      ...prevState,
      [id]: value,
      }));
  };

  const renderPage = () => {
      switch (currentPage) {
      case 1:
          return <QuestionsPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} pageNum={1} />;
      case 2:
          return <QuestionsPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} pageNum={2} />;
      case 3:
          return <QuestionsPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} pageNum={3} />;
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
  
const QuestionsPage = ({ selectedOptions, handleChange, pageNum }) => {
  return (
    <div>
      {highSchoolQuestionsConfig.filter(question => question.page === pageNum)
                .map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id]}
          onChange={(e) => handleChange(question.id, e.target.value)}
        />
      ))}
    </div>
  );
};