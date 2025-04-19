import { useState } from "react";

const EmailConfirmation = ({ selectedOptions, handleChange, loginEmail }) => {
    const publicity = selectedOptions["isPublic"] ? "all" : "school";
    const [selectedOption, setSelectedOption] = useState(publicity);
    console.log("publicity ", publicity)
  
    const handleOptionChange = (optionValue) => {
      setSelectedOption(optionValue);
      if(optionValue === "school"){
        handleChange("isPublic", false);
      }
      else{
        handleChange("isPublic", true);
      }
    };
  
    return (
      <div className="contact-sharing-container">
        <div className="contact-sharing-header">
          
          <span className="onboardingQuestion"><span style={{fontWeight: "bolder"}}>Last thing!</span>  Driven students, alumni, and young professionals will reach out to you for advice. Who are you open to sharing your contact info with, so they can reach out directly to you?</span>
        </div>
        
        <div className="radio-option">
          <label className="radio-label">
            <input
              type="radio"
              name="contactSharing"
              value="all"
              checked={selectedOption === "all"}
              onChange={() => handleOptionChange("all")}
              className="radio-input"
            />
            <span className="radio-custom"></span>
            <span className="option-text">
              I am open to sharing my email address to all users
            </span>
          </label>
        </div>
        
        <div className="radio-option">
          <label className="radio-label">
            <input
              type="radio"
              name="contactSharing"
              value="school"
              checked={selectedOption === "school"}
              onChange={() => handleOptionChange("school")}
              className="radio-input"
            />
            <span className="radio-custom"></span>
            <span className="option-text">
              I am open to sharing my email address only to users part of my school community
            </span>
          </label>
        </div>
      </div>
    );
  };

  export default EmailConfirmation;