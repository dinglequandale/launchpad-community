import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/auth/AuthContext';
import DefaultIcon from './DefaultIcon/DefaultIcon';
import { displayShortenedName, getBasicUserDescription } from '../services/userProfileServices';
import { IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
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
  const modalRef = useRef(null);
  const userType = localStorage.getItem("basicUserInfo") ? JSON.parse(localStorage.getItem("basicUserInfo")).userType : "";

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

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
    const showConnectBtn = section === 'approved' || section === 'parent_approved';
    
    return (
      <div key={conn.id}
        className={`connection-status-modal-connection-card ${section} ${removingCards[conn.id] ? 'connection-card-removing' : ''}`}
      >
        <div className="connection-status-modal-connection-info">
          <div className="connection-status-modal-connection-avatar">
            {user.userPfpPreview ? (
              <img
                src={user.userPfpPreview}
                alt=""
              />
            ) : (
              <DefaultIcon length="60px" size={30} />
            )}
          </div>
          <div className="connection-status-modal-connection-details">
            <div className="connection-status-modal-connection-header">
              <h3 className={`connection-status-modal-connection-name ${section}`}>
                {displayShortenedName(user.userName)}
              </h3>
              <button
                className="connection-status-modal-profile-button"
                onClick={() => handleProfileClick && handleProfileClick(user)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                See Profile
              </button>
            </div>
            <div className="connection-status-modal-connection-description">
              {basicInfoContent}
            </div>
            {extra && (
              <div className={`connection-status-modal-connection-extra ${section}`}>
                {extra}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons for incomingRequests */}
        {showActions && (
          <div className="connection-status-modal-connection-actions">
            <button
              className="connection-status-modal-approve-button"
              onClick={() => loadingAction[conn.id] ? null : handleApprove(conn)}
              disabled={loadingAction[conn.id] === 'approve'}
            >
              {loadingAction[conn.id] === 'approve' ? 'Approving...' : (<><IoCheckmarkOutline size={14} /> Approve</>)}
            </button>
            <button
              className="connection-status-modal-deny-button"
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
              className="connection-status-modal-connect-button"
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
    <div className="connection-status-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="connection-status-modal" ref={modalRef}>
        <div className="connection-status-modal-header">
          <button className="connection-status-modal-close-btn" onClick={onClose} title="Close">
            <IoCloseOutline size={20} />
          </button>
        </div>
        
        <div className="connection-status-modal-section">
          <div className="connection-status-modal-icon">📬</div>
          <h2 className="connection-status-modal-title">
            Connection Updates
          </h2>
        </div>
        
        <hr className="connection-status-modal-divider" />
        
        <div className="connection-status-modal-content">
          {incomingRequests.filter(conn => !hiddenCards.has(conn.id)).length > 0 && (
            <h3 className="connection-status-modal-section-title incoming">📥 Incoming Connection Requests</h3>
          )}
          <div className="connection-status-modal-connections-list">
            {incomingRequests.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
              const user = getOtherUser(conn);
              if (!user) return <div key={conn.id}>Loading...</div>;
              return renderConnectionCard(conn, user, 'incoming', <div>Wants to connect with you</div>, true);
            })}
          </div>
          
          {(userType === "High Schooler") && pending_parental_approval.length > 0 && (
            <>
              <h3 className="connection-status-modal-section-title pending-parental">⏳ Pending Parent Approval</h3>
              <div className="connection-status-modal-connections-list">
                {pending_parental_approval.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
                  const user = getOtherUser(conn);
                  if (!user) return <div key={conn.id}>Loading...</div>;
                  return renderConnectionCard(conn, user, 'pending-parental', <div>Waiting for parent approval</div>);
                })}
              </div>
            </>
          )}

          {(approved.filter(conn => !hiddenCards.has(conn.id)).length > 0 || (userType === "High Schooler" && parent_approved.filter(conn => !hiddenCards.has(conn.id)).length > 0)) && (
            <h3 className="connection-status-modal-section-title approved">✅ Approved Connections</h3>
          )}
          
          <div className="connection-status-modal-connections-list">
            {userType === "High Schooler" && (
              <div style={{display: "flex", flexDirection: "column", gap: "16px", marginBottom: parent_approved.length > 0 ? "16px" : "0px"}}>
                {parent_approved.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
                  const user = getOtherUser(conn);
                  if (!user) return <div key={conn.id}>Loading...</div>;
                  return renderConnectionCard(conn, user, 'parent_approved');
                })}
              </div>
            )}
            {approved.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
              const user = getOtherUser(conn);
              if (!user) return <div key={conn.id}>Loading...</div>;
              return renderConnectionCard(conn, user, 'approved');
            })}
          </div>

          {pending.filter(conn => !hiddenCards.has(conn.id)).length > 0 && (
            <h3 className="connection-status-modal-section-title pending">Pending Connections</h3>
          )}
          <div className="connection-status-modal-connections-list">
            {pending.filter(conn => !hiddenCards.has(conn.id)).map(conn => {
              const user = getOtherUser(conn);
              if (!user) return <div key={conn.id}>Loading...</div>;
              return renderConnectionCard(conn, user, 'pending');
            })}
          </div>
        </div>
        
        <div className="connection-status-modal-footer">
          <button
            onClick={onClose}
            className="connection-status-modal-close-button"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
} 