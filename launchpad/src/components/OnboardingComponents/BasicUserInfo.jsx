import { useRef, useState } from "react";
import "../../pages/Onboarding/Onboarding.css";
import "./BasicUserInfo.css";
import OnboardingDropdown from "../OnboardingDropdown/OnboardingDropdown";
import CustomSelect from "../CustomSelect";
import { BiEdit, BiShield, BiTrash, BiUpload } from "react-icons/bi";
import { FaRegFilePdf } from "react-icons/fa6";
import { validateLinkedInUrl } from "../../services/userProfileServices";
import { GoUnverified } from "react-icons/go";

export default function BasicUserInfo({ handleChange, selectedOptions, setSelectedOptions, questionsForPage }) {
  const pfpInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [resumeError, setResumeError] = useState(null);
  const [linkedInOptionSelected, setLinkedInOptionSelected] = useState(selectedOptions.linkedinLink);

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'pfp' && !file.type.startsWith('image/')) {
        // setPfpError('Please upload an image file.');
        return;
      }
      if (fileType === 'resume' && file.type !== 'application/pdf') {
        // setResumeError('Please upload a PDF file.');
        return;
      }

      setSelectedOptions(prevData => ({
        ...prevData,
        [fileType === 'pfp' ? 'userPfpPreview' : 'userResumePreview']: URL.createObjectURL(file),
        [fileType === 'pfp' ? 'userPfp' : 'userResume']: file
      }));

    }
  }

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  }

  const removeFile = (fileType) => {
    setSelectedOptions(prevData => ({
      ...prevData,
      [fileType === 'pfp' ? 'userPfpPreview' : 'userResumePreview']: null,
      [fileType === 'pfp' ? 'userPfp' : 'userResume']: null
    }));
  }

  const OptionalLabel = () => (
    <span className="optional-label">(Optional)</span>
  );

  return (
    <div className="onboarding-basic-info-container">
      <div>
        <label className="onboardingQuestion">{questionsForPage[0].text}</label>
        <input 
          type="text"
          onChange={(e) => handleChange(questionsForPage[0].id, e.target.value)}
          className="onboardingInput"
          value={selectedOptions[questionsForPage[0].id]}
          placeholder={questionsForPage[0].placeholder}
        />
      </div>

      {questionsForPage[4] && questionsForPage[4].id === "schoolAttending" && (
        <div className="onboarding-dropdown-container">
          <OnboardingDropdown
            key={questionsForPage[4].id}
            question={questionsForPage[4].text}
            options={questionsForPage[4].options}
            selectedOption={selectedOptions[questionsForPage[4].id] || (questionsForPage[4].type === 'multi-select' ? [] : '')}
            onChange={(label) => handleChange(questionsForPage[4].id, label)}
            type={questionsForPage[4].type}
            placeholder={questionsForPage[4].placeholder}
            onSearchQueryChange={questionsForPage[4].id === 'whatCollege' ? onSearchQueryChange : null}
          />
        </div>
      )}

      <div className="file-upload-container">
        <input 
          type="file"
          ref={pfpInputRef}
          onChange={(e) => handleFileChange(e, 'pfp')}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      <div className="onboarding-dropdown-container-secondary">
        <label className="onboardingQuestion">{questionsForPage[2].text}</label>
        <CustomSelect
          options={questionsForPage[2].options}
          value={selectedOptions[questionsForPage[2].id] || []}
          onChange={(label) => handleChange(questionsForPage[2].id, label)}
          placeholder="Type to search..."
          isMulti={true}
          isSearchable={true}
        />
      </div>
      
      {questionsForPage[3] && (
        <>
          {selectedOptions.userType === "High Schooler" ? (
            <>
              <div className="file-upload-container" style={{position: "relative"}}>
                <label className="onboardingQuestion" style={{position: "relative"}}>
                  {questionsForPage[3].text}
                  {/* {questionsForPage[3].optional && (
                    <div className="onboarding-optional-label-container">
                      <OptionalLabel />
                    </div>
                  )} */}
                </label>
                <div className="file-upload-preview">
                  {selectedOptions.userResumePreview ? (
                    <div className="btnFileUpload onboarding-upload" style={{position: "relative"}}>
                      <FaRegFilePdf size={25} />
                      <span className="file-name">{selectedOptions.userResume.name}</span>
                      <div className="preview-actions" style={{top: "-15px"}}>
                        <button onClick={() => triggerFileInput(resumeInputRef)} className="action-button">
                          <BiEdit size={20} />
                        </button>
                        <button onClick={() => removeFile('resume')} className="action-button">
                          <BiTrash size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => triggerFileInput(resumeInputRef)} className="btnFileUpload onboarding-upload">
                      <BiUpload size={25} />
                      <span>Upload Your Resume</span>
                    </button>
                  )}
                </div>
                <input 
                  type="file"
                  ref={resumeInputRef}
                  onChange={(e) => handleFileChange(e, 'resume')}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* LinkedIn Input Field - Now positioned underneath resume upload */}
              <div className="linkedin-input-container">
                <div className="linkedin-toggle-section">
                  <button 
                    className={`linkedin-toggle-btn ${linkedInOptionSelected ? 'active' : ''}`}
                    onClick={() => setLinkedInOptionSelected(!linkedInOptionSelected)}
                  >
                    <span className="toggle-icon">
                      {linkedInOptionSelected ? '−' : '+'}
                    </span>
                    {linkedInOptionSelected ? 'Hide LinkedIn Profile' : 'Add LinkedIn Profile'}
                  </button>
                </div>
                
                <div className={`linkedin-input-wrapper ${linkedInOptionSelected ? 'expanded' : ''}`}>
                  <input
                    type="url"
                    onChange={(e) => handleChange("linkedinLink", e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={selectedOptions["linkedinLink"] || ''}
                    className="onboardingInput linkedin-profile-input"
                  />
                  {selectedOptions["linkedinLink"] && (
                    <div className="linkedin-verification-status">
                      {validateLinkedInUrl(selectedOptions["linkedinLink"]) ? (
                        <div className="verification-badge verified">
                          <BiShield size={16} />
                          <span>Valid LinkedIn URL</span>
                        </div>
                      ) : (
                        <div className="verification-badge unverified">
                          <GoUnverified size={16} />
                          <span>Invalid LinkedIn URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="onboarding-linkedin-section">
              <span className="onboardingQuestion">{questionsForPage[3].text}</span>
              {selectedOptions["linkedinLink"] && (
                <div className="onboarding-linkedin-verification">
                  {validateLinkedInUrl(selectedOptions["linkedinLink"]) ? (
                    <div className="onboarding-verification-status verified">
                      <span>Verified</span>
                      <BiShield size={30}/>
                    </div>
                  ) : (
                    <div className="onboarding-verification-status unverified">
                      <span>Unverified</span>
                      <GoUnverified size={30}/>
                    </div>
                  )}
                </div>
              )}
              <div>
                <input
                  type="url"
                  onChange={(e) => handleChange("linkedinLink", e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={selectedOptions["linkedinLink"]}
                  className="onboardingInput"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}