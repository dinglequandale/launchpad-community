import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { db } from '../firebase/firebaseConfig'; // adjust path as needed
import { doc, getDoc } from 'firebase/firestore';

export default function ConnectionStatusModal({ onClose, onConnect }) {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [approvedConnections, setApprovedConnections] = useState([]);
  const [connectionData, setConnectionData] = useState({}); // { id: userData }

  useEffect(() => {
    // Get connection IDs from localStorage
    const pending = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    setPendingConnections(pending);
    setApprovedConnections(approved);

    // Fetch user data for all IDs
    const allIds = [...pending, ...approved];
    if (allIds.length === 0) return;

    const schoolId = localStorage.getItem('schoolId');
    Promise.all(
      allIds.map(async (uid) => {
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

  const hasUpdates = pendingConnections.length > 0 || approvedConnections.length > 0;
  if (!hasUpdates) {
    onClose();
    return null;
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
          padding: '32px 28px 24px 28px',
          minWidth: 450,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          textAlign: 'center',
        }}>
          <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
          <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Connection Updates</h2>
          
          <div style={{ color: '#444', marginBottom: 18, textAlign: 'left' }}>
            {approvedConnections.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#4caf50', marginBottom: '8px' }}>✅ Approved Connections</h3>
                {approvedConnections.map((uid, index) => {
                  const user = connectionData[uid];
                  return (
                    <div key={uid} style={{ 
                      background: '#f8fff8', 
                      border: '1px solid #4caf50', 
                      borderRadius: '6px', 
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
                        onClick={() => onConnect && onConnect(user)}
                      >
                        Connect
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {pendingConnections.length > 0 && (
              <div>
                <h3 style={{ color: '#ff9800', marginBottom: '8px' }}>⏳ Pending Approval</h3>
                {pendingConnections.map((uid, index) => {
                  const user = connectionData[uid];
                  return (
                    <div key={uid} style={{ 
                      background: '#fff8f0', 
                      border: '1px solid #ff9800', 
                      borderRadius: '6px', 
                      padding: '12px', 
                      marginBottom: '8px' 
                    }}>
                      <strong>{user?.userName || 'Professional/Alumni'}</strong>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {user?.areasOfInterest?.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {getDescription(user)}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#ff9800', marginTop: '4px' }}>
                        Waiting for parent approval
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
            Got it!
          </button>
        </div>
      </div>
    </>
  );
} 