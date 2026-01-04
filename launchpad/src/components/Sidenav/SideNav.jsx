import './SideNav.css';
import { useState, useEffect } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { TbUserHexagon } from "react-icons/tb";
import { GoOrganization } from "react-icons/go";
import { LuMessagesSquare, LuMessageSquarePlus } from "react-icons/lu";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuGraduationCap, LuSettings, LuLogOut, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { doSignOut } from '../../firebase/auth';
import toast from 'react-hot-toast';
import { useModal } from '../../contexts/ModalContext';
import { StreamChat } from 'stream-chat';
import { useAuth } from '../../contexts/auth/AuthContext';

export default function SideNav({show}){

    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Initialize collapsed state from sessionStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = sessionStorage.getItem('sidebarCollapsed');
        return savedState === 'true';
    });

    // Mobile menu open state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { openLogoutModal } = useModal();
    const [unreadCount, setUnreadCount] = useState(0);
    const navList = [
        [<IoHomeOutline size={24}/>, "Home", "/Home"],
        [<TbUserHexagon size={24}/>, "Network", "/network"],
        [<GoOrganization size={24}/>, "Organizations", "/Organizations"],
        [<LuGraduationCap size={24}/>, "Academics", "/academics"],
        [<LuMessagesSquare size={24}/>, "Messages", "/chat"]
    ];

    const [selectedNav, setSelectedNav] = useState(null);

    // Listen for mobile menu toggle events
    useEffect(() => {
        const handleMobileMenuToggle = () => {
            setIsMobileMenuOpen(prev => !prev);
        };

        window.addEventListener('toggleMobileMenu', handleMobileMenuToggle);
        return () => window.removeEventListener('toggleMobileMenu', handleMobileMenuToggle);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobileMenuOpen && window.innerWidth <= 1024) {
                const sidebar = document.querySelector('.v0-sidebar');
                if (sidebar && !sidebar.contains(e.target) && !e.target.closest('.v0-mobile-menu-btn')) {
                    setIsMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Track unread messages from Stream Chat
    useEffect(() => {
        const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

        const updateUnreadCount = async () => {
            if (chatClient.userID && currentUser) {
                try {
                    const filters = { type: 'messaging', members: { $in: [currentUser.uid] } };
                    const channels = await chatClient.queryChannels(filters);

                    let totalUnread = 0;
                    channels.forEach(channel => {
                        const unread = channel.countUnread();
                        totalUnread += unread;
                    });

                    setUnreadCount(totalUnread);
                } catch (error) {
                    console.error('Error fetching unread count:', error);
                }
            }
        };

        // Initial count
        updateUnreadCount();

        // Listen for new messages
        const handleEvent = () => {
            updateUnreadCount();
        };

        if (chatClient.userID) {
            chatClient.on('message.new', handleEvent);
            chatClient.on('message.read', handleEvent);
        }

        return () => {
            if (chatClient.userID) {
                chatClient.off('message.new', handleEvent);
                chatClient.off('message.read', handleEvent);
            }
        };
    }, [currentUser]);

    // push the color state of current page option to session storage for persistence, check every location change
    useEffect(() => {
        const storedSelectedNav = sessionStorage.getItem('selectedNav');
        if (storedSelectedNav) {
          setSelectedNav(storedSelectedNav);
        } else {
          const currentPath = location.pathname;
          const initialLabel = navList.find(([, , path]) => path === currentPath)?.[1];
          setSelectedNav(initialLabel || null);
        }
      }, [location]);



    const handleNavClick = (label) => {
        setSelectedNav(label);
        sessionStorage.setItem('selectedNav', label);
        // Close mobile menu when nav item is clicked
        if (window.innerWidth <= 1024) {
            setIsMobileMenuOpen(false);
        }
    }

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);

        // Save to sessionStorage for persistence across page changes
        sessionStorage.setItem('sidebarCollapsed', newCollapsedState.toString());

        // Dispatch custom event for other components to listen to
        const event = new CustomEvent('sidebarToggle', {
            detail: { isCollapsed: newCollapsedState }
        });
        window.dispatchEvent(event);
    }

    const handleSettingsClick = () => {
        navigate('/Settings');
    }

    const handleLogoutClick = () => {
        openLogoutModal({
            onVerify: async () => {
                try {
                    await doSignOut();
                    toast.success('Successfully logged out!');
                    navigate('/');
                } catch (error) {
                    console.error('Error logging out:', error);
                    toast.error('Error logging out. Please try again.');
                }
            }
        });
    }

    return(
        <>
            <div className={`v0-sidebar ${isCollapsed ? 'v0-sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="v0-sidebar-header">
                    <div className="v0-logo-section">

                        {!isCollapsed ? <span className="v0-logo-text"><div style={{display: "flex", justifyContent: "center"}}>
                        <img src="/assets/launchpad_logo.png" alt="" style={{width: "150px"}}/>
                    </div></span> : <div style={{display: "flex", justifyContent: "center"}}>
                        <img src="/assets/launchpad_logo_raw.png" alt="" style={{width: "35px"}}/>
                    </div>}
                    </div>
                    <button className="v0-collapse-btn" onClick={toggleSidebar}>
                        {isCollapsed ? <LuChevronRight size={20} /> : <LuChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="v0-sidebar-nav">
                    {navList.map(([icon, label, path], index) => (
                        <Link to={path} style={{ color: 'inherit', textDecoration: 'none' }} key={index}>
                            <div
                                className={`v0-nav-item ${selectedNav === label ? "v0-nav-selected" : ""}`}
                                onClick={() => handleNavClick(label)}
                                title={isCollapsed ? label : ""}
                            >
                                <div style={{ position: 'relative', display: 'inline-flex' }}>
                                    {icon}
                                    {label === "Messages" && unreadCount > 0 && (
                                        <span className="v0-notification-badge">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {!isCollapsed && <span className="v0-nav-label">{label}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="v0-sidebar-footer">
                    <Link to="/feedback" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <div
                            className={`v0-nav-item ${selectedNav === "Feedback" ? "v0-nav-selected" : ""}`}
                            title={isCollapsed ? "Feedback" : ""}
                            onClick={() => handleNavClick("Feedback")}
                            style={{ cursor: 'pointer' }}
                        >
                            <LuMessageSquarePlus size={28} />
                            {!isCollapsed && <span className="v0-nav-label">Feedback</span>}
                        </div>
                    </Link>
                    <div
                        className="v0-nav-item"
                        title={isCollapsed ? "Settings" : ""}
                        onClick={handleSettingsClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <LuSettings size={28} />
                        {!isCollapsed && <span className="v0-nav-label">Settings</span>}
                    </div>
                    <div
                        className="v0-nav-item"
                        title={isCollapsed ? "Logout" : ""}
                        onClick={handleLogoutClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <LuLogOut size={28} />
                        {!isCollapsed && <span className="v0-nav-label">Logout</span>}
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div
                    className="v0-sidebar-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    )
}