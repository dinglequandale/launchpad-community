import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

export default function ConnectionStatusModal({ onClose }) {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [approvedConnections, setApprovedConnections] = useState([]);
  const [professionalData, setProfessionalData] = useState({});

  useEffect(() => {
    // Get connection data from localStorage
    const pending = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
    
    setPendingConnections(pending);
    setApprovedConnections(approved);

    // For demo purposes, let's simulate some professional data
    // In real app, you'd fetch this from your database
    const mockProfessionalData = {
      'prof1': { userName: 'John Smith', industryPosition: 'Software Engineer', companyName: 'Google' },
      'prof2': { userName: 'Sarah Johnson', industryPosition: 'Marketing Director', companyName: 'Microsoft' },
      'prof3': { userName: 'Mike Davis', industryPosition: 'Data Scientist', companyName: 'Amazon' },
    };
    setProfessionalData(mockProfessionalData);
  }, []);

  const hasUpdates = pendingConnections.length > 0 || approvedConnections.length > 0;

  if (!hasUpdates) {
    onClose();
    return null;
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
                {approvedConnections.map((profId, index) => (
                  <div key={index} style={{ 
                    background: '#f8fff8', 
                    border: '1px solid #4caf50', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    marginBottom: '8px' 
                  }}>
                    <strong>{professionalData[profId]?.userName || 'Professional'}</strong>
                    {professionalData[profId] && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {professionalData[profId].industryPosition} at {professionalData[profId].companyName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pendingConnections.length > 0 && (
              <div>
                <h3 style={{ color: '#ff9800', marginBottom: '8px' }}>⏳ Pending Approval</h3>
                {pendingConnections.map((profId, index) => (
                  <div key={index} style={{ 
                    background: '#fff8f0', 
                    border: '1px solid #ff9800', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    marginBottom: '8px' 
                  }}>
                    <strong>{professionalData[profId]?.userName || 'Professional'}</strong>
                    {professionalData[profId] && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {professionalData[profId].industryPosition} at {professionalData[profId].companyName}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8em', color: '#ff9800', marginTop: '4px' }}>
                      Waiting for parent approval
                    </div>
                  </div>
                ))}
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