import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import "./aboutmemodal.css"
import MakeChanges from '../../Makechanges/MakeChanges';
import { editUserData } from '../../../services/userProfileServices';
import { useAuth } from '../../../contexts/auth/AuthContext';

export default function AboutMeModal({userData, visibility, onClose}){
  const [aboutMeContent, setAboutMeContent] = useState(userData.userAboutMe ?? "");
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const {currentUser} = useAuth();
  const wordLimit = 50;

  // TODO: later replace with logic tailored to FireStore

  const saveAboutMe = async () => {

    const newUserData = {...userData, userAboutMe: aboutMeContent};
    await editUserData(newUserData, currentUser);

    localStorage.setItem("userAboutMe", aboutMeContent);
    onClose();
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
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="About Me Modal"
        shouldCloseOnOverlayClick={false} 
      >
        <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> My About Me <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>It's your time to shine!</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{paddingTop: "20px"}}>
          <textarea className='inputAboutMe' placeholder='Tell us more about yourself!' onChange={e => handleAboutMeChange(e.target.value)} value={aboutMeContent}></textarea>
        </main>
        <span style={{fontSize: "smaller"}}>Word Count: {aboutMeContent ? `${getWordCount(aboutMeContent)}` : "0"}/{wordLimit}</span>
        <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button onClick={
            ()=>setMakeChangesVisibility(true)
            } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Cancel</button>
          <button onClick={saveAboutMe} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Save Changes</button>
        </footer>
      </Modal>
    </div>
  );
};