import React, { useState } from 'react';
import "./onboardingdropdown.css";

export default function OnboardingDropdown({ question, options }) {
    const [selectedOption, setSelectedOption] = useState('');
  
    const handleChange = (event) => {
      setSelectedOption(event.target.value);
    };
  
    return (
      <div>
        <label htmlFor="dropdown">{question}</label>
        <select id="dropdown" value={selectedOption} onChange={handleChange}>
          <option value="" disabled>Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {selectedOption && <p>You selected: {selectedOption}</p>}
      </div>
    );
};