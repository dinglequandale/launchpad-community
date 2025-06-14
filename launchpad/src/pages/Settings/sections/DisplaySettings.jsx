import React, { useState } from 'react';

const DisplaySettings = () => {
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('comfortable');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
    // TODO: Implement theme change logic
  };

  const handleDensityChange = (event) => {
    setDensity(event.target.value);
    // TODO: Implement density change logic
  };

  const handleFontSizeChange = (event) => {
    setFontSize(event.target.value);
    // TODO: Implement font size change logic
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Display Settings</h2>

      <div className="settings-section-content">
        {/* Theme Selection */}
        <div className="settings-card">
          <h3 className="settings-card-title">Theme</h3>
          <div className="settings-radio-group">
            <label className="settings-radio">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={handleThemeChange}
              />
              <span className="settings-radio-label">Light</span>
            </label>
            <label className="settings-radio">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
              />
              <span className="settings-radio-label">Dark</span>
            </label>
            <label className="settings-radio">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={theme === 'system'}
                onChange={handleThemeChange}
              />
              <span className="settings-radio-label">System</span>
            </label>
          </div>
        </div>

        <div className="settings-grid">
          {/* Density Settings */}
          <div className="settings-card">
            <div className="settings-form-group">
              <label className="settings-label" htmlFor="density-select">
                Interface Density
              </label>
              <select
                id="density-select"
                className="settings-select"
                value={density}
                onChange={handleDensityChange}
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>

          {/* Font Size Settings */}
          <div className="settings-card">
            <div className="settings-form-group">
              <label className="settings-label" htmlFor="font-size-select">
                Font Size
              </label>
              <select
                id="font-size-select"
                className="settings-select"
                value={fontSize}
                onChange={handleFontSizeChange}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="settings-card">
          <h3 className="settings-card-title">Accessibility</h3>
          <div className="settings-toggle-group">
            <div className="settings-toggle-content">
              <h4 className="settings-toggle-title">Reduce Motion</h4>
              <p className="settings-toggle-description">
                Minimize animations and transitions
              </p>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
              <span className="settings-switch-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings; 