import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

export default function ParentalVerificationModal({ parentEmail, parentVerified, onResend, onClose, onUpdateEmail, userEmail }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(parentEmail || '');
  const [emailError, setEmailError] = useState('');

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResent(true);
      toast.success('Parent verification email sent successfully!');
      if (onResend) onResend();
    }, 1200);
  };

  const handleEdit = () => {
    setEditing(true);
    setNewEmail(parentEmail || '');
    setEmailError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEmailError('');
  };

  const handleSave = () => {
    if (!newEmail.trim()) {
      setEmailError('Email cannot be empty.');
      return;
    }
    if (userEmail && newEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()) {
      setEmailError("Parent/Guardian email cannot be the same as your own email.");
      return;
    }
    setEmailError('');
    onUpdateEmail(newEmail.trim());
    setEditing(false);
    setResent(false);
    toast.success('Parent email updated successfully!');
  };

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Simple edit icon SVG
  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );

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
      onClick={handleBackdropClick}
    >
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '32px 28px 24px 28px',
        minWidth: 380,
        maxWidth: '90vw',
        position: 'relative',
        textAlign: 'center',
      }}>
        <button className='btnClose' onClick={onClose} style={{background:"none"}}><CgClose size={25}/></button>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
        <h2 style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Parental Consent {parentVerified ? 'Approved' : 'Pending'}</h2>
        <div style={{ color: '#444', marginBottom: 18 }}>
          {parentVerified
            ? 'Your parent or guardian has approved your access. You now have full functionality!'
            : (
              <>
                <div style={{ marginBottom: 8 }}>
                  <span>Your parent/guardian at </span>
                  {!editing ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <b>{parentEmail}</b>
                      <button
                        onClick={handleEdit}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1976d2',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Edit email"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '1em',
                          width: '280px',
                          outline: 'none',
                          borderColor: '#1976d2',
                        }}
                        autoFocus
                        placeholder="Enter parent/guardian email"
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={handleSave}
                          className="btnSaveChanges"
                          style={{
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            width: '80px',
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btnUnfilled"
                          style={{
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {emailError && <div style={{ color: 'red', marginBottom: 6, fontSize: '0.9em' }}>{emailError}</div>}
                You can use Launchpad, but some features may be restricted until approval.
              </>
            )}
        </div>
        {!parentVerified && !editing && (
          <>
            <button
              onClick={handleResend}
              disabled={resending}
              className="btnSaveChanges"
              style={{
                background: resent ? '#4caf50' : '',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 18px',
                fontWeight: 600,
                cursor: resending ? 'not-allowed' : 'pointer',
                marginBottom: 8,
                marginTop: 4,
                opacity: resending ? 0.7 : 1,
                fontSize: '1em',
              }}
            >
              {resending ? 'Resending...' : (resent ? 'Resent!' : 'Resend Email')}
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
} 