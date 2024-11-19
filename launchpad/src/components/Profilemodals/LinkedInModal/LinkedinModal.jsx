import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import MakeChanges from '../../Makechanges/MakeChanges';
import { editUserData } from '../../../services/userProfileServices';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { Link } from 'react-router-dom';

export default function LinkedinModal({userData, visibility, onClose}){
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const {currentUser} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLinkedinLink, setNewLinkedinLink] = useState("");

  const saveLinkedIn = async () => {
    setIsSubmitting(true);

    const loadingToast = toast.loading('Making your changes...');
    
    try {
        await editUserData({linkedinLink: newLinkedinLink}, currentUser, userData);

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

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "3",
    }
  };

  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Linkedin Modal"
        shouldCloseOnOverlayClick={false} 
      >
        <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
        <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> LinkedIn Profile <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>{userData.userType === "High Schooler" ? "Showcase who you are what you're capable of!" : "Show our students who you are and what you do!"}</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{paddingTop: "10px"}}>
        <form>
        {userData.linkedinLink ? 
        <>
          <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <span style={{color: "var(--secondary)", fontSize: "19px"}}>Paste your new LinkedIn profile:</span>
            <input style={{width: "300px", margin: "auto"}} placeholder='Paste the link here!' value={newLinkedinLink} onChange={(e) => setNewLinkedinLink(e.target.value)}/>
          </div>
            <br />
            <span style={{color: "var(--secondary)", fontSize: "19px"}}>Current LinkedIn Profile: <br /> <Link onClick={() => window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer')}>{userData.linkedinLink}</Link></span>
        </>
        :
        <>
        <span style={{color: "var(--secondary)", fontSize: "19px"}}>Input your LinkedIn profile below:</span>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px"}}>
            <input style={{width: "300px", margin: "auto"}} placeholder='Paste the link here!' value={newLinkedinLink} onChange={(e) => setNewLinkedinLink(e.target.value)}/>
        </div>
        </>}
        </form>
        </main>
        <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button disabled={isSubmitting} className='btnUnfilled' onClick={()=>setMakeChangesVisibility(true)} style={{borderRadius: "4px", width: "40%", padding: "8px", fontSize: "larger"}}>
            Cancel</button>
          <button onClick={saveLinkedIn} type='submit' disabled={isSubmitting || newLinkedinLink===""} className="btnSaveChanges" style={{background: (isSubmitting || newLinkedinLink === "") ? "gray": "", borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", cursor: (newLinkedinLink === "") ? "not-allowed" : ""}}>
            Save Changes</button>
        </footer>
      </Modal>
    </div>
  );
};