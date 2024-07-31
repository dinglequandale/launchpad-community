import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { sendConnectMessageWithoutResume, sendConnectMessageWithResume } from '../../Streamchat/chatFunctions/sendConnectMessage';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../firebase/firebaseConfig';
import toast from 'react-hot-toast';

// TODO: actually implement clickedUser logic
export default function ConnectModal({visibility, chat, onClose, clickedUser="EUVGKcqLdkbINcp6EEgUASaW2rI3"}){
  
  const [introMessage, setIntroMessage] = useState("");
  const [sendWithResume, setSendWithResume] = useState(false);
  const [channelId, setChannelId] = useState("")
  const {currentUser} = useAuth();

  const wordLimit = 50;

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).length;
  }

  const navigate = useNavigate();

  const onSendClick = async () => {
    try {
        await toast.promise(
          verifySend(),
          {
            loading: 'Sending your message ...',
            success: 'Messag sent successfully!',
            error: (err) => `Failed to send your message: ${err.message}`,
          }
        );
      } catch (error) {
        console.error("Error saving opportunity: ", error);
      }
  }

  const verifySend = async () => {
    try{
        if(sendWithResume){
            const resumeRef = ref(storage, `resumes/resume_${currentUser.uid}.pdf`);
            //TODO: Check this
            const resumeURL = await storage.getDownloadURL(resumeRef);

            // Get the file metadata
            const metaData = await storage.getMetadata(resumeRef);

            // TODO: user resume read logic
            
            await sendConnectMessageWithResume(introMessage, resumeURL, metaData, currentUser.uid, clickedUser, setChannelId, chat);
        }
        else{
            await sendConnectMessageWithoutResume(introMessage, currentUser.uid, clickedUser, setChannelId, chat);
        }
    }catch(error){
        console.log(error);
        return;
    }
    
    navigate("/messages", {state: channelId});
  }

  const handleIntroChange = (text) => {
    const currentWordCount = getWordCount(text);
    if (currentWordCount <= wordLimit) {
      setIntroMessage(text);
    }  
}

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      zIndex: "4",
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "4",
    }
  };

  return (
    <div>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Connect Modal"
        shouldCloseOnOverlayClick={false} 
      >
        <header>
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Connect with [clickedUser] <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Gain valuable internships amd mentorship</span></h2>
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{paddingTop: "20px", display: "flex", flexDirection: "column", gap: "7px"}}>
            <textarea className='inputIntroMessage' placeholder='Introduce yourself!' onChange={e => handleIntroChange(e.target.value)} value={introMessage} style={{width: "600px", height: "200px"}}></textarea>
            <span style={{fontSize: "smaller"}}>Word Count: {introMessage ? `${getWordCount(introMessage)}` : "0"}/{wordLimit}</span>
            <div style={{margin: "0 auto"}}>
                <input type="checkbox" checked={sendWithResume} onChange={()=>setSendWithResume(!sendWithResume)}/>
                <span style={{fontSize: "larger", fontWeight: "300"}}>Attach resume in your message</span>
            </div>
        </main>
        <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button onClick={onClose} style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Cancel</button>
          <button onClick={onSendClick} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Send it over!</button>
        </footer>
      </Modal>
    </div>
  );
};