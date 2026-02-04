import React, { useRef, useEffect } from 'react';
import { BiGlobe, BiGroup } from 'react-icons/bi';
import { IoCloseOutline } from 'react-icons/io5';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import './HSWelcomeModal.css';

export default function HSWelcomeModal({ isOpen, onClose, isLegacyUser = false }) {
  const modalRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleDismiss();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDismiss = () => {
    localStorage.removeItem('showHSWelcomeModal');
    localStorage.setItem('hsWelcomeModalDismissed', 'true');
    onClose();
  };

  const handleSelection = async (value) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        openToCrossSchoolConnections: value
      });

      const storedUserInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}');
      storedUserInfo.openToCrossSchoolConnections = value;
      localStorage.setItem('basicUserInfo', JSON.stringify(storedUserInfo));

      localStorage.removeItem('showHSWelcomeModal');
      localStorage.setItem('hsWelcomeModalDismissed', 'true');

      if (value === 'no') {
        toast.success('Updated to community only. You can change this anytime in Settings.');
      } else {
        toast.success('You\'re open to all schools. You can change this anytime in Settings.');
      }
      onClose();
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Something went wrong. You can update this in Settings.');
      handleDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="hs-welcome-overlay">
      <div className="hs-welcome-modal" ref={modalRef}>
        <button className="hs-welcome-close-btn" onClick={handleDismiss} title="Close">
          <IoCloseOutline size={20} />
        </button>

        <div className="hs-welcome-content">
          <div className="hs-welcome-emoji">&#x1F44B;</div>
          <h2 className="hs-welcome-title">{isLegacyUser ? 'Welcome back!' : 'Welcome to Launchpad!'}</h2>
          <p className="hs-welcome-message">
            You're currently visible to — and can connect with — professionals and students from
            all schools on the platform, not just your own.
          </p>
          <p className="hs-welcome-message">
            Would you like to keep it that way, or limit your network to your school community?
          </p>

          <div className="hs-welcome-options">
            <button
              className="hs-welcome-option"
              onClick={() => handleSelection('yes')}
            >
              <BiGlobe size={24} className="hs-welcome-option-icon" />
              <div className="hs-welcome-option-text">
                <span className="hs-welcome-option-title">Open to All</span>
                <span className="hs-welcome-option-desc">Connect with people from any school</span>
              </div>
            </button>
            <button
              className="hs-welcome-option"
              onClick={() => handleSelection('no')}
            >
              <BiGroup size={24} className="hs-welcome-option-icon" />
              <div className="hs-welcome-option-text">
                <span className="hs-welcome-option-title">My School Only</span>
                <span className="hs-welcome-option-desc">Limit to your school community</span>
              </div>
            </button>
          </div>

          <p className="hs-welcome-footnote">
            You can always change this later in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
