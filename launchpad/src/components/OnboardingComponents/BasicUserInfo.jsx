import { useRef, useState } from "react";
import "../../pages/Onboarding/onboarding.css"
import OnboardingDropdown from "../OnboardingDropdown/OnboardingDropdown";
import { BiEdit, BiTrash, BiUpload } from "react-icons/bi";
import { IoAdd } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa6";

export default function BasicUserInfo({handleChange, selectedOptions, setSelectedOptions, questionsForPage}){
  const pfpInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  // const [pfpError, setPfpError] = useState(null);
  const [resumeError, setResumeError] = useState(null);

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

      // if (fileType === 'pfp') setPfpError(null);
      // else setResumeError(null);
    }
  }

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  }

  const removeFile = (fileType) => {
    setSelectedOptions(prevData => ({
      ...prevData,
      [fileType === 'pfp' ? 'userPfpPreview' : 'resumePreview']: null,
      [fileType === 'pfp' ? 'userPfp' : 'resume']: null
    }));
  }

  const OptionalLabel = () => (
    <span className="optional-label">(Optional)</span>
  );

  
    return(
      <div className="onboardingQuestions" style={{width: "465px"}}>
        <div>
          <label className="onboardingQuestion">{questionsForPage[0].text}</label>
          <input 
            type="text"
            onChange={(e) => handleChange(questionsForPage[0].id, e.target.value)}
            className="onboardingInput"
            placeholder={questionsForPage[0].placeholder}
          />
        </div>
        
        <div className="file-upload-container" style={{display: "flex", alignItems: "center"}}>
        <label className="onboardingQuestion" style={{width: "100%", position: 'relative'}}>
          {questionsForPage[1].text}
          <div style={{position: "absolute", bottom: "-20px"}}>
            <OptionalLabel />
            </div>
        </label>
        <div className="file-upload-preview" style={{display: "flex", justifyContent: "center", width: "100%"}}>
          {selectedOptions.userPfpPreview ? (
            <div className="preview-container">
              <img src={selectedOptions.userPfpPreview} alt="Profile Preview" className="file-preview" style={{width: "70px", height: "70px", borderRadius: "50%"}} />
              <div className="preview-actions" style={{top: "-15px"}}>
                <button onClick={() => triggerFileInput(pfpInputRef)} className="action-button">
                  <BiEdit size={20} />
                </button>
                <button onClick={() => removeFile('pfp')} className="action-button">
                  <BiTrash size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="btnCircle btnFileUpload"
              style={{width: "70px", height: "70px"}}
              onClick={() => triggerFileInput(pfpInputRef)}
            >
              <IoAdd size={50}/>
            </button>
          )}
        </div>
        <input 
          type="file"
          ref={pfpInputRef}
          onChange={(e) => handleFileChange(e, 'pfp')}
          accept="image/*"
          style={{display: 'none'}}
        />
      </div>
        
        <OnboardingDropdown
          key={questionsForPage[2].id}
          question={questionsForPage[2].text}
          options={questionsForPage[2].options}
          selectedOption={selectedOptions[questionsForPage[2].id] || (questionsForPage[2].type === 'multi-select' ? [] : '')}
          onChange={(label) => handleChange(questionsForPage[2].id, label)}
          type={questionsForPage[2].type}
          onSearchQueryChange={questionsForPage[2].id === 'whatCollege' ? onSearchQueryChange : null}
        />
        
        {questionsForPage[3] && (
        <div className="file-upload-container">
          <label className="onboardingQuestion" style={{position: "relative"}}>
            {questionsForPage[3].text}
            {questionsForPage[3].optional && <div style={{position: "absolute", bottom: "-20px"}}>
            <OptionalLabel />
            </div>}
          </label>
          <div className="file-upload-preview">
            {selectedOptions.userResumePreview ? (
              <div className="btnFileUpload" style={{display: "flex", flexDirection: "column", width: "200px", padding: "14px", borderRadius: "5px", marginTop: "10px", fontSize: "larger", position: "relative"}}>
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
              <button onClick={() => triggerFileInput(resumeInputRef)} className='btnFileUpload' style={{display: "flex", flexDirection: "column", padding: "14px", borderRadius: "5px", marginTop: "10px", fontSize: "larger"}}>
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
            style={{display: 'none'}}
          />
        </div>
        )}
      </div>
    )
  }