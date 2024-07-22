import './sidenav.css';
import { useState, useEffect } from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { TbUserHexagon } from "react-icons/tb";
import { GoOrganization } from "react-icons/go";
import { LuMessagesSquare } from "react-icons/lu";
import { Link } from 'react-router-dom';

export default function SideNav({show}){
    
    const navList = [[<IoHomeOutline size={35}/>, "Home", "/Home"], [<TbUserHexagon size={35}/>, "Network", "/UserNetwork"],
        [<GoOrganization size={35}/>, "Opportunities", "/Organizations"], [<LuMessagesSquare size={35}/>, "Messages", "/messages"]];

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

    return(
        <div className='sideNav'>
            <img src="https://thebuzzmagazines.com/sites/default/files/events/2021/08/awty_logo_sep16.jpg" alt="school-logo" className='schoollogo' />
            <div className='navOptions'>
                {navList.map(([icon, label, path], index) => (
                    <Link to={path} style={{ color: 'inherit' }}>
                        <div className={`destinationNav ${selectedNav === label ? "selected" : ""}`} key={index} onClick={() => handleNavClick(label)}> 
                            {icon}
                            {label}
                        </div>
                    </Link>
        
      ))}
            </div>
        </div>
    )
}