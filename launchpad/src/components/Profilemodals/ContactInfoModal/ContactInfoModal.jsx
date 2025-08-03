import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import MakeChanges from '../../Makechanges/MakeChanges';
import { editUserData, validateLinkedInUrl } from '../../../services/userProfileServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

export default function ContactInfoModal({userData, visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const {currentUser} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEmail, setNewEmail] = useState(userData.userType === "Staff" ? userData.personalEmail : userData.email);
  const [newLinkedinLink, setNewLinkedinLink] = useState(userData.linkedinLink);
  const [linkedInError, setLinkedInError] = useState("");

  const saveLinkedIn = async () => {
    setIsSubmitting(true);

    const loadingToast = toast.loading('Making your changes...');
    
    try {
      if(userData.userType === "Staff"){
        await editUserData({personalEmail: newEmail, linkedinLink: newLinkedinLink}, currentUser, userData);
      }
      else{
        await editUserData({email: newEmail, linkedinLink: newLinkedinLink}, currentUser, userData);
      }

      toast.success('Changes made successfully!', { id: loadingToast });

      new Promise( res => setTimeout(res, 500) );

      onClose();

    } catch (error) {
        toast.error(`Failed to make changes!`, { id: loadingToast });

        console.error('Error changing:', error);
    }
    finally{
      setIsSubmitting(false);
    }
    onClose();
  }

  const validateAndSaveLinkedIn = async () => {
    if (userData.userType === "Professional" && !validateLinkedInUrl(newLinkedinLink)) {
      setLinkedInError("Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)");
      return;
    }
    setLinkedInError("");
    await saveLinkedIn();
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      minWidth: "500px"
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "3",
    }
  };

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
              <h2 className="v0-modal-title">Contact Information</h2>
              <p className="v0-modal-subtitle">Connect with the School Network</p>
            </div>
            
            <div className="v0-modal-content">
              <form className="v0-modal-form">
                <div className="v0-form-group">
                  <label className="v0-form-label">Email Address</label>
                  <input 
                    className="v0-form-input"
                    placeholder="Enter your email address"
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                
                <div className="v0-form-group">
                  <label className="v0-form-label">LinkedIn Profile</label>
                  <input 
                    className={`v0-form-input ${linkedInError ? 'v0-form-input-error' : ''}`}
                    placeholder="https://www.linkedin.com/in/username"
                    value={newLinkedinLink} 
                    onChange={(e) => setNewLinkedinLink(e.target.value)}
                  />
                  {linkedInError && (
                    <div className="v0-form-error">{linkedInError}</div>
                  )}
                </div>
              </form>
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
                onClick={validateAndSaveLinkedIn}
                disabled={isSubmitting || newEmail === ""}
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