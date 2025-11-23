import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import './LandingNav.css';

export default function Landing_Nav () {
  const [activePage, setActivePage] = useState('Landing');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '?userType=professional', label: 'For Professionals' },
    { id: '?userType=highschooler', label: 'For High Schoolers' },
    { id: '?userType=alumni', label: 'For College Students' },
  ];

  
  useEffect(()=>{
    const pathname = window.location.pathname;
    setActivePage(pathname.substring(1, pathname.length));
    console.log(pathname.substring(1, pathname.length));
  },[]);

  const handleNavigation = (id) => {
    setActivePage(id);
    navigate(`/Landing${id}`);
  };

  return (
    <div className="app-container">
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};