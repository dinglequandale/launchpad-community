import React, { useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';

const professionalQuestionsConfig = [
  // Page 1
  {
    id: "retiredStatus",
    text: "Are you currently retired?",
    type: "select",
    options: ["Yes", "No"],
    page: 1,
  },
  // If yes
  {
    id: "lastPosition",
    text: "What was the last position you held?",
    type: "select",
    options: [
        "Petroleum Engineer",
        "Geoscientist",
        "Drilling Engineer",
        "Production Manager"
    ],
    page: 1,
  },
  {
    id: "lastCompany",
    text: "What company / organization did you work for last?",
    type: "select",
    options: [
        "ExxonMobil",
        "Chevron",
        "Royal Dutch Shell",
        "BP (British Petroleum)",
        "TotalEnergies",
        "ConocoPhillips",
        "Saudi Aramco",
        "PetroChina",
        "Gazprom",
        "Schlumberger"
    ],
    page: 1
  },
  {
    id: "workFields",
    text: "What were your main fields at work? (select all that apply)",
    type: "multi-select",
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
    page: 1
  },
  // If no
  {
    id: "currentPosition",
    text: "What is your current position?",
    type: "select",
    options: [
        "Petroleum Engineer",
        "Geoscientist",
        "Drilling Engineer",
        "Production Manager"
    ],
    page: 1
  },
  {
    id: "currentCompany",
    text: "What company / organization do you currently work at?",
    type: "select",
    options: [
        "ExxonMobil",
        "Chevron",
        "Royal Dutch Shell",
        "BP (British Petroleum)",
        "TotalEnergies",
        "ConocoPhillips",
        "Saudi Aramco",
        "PetroChina",
        "Gazprom",
        "Schlumberger"
    ],
    page: 1
  },
  {
    id: "workFields",
    text: "What were your main fields at work? (select all that apply)",
    type: "multi-select",
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
    page: 1
  },

  // Page 2
  // TODO: add descriptions to the options
  {
    id: "networkingLevel",
    text: "With our app, high school and college students will have the opportunity to connect with you. \
            What is your level of networking commitment to these students? (select all that apply)",
    type: "multi-select",
    options: [
        "Casual Connections",
        "General Inquires",
        "Short Interviews / Coffee Chats",
        "Guest Speaking",
        "Project Support",
        "Mentorship",
        "Workplace Opportunities"
    ],
    page: 2
  },

  // Page 3
  {
    id: "uploadResume",
    text: "Almost done! Please upload any recent resume of yours as a PDF. Resumes will be public so students \
        can understand more about you and your experiences in the simplest way. You may cut out your contact info if you’d like.",
    type: "select",
    options: ["File upload", "Skip for now", "Write \"about me\" instead"],
    page: 3
  }
];

export default function Professional() {
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
        return <FirstPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
      case 2:
        return <SecondPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
      case 3:
        return <LastPage selectedOptions={selectedOptions} handleChange={handleDropdownChange} />;
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

const FirstPage = ({ selectedOptions, handleChange }) => {
  const yesQuestions = professionalQuestionsConfig.slice(1, 4);
  const noQuestions = professionalQuestionsConfig.slice(4, 7);

  const retiredStatus = selectedOptions['retiredStatus'];

  return (
    <div>
      <OnboardingDropdown
        question={professionalQuestionsConfig[0].text}
        options={professionalQuestionsConfig[0].options}
        selectedOption={selectedOptions['retiredStatus'] || ''}
        onChange={(value) => handleChange('retiredStatus', value)}
        type={professionalQuestionsConfig[0].type}
      />
      {retiredStatus === 'Yes' && (yesQuestions.map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(value) => handleChange(question.id, value)}
          type={question.type}
        />
      )))}
      {retiredStatus === 'No' && (noQuestions.map((question) => (
        <OnboardingDropdown
          key={question.id}
          question={question.text}
          options={question.options}
          selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
          onChange={(value) => handleChange(question.id, value)}
          type={question.type}
        />
      )))}
    </div>
  );
};

const SecondPage = ({ selectedOptions, handleChange }) => {
    return (
      <div>
          <OnboardingDropdown
            key={professionalQuestionsConfig[7].id}
            question={professionalQuestionsConfig[7].text}
            options={professionalQuestionsConfig[7].options}
            selectedOption={selectedOptions['networkingLevel'] || []}
            onChange={(value) => handleChange('networkingLevel', value)}
            type={professionalQuestionsConfig[7].type}
          />
      </div>
    );
};

const LastPage = ({ selectedOptions, handleChange }) => {
    const uploadStatus = selectedOptions['uploadResume'];

    return (
      <div>
        <OnboardingDropdown
          question={professionalQuestionsConfig[8].text}
          options={professionalQuestionsConfig[8].options}
          selectedOption={selectedOptions['uploadResume'] || ''}
          onChange={(value) => handleChange('uploadResume', value)}
          type={professionalQuestionsConfig[8].type}
        />
        {uploadStatus === "File upload" && (
            // TODO: Add file handler
            <form>
                <h1>Resume Upload</h1>
                <input type="file" />
                <button type="submit">Upload</button>
            </form>       
        )}
        {uploadStatus === "Write \"about me\" instead" && (
            <input type="text" />
        )}
      </div>
    );
};
