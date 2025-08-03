import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import "./aboutmemodal.css"
import MakeChanges from '../../Makechanges/MakeChanges';
import { editUserData } from '../../../services/userProfileServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

export default function AboutMeModal({userData, visibility, onClose}){
  const [aboutMeContent, setAboutMeContent] = useState(userData.userAboutMe ?? "");
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const {currentUser} = useAuth();
  const wordLimit = 75;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: later replace with logic tailored to FireStore

  const saveAboutMe = async () => {
    setIsSubmitting(true);

    console.log("Running.....")

    const loadingToast = toast.loading('Making your changes...');
    
    try {
        await editUserData({userAboutMe: aboutMeContent}, currentUser, userData);

        toast.success('Changes made successfully!', { id: loadingToast });

        new Promise( res => setTimeout(res, 500) );

        onClose();

    } catch (error) {
        toast.error(`Failed to make changes!`, { id: loadingToast });

        console.error('Error changing skills:', error);
    }
    finally{
      setIsSubmitting(false);
    }
    // onClose();
  }

  const handleAboutMeChange = (text) => {
    const currentWordCount = getWordCount(text);
    if (currentWordCount <= wordLimit) {
      setAboutMeContent(text);
    }  
  }

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  }

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      {visibility && (
        <div className="v0-modal-overlay" onClick={onClose}>
          <div className="v0-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="v0-modal-header">
              <button className="v0-modal-close-btn" onClick={onClose}>
                <CgClose size={20} />
              </button>
              <h2 className="v0-modal-title">My About Me</h2>
              <p className="v0-modal-subtitle">It's your time to shine!</p>
            </div>
            
            <div className="v0-modal-content">
              <div className="v0-form-group">
                <label className="v0-form-label">Tell us about yourself</label>
                <textarea 
                  className="v0-form-textarea" 
                  placeholder="Share your story, interests, and what makes you unique..."
                  value={aboutMeContent}
                  onChange={e => handleAboutMeChange(e.target.value)}
                />
                <div className="v0-word-count">
                  Word Count: {aboutMeContent ? `${getWordCount(aboutMeContent)}` : "0"}/{wordLimit}
                </div>
              </div>
            </div>
            
            <div className="v0-modal-footer">
              <button 
                className="v0-btn-secondary" 
                onClick={() => setMakeChangesVisibility(true)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="v0-btn-primary" 
                onClick={saveAboutMe}
                disabled={isSubmitting}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};