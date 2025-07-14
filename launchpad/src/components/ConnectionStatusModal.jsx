import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/auth/AuthContext';
import DefaultIcon from './DefaultIcon/DefaultIcon';
import { displayShortenedName, getBasicUserDescription } from '../services/userProfileServices';
import { IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { CgClose } from 'react-icons/cg';
import { getFunctions, httpsCallable } from 'firebase/functions';
import './ConnectionStatusModal.css';

export default function ConnectionStatusModal({
  pending = [],
  pending_parental_approval = [],
  parent_approved = [],
  approved = [],
  incomingRequests = [],
  onClose,
  onConnect,
  handleProfileClick,
  refetchConnections,
  ...props
}) {
  const { currentUser } = useAuth();
  const [userMap, setUserMap] = useState({});
  const [loadingAction, setLoadingAction] = useState({}); // { [connId]: 'approve' | 'deny' | null }
  const [removingCards, setRemovingCards] = useState({}); // Track cards being animated out
  const [hiddenCards, setHiddenCards] = useState(new Set()); // Track cards to hide after animation
  const userType = localStorage.getItem("basicUserInfo") ? JSON.parse(localStorage.getItem("basicUserInfo")).userType : "";

  useEffect(() => {
    const allConnections = [
      ...pending,
      ...pending_parental_approval,
      ...parent_approved,
      ...approved,
      ...incomingRequests,
    ];
    const userIds = new Set();
    allConnections.forEach(conn => {
      if (!currentUser?.uid) return;
      const otherId = conn.initiateUserId === currentUser.uid ? conn.targetUserId : conn.initiateUserId;
      userIds.add(otherId);
    });
    if (userIds.size === 0) {
      setUserMap({});
      return;
    }
    const schoolId = localStorage.getItem('schoolId');
    Promise.all(
      Array.from(userIds).map(async userId => {
        const userDoc = await getDoc(doc(db, 'tenants', schoolId, 'users', userId));
        return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
      })
    ).then(users => {
      const map = {};
      users.forEach(user => {
        if (user) map[user.id] = user;
      });
      setUserMap(map);
    });
  }, [pending, pending_parental_approval, parent_approved, approved, incomingRequests, currentUser?.uid]);

  // Clear hiddenCards after backend data updates (when any connection array changes)
  useEffect(() => {
    setHiddenCards(new Set());
  }, [pending, pending_parental_approval, parent_approved, approved, incomingRequests]);

  const getOtherUser = (conn) => {
    if (!currentUser?.uid) return null;
    const otherId = conn.initiateUserId === currentUser.uid ? conn.targetUserId : conn.initiateUserId;
    return userMap[otherId] || null;
  };

  // Approve logic
  const handleApprove = async (conn) => {
    setLoadingAction((prev) => ({ ...prev, [conn.id]: 'approve' }));
    setRemovingCards((prev) => ({ ...prev, [conn.id]: true }));
    setHiddenCards(prev => new Set(prev).add(conn.id));
    setTimeout(async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const manageConnections = httpsCallable(getFunctions(), 'manageConnections');
        await manageConnections({
          action: 'updateStatus',
          schoolId,
          connectionId: conn.id,
          status: 'approved',
        });
        // if (refetchConnections) await refetchConnections();
      } catch (error) {
        console.error('Error approving connection:', error);
      } finally {
        setLoadingAction((prev) => ({ ...prev, [conn.id]: null }));
        setRemovingCards((prev) => {
          const newState = { ...prev };
          delete newState[conn.id];
          return newState;
        });
      }
    }, 400); // Match animation duration
  };

  // Deny logic
  const handleDeny = async (conn) => {
    setLoadingAction((prev) => ({ ...prev, [conn.id]: 'deny' }));
    setRemovingCards((prev) => ({ ...prev, [conn.id]: true }));
    setHiddenCards(prev => new Set(prev).add(conn.id));
    setTimeout(async () => {
      try {
        const schoolId = localStorage.getItem('schoolId');
        const manageConnections = httpsCallable(getFunctions(), 'manageConnections');
        await manageConnections({
          action: 'remove',
          schoolId,
          targetUserId: conn.initiateUserId === currentUser.uid ? conn.targetUserId : conn.initiateUserId,
        });
        if (refetchConnections) await refetchConnections();
      } catch (error) {
        console.error('Error denying connection:', error);
      } finally {
        setLoadingAction((prev) => ({ ...prev, [conn.id]: null }));
        setRemovingCards((prev) => {
          const newState = { ...prev };
          delete newState[conn.id];
          return newState;
        });
      }
    }, 400); // Match animation duration
  };

  // Helper to render a styled card for a connection
  const renderConnectionCard = (conn, user, section, extra = null, showActions = false) => {
    if (!user) return <div key={conn.id}>Loading...</div>;
    const basicInfoContent = getBasicUserDescription(user);
    let borderColor = '#9c27b0', bgColor = '#faf5ff';
    if (section === 'pending_parental_approval') {
      borderColor = '#ff9800'; bgColor = '#fff8f0';
    } else if (section === 'approved' || section === 'parent_approved') {
      borderColor = '#4caf50'; bgColor = '#f8fff8';
    } else if (section === 'pending') {
      borderColor = '#1976d2'; bgColor = '#f0f8ff';
    }
    if (section === 'incoming') {
      borderColor = '#9c27b0'; bgColor = '#faf5ff';
    }
    const showConnectBtn = section === 'approved' || section === 'parent_approved';
    return (
      <div key={conn.id}
        className={removingCards[conn.id] ? 'connection-card-removing' : ''}
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          boxShadow: `0 2px 8px ${borderColor}22`,
        }}
      >
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
                  border: `2px solid ${borderColor}`,
                  boxShadow: `0 2px 8px ${borderColor}22`
                }}
              />
            ) : (
              <DefaultIcon length="60px" size={30} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: showConnectBtn ? 'calc(100% - 180px)' : 'calc(100% - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', marginRight: showConnectBtn ? 10 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 4 }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.18em',
                fontWeight: 700,
                color: borderColor,
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
                onClick={() => handleProfileClick && handleProfileClick(user)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                See Profile
              </button>
            </div>
            <div style={{ fontSize: '0.98em', color: '#666', fontStyle: 'italic', marginBottom: 6 }}>
              {basicInfoContent}
            </div>
            {extra}
          </div>
        </div>
        {/* Action Buttons for incomingRequests */}
        {showActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 120, alignItems: 'center', justifyContent: 'center' }}>
            <button
              className="btnConnect"
              style={{
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                fontWeight: 600,
                cursor: loadingAction[conn.id] === 'approve' ? 'not-allowed' : 'pointer',
                fontSize: '0.95em',
                transition: 'all 0.2s ease',
                width: '100%',
                opacity: loadingAction[conn.id] === 'approve' ? 0.7 : 1
              }}
              onClick={() => loadingAction[conn.id] ? null : handleApprove(conn)}
              disabled={loadingAction[conn.id] === 'approve'}
            >
              {loadingAction[conn.id] === 'approve' ? 'Approving...' : (<><IoCheckmarkOutline size={14} /> Approve</>)}
            </button>
            <button
              className="btnConnect"
              style={{
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                fontWeight: 600,
                cursor: loadingAction[conn.id] === 'deny' ? 'not-allowed' : 'pointer',
                fontSize: '0.95em',
                transition: 'all 0.2s ease',
                width: '100%',
                opacity: loadingAction[conn.id] === 'deny' ? 0.7 : 1
              }}
              onClick={() => loadingAction[conn.id] ? null : handleDeny(conn)}
              disabled={loadingAction[conn.id] === 'deny'}
            >
              {loadingAction[conn.id] === 'deny' ? 'Denying...' : (<><IoCloseOutline size={14} /> Deny</>)}
            </button>
          </div>
        )}
        {/* Connect button for approved/parent_approved */}
        {showConnectBtn && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 120 }}>
            <button
              className="btnConnect"
              style={{
                background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1em',
                transition: 'all 0.2s ease',
                marginLeft: 10
              }}
              onClick={() => onConnect && onConnect(user)}
            >
              Connect
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
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
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '5px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '0 28px 17px 24px',
        minWidth: 600,
        maxWidth: '90vw',
        maxHeight: '88vh',
        overflowX: 'scroll',
        position: 'relative',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <button className='btnClose' onClick={onClose} style={{background:"none", color: "white", position: 'absolute', right: 12, top: 12}}><CgClose size={25}/></button>
        <div
          style={{
            background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
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
        <div style={{ color: '#444', marginBottom: 18, textAlign: 'left', overflowY: 'auto', minHeight: "300px" }}>
          {incomingRequests.filter(conn => !hiddenCards.has(conn.id)).length > 0 && <h3 style={{ color: '#9c27b0' }}>📥 Incoming Connection Requests</h3>}
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {incomingRequests.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
            const user = getOtherUser(conn);
            if (!user) return <div key={conn.id}>Loading...</div>;
            return renderConnectionCard(conn, user, 'incoming', <div style={{ fontSize: '0.85em', color: '#9c27b0', marginTop: '8px', fontStyle: 'italic' }}>Wants to connect with you</div>, true);
          })}
          </div>
          {(userType === "High Schooler") && pending_parental_approval.length > 0 && <>
          <h3 style={{ color: '#ff9800' }}>⏳ Pending Parent Approval</h3>
          {pending_parental_approval.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
            const user = getOtherUser(conn);
            if (!user) return <div key={conn.id}>Loading...</div>;
            return renderConnectionCard(conn, user, 'pending_parental_approval', <div style={{ fontSize: '0.85em', color: '#ff9800', marginTop: '8px', fontStyle: 'italic' }}>Waiting for parent approval</div>);
          })}
          </>}

          {(approved.filter(conn => !hiddenCards.has(conn.id)).length > 0 || (userType === "High Schooler" && parent_approved.filter(conn => !hiddenCards.has(conn.id)).length > 0)) && <h3 style={{ color: '#4caf50' }}>✅ Approved Connections</h3>}
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {userType === "High Schooler" && <div style={{display: "flex", flexDirection: "column", gap: "16px", marginBottom: approved.filter(conn => !hiddenCards.has(conn.id)).length > 0 ? "16px" : "0px"}}>
          {parent_approved.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
            const user = getOtherUser(conn);
            if (!user) return <div key={conn.id}>Loading...</div>;
            return renderConnectionCard(conn, user, 'parent_approved');
          })}
          </div>}
          {approved.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
            const user = getOtherUser(conn);
            if (!user) return <div key={conn.id}>Loading...</div>;
            return renderConnectionCard(conn, user, 'approved');
          })}
          </div>

          {pending.filter(conn => !hiddenCards.has(conn.id)).length > 0 && <h3 style={{ color: '#1976d2' }}>Pending Connections</h3>}
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {pending.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
            const user = getOtherUser(conn);
            if (!user) return <div key={conn.id}>Loading...</div>;
            return renderConnectionCard(conn, user, 'pending');
          })}
          </div>
        </div>
        <div style={{display: "flex", justifyContent: "left"}}>
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
            background: 'linear-gradient(90deg, #667eea 0%, #1976d2 100%)',
            width: "100px"
          }}
        >
          Got it!
        </button>
        </div>
      </div>
    </div>
  );
} 