import React, { useState } from 'react';

const NotificationSettings = () => {
  const savedPreferences = localStorage.getItem("userNotificationPreferences") ? JSON.parse(localStorage.getItem("userNotificationPreferences")) : null;
  // console.log(savedPreferences);
  // const [preferences, setPreferences] = useState({email_notifications: true, push_notifications: true, security_alerts: true});
  const [settings, setSettings] = useState([
    {
      id: 'email_notifications',
      label: 'Email Notifications',
      description: 'Receive important updates and announcements via email',
      enabled: savedPreferences ? savedPreferences.email_notifications : true,
    },
    {
      id: 'push_notifications',
      label: 'Push Notifications',
      description: 'Get instant notifications in your browser',
      enabled: savedPreferences ? savedPreferences.push_notifications : true,
    },
    // {
    //   id: 'task_reminders',
    //   label: 'Task Reminders',
    //   description: 'Receive reminders about upcoming and overdue tasks',
    //   enabled: true,
    // },
    // {
    //   id: 'team_updates',
    //   label: 'Team Updates',
    //   description: 'Get notified about team member activities and updates',
    //   enabled: true,
    // },
    {
      id: 'security_alerts',
      label: 'Security Alerts',
      description: 'Receive notifications about security-related events',
      enabled: savedPreferences ? savedPreferences.security_alerts : true,
    },
  ]);

  const handleToggle = (id) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    const preferences = {email_notifications: settings[0].enabled, push_notifications: settings[1].enabled, security_alerts: settings[2].enabled};
    console.log('Saving notification settings:', settings);
    localStorage.setItem("userNotificationPreferences", JSON.stringify(preferences));
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Notification Settings</h2>
      
      <div className="settings-alert settings-alert-info">
        Choose how you want to receive notifications. You can change these settings at any time.
      </div>

      <div className="settings-form-group">
        {settings.map((setting, index) => (
          <React.Fragment key={setting.id}>
            <div className="settings-notification-item">
              <div className="settings-notification-content">
                <h3 className="settings-notification-title">{setting.label}</h3>
                <p className="settings-notification-description">{setting.description}</p>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => handleToggle(setting.id)}
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>
            {index < settings.length - 1 && <div className="settings-divider" />}
          </React.Fragment>
        ))}
      </div>

      <div className="settings-actions">
        <button
          className="settings-button settings-button-primary"
          onClick={handleSave}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings; 