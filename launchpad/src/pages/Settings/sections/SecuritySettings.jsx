import React, { useState } from 'react';
import { BiLock } from 'react-icons/bi';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { doPasswordChange } from '../../../firebase/auth';
import toast, { Toaster } from 'react-hot-toast';

const SecuritySettings = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const currentUser = useAuth();

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement password change logic
        if(passwordData.newPassword === passwordData.confirmPassword){
            doPasswordChange(passwordData.newPassword);
            toast.success("Password successfully changed!");
        }
        console.log('Password change requested:', passwordData);
    };

    const handleTwoFactorToggle = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        // TODO: Implement 2FA toggle logic
        console.log('2FA toggled:', !twoFactorEnabled);
    };

    return (
    <div className="settings-section">
        <Toaster position={'bottom-right'} reverseOrder={false}/>
        <h2 className="settings-section-title">Security Settings</h2>

        <div className="settings-section-content">
            {/* Password Change Section */}
            <div className="settings-card">
            <div className="settings-card-header">
                <BiLock className="settings-card-icon" />
                <h3 className="settings-card-title">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="settings-form-group">
                <label className="settings-label" htmlFor="currentPassword">
                    Current Password
                </label>
                <input
                    id="currentPassword"
                    type="password"
                    className="settings-input"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                />
                </div>
                <div className="settings-form-group">
                <label className="settings-label" htmlFor="newPassword">
                    New Password
                </label>
                <input
                    id="newPassword"
                    type="password"
                    className="settings-input"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                />
                </div>
                <div className="settings-form-group">
                <label className="settings-label" htmlFor="confirmPassword">
                    Confirm New Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="settings-input"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                />
                </div>
                <button type="submit" className="settings-button settings-button-primary">
                Update Password
                </button>
            </form>
            </div>

            <div className="settings-divider" />

            {/* Two-Factor Authentication Section */}
            <div className="settings-card">
            <div className="settings-card-header">
                <BiLock className="settings-card-icon" />
                <h3 className="settings-card-title">Two-Factor Authentication</h3>
            </div>
            
            <div className="settings-alert settings-alert-info">
                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
            </div>

            <div className="settings-toggle-group">
                <div className="settings-toggle-content">
                <h4 className="settings-toggle-title">Enable Two-Factor Authentication</h4>
                <p className="settings-toggle-description">
                    Require a verification code in addition to your password when signing in
                </p>
                </div>
                <label className="settings-switch">
                <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={handleTwoFactorToggle}
                />
                <span className="settings-switch-slider"></span>
                </label>
            </div>

            {twoFactorEnabled && (
                <div className="settings-action-group">
                <button
                    className="settings-button settings-button-secondary"
                    onClick={() => {
                    // TODO: Implement 2FA setup flow
                    console.log('Setup 2FA clicked');
                    }}
                >
                    Setup Two-Factor Authentication
                </button>
                </div>
            )}
            </div>
        </div>
    </div>
);
};

export default SecuritySettings; 