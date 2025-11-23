import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { IoCloseOutline } from 'react-icons/io5';
import { parentConnectionRequestTemplate } from '../utils/parentVerificationTemplates';
import { useAuth } from '../contexts/auth/AuthContext';
import { addOrUpdateConnection, getConnectionsByStatus } from '../services/connectionService';
import './ParentalConnectionModal.css';

export default function ParentalConnectionModal({ professionalData, onClose, onApproved=()=>{} }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  const {currentUser} = useAuth();
  const userBasicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Check if already requested using new connection system
  useEffect(() => {
    const checkPendingConnection = async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const result = await getConnectionsByStatus(schoolId, 'pending_parental_approval');
        
        if (result.success && result.connections) {
          // Check if there's a pending parental approval connection between these users
          const hasPendingConnection = result.connections.some(conn => 
            (conn.initiateUserId === currentUser.uid && conn.targetUserId === professionalData.id) ||
            (conn.initiateUserId === professionalData.id && conn.targetUserId === currentUser.uid)
          );
          
          if (hasPendingConnection) {
            console.log("Connection already requested");
            setRequested(true);
          }
        }
      } catch (error) {
        console.error('Error checking pending connections:', error);
      }
    };
    
    checkPendingConnection();
  }, [professionalData.id, currentUser.uid]);

  const handleRequestApproval = async () => {
    setRequesting(true);

    try {
      // Generate verification link
      const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
      const verificationLinkResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: "connection",
        schoolId: localStorage.getItem("schoolId"),
        targetUserName: professionalData.userName,
        targetUserId: professionalData.id,
        userType: userBasicInfo.userType,
        targetUserType: professionalData.userType
      });

      // Extract the verification link from the result
      const verificationLink = verificationLinkResult.data;

      if (!verificationLink) {
        throw new Error('Failed to generate verification link');
      }

      // Send email
      const sendSESEmail = httpsCallable(getFunctions(), "sendSESEmail");
      const result = await sendSESEmail({
          recipient: [ userBasicInfo.parentEmail ], 
          subject: "Verify Your Student's Connection", 
          htmlTemplate: parentConnectionRequestTemplate({
            studentName: userBasicInfo.userName ? userBasicInfo.userName.split(" ")[0] : "",
            parentName: "", 
            professionalData, 
            verificationLink: verificationLink, 
            connectionType: professionalData.userType}),
          emailType: "parent_verification"
        });
        console.log("result: ", result);
        toast.success('Connection request sent to parent for approval!');
    }
    catch(e){
      console.log("ERROR: ", e);
      toast.error("Error sending your request. Please try again!");
    }

    // add to pending connections
    await addOrUpdateConnection(currentUser, professionalData, 'pending_parental_approval', null, true);
  
    setRequesting(false);
    setRequested(true);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* <div style={{zIndex: 9999}}>
        <Toaster position="bottom-right" reverseOrder={false}/>
      </div> */}
      <div className="parental-connection-modal-overlay">
        <div className="parental-connection-modal" ref={modalRef}>
          <div className="parental-connection-modal-header">
            <button className="parental-connection-modal-close-btn" onClick={handleClose} title="Close">
              <IoCloseOutline size={20} />
            </button>
          </div>
          
          <div className="parental-connection-modal-content">
            <div className="parental-connection-modal-icon">🤝</div>
            <h2 className="parental-connection-modal-title">
              {requested ? 'Connection Request Sent' : 'Parent Approval Required'}
            </h2>
            
            <div className="parental-connection-modal-message">
              {!requested ? (
                <>
                  <div className="parental-connection-modal-details-card">
                    {professionalData.userType === 'Professional' ? (
                      <>
                        <div className="parental-connection-modal-details-title">Professional Details:</div>
                        <div className="parental-connection-modal-details-item">
                          <strong>Name:</strong> {professionalData.userName}
                        </div>
                        <div className="parental-connection-modal-details-item">
                          <strong>Position:</strong> {professionalData.industryPosition} at {professionalData.companyName}
                        </div>
                        {professionalData.areasOfInterest && (
                          <div className="parental-connection-modal-details-item">
                            <strong>Expertise:</strong> {professionalData.areasOfInterest.join(', ')}
                          </div>
                        )}
                      </>
                    ) : professionalData.userType === 'College Student' ? (
                      <>
                        <div className="parental-connection-modal-details-title">College Student Details:</div>
                        <div className="parental-connection-modal-details-item">
                          <strong>Name:</strong> {professionalData.userName}
                        </div>
                        <div className="parental-connection-modal-details-item">
                          <strong>College:</strong> {professionalData.collegeAttending || ''}
                        </div>
                        {professionalData.areasOfInterest && professionalData.areasOfInterest.length > 0 && (
                          <div className="parental-connection-modal-details-item">
                            <strong>Fields of Study:</strong> {professionalData.areasOfInterest.join(', ')}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                  <p className="parental-connection-modal-description">
                    To connect with this {professionalData.userType === 'College Student' ? 'college student' : 'professional'}, we need your parent or guardian's approval for your safety.
                  </p>
                </>
              ) : (
                <>
                  <p className="parental-connection-modal-success-message">
                    Your request to connect with <strong>{professionalData.userName}</strong> has been sent to your parent/guardian for approval.
                  </p>
                  <p className="parental-connection-modal-subtitle">
                    You'll receive a notification once they approve or decline the connection.
                  </p>
                </>
              )}
            </div>

            {!requested && (
              <button
                onClick={handleRequestApproval}
                disabled={requesting}
                className="parental-connection-modal-button"
              >
                {requesting ? 'Sending Request...' : 'Request Parent Approval'}
              </button>
            )}

            {requested && (
              <button
                onClick={handleClose}
                className="parental-connection-modal-button"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 