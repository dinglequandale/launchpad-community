import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import "./aboutmemodal.css"
import MakeChanges from '../../Makechanges/MakeChanges';

export default function AboutMeModal({visibility, onClose}){
  const [aboutMeContent, setAboutMeContent] = useState("");
  const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
  const prevAboutMe =  localStorage.getItem("userAboutMe", "") ? localStorage.getItem("userAboutMe", "") : "";

  // later replace with logic tailored to FireStore

  const clearCache = () => {
    localStorage.setItem("userAboutMe", prevAboutMe);
  }

  const saveAboutMe = () => {
    localStorage.setItem("userAboutMe", aboutMeContent);
    onClose();
  }

  useEffect(() => {
    const storedAboutMe = localStorage.getItem("userAboutMe");
    if (storedAboutMe || storedAboutMe === "") {
        setAboutMeContent(storedAboutMe);
    }
}, [visibility]);


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
      <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose} clearCache={clearCache}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="About Me Modal"
        shouldCloseOnOverlayClick={false} 
      >
        <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "10px"}}> My "About Me" <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Tell us more about yourself.</span></h2>
        <div><textarea className='inputAboutMe' placeholder='Tell us more about yourself ...' onChange={e => setAboutMeContent(e.target.value)} value={aboutMeContent} maxLength={500}></textarea></div>
        <span style={{fontSize: "smaller"}}>Word Count: {aboutMeContent ? `${aboutMeContent.split(" ").length}` : "0"}/100</span>
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