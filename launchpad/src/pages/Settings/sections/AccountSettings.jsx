import React, { useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { CiWarning } from 'react-icons/ci';
import { FiDelete } from 'react-icons/fi';

const AccountSettings = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleDeleteAccount = () => {
    if (confirmDelete === 'DELETE') {
      // TODO: Implement account deletion logic
      console.log('Account deletion confirmed');
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Account Settings</h2>

      <div className="settings-section-content">
        {/* Data Export Section */}
        <div className="settings-card">
          <h3 className="settings-card-title">Data Export</h3>
          <p className="settings-card-description">
            Download a copy of your data, including your profile information, preferences, and activity history.
          </p>
          <button
            className="settings-button settings-button-secondary"
            onClick={() => {
              // TODO: Implement data export logic
              console.log('Export data clicked');
            }}
          >
            <BiDownload className="settings-button-icon" />
            Export Data
          </button>
        </div>

        {/* Connected Services Section */}
        {/* <div className="settings-card">
          <h3 className="settings-card-title">Connected Services</h3>
          <ul className="settings-list">
            <li className="settings-list-item">
              <div className="settings-list-content">
                <h4 className="settings-list-title">Google Account</h4>
                <p className="settings-list-description">Connected on Jan 1, 2024</p>
              </div>
              <button
                className="settings-button settings-button-error"
                onClick={() => {
                  // TODO: Implement disconnect logic
                  console.log('Disconnect Google account');
                }}
              >
                Disconnect
              </button>
            </li>
            <div className="settings-divider" />
            <li className="settings-list-item">
              <div className="settings-list-content">
                <h4 className="settings-list-title">GitHub</h4>
                <p className="settings-list-description">Not connected</p>
              </div>
              <button
                className="settings-button settings-button-primary"
                onClick={() => {
                  // TODO: Implement connect logic
                  console.log('Connect GitHub account');
                }}
              >
                Connect
              </button>
            </li>
          </ul>
        </div> */}

        {/* Delete Account Section */}
        <div className="settings-card settings-card-danger">
          <div className="settings-card-header">
            <CiWarning className="settings-card-icon" />
            <h3 className="settings-card-title">Danger Zone</h3>
          </div>
          <p className="settings-card-description">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            className="settings-button settings-button-error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <FiDelete className="settings-button-icon" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      {deleteDialogOpen && (
        <div className="settings-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
          <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="settings-dialog-header">
              <h3 className="settings-dialog-title settings-text-error">Delete Account</h3>
              <button
                className="settings-dialog-close"
                onClick={() => setDeleteDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="settings-dialog-content">
              <div className="settings-alert settings-alert-warning">
                This action cannot be undone. All your data will be permanently deleted.
              </div>
              <p className="settings-dialog-text">Please type "DELETE" to confirm:</p>
              <input
                type="text"
                className="settings-input"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </div>
            <div className="settings-dialog-actions">
              <button
                className="settings-button"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="settings-button settings-button-error"
                disabled={confirmDelete !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings; 