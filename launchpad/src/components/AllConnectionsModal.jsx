import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { IoTrashOutline } from 'react-icons/io5';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getConnectionsByStatus, removeConnection } from '../services/connectionService';
import { displayColleges, displayFieldsOfInterest, displayShortenedName, getBasicUserDescription } from '../services/userProfileServices';
import DefaultIcon from './DefaultIcon/DefaultIcon';
import toast from 'react-hot-toast';

export default function AllConnectionsModal({ onClose, onViewProfile }) {
  const [approvedConnections, setApprovedConnections] = useState([]);
  const [connectionData, setConnectionData] = useState({}); // { id: userData }
  const [loading, setLoading] = useState(true);
  const [removingConnection, setRemovingConnection] = useState(null);

  useEffect(() => {
    fetchApprovedConnections();
  }, []);

  const fetchApprovedConnections = async () => {
    try {
      setLoading(true);
      const schoolId = localStorage.getItem('schoolId');
      
      // Fetch approved connections from the database
      const result = await getConnectionsByStatus(schoolId, 'approved');
      
      if (result.success && result.connections) {
        setApprovedConnections(result.connections);
        
        // Extract user IDs from connections
        const userIds = result.connections.map(conn => 
          conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId
        );
        
        // Fetch user data for all IDs
        if (userIds.length > 0) {
          const userPromises = userIds.map(async (uid) => {
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
      }
    } catch (error) {
      console.error('Error fetching approved connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (connection, userId) => {
    try {
      setRemovingConnection(userId);
      const schoolId = localStorage.getItem('schoolId');
      
      await removeConnection(schoolId, userId);
      
      // Remove from local state
      setApprovedConnections(prev => prev.filter(conn => 
        !(conn.role === 'initiator' ? conn.targetUserId : conn.initiateUserId === userId)
      ));
      
      // Remove from connection data
      setConnectionData(prev => {
        const newData = { ...prev };
        delete newData[userId];
        return newData;
      });
      
      toast.success('Connection removed successfully');
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    } finally {
      setRemovingConnection(null);
    }
  };

  // Helper functions borrowed from UserCard
  const getDescType = (userData) => {
    switch(userData.userType){
      case "High Schooler":
        return userData.collegeDecision === "No" ? "Dream Colleges" : "Committed College";
      case "Alumni":
        return "Attending College";
      case "Professional":
        return "Current Position";
      default:
        return "";
    }
  };

  const getBasicInfoContent = (userData) => {
    const userType = userData.userType;
    return {
      userPreface: userType === "Alumni" ? getBasicUserDescription(userData) : getBasicUserDescription(userData).split(' in ')[0],
      userFirstDesc: {
        label: userType !== "Professional" ? "Interests" : "Expertise",
        content: (userData.areasOfInterest && userData.areasOfInterest.length > 0) 
          ? displayFieldsOfInterest(userData.areasOfInterest, "shorter") 
          : displayFieldsOfInterest(userData.areasOfInterest, "shorter")
      },
      userSecondDesc: {
        label: getDescType(userData),
        content: userType === "Professional" 
          ? (userData.industryPosition ? userData.industryPosition : "None")
          : userType === "Alumni" 
            ? displayColleges([userData.collegeAttending], "shorter")
            : (Array.isArray(userData.collegeInterestsOrDecision) 
                ? displayColleges([...userData.collegeInterestsOrDecision], "shorter")
                : displayColleges([userData.collegeInterestsOrDecision]))
      }
    };
  };

  if (loading) {
    return (
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
      >
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '32px 28px 24px 28px',
          minWidth: 350,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 18 }}>⏳</div>
          <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Loading Connections</h2>
          <div style={{ color: '#888', margin: '24px 0 32px 0', fontSize: '1.1em', lineHeight: 1.6 }}>
            Fetching your approved connections...
          </div>
        </div>
      </div>
    );
  }

  if (approvedConnections.length === 0) {
    return (
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
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '32px 28px 24px 28px',
          minWidth: 350,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          textAlign: 'center',
        }}>
          <button className='btnClose' onClick={onClose} style={{background:"none", position: 'absolute', right: 12, top: 12}}><CgClose size={25}/></button>
          <div style={{ fontSize: 48, marginBottom: 18 }}>🌱</div>
          <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>No Connections Yet</h2>
          <div style={{ color: '#888', margin: '24px 0 32px 0', fontSize: '1.1em', lineHeight: 1.6 }}>
            You haven't made any connections yet.<br/>
            <span style={{color: '#1976d2', fontWeight: 500}}>Start exploring profiles and connect with professionals, alumni, or peers!</span>
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
            Close
          </button>
        </div>
      </div>
    );
  }

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
          borderRadius: '16px',
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
            <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
            <h2 style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '0.01em',
              textShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
            }}>
              My Connections
            </h2>
          </div>
          <hr style={{
            border: 'none',
            borderTop: '2px solid #e3e8f7',
            margin: '0 0 24px 0'
          }} />
          <div style={{ color: '#444', marginBottom: 18, textAlign: 'left' }}>
            {approvedConnections.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {approvedConnections.map((connection, index) => {
                  const userId = connection.role === 'initiator' ? connection.targetUserId : connection.initiateUserId;
                  const user = connectionData[userId];
                  
                  if (!user) return null;
                  
                  const basicInfoContent = getBasicInfoContent(user);
                  
                  return (
                    <div 
                      key={connection.id} 
                      style={{ 
                        background: '#f8fff8', 
                        border: '1px solid #4caf50', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* User Info Section */}
                      <div style={{ display: 'flex', flex: 1, gap: '16px', alignItems: 'flex-start' }}>
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
                                border: '2px solid #4caf50',
                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
                              }}
                            />
                          ) : (
                            <DefaultIcon length="60px" size={30} />
                          )}
                        </div>
                        
                        {/* User Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: '8px' }}>
                            <h3 style={{ 
                              margin: '0 0 4px 0', 
                              fontSize: '1.2em', 
                              fontWeight: 700, 
                              color: '#2e7d32',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {displayShortenedName(user.userName)}
                            </h3>
                            <p style={{ 
                              margin: '0', 
                              fontSize: '0.9em', 
                              color: '#666',
                              fontStyle: 'italic'
                            }}>
                              {basicInfoContent.userPreface}
                            </p>
                          </div>
                          
                          {/* User Information */}
                          <div style={{ fontSize: '0.9em', color: '#555' }}>
                            <div style={{ 
                              marginBottom: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              <strong>{basicInfoContent.userFirstDesc.label}:</strong> {basicInfoContent.userFirstDesc.content}
                            </div>
                            <div style={{ 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              <strong>{basicInfoContent.userSecondDesc.label}:</strong> {basicInfoContent.userSecondDesc.content}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexDirection: "column", width: "140px", height: "100%", justifyContent: "center", alignItems: "center" }}>
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
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1565c0';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#1976d2';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          onClick={() => onViewProfile && onViewProfile(user)}
                        >
                          View Profile
                        </button>
                        
                        {/* Remove Connection Button */}
                        <button
                          className="btnConnect"
                          style={{
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.95em',
                            transition: 'all 0.2s ease',
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e01e10';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f44336';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          onClick={() => handleRemoveConnection(connection, userId)}
                          disabled={removingConnection === userId}
                        >
                          {removingConnection === userId ? (
                            'Removing...'
                          ) : (
                            <>
                              <IoTrashOutline size={14} style={{ marginRight: '4px' }} />
                              Remove
                            </>
                          )}
                        </button>
                      </div>
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
            Close
          </button>
        </div>
      </div>
    </>
  );
} 