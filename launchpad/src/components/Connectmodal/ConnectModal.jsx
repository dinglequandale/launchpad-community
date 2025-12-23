import { useEffect, useState, useRef } from 'react';
import { sendConnectMessageWithoutResume, sendConnectMessageWithResume } from '../../Streamchat/chatFunctions/sendConnectMessage';
import { useAuth } from '../../contexts/auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../firebase/firebaseConfig';
import toast, { Toaster } from 'react-hot-toast';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { IoCloseOutline } from 'react-icons/io5';
import { displayShortenedLinkedin } from '../../services/userProfileServices';
import { addOrUpdateConnection } from '../../services/connectionService';
import Loading from '../LoadingAnimation/Loading';
import './ConnectModal.css';

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
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const modalRef = useRef(null);

  // Debug logging
  console.log('ConnectModal received props:', {
    visibility,
    chat: !!chat,
    chatUserID: chat?.userID,
    userId,
    userData: userData?.userId,
    isOpportunity,
    chatType: typeof chat,
    chatConstructor: chat?.constructor?.name
  });

  const userType = userData.userType;
  const navigate = useNavigate();
  const targetUserId = userId || userData?.userId || userData?.id; // Use userId if provided, otherwise extract from userData

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (visibility) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [visibility, onClose]);

  // Reset connection state when modal opens/closes
  useEffect(() => {
    if (visibility) {
      setIsConnected(initialConnectionStatus || false);
      setConnectionCreated(false);
    }
  }, [visibility, initialConnectionStatus]);

  // Check if user has resume when modal opens
  useEffect(() => {
    const checkResume = async () => {
      if (!visibility || !currentUser) return;

      try {
        const resumeRef = ref(storage, `resumes/${currentUser.uid}`);
        await getMetadata(resumeRef);
        setHasResume(true);
      } catch (error) {
        // Resume doesn't exist
        setHasResume(false);
        setSendWithResume(false); // Uncheck if user doesn't have resume
      }
    };

    checkResume();
  }, [visibility, currentUser]);

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
      await navigator.clipboard.writeText(userData.email);
      toast.success('Email copied to clipboard!');
    } catch (error) {
      console.error('Error copying email:', error);
      toast.error('Failed to copy email');
    }
  };

  const onSendClick = async () => {
    try {
      setIsSendingMessage(true);
      console.log('ConnectModal onSendClick called with:', {
        introMessage: introMessage?.substring(0, 50) + '...',
        currentUserUid: currentUser?.uid,
        targetUserId,
        chat: !!chat,
        sendWithResume
      });
      
      // Create connection first
      const connectionResult = await createConnection();
      
      if (connectionResult.success) {
        // Send message and get the channel ID
        let channelId;
        if (sendWithResume) {
          // Fetch resume data for sending with resume
          const resumeRef = ref(storage, `resumes/${currentUser.uid}`);
          const resumeURL = await getDownloadURL(resumeRef);
          const metaData = await getMetadata(resumeRef);

          channelId = await sendConnectMessageWithResume(
            introMessage,
            resumeURL,
            metaData,
            currentUser.uid,
            targetUserId,
            setChannelId,
            chat
          );
        } else {
          channelId = await sendConnectMessageWithoutResume(
            introMessage,
            currentUser.uid,
            targetUserId,
            setChannelId,
            chat
          );
        }

        toast.success('Message sent successfully!');
        // Navigate to chat with the channel ID so the conversation opens automatically
        console.log('[ConnectModal] Navigating to chat with channel ID:', channelId);
        navigate('/chat', { state: channelId });
        onClose();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const verifySend = async () => {
    try {
      // Check if user has a resume
      const resumeRef = ref(storage, `resumes/${currentUser.uid}`);
      const metadata = await getMetadata(resumeRef);
      
      if (metadata) {
        // User has a resume, proceed with sending
        await onSendClick();
      } else {
        // No resume found
        toast.error('No resume found. Please upload a resume first.');
      }
    } catch (error) {
      console.error('Error verifying resume:', error);
      toast.error('No resume found. Please upload a resume first.');
    }
  };

  const handleIntroChange = (text) => {
    setIntroMessage(text);
    setCanSubmit(text.length > 0);
  };

  if (!visibility) return null;

  return (
    <div className="connect-modal-overlay">
      <div className="connect-modal" ref={modalRef}>
        <div className="connect-modal-header">
          <button className="connect-modal-close-btn" onClick={onClose} title="Close">
            <IoCloseOutline size={20} />
          </button>
        </div>
        
        <div className="connect-modal-content">
          <header>
            {!isOpportunity ? (
              <h2 className="connect-modal-title">
                Contact {userData.userName}
              </h2>
            ) : (
              <h2 className="connect-modal-title">
                Learn More about {userData.userName.split(" ")[0]}'s {userType === "Professional" ? "Opportunity" : "Initiative"}
              </h2>
            )}
            <p className="connect-modal-subtitle">
              {!isOpportunity ? "Receive valuable opportunities, mentorship, and referrals" : "Send an Introductory Message"}
            </p>
            <hr className="connect-modal-divider"/>
          </header>
          
          <main>
            <div className="connect-modal-contact-info">
              <div className="connect-modal-contact-item">
                <span className="connect-modal-contact-label">Email:</span>
                {userData.email ? (
                  <span 
                    className="connect-modal-contact-value"
                    onClick={handleEmailCopy}
                    title="Click to copy email"
                  >
                    {userData.email}
                  </span>
                ) : (
                  <span>No email provided</span>
                )}
              </div>
              
              {userData.linkedinLink && (
                <div className="connect-modal-contact-item">
                  <span className="connect-modal-contact-label">LinkedIn:</span>
                  <Link 
                    onClick={handleLinkedInClick}
                    className="connect-modal-contact-value linkedin"
                  >
                    {displayShortenedLinkedin(userData.linkedinLink)}
                  </Link>
                </div>
              )}
            </div>
            
            {sendDirectMessage && (
              <div className="connect-modal-message-section">
                <textarea
                  className="connect-modal-textarea"
                  placeholder="Introduce yourself!"
                  onChange={e => handleIntroChange(e.target.value)}
                  value={introMessage}
                />
                {hasResume && (
                  <div className="connect-modal-checkbox-container">
                    <input
                      type="checkbox"
                      className="connect-modal-checkbox"
                      checked={sendWithResume}
                      onChange={() => setSendWithResume(!sendWithResume)}
                    />
                    <span className="connect-modal-checkbox-label">
                      Attach resume in your message
                    </span>
                  </div>
                )}
              </div>
            )}
          </main>
          
          <footer className="connect-modal-footer">
            <button 
              onClick={onClose} 
              className="connect-modal-cancel-button"
            >
              Cancel
            </button>
            
            {sendDirectMessage ? (
              <button 
                onClick={onSendClick} 
                disabled={!canSend || isSendingMessage} 
                type="submit" 
                className={`connect-modal-send-button ${isSendingMessage ? 'sending' : ''}`}
              >
                {isSendingMessage ? (
                  <>
                    <Loading size="20" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            ) : (
              <button 
                onClick={() => setSendDirectMessage(!sendDirectMessage)} 
                className="connect-modal-send-button"
              >
                Send Direct Message
              </button>
            )}
          </footer>
        </div>
      </div>
{/*       
      <div style={{zIndex: 9999}}>
        <Toaster position={'bottom-right'} reverseOrder={false} />
      </div> */}
    </div>
  );
}