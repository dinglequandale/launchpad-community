import React, { useState } from 'react';
import OnboardingDropdown from '../../../components/OnboardingDropdown/OnboardingDropdown';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import { careerInterests } from './../Options';

const professionalQuestionsConfig = [
  // Page 1
  {
    id: "retiredStatus",
    text: "Are you currently retired?",
    type: "select",
    options: ["Yes", "No"].map(option => ({ value: option, label: option })),
    page: 1,
  },
  // If yes
  {
    id: "companyPosition",
    text: "What was the last position you held?",
    type: "text-box",
    options: null,
    page: 1,
  },
  {
    id: "companyName",
    text: "What company / organization did you work for last?",
    type: "text-box",
    options: null,
    page: 1
  },
  {
    id: "workFields",
    text: "What were your main fields at work? (select all that apply)",
    type: "multi-select",
    options: careerInterests,
    page: 1
  },
  // If no
  {
    id: "companyPosition",
    text: "What is your current position?",
    type: "text-box",
    options: null,
    page: 1
  },
  {
    id: "companyName",
    text: "What company / organization do you currently work at?",
    type: "text-box",
    options: null,
    page: 1
  },
  {
    id: "workFields",
    text: "What were your main fields at work? (select all that apply)",
    type: "multi-select",
    options: careerInterests,
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
    ].map(option => ({ value: option, label: option })),
    page: 2
  },

  // Page 3
  {
    id: "resumeOrDescription",
    text: "Almost done! Please upload any recent resume of yours as a PDF. Resumes will be public so students \
        can understand more about you and your experiences in the simplest way. You may cut out your contact info if you’d like.",
    type: "select",
    options: ["File upload", "Skip for now", "Write \"about me\" instead"].map(option => ({ value: option, label: option })),
    page: 3
  }
];

export default function Professional() {
  const numOfSections = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [professionalData, setProfessionalData] = useState({
    retiredStatus: '',
    companyPosition: '',
    companyName: '',
    workFields: [],
    networkingLevel: [],
    resumeOrDescription: null
  });

  const handleDropdownChange = (id, value) => {
    setProfessionalData(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <FirstPage selectedOptions={professionalData} handleChange={handleDropdownChange} />;
      case 2:
        return <SecondPage selectedOptions={professionalData} handleChange={handleDropdownChange} />;
      case 3:
        return <LastPage selectedOptions={professionalData} handleChange={handleDropdownChange} />;
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
  // These questions are identical except for the question asked (past vs present tense)
  const questions = selectedOptions['retiredStatus'] === 'Yes'
    ? professionalQuestionsConfig.slice(1, 4)
    : professionalQuestionsConfig.slice(4, 7);

  return (
    <div>
      <OnboardingDropdown
        question={professionalQuestionsConfig[0].text}
        options={professionalQuestionsConfig[0].options}
        selectedOption={selectedOptions['retiredStatus'] || ''}
        onChange={(value) => handleChange('retiredStatus', value)}
        type={professionalQuestionsConfig[0].type}
      />
      {questions.map((question) => (
        question.type === 'text-box' ? (
          <div key={question.id} className="form-group">
            <label>{question.text}</label>
            <input
              type="text"
              value={selectedOptions[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </div>
        ) : (
          <OnboardingDropdown
            key={question.id}
            question={question.text}
            options={question.options}
            selectedOption={selectedOptions[question.id] || (question.type === 'multi-select' ? [] : '')}
            onChange={(value) => handleChange(question.id, value)}
            type={question.type}
          />
        )
      ))}
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
  const uploadStatus = selectedOptions['resumeOrDescription']?.type === 'file'
    ? "File upload"
    : (selectedOptions['resumeOrDescription']?.type === 'text' ? "Write \"about me\" instead" : '');

  return (
    <div>
      <OnboardingDropdown
        question={professionalQuestionsConfig[8].text}
        options={professionalQuestionsConfig[8].options}
        selectedOption={uploadStatus || ''}
        onChange={(value) => handleChange('resumeOrDescription', value === "File upload" ? { type: 'file' } : (value === "Write \"about me\" instead" ? { type: 'text' } : ''))}
        type={professionalQuestionsConfig[8].type}
      />
      {uploadStatus === "File upload" && (
        <form>
          <h1>Resume Upload</h1>
          <input 
            type="file" 
            onChange={(e) => handleChange('resumeOrDescription', { type: 'file', file: e.target.files[0] })}
          />
          <button type="submit">Upload</button>
        </form>
      )}
      {uploadStatus === "Write \"about me\" instead" && (
        <input 
          type="text" 
          value={selectedOptions['resumeOrDescription']?.text || ''}
          onChange={(e) => handleChange('resumeOrDescription', { type: 'text', text: e.target.value })}
        />
      )}
    </div>
  );
};
