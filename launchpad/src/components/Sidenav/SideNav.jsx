import './sidenav.css';
import { useState, useEffect } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { TbUserHexagon } from "react-icons/tb";
import { GoOrganization } from "react-icons/go";
import { LuMessagesSquare } from "react-icons/lu";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuGraduationCap, LuSettings, LuLogOut, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { doSignOut } from '../../firebase/auth';
import toast from 'react-hot-toast';
import { useModal } from '../../contexts/ModalContext';

export default function SideNav({show}){
    
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { openLogoutModal } = useModal();
    const navList = [
        [<IoHomeOutline size={24}/>, "Home", "/Home"], 
        [<TbUserHexagon size={24}/>, "Network", "/network"],
        [<GoOrganization size={24}/>, "Organizations", "/Organizations"], 
        [<LuMessagesSquare size={24}/>, "Messages", "/messages"]
    ];

    const [selectedNav, setSelectedNav] = useState(null);

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
    }

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
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
            <div className={`v0-sidebar ${isCollapsed ? 'v0-sidebar-collapsed' : ''}`}>
                <div className="v0-sidebar-header">
                    <div className="v0-logo-section">
                        <div className="v0-logo-icon">
                            <LuGraduationCap size={28} />
                        </div>
                        {!isCollapsed && <span className="v0-logo-text">Launchpad</span>}
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
                                {icon}
                                {!isCollapsed && <span className="v0-nav-label">{label}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="v0-sidebar-footer">
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
        </>
    )
}