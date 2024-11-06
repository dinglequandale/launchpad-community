import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { sendConnectMessageWithoutResume, sendConnectMessageWithResume } from '../../Streamchat/chatFunctions/sendConnectMessage';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../firebase/firebaseConfig';
import toast, { Toaster } from 'react-hot-toast';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { CgClose } from 'react-icons/cg';

// TODO: actually implement clickedUser logic
export default function ConnectModal({visibility, chat, onClose, userId, userName, isOpportunity=false, opportunityType=null}){

  const [introMessage, setIntroMessage] = useState("");
  const [sendWithResume, setSendWithResume] = useState(false);
  const [channelId, setChannelId] = useState("")
  const {currentUser} = useAuth();
  const [canSend, setCanSubmit] = useState(introMessage.length > 0);

  const [sendDirectMessage, setSendDirectMessage] = useState(false);

  const userType = JSON.parse(localStorage.getItem("basicUserInfo")).userType;

  // const wordLimit = 50;

  // const getWordCount = (text) => {
  //   return text.trim().split(/\s+/).length;
  // }

  const navigate = useNavigate();

  const onSendClick = async () => {
    const loadingToast = toast.loading('Sending your message...');
    setCanSubmit(false);
    console.log("sending...")

    try {
      await verifySend();
      toast.success('Message sent!', { id: loadingToast });

      new Promise( res => setTimeout(res, 500) );

      navigate("/messages", {state: channelId});

    } catch (error) {
      toast.error("Error sending your message!");
      console.error("Error sending your message!", error);
      setCanSubmit(true);
    }
    }

  const verifySend = async () => {

    try{
        if(sendWithResume){
          const resumeRef = ref(storage, `resumes/resume_${currentUser.uid}.pdf`);
          if(!resumeRef){
            await sendConnectMessageWithoutResume(introMessage, currentUser.uid, userId, setChannelId, chat);
            return;
          }
          //TODO: Check this
          const resumeURL = await getDownloadURL(resumeRef);

          // Get the file metadata
          const metaData = await getMetadata(resumeRef);
          
          
          await sendConnectMessageWithResume(introMessage, resumeURL, metaData, currentUser.uid, userId, setChannelId, chat);
        }
        else{
          await sendConnectMessageWithoutResume(introMessage, currentUser.uid, userId, setChannelId, chat);
        }
    }catch(error){
        console.log(error);
        return;
    }

  }

  const handleIntroChange = (text) => {
    if(text.length > 0){
      setCanSubmit(true);
    }
    setIntroMessage(text);
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
      <Toaster position={'bottom-right'} reverseOrder={false}/>
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Connect Modal"
      >
        <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
        <header>
          {!isOpportunity ? <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px"}}> Contact {userName} <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Receive valuable opportunities, mentorship, and referrals</span></h2>
          :
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px"}}> Join {userName}'s {userType === "Professional" ? "Opportunity" : "Initiative"} <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Send an Introductory Message</span></h2>}
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{ display: "flex", flexDirection: "column", gap: "7px"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "5px", padding: "15px 5px"}}>
              <span style={{fontSize: "18px"}}>
                <span style={{fontWeight: "550", fontSize: "18px"}}>Email:</span>
                &nbsp;tittelk@awty.org
              </span>
              {userId && <span style={{fontSize: "18px"}}>
                <span style={{textDecoration: "", color: "black", fontWeight: "550"}}>Linkedin:</span>
                &nbsp;<button className='btnText' style={{fontSize: "18px", textDecoration: "underline", color: "#555CFF"}}>https://www.linkedin.com/in/konrad-tittel-b03122273/</button>
              </span>}
            </div>
            {sendDirectMessage && (<>
            <textarea className='inputIntroMessage' placeholder='Introduce yourself!' onChange={e => handleIntroChange(e.target.value)} value={introMessage} style={{width: "600px", height: "180px"}}></textarea>
            <div style={{margin: "0 auto", paddingTop: "15px"}}>
                <input type="checkbox" checked={sendWithResume} onChange={()=>setSendWithResume(!sendWithResume)}/>
                <span style={{fontSize: "larger", fontWeight: "300"}}>Attach resume in your message</span>
            </div>
            </>)}

        </main>
        <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
          <button onClick={onClose} className='btnUnfilled' style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Cancel</button>
          {sendDirectMessage ? <button onClick={onSendClick} disabled={!canSend} type='submit' className='btnSaveChanges' style={{background: !canSend && "grey", borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
            Send</button> :
            <button onClick={() => setSendDirectMessage(!sendDirectMessage)} className='btnSaveChanges' style={{borderRadius: "4px", width: "40%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Send Direct Message
            </button>}
          
        </footer>
      </Modal>
    </div>
  );
};