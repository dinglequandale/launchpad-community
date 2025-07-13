import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function AllConnectionsModal({ onClose, onViewProfile }) {
  const [approvedConnections, setApprovedConnections] = useState([]);
  const [connectionData, setConnectionData] = useState({}); // { id: userData }

  useEffect(() => {
    // Get connection IDs from localStorage
    const approved = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    setApprovedConnections(approved);

    // Fetch user data for all IDs
    if (approved.length === 0) return;
    const schoolId = localStorage.getItem('schoolId');
    Promise.all(
      approved.map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'tenants', schoolId, 'users', uid));
        return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
      })
    ).then(users => {
      const data = {};
      users.forEach(user => {
        if (user) data[user.id] = user;
      });
      setConnectionData(data);
    });
  }, []);

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

  // Helper to get description
  const getDescription = (user) => {
    if (!user) return '';
    if (user.userType === 'Professional') {
      return `${user.industryPosition || ''}${user.companyName ? ' at ' + user.companyName : ''}`;
    } else if (user.userType === 'Alumni') {
      return `Field: ${user.areasOfInterest?.join(', ') || ''} | College: ${user.collegeAttending || ''}`;
    } else {
      return '';
    }
  };

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
          minWidth: 450,
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
                {approvedConnections.map((uid, index) => {
                  const user = connectionData[uid];
                  return (
                    <div key={uid} style={{ 
                      background: '#f8fff8', 
                      border: '1px solid #4caf50', 
                      borderRadius: '5px', 
                      padding: '12px', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <strong>{user?.userName || 'Professional/Alumni'}</strong>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          {user?.areasOfInterest?.join(', ')}
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          {getDescription(user)}
                        </div>
                      </div>
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
                        }}
                        onClick={() => onViewProfile && onViewProfile(user)}
                      >
                        View Profile
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
            Close
          </button>
        </div>
      </div>
    </>
  );
} 