import React from 'react';
import { useSchoolConfig } from '../../utils/subdomainUtils';
import './SchoolCTAButton.css';

const SchoolCTAButton = ({ onClick, className = "", children, variant = "primary" }) => {
  const schoolConfig = useSchoolConfig();
  const isAwty = schoolConfig.schoolShortName === "Awty";

  if (isAwty && variant === "primary") {
    return (
      <button 
        className={`school-cta-button awty-cta ${className}`} 
        onClick={onClick}
      >
        <div className="cta-content">
          <div className="mascot-container">
            <img 
              src={schoolConfig.mascotImage} 
              alt={`${schoolConfig.mascotName} mascot`} 
              className="mascot-image"
            />
          </div>
          <div className="cta-text">
            <div className="school-name">{schoolConfig.schoolName}</div>
            <div className="cta-action">{schoolConfig.ctaButtonText}</div>
          </div>
        </div>
      </button>
    );
  }

  // Fallback for non-Awty schools or secondary variants
  return (
    <button className="cta-button btnUnfilled" onClick={onClick}>{schoolConfig.ctaButtonText}</button>
  );
};

export default SchoolCTAButton; 