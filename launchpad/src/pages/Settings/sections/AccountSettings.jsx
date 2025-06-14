import React, { useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { CiWarning } from 'react-icons/ci';
import { FiDelete } from 'react-icons/fi';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';

const AccountSettings = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const { currentUser } = useAuth();

  const handleExportData = async () => {
    try {
      const loadingToast = toast.loading('Preparing your data export...');
      e
      const userDoc = await getDoc(doc(db, "tenants", localStorage.getItem("schoolId"), "users", currentUser.uid));
      
      if (!userDoc.exists()) {
        toast.error('Could not find your user data', { id: loadingToast });
        return;
      }

      const userData = userDoc.data();
      
      // Create a JSON file with the user's data
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // Create download link and trigger download
      const exportFileDefaultName = `user_data.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete === 'DELETE') {
      try {
        const loadingToast = toast.loading('Deleting your account...');
        const userDoc = doc(db, "tenants", localStorage.getItem("schoolId"), "users", currentUser.uid);
        await deleteDoc(userDoc);
        await currentUser.delete();
        localStorage.clear();
        toast.success('Account deleted successfully', { id: loadingToast });
        window.location.href = '/Landing';
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again.');
      }
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
            className="settings-button"
            onClick={handleExportData}
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
            <CiWarning className="settings-card-icon" size={40}/>
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
          <div className="settings-dialog" style={{position: "relative"}} onClick={(e) => e.stopPropagation()}>
          <button className='btnClose' onClick={() => setDeleteDialogOpen(false)} style={{background:"none"}}><CgClose size={25}/></button>
            <div className="settings-dialog-header">
              <h3 className="settings-dialog-title settings-text-error">Delete Account</h3>
            </div>
            <div className="settings-dialog-content">
              {/* <div className="settings-alert settings-alert-warning">
                This action cannot be undone. All your data will be permanently deleted.
              </div> */}
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