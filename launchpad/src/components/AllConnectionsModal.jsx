import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { IoCloseOutline } from 'react-icons/io5';
import { IoTrashOutline } from 'react-icons/io5';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getConnectionsByStatus, removeConnection } from '../services/connectionService';
import { displayColleges, displayFieldsOfInterest, displayShortenedName, getBasicUserDescription } from '../services/userProfileServices';
import DefaultIcon from './DefaultIcon/DefaultIcon';
import toast from 'react-hot-toast';
import './AllConnectionsModal.css';

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
      case "College Student":
        return "College Attending";
      case "Professional":
        return "Current Position";
      default:
        return "";
    }
  };

  const getBasicInfoContent = (userData) => {
    const userType = userData.userType;
    return {
      userPreface: userType === "College Student" ? getBasicUserDescription(userData) : getBasicUserDescription(userData).split(' in ')[0],
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
          : userType === "College Student"
            ? displayColleges([userData.collegeAttending], "shorter")
            : (Array.isArray(userData.collegeInterestsOrDecision) 
                ? displayColleges([...userData.collegeInterestsOrDecision], "shorter")
                : displayColleges([userData.collegeInterestsOrDecision]))
      }
    };
  };

  if (loading) {
    return (
      <div className="all-connections-modal-overlay">
        <div className="all-connections-modal">
          <div className="all-connections-modal-loading">
            <div className="all-connections-modal-loading-icon">⏳</div>
            <h2 className="all-connections-modal-loading-title">Loading Connections</h2>
            <p className="all-connections-modal-loading-text">
              Fetching your approved connections...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (approvedConnections.length === 0) {
    return (
      <div className="all-connections-modal-overlay" onClick={onClose}>
        <div className="all-connections-modal" onClick={(e) => e.stopPropagation()}>
          <div className="all-connections-modal-header">
            <button className="all-connections-modal-close-btn" onClick={onClose} title="Close">
              <IoCloseOutline size={20} />
            </button>
          </div>
          <div className="all-connections-modal-empty">
            <div className="all-connections-modal-empty-icon">🌱</div>
            <h2 className="all-connections-modal-empty-title">No Connections Yet</h2>
            <p className="all-connections-modal-empty-text">
              You haven't made any connections yet.<br/>
              <span>Start exploring profiles and connect with professionals, alumni, or peers!</span>
            </p>
            <button
              onClick={onClose}
              className="all-connections-modal-close-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <div style={{zIndex: 9999}}>
        <Toaster position="bottom-right" reverseOrder={false}/>
      </div> */}
      <div className="all-connections-modal-overlay" onClick={onClose}>
        <div className="all-connections-modal" onClick={(e) => e.stopPropagation()}>
          <div className="all-connections-modal-header">
            <button className="all-connections-modal-close-btn" onClick={onClose} title="Close">
              <IoCloseOutline size={20} />
            </button>
          </div>
          
          <div className="all-connections-modal-section">
            <div className="all-connections-modal-empty-icon">🤝</div>
            <h2 className="all-connections-modal-title">My Connections</h2>
            <p className="all-connections-modal-subtitle">
              {approvedConnections.length} connection{approvedConnections.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="all-connections-modal-content">
            <div className="all-connections-modal-connections-list">
              {approvedConnections.map((connection, index) => {
                const userId = connection.role === 'initiator' ? connection.targetUserId : connection.initiateUserId;
                const user = connectionData[userId];
                
                if (!user) return null;
                
                const basicInfoContent = getBasicInfoContent(user);
                
                return (
                  <div 
                    key={connection.id} 
                    className="all-connections-modal-connection-card"
                  >
                    <div className="all-connections-modal-connection-info">
                      <div className="all-connections-modal-connection-avatar">
                        {user.userPfpPreview ? (
                          <img 
                            src={user.userPfpPreview} 
                            alt="" 
                          />
                        ) : (
                          <DefaultIcon length="60px" size={30} />
                        )}
                      </div>
                      
                      <div className="all-connections-modal-connection-details">
                        <h3 className="all-connections-modal-connection-name">
                          {displayShortenedName(user.userName)}
                        </h3>
                        <p className="all-connections-modal-connection-description">
                          {basicInfoContent.userPreface}
                        </p>
                        
                        <div className="all-connections-modal-connection-info-grid">
                          <div className="all-connections-modal-connection-info-item">
                            <strong>{basicInfoContent.userFirstDesc.label}:</strong> {basicInfoContent.userFirstDesc.content}
                          </div>
                          <div className="all-connections-modal-connection-info-item">
                            <strong>{basicInfoContent.userSecondDesc.label}:</strong> {basicInfoContent.userSecondDesc.content}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="all-connections-modal-connection-actions">
                      <button
                        className="all-connections-modal-view-button"
                        onClick={() => onViewProfile && onViewProfile(user)}
                      >
                        View Profile
                      </button>
                      
                      <button
                        className="all-connections-modal-remove-button"
                        onClick={() => handleRemoveConnection(connection, userId)}
                        disabled={removingConnection === userId}
                      >
                        {removingConnection === userId ? (
                          'Removing...'
                        ) : (
                          <>
                            <IoTrashOutline size={14} />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 