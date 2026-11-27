import React, { useState } from 'react';
import { BiLock } from 'react-icons/bi';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { doPasswordChange, doReauthenticate } from '../../../firebase/auth';
import toast, { Toaster } from 'react-hot-toast';

const SecuritySettings = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const { currentUser } = useAuth();
    const isEmailProvider = currentUser?.providerData?.some(
        provider => provider.providerId === 'password'
    );


    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEmailProvider) {
            toast.error("Password change is not available for Google-authenticated accounts");
            return;
        }

        if (!currentUser?.email) {
            toast.error("Unable to verify account email. Please try signing out and back in.");
            return;
        }
        
        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match!");
            return;
        }

        // Validate password length
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }

        try {
            // First verify the current password (also satisfies Firebase's recent-login requirement)
            await doReauthenticate(currentUser.email, passwordData.currentPassword);
            
            // If verification successful, update the password
            await doPasswordChange(passwordData.newPassword);
            
            // Clear the form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
            toast.success("Password successfully changed!");
        } catch (error) {
            console.error('Password change error:', error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error("Current password is incorrect!");
            } else {
                toast.error("Failed to change password. Please try again.");
            }
        }
    };

    return (
    <div className="settings-section">
        {/* <Toaster position={'bottom-right'} reverseOrder={false}/> */}
        <h2 className="settings-section-title">Security Settings</h2>

        <div className="settings-section-content">
            {/* Password Change Section */}
            <div className="settings-card">
            <div className="settings-card-header">
                <BiLock className="settings-card-icon" size={40}/>
                <h3 className="settings-card-title">Change Password</h3>
            </div>
            {!isEmailProvider ? (
                <div className="settings-alert settings-alert-info">
                    Password management is not available for Google-authenticated accounts. 
                    To change your password, please use your Google account settings.
                </div>
            ) : (
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
            )}
            </div>

            <div className="settings-divider" />

            {/* Two-Factor Authentication Section */}
            <div className="settings-card">
            <div className="settings-card-header">
                <BiLock className="settings-card-icon" size={40} />
                <h3 className="settings-card-title">Two-Factor Authentication</h3>
            </div>
            
            <div className="settings-alert settings-alert-info">
                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
            </div>

            {/* The previous switch here did nothing (its handler was a TODO), so it implied
                protection that did not exist. Shown as upcoming until 2FA is implemented. */}
            <div className="settings-alert settings-alert-info">
                <strong>Coming soon.</strong> Two-factor authentication is not available yet.
            </div>
            </div>
        </div>
    </div>
);
};

export default SecuritySettings; 