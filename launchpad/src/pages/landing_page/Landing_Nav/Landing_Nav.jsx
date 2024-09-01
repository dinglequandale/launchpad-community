import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import './landing_nav.css';

export default function Landing_Nav () {
  const [activePage, setActivePage] = useState('highschoolers');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'professionals', label: 'For Professionals' },
    { id: 'highschoolers', label: 'For High Schoolers' },
    { id: 'undergrads', label: 'For College Students' },
  ];

  
  useEffect(()=>{
    const pathname = window.location.pathname;
    setActivePage(pathname.substring(1, pathname.length));
    console.log(pathname.substring(1, pathname.length));
  },[]);

  const handleNavigation = (id) => {
    setActivePage(id);
    navigate(`/${id}`);
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