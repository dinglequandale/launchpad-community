import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import './LandingNav.css';

export default function Landing_Nav () {
  const [activePage, setActivePage] = useState('Landing');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'for-professionals', label: 'For Professionals', path: '/for-professionals' },
    { id: 'for-high-schoolers', label: 'For High Schoolers', path: '/for-high-schoolers' },
    { id: 'for-college-students', label: 'For College Students', path: '/for-college-students' },
    { id: 'six-degrees', label: '6 Degrees', path: '/six-degrees' },
  ];


  useEffect(()=>{
    const pathname = window.location.pathname;

    // Map paths to nav item IDs
    const pathToId = {
      '/for-professionals': 'for-professionals',
      '/for-high-schoolers': 'for-high-schoolers',
      '/for-college-students': 'for-college-students',
      '/six-degrees': 'six-degrees',
    };

    const activeId = pathToId[pathname];
    if (activeId) {
      setActivePage(activeId);
    }
  },[location]);

  const handleNavigation = (item) => {
    setActivePage(item.id);
    navigate(item.path);
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
                onClick={() => handleNavigation(item)}
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