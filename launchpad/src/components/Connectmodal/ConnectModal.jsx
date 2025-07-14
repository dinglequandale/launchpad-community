import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { sendConnectMessageWithoutResume, sendConnectMessageWithResume } from '../../Streamchat/chatFunctions/sendConnectMessage';
import { useAuth } from '../../contexts/auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../firebase/firebaseConfig';
import toast, { Toaster } from 'react-hot-toast';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { CgClose } from 'react-icons/cg';
import {  displayShortenedLinkedin } from '../../services/userProfileServices';
import { addOrUpdateConnection } from '../../services/connectionService';

// TODO: actually implement clickedUser logic
export default function ConnectModal({visibility, chat, onClose, userId, userData, isOpportunity=false, opportunityType=null, onConnectionSuccess, isConnected: initialConnectionStatus}){

  const [introMessage, setIntroMessage] = useState("");
  const [sendWithResume, setSendWithResume] = useState(false);
  const [channelId, setChannelId] = useState("")
  const {currentUser} = useAuth();
  const [canSend, setCanSubmit] = useState(introMessage.length > 0);
  const [isConnected, setIsConnected] = useState(initialConnectionStatus || false);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionCreated, setConnectionCreated] = useState(false);

  const [sendDirectMessage, setSendDirectMessage] = useState(false);

  // const userType = JSON.parse(localStorage.getItem("basicUserInfo")).userType;
  const userType = userData.userType;

  const schoolId = localStorage.getItem("schoolId");
  const navigate = useNavigate();

  // Reset connection state when modal opens/closes
  useEffect(() => {
    if (visibility) {
      setIsConnected(initialConnectionStatus || false);
      setConnectionCreated(false);
    }
  }, [visibility, initialConnectionStatus]);

  const createConnection = async () => {
    // Prevent duplicate connections
    if (isCreatingConnection || connectionCreated || isConnected) {
      console.log('Connection creation prevented - already in progress or exists');
      return { success: true, alreadyExists: true };
    }

    try {
      setIsCreatingConnection(true);
      
      // Determine connection status based on user types
      const currentUserInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
      const currentUserType = currentUserInfo.userType;
      const targetUserType = userData.userType;
      
      // Determine if approval is needed
      const needsApproval = currentUserType === 'High Schooler' && targetUserType !== 'High Schooler';
      const connectionStatus = "pending";
      
      const result = await addOrUpdateConnection(
        currentUser, 
        userData, 
        connectionStatus, 
        setIsConnected
      );
      
      if (result.success === false && result.message === 'Connection already exists') {
        console.log('Connection already exists');
        setIsConnected(true);
        setConnectionCreated(true);
        return { success: true, alreadyExists: true };
      }
      
      console.log('Connection created successfully:', result);
      setConnectionCreated(true);
      
      // Call success callback to refresh connection status
      if (onConnectionSuccess) {
        onConnectionSuccess();
      }
      
      return { success: true, alreadyExists: false };
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    } finally {
      setIsCreatingConnection(false);
    }
  };

  const handleLinkedInClick = async () => {
    try {
      // Create connection when LinkedIn is clicked
      await createConnection();
      
      // Open LinkedIn in new tab
      window.open(userData.linkedinLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error handling LinkedIn click:', error);
      toast.error('Failed to create connection');
    }
  };

  const handleEmailCopy = async () => {
    try {
      // Create connection when email is copied
      await createConnection();
      
      // Copy email to clipboard
      if (userData.email) {
        await navigator.clipboard.writeText(userData.email);
        toast.success('Email copied to clipboard!');
      }
    } catch (error) {
      console.error('Error handling email copy:', error);
      toast.error('Failed to copy email or create connection');
    }
  };

  const onSendClick = async () => {
    const loadingToast = toast.loading('Sending your message...');
    setCanSubmit(false);
    console.log("sending...")

    try {
      // Create connection when message is sent
      await createConnection();
      
      // Message is already sent, just send the message
      await verifySend();
      toast.success('Message sent!', { id: loadingToast });

      // Call success callback to refresh connection status
      if (onConnectionSuccess) {
        onConnectionSuccess();
      }

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
            await sendConnectMessageWithoutResume(introMessage, currentUser.uid, userId, setChannelId, chat, schoolId);
            return;
          }
          //TODO: Check this
          const resumeURL = await getDownloadURL(resumeRef);

          // Get the file metadata
          const metaData = await getMetadata(resumeRef);
          
          
          await sendConnectMessageWithResume(introMessage, resumeURL, metaData, currentUser.uid, userId, setChannelId, chat, schoolId);
        }
        else{
          await sendConnectMessageWithoutResume(introMessage, currentUser.uid, userId, setChannelId, chat, schoolId);
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
      zIndex: "9998",
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: "9998",
    }
  };

  useEffect(() => {
    console.log("schoolId", schoolId);
    console.log("receiving user", userId);
    console.log("current user", currentUser.uid);
  }, [schoolId]);

  return (
    <div>
      <div style={{zIndex: 9999}}>
      <Toaster position={'bottom-right'} reverseOrder={false} />
      </div>
      
      <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Connect Modal"
      >
        <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
        <header>
          {!isOpportunity ? <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px"}}> Contact {userData.userName} <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Receive valuable opportunities, mentorship, and referrals</span></h2>
          :
          <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px"}}> Learn More about {userData.userName.split(" ")[0]}'s {userType === "Professional" ? "Opportunity" : "Initiative"} <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Send an Introductory Message</span></h2>}
          <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{ display: "flex", flexDirection: "column", gap: "7px", width: "600px", overflow: "clip"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "5px", padding: "15px 5px"}}>
              {<span style={{fontSize: "18px"}}>
                <span style={{fontWeight: "550", fontSize: "18px"}}>Email:</span>
                &nbsp;{userData.email ? (
                  <span 
                    style={{
                      cursor: 'pointer',
                      color: '#1976d2',
                      textDecoration: 'underline',
                      userSelect: 'text'
                    }}
                    onClick={handleEmailCopy}
                    title="Click to copy email"
                  >
                    {userData.email}
                  </span>
                ) : "No email provided"}
              </span>}
              {userData.linkedinLink && <span style={{fontSize: "18px"}}>
                <span style={{textDecoration: "", color: "black", fontWeight: "550"}}>Linkedin:</span>
                &nbsp;<Link 
                  onClick={handleLinkedInClick}
                  style={{
                    cursor: 'pointer',
                    color: '#0077b5',
                    textDecoration: 'underline'
                  }}
                >
                  {displayShortenedLinkedin(userData.linkedinLink)}
                </Link>
              </span>}
            </div>
            {sendDirectMessage && (<div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <textarea className='inputIntroMessage' placeholder='Introduce yourself!' onChange={e => handleIntroChange(e.target.value)} value={introMessage} style={{width: "500px", height: "180px"}}></textarea>
            <div style={{margin: "0 auto", paddingTop: "15px"}}>
                <input type="checkbox" checked={sendWithResume} onChange={()=>setSendWithResume(!sendWithResume)}/>
                <span style={{fontSize: "larger", fontWeight: "300"}}>Attach resume in your message</span>
            </div>
            </div>)}

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