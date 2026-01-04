import React from 'react';
import './SixDegreesWelcomeModal.css';
import { IoCheckmarkCircle } from 'react-icons/io5';

const SixDegreesWelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleExplore = () => {
    // Clear the localStorage flag
    localStorage.removeItem('showSixDegreesWelcome');
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Close if clicking the overlay background (not the modal content)
    if (e.target === e.currentTarget) {
      handleExplore();
    }
  };

  return (
    <div className="six-degrees-welcome-overlay" onClick={handleOverlayClick}>
      <div className="six-degrees-welcome-modal">
        <IoCheckmarkCircle size={64} className="six-degrees-welcome-icon" />
        <h2 className="six-degrees-welcome-title">Thank you!</h2>
        <p className="six-degrees-welcome-message">
          We will reach out shortly with next steps regarding our 6 Degrees Program.
        </p>
        <p className="six-degrees-welcome-message">
          In the meantime, please click the button below to go to the Launchpad platform,
          where you can directly connect with college students studying at your dream university
          and professionals working your dream jobs.
        </p>
        <button
          className="six-degrees-welcome-button"
          onClick={handleExplore}
        >
          Explore Launchpad
        </button>
      </div>
    </div>
  );
};

export default SixDegreesWelcomeModal;
