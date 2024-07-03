import React from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';


export default HighSchooler = () => {
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
          return <Page1 selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
      case 2:
          return <Page2 selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
      case 3:
          return <Page3 selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
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
  
const Page1 = ({ selectedOptions, handleChange }) => {
  const questions = [
    {
      id: "whatSchool",
      text: "What school do you go to?",
      options: ["The Awty International School"],
    },
    {
      id: "graduationYear",
      text: "What year do you graduate?",
      options: [1999, 2008],
    },
    {
      id: "whatSection",
      text: "Are you part of the French or International Section?",
      options: ["French", "International"],
    },
  ];

  return (
    <div>
      {questions.map((question) => (
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

const Page2 = ({ selectedOptions, handleChange }) => {
  const questions = [
    {
      id: "dreamCareer",
      text: "What is your dream career field? (Select up to 4)",
      options: [
        "Consumer Electronics",
        "Consumer Goods",
        "Consumer Services",
        "Cosmetics",
        "Business",
        "Education",
        "Healthcare",
        "Technology",
      ],
    },
  ];

  return (
    <div>
      {questions.map((question) => (
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

const Page3 = ({ selectedOptions, handleChange }) => {
  const questions = [
    {
      id: "collegeDecision",
      text: "Have you decided what college you will attend after highschool?",
      options: ["Yes", "No"],
    },
    {
      id: "collegeInterests",
      text: "What colleges are you interested in attending after highschool?",
      options: ["Harvard", "Yale", "UT Austin"],
    },
    {
      id: "collegeAttending",
      text: "What college will you be attending?",
      options: ["Harvard", "Yale", "UT Austin"],
    },
  ];

  return (
    <div>
      {questions.map((question) => (
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
