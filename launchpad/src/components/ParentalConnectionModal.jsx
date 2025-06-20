import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

export default function ParentalConnectionModal({ professionalData, onClose, onApproved }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  // Check if already requested
  useEffect(() => {
    const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    
    if (pendingConnections.includes(professionalData.userId)) {
      setRequested(true);
    }
  }, [professionalData.userId]);

  const handleRequestApproval = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      setRequested(true);
      
      // Add to pending connections
      const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
      if (!pendingConnections.includes(professionalData.userId)) {
        pendingConnections.push(professionalData.userId);
        localStorage.setItem('pendingConnections', JSON.stringify(pendingConnections));
      }
      
      toast.success('Connection request sent to parent for approval!');
    }, 1500);
  };

  const handleClose = () => {
    if (requested) {
      // If already requested, close and allow viewing the professional
      onApproved && onApproved();
    }
    onClose();
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
            handleClose();
          }
        }}
      >
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '32px 28px 24px 28px',
          minWidth: 420,
          maxWidth: '90vw',
          position: 'relative',
          textAlign: 'center',
        }}>
          <button className='btnClose' onClick={handleClose} style={{background:"none"}}><CgClose size={25}/></button>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
          <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>
            {requested ? 'Connection Request Sent' : 'Parent Approval Required'}
          </h2>
          
          <div style={{ color: '#444', marginBottom: 18 }}>
            {!requested ? (
              <>
                <div style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Professional Details:</div>
                  <div><strong>Name:</strong> {professionalData.userName}</div>
                  <div><strong>Position:</strong> {professionalData.industryPosition} at {professionalData.companyName}</div>
                  {professionalData.areasOfInterest && (
                    <div><strong>Expertise:</strong> {professionalData.areasOfInterest.join(', ')}</div>
                  )}
                </div>
                <p>To connect with this professional, we need your parent or guardian's approval for your safety.</p>
              </>
            ) : (
              <>
                <p>Your request to connect with <strong>{professionalData.userName}</strong> has been sent to your parent/guardian for approval.</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                  You'll receive a notification once they approve or decline the connection.
                </p>
              </>
            )}
          </div>

          {!requested && (
            <button
              onClick={handleRequestApproval}
              disabled={requesting}
              className="btnSaveChanges"
              style={{
                background: requesting ? '#ccc' : '',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 24px',
                fontWeight: 600,
                cursor: requesting ? 'not-allowed' : 'pointer',
                marginBottom: 8,
                marginTop: 4,
                opacity: requesting ? 0.7 : 1,
                fontSize: '1em',
              }}
            >
              {requesting ? 'Sending Request...' : 'Request Parent Approval'}
            </button>
          )}

          {requested && (
            <button
              onClick={handleClose}
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
              Continue
            </button>
          )}
        </div>
      </div>
    </>
  );
} 