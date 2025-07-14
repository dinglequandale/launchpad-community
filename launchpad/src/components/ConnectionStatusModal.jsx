import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { IoRefreshOutline } from 'react-icons/io5';
import { IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getConnectionsByStatus, removeConnection } from '../services/connectionService';
import { parentConnectionRequestTemplate } from '../utils/parentVerificationTemplates';
import { useAuth } from '../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import DefaultIcon from './DefaultIcon/DefaultIcon';
import { displayShortenedName, getBasicUserDescription, displayFieldsOfInterest, displayColleges } from '../services/userProfileServices';

export default function ConnectionStatusModal({ onClose, onConnect, filteredReceived, handleProfileClick }) {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [approvedConnections, setApprovedConnections] = useState([]);
  const [receivedConnections, setReceivedConnections] = useState([]);
  const [connectionData, setConnectionData] = useState({}); // { id: userData }
  const [resendingConnection, setResendingConnection] = useState(null);
  const [processingConnection, setProcessingConnection] = useState(null);
  const { currentUser } = useAuth();
  const [userBasicInfo, setUserBasicInfo] = useState(null);

  useEffect(() => {
    fetchAllConnections();
  }, []);

  const fetchAllConnections = async () => {
    try {
      const schoolId = localStorage.getItem('schoolId');
      const basicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
      setUserBasicInfo(basicInfo);

      // Fetch sent connections from localStorage (existing logic)
      const pending = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
      const approved = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
      setPendingConnections(pending);
      setApprovedConnections(approved);

      setReceivedConnections(filteredReceived);

      // Fetch user data for all connection IDs
      const allIds = [
        ...pending, 
        ...approved, 
        ...filteredReceived.map(conn => conn.role === 'initiator' ? conn.initiateUserId : conn.targetUserId)
      ];

      if (allIds.length > 0) {
        const userPromises = allIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'tenants', schoolId, 'users', uid));
          return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
        });
        
        const users = await Promise.all(userPromises);
        const data = {};
        users.forEach(user => {
          if (user) data[user.id] = user;
        });
        setConnectionData(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    }
  };

  const handleResendApproval = async (userId) => {
    try {
      setResendingConnection(userId);
      const user = connectionData[userId];
      const userBasicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
      
      if (!user || !userBasicInfo) {
        throw new Error('User data not found');
      }

      // Generate verification link
      const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
      const verificationLinkResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: "connection",
        schoolId: localStorage.getItem("schoolId"),
        targetUserName: user.userName,
        targetUserId: user.id,
        userType: userBasicInfo.userType,
        targetUserType: user.userType
      });

      // Extract the verification link from the result
      const verificationLink = verificationLinkResult.data;

      if (!verificationLink) {
        throw new Error('Failed to generate verification link');
      }

      // Send email
      const sendSESEmail = httpsCallable(getFunctions(), "sendSESEmail");
      const result = await sendSESEmail({
        recipient: [userBasicInfo.parentEmail], 
        subject: "Verify Your Student's Connection", 
        htmlTemplate: parentConnectionRequestTemplate({
          studentName: userBasicInfo.userName ? userBasicInfo.userName.split(" ")[0] : "",
          parentName: "", 
          professionalData: user, 
          verificationLink: verificationLink, 
          connectionType: user.userType
        }),
        emailType: "parent_verification"
      });

      console.log("Resend result: ", result);
      toast.success('Verification email resent to parent!');
    } catch (error) {
      console.error('Error resending approval:', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setResendingConnection(null);
    }
  };

  const handleConnectionAction = async (connection, action) => {
    try {
      setProcessingConnection(connection.id);
      const schoolId = localStorage.getItem('schoolId');
      const initiatorId = connection.initiateUserId;
      const isHighSchooler = userBasicInfo?.userType === 'High Schooler';
      
      if (action === 'approve') {
        if (isHighSchooler) {
          // High schoolers can't change status, just show success
          toast.success('Connection approved!');
        } else {
          // Adults can approve parent_approved connections
          if (connection.status === 'parent_approved') {
            // Update connection status to approved
            const manageConnections = httpsCallable(getFunctions(), "manageConnections");
            await manageConnections({
              action: 'updateStatus',
              schoolId,
              connectionId: connection.id,
              status: 'approved'
            });
            toast.success('Connection approved!');
          }
        }
      } else if (action === 'reject') {
        // Remove the connection
        await removeConnection(schoolId, initiatorId);
        toast.success('Connection rejected');
      }
      
      // Refresh connections
      await fetchAllConnections();
    } catch (error) {
      console.error('Error processing connection action:', error);
      toast.error('Failed to process connection action. Please try again.');
    } finally {
      setProcessingConnection(null);
    }
  };

  const hasUpdates = pendingConnections.length > 0 || approvedConnections.length > 0 || receivedConnections.length > 0;
  // if (!hasUpdates) {
  //   onClose();
  //   return null;
  // }

  // Helper to get description
  // (no longer needed, replaced by getBasicUserDescription and other helpers)

  return (
    <>
      <div style={{zIndex: 9999}}>
        <Toaster position="bottom-right" reverseOrder={false}/>
      </div>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.32)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div style={{
          background: '#fff',
          borderRadius: '5px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '0 28px 24px 28px',
          minWidth: 600,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          textAlign: 'center',
        }}>
          <button className='btnClose' onClick={onClose} style={{background:"none", color: "white", position: 'absolute', right: 12, top: 12}}><CgClose size={25}/></button>
          {/* Beautified header */}
          <div
            style={{
              background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              padding: '32px 0 20px 0',
              margin: '0 -28px 0 -28px',
              textAlign: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>📬</div>
            <h2 style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '0.01em',
              textShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
            }}>
              Connection Updates
            </h2>
          </div>
          <hr style={{
            border: 'none',
            borderTop: '2px solid #e3e8f7',
            margin: '0 0 24px 0'
          }} />
          <div style={{ color: '#444', marginBottom: 18, textAlign: 'left' }}>
            
            {/* Received Connection Requests */}
            {receivedConnections.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#9c27b0', marginBottom: '12px' }}>📥 Incoming Connection Requests</h3>
                {receivedConnections.map((connection, index) => {
                  const initiatorId = connection.initiateUserId;
                  const user = connectionData[initiatorId];
                  const isProcessing = processingConnection === connection.id;
                  const isHighSchooler = userBasicInfo?.userType === 'High Schooler';
                  const isParentApproved = connection.status === 'parent_approved';
                  if (!user) return null;
                  const basicInfoContent = user && getBasicUserDescription(user);
                  return (
                    <div key={connection.id} style={{ 
                      background: '#faf5ff', 
                      border: '1px solid #9c27b0', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(156, 39, 176, 0.08)',
                    }}>
                      {/* User Info Section */}
                      <div style={{ display: 'flex', flex: 1, gap: '18px', alignItems: 'center' }}>
                        {/* Profile Picture */}
                        <div style={{ flexShrink: 0 }}>
                          {user.userPfpPreview ? (
                            <img 
                              src={user.userPfpPreview} 
                              alt="" 
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                border: '2px solid #9c27b0',
                                boxShadow: '0 2px 8px rgba(156, 39, 176, 0.12)'
                              }}
                            />
                          ) : (
                            <DefaultIcon length="60px" size={30} />
                          )}
                        </div>
                        {/* User Details */}
                        <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100% - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 4 }}>
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: '1.18em', 
                              fontWeight: 700, 
                              color: '#6a1b9a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayShortenedName(user.userName)}
                            </h3>
                            <button 
                              style={{
                                background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 14px',
                                fontWeight: 600,
                                fontSize: '0.98em',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s, transform 0.2s',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #667eea 100%)'}
                              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)'}
                              onClick={() => handleProfileClick(user)}
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                              See Profile
                            </button>
                          </div>
                          <div style={{ fontSize: '0.98em', color: '#666', fontStyle: 'italic', marginBottom: 6 }}>
                            {basicInfoContent}
                          </div>
              
                          <div style={{ fontSize: '0.85em', color: '#9c27b0', marginTop: '8px', fontStyle: 'italic' }}>
                            {isParentApproved ? 'Parent approved - awaiting your decision' : 'Wants to connect with you'}
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexDirection: 'column', width: '120px', justifyContent: 'center' }}>
                        <button
                          className="btnConnect"
                          style={{
                            background: isProcessing ? '#ccc' : '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontSize: '0.95em',
                            transition: 'all 0.2s ease',
                            opacity: isProcessing ? 0.7 : 1,
                            width: '100%'
                          }}
                          onClick={() => !isProcessing && handleConnectionAction(connection, 'approve')}
                          disabled={isProcessing}
                        >
                          <IoCheckmarkOutline size={14} />
                          {isHighSchooler ? 'Accept' : 'Approve'}
                        </button>
                        <button
                          className="btnConnect"
                          style={{
                            background: isProcessing ? '#ccc' : '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontSize: '0.95em',
                            transition: 'all 0.2s ease',
                            opacity: isProcessing ? 0.7 : 1,
                            width: '100%'
                          }}
                          onClick={() => !isProcessing && handleConnectionAction(connection, 'reject')}
                          disabled={isProcessing}
                        >
                          <IoCloseOutline size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sent Approved Connections */}
            {approvedConnections.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#4caf50', marginBottom: '8px' }}>✅ Approved Connections</h3>
                {approvedConnections.map((uid, index) => {
                  const user = connectionData[uid];
                  if (!user) return null;
                  const basicInfoContent = getBasicUserDescription(user);
                  return (
                    <div key={uid} style={{ 
                      background: '#f8fff8', 
                      border: '1px solid #4caf50', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.10)',
                    }}>
                      <div style={{ display: 'flex', flex: 1, gap: '18px', alignItems: 'center' }}>
                        <div style={{ flexShrink: 0 }}>
                          {user.userPfpPreview ? (
                            <img 
                              src={user.userPfpPreview} 
                              alt="" 
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                border: '2px solid #4caf50',
                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.12)'
                              }}
                            />
                          ) : (
                            <DefaultIcon length="60px" size={30} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100% - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 4 }}>
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: '1.18em', 
                              fontWeight: 700, 
                              color: '#6a1b9a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayShortenedName(user.userName)}
                            </h3>
                            <button 
                              style={{
                                background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 14px',
                                fontWeight: 600,
                                fontSize: '0.98em',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s, transform 0.2s',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #667eea 100%)'}
                              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)'}
                              onClick={() => handleProfileClick(user)}
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                              See Profile
                            </button>
                          </div>
                          <div style={{ fontSize: '0.98em', color: '#666', fontStyle: 'italic', marginBottom: 6 }}>
                            {basicInfoContent}
                          </div>
                          
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexDirection: 'column', width: '120px', justifyContent: 'center' }}>
                        <button
                          className="btnConnect"
                          style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.95em',
                            transition: 'all 0.2s ease',
                            width: '100%'
                          }}
                          onClick={() => onConnect && onConnect(user)}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sent Pending Connections */}
            {pendingConnections.length > 0 && (
              <div>
                <h3 style={{ color: '#ff9800', marginBottom: '8px' }}>⏳ Pending Parent Approval</h3>
                {pendingConnections.map((uid, index) => {
                  const user = connectionData[uid];
                  const isResending = resendingConnection === uid;
                  if (!user) return null;
                  const basicInfoContent = getBasicUserDescription(user);
                  return (
                    <div key={uid} style={{ 
                      background: '#fff8f0', 
                      border: '1px solid #ff9800', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.10)',
                    }}>
                      <div style={{ display: 'flex', flex: 1, gap: '18px', alignItems: 'center' }}>
                        <div style={{ flexShrink: 0 }}>
                          {user.userPfpPreview ? (
                            <img 
                              src={user.userPfpPreview} 
                              alt="" 
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                border: '2px solid #ff9800',
                                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.12)'
                              }}
                            />
                          ) : (
                            <DefaultIcon length="60px" size={30} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100% - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 4 }}>
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: '1.18em', 
                              fontWeight: 700, 
                              color: '#6a1b9a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayShortenedName(user.userName)}
                            </h3>
                            <button 
                              style={{
                                background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 14px',
                                fontWeight: 600,
                                fontSize: '0.98em',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background 0.2s, transform 0.2s',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1976d2 0%, #667eea 100%)'}
                              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)'}
                              onClick={() => handleProfileClick(user)}
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                              See Profile
                            </button>
                          </div>
                          <div style={{ fontSize: '0.98em', color: '#666', fontStyle: 'italic', marginBottom: 6 }}>
                            {basicInfoContent}
                          </div>
                          
                          <div style={{ fontSize: '0.85em', color: '#ff9800', marginTop: '8px', fontStyle: 'italic' }}>
                            Waiting for parent approval
                          </div>
                        </div>
                      </div>
                      <button
                        className="btnConnect"
                        style={{
                          background: isResending ? '#ccc' : '#ff9800',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontWeight: 600,
                          cursor: isResending ? 'not-allowed' : 'pointer',
                          fontSize: '0.95em',
                          transition: 'all 0.2s ease',
                          opacity: isResending ? 0.7 : 1,
                          width: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center'
                        }}
                        onClick={() => !isResending && handleResendApproval(uid)}
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <IoRefreshOutline size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            Resending...
                          </>
                        ) : (
                          <>
                            <IoRefreshOutline size={14} />
                            Resend
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="btnSaveChanges"
            style={{
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1em',
            }}
          >
            Got it!
          </button>
        </div>
      </div>
      
      {/* CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 