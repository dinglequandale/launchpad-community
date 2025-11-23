import React, { useState, useEffect, useRef } from 'react';
import { LuMenu, LuBell, LuGraduationCap, LuUser, LuSettings, LuLogOut, LuChevronDown } from "react-icons/lu";
import { BiFlag } from "react-icons/bi";
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../contexts/ModalContext';
import { useReport } from '../../contexts/report/ReportContext';
import { useConnections } from '../../contexts/ConnectionContext';
import DefaultIcon from '../DefaultIcon/DefaultIcon';
import './topbar.css';

export default function TopBar({ isSidebarCollapsed }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [basicUserInfo, setBasicUserInfo] = useState(null);
    const [notificationClicked, setNotificationClicked] = useState(false);
    const dropdownRef = useRef(null);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { openLogoutModal } = useModal();
    const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport();
    const [userPfp, setUserPfp] = useState(null);
    
    // Get connection data for notifications
    const {
        pending,
        approved,
        incomingRequests,
        loading: connectionsLoading,
    } = useConnections();

    // COMMUNITY VERSION: Parent approval states removed

    useEffect(() => {
        const userInfo = localStorage.getItem('basicUserInfo');
        if (userInfo) {
            setBasicUserInfo(JSON.parse(userInfo));
            setUserPfp(JSON.parse(userInfo).userPfpPreview);
        }
        
        // Check if notification was already clicked in this session
        const notificationClickedFlag = sessionStorage.getItem('notificationClicked');
        if (notificationClickedFlag) {
            setNotificationClicked(true);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        openLogoutModal({
            onVerify: handleLogout
        });
    };

    const handleReportClick = () => {
        setReportTarget("General");
        setReportedUser("");
        setShowReportUserName(true);
        setReportVisibility(true);
    };

    const displayShortenedName = (name) => {
        if (!name) return "User";
        if (name.length <= 20) return name;
        return name.substring(0, 20) + "...";
    };

    // Check if there are connection notifications
    const hasNotifications = () => {
        if (connectionsLoading || !basicUserInfo || notificationClicked) return false;

        // COMMUNITY VERSION: Simplified - removed parent approval checks
        return (pending?.length > 0 ||
                approved?.length > 0 ||
                incomingRequests?.length > 0);
    };

    // Handle notification click to show connection modal
    const handleNotificationClick = () => {
        // Mark notification as clicked in this session
        sessionStorage.setItem('notificationClicked', 'true');
        setNotificationClicked(true);
        
        // We need to trigger the connection modal from GlobalAuthWrapper
        // We'll use a custom event to communicate with the parent
        window.dispatchEvent(new CustomEvent('showConnectionModal'));
    };

    return (
        <div className={`v0-topbar ${isSidebarCollapsed ? 'v0-topbar-sidebar-collapsed' : 'v0-topbar-sidebar-expanded'}`}>
            <div className="v0-topbar-left">
                {/* <button className="v0-mobile-menu-btn">
                    <LuMenu size={20} />
                </button> */}
                <div className="v0-logo-section">
                <div style={{display: "flex", justifyContent: "center"}}>
            {/* <img src="assets/awty_school_raw.jpg" alt="" style={{width: "72px"}}/> */}
          </div>
                </div>
            </div>
            
            <div className="v0-topbar-right">
                <button 
                    className="v0-notification-btn"
                    onClick={handleNotificationClick}
                >
                    <div className="v0-notification-icon-wrapper">
                        <LuBell size={24} />
                        {hasNotifications() && (
                            <div className="v0-notification-dot"></div>
                        )}
                    </div>
                </button>
                <button className="v0-report-btn" onClick={handleReportClick}>
                    <BiFlag size={26} />
                </button>
                <div className="v0-user-section" ref={dropdownRef}>
                    <button 
                        className="v0-user-dropdown-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {userPfp ? (
                            <img 
                                className="v0-user-avatar" 
                                src={userPfp} 
                                alt={currentUser.displayName || "User"} 
                            />
                        ) : (
                            <div style={{color: "black", display: "flex", justifyContent: "center", alignItems: "center"}}>
                                <DefaultIcon size={32} length="38px" />
                            </div>
                        )}
                        <LuChevronDown size={16} className="v0-dropdown-chevron" />
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="v0-user-dropdown">
                            <div className="v0-dropdown-header">
                                {userPfp ? (
                                    <img 
                                        className="v0-dropdown-avatar" 
                                        src={userPfp} 
                                        alt={currentUser.displayName || "User"} 
                                    />
                                ) : (
                                    <DefaultIcon size={40} />
                                )}
                                <div className="v0-dropdown-user-info">
                                    <span className="v0-dropdown-user-name">
                                        {displayShortenedName(basicUserInfo?.userName)}
                                    </span>
                                    <span className="v0-dropdown-user-email">
                                        {currentUser?.email}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="v0-dropdown-divider"></div>
                            
                            <div className="v0-dropdown-menu">
                                <button 
                                    className="v0-dropdown-item"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        navigate('/profile');
                                    }}
                                >
                                    <LuUser size={16} />
                                    <span>Profile</span>
                                </button>
                                
                                <button 
                                    className="v0-dropdown-item"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        navigate('/settings');
                                    }}
                                >
                                    <LuSettings size={16} />
                                    <span>Settings</span>
                                </button>
                                
                                <div className="v0-dropdown-divider"></div>
                                
                                <button 
                                    className="v0-dropdown-item v0-dropdown-item-danger"
                                    onClick={handleLogoutClick}
                                >
                                    <LuLogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}