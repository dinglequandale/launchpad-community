import React, { useState } from 'react';
import './SettingsPage.css';

// Settings sections components
import NotificationSettings from './sections/NotificationSettings.jsx';
import DisplaySettings from './sections/DisplaySettings.jsx';
import SecuritySettings from './sections/SecuritySettings.jsx';
import AccountSettings from './sections/AccountSettings.jsx';
import { BiLock, BiNotification, BiPalette, BiUser } from 'react-icons/bi';
import LegalityGoBack from '../../components/Legality Footer/LegalityGoBack.jsx';

const settingsSections = [
  { id: 'notifications', label: 'Notifications', icon: <BiNotification className="settings-nav-icon"/>, component: NotificationSettings },
  // { id: 'display', label: 'Display', icon: <BiPalette className="settings-nav-icon"/>, component: DisplaySettings },
  { id: 'security', label: 'Security', icon: <BiLock className="settings-nav-icon"/>, component: SecuritySettings },
  { id: 'account', label: 'Account', icon: <BiUser className="settings-nav-icon"/>, component: AccountSettings },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');

  const ActiveComponent = settingsSections.find(
    (section) => section.id === activeSection
  )?.component || NotificationSettings;

  return (
    <div className='settings-holder'>
      <LegalityGoBack/>
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <div className="settings-layout">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {settingsSections.map((section) => (
                <div
                  key={section.id}
                  className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.icon}
                  <span className="settings-nav-text">{section.label}</span>
                </div>
              ))}
            </nav>
          </div>
          <div className="settings-content">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 