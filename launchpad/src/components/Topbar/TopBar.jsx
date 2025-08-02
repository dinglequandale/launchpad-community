import './topbar.css';
import { useState, useEffect, useRef } from 'react';
import { LuMenu, LuBell, LuGraduationCap, LuUser, LuSettings, LuLogOut, LuChevronDown } from "react-icons/lu";
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { displayShortenedName } from '../../services/userProfileServices';

export default function TopBar({ show }) {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const basicUserInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
    // Listen for sidebar state changes
    useEffect(() => {
        const handleSidebarChange = () => {
            const sidebar = document.querySelector('.v0-sidebar');
            if (sidebar) {
                setIsSidebarCollapsed(sidebar.classList.contains('v0-sidebar-collapsed'));
            }
        };

        // Initial check
        handleSidebarChange();

        // Set up observer to watch for sidebar class changes
        const observer = new MutationObserver(handleSidebarChange);
        const sidebar = document.querySelector('.v0-sidebar');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        }

        return () => observer.disconnect();
    }, []);

    // Handle click outside dropdown
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

    return (
        <div className={`v0-topbar ${isSidebarCollapsed ? 'v0-topbar-sidebar-collapsed' : 'v0-topbar-sidebar-expanded'}`}>
            <div className="v0-topbar-left">
                <button className="v0-mobile-menu-btn">
                    <LuMenu size={20} />
                </button>
                <div className="v0-logo-section">
                    <div className="v0-logo-icon">
                        <LuGraduationCap size={20} />
                    </div>
                    <span className="v0-logo-text">Launchpad</span>
                </div>
            </div>
            
            <div className="v0-topbar-right">
                <button className="v0-notification-btn">
                    <LuBell size={20} />
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
                            <div className="v0-avatar-fallback">
                                {(currentUser?.displayName || "U").charAt(0).toUpperCase()}
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
                                    <div className="v0-dropdown-avatar-fallback">
                                        {(currentUser?.displayName || "U").charAt(0).toUpperCase()}
                                    </div>
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
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        handleLogout();
                                    }}
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