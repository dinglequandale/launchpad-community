import React, { useState, useEffect, useRef } from 'react';
import { LuMenu, LuBell, LuGraduationCap, LuUser, LuSettings, LuLogOut, LuChevronDown } from "react-icons/lu";
import { BiFlag } from "react-icons/bi";
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../contexts/ModalContext';
import { useReport } from '../../contexts/report/ReportContext';
import DefaultIcon from '../DefaultIcon/DefaultIcon';
import './topbar.css';

export default function TopBar({ isSidebarCollapsed }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [basicUserInfo, setBasicUserInfo] = useState(null);
    const dropdownRef = useRef(null);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { openLogoutModal } = useModal();
    const { setReportVisibility, setReportTarget, setReportedUser, setShowReportUserName } = useReport();

    useEffect(() => {
        const userInfo = localStorage.getItem('basicUserInfo');
        if (userInfo) {
            setBasicUserInfo(JSON.parse(userInfo));
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

    return (
        <div className={`v0-topbar ${isSidebarCollapsed ? 'v0-topbar-sidebar-collapsed' : 'v0-topbar-sidebar-expanded'}`}>
            <div className="v0-topbar-left">
                {/* <button className="v0-mobile-menu-btn">
                    <LuMenu size={20} />
                </button> */}
                <div className="v0-logo-section">
                <div style={{display: "flex", justifyContent: "center"}}>
            <img src="assets/launchpad_logo.png" alt="" style={{width: "250px"}}/>
          </div>
                </div>
            </div>
            
            <div className="v0-topbar-right">
                <button className="v0-notification-btn">
                    <LuBell size={24} />
                </button>
                <button className="v0-report-btn" onClick={handleReportClick}>
                    <BiFlag size={26} />
                </button>
                <div className="v0-user-section" ref={dropdownRef}>
                    <button 
                        className="v0-user-dropdown-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {currentUser?.photoURL ? (
                            <img 
                                className="v0-user-avatar" 
                                src={currentUser.photoURL} 
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
                                {currentUser?.photoURL ? (
                                    <img 
                                        className="v0-dropdown-avatar" 
                                        src={currentUser.photoURL} 
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