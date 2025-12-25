import React, { useState, useEffect } from 'react';
import { BiDownload } from 'react-icons/bi';
import { CiWarning } from 'react-icons/ci';
import { FiDelete } from 'react-icons/fi';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../contexts/auth/AuthContext';
import toast from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { BiGlobe, BiGroup } from 'react-icons/bi';

const AccountSettings = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [openToCrossSchoolConnections, setOpenToCrossSchoolConnections] = useState('no');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOpenToCrossSchoolConnections(userData.openToCrossSchoolConnections || 'no');
          setUserType(userData.userType || '');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [currentUser]);

  const handleUpdateCommunityPreference = async (value) => {
    try {
      const loadingToast = toast.loading('Updating preference...');
      const userDoc = doc(db, "users", currentUser.uid);
      await updateDoc(userDoc, {
        openToCrossSchoolConnections: value
      });
      setOpenToCrossSchoolConnections(value);

      // Update localStorage
      const storedUserInfo = JSON.parse(localStorage.getItem('basicUserInfo') || '{}');
      storedUserInfo.openToCrossSchoolConnections = value;
      localStorage.setItem('basicUserInfo', JSON.stringify(storedUserInfo));

      toast.success('Preference updated successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error updating community preference:', error);
      toast.error('Failed to update preference. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const loadingToast = toast.loading('Preparing your data export...');

      // COMMUNITY VERSION: Removed tenant-based architecture
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

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
        // COMMUNITY VERSION: Removed tenant-based architecture
        const userDoc = doc(db, "users", currentUser.uid);
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

        {/* Community Preference Section - Only for College Students and Professionals */}
        {!loading && (userType === 'College Student' || userType === 'Professional') && (
          <div className="settings-card">
            <h3 className="settings-card-title">Networking Preference</h3>
            <p className="settings-card-description">
              {userType === 'College Student'
                ? 'Choose whether you want to connect only with students from your school community or be open to connections from other schools.'
                : 'Choose whether you prefer to connect with students from your affiliated school community only or be open to connections from all schools.'}
            </p>
            <div className="settings-toggle-group">
              <button
                className={`settings-toggle-option ${openToCrossSchoolConnections === 'no' ? 'active' : ''}`}
                onClick={() => handleUpdateCommunityPreference('no')}
              >
                <BiGroup className="settings-toggle-icon" size={24} />
                <div className="settings-toggle-text">
                  <div className="settings-toggle-title">Community Only</div>
                  <div className="settings-toggle-description">Connect with your school community</div>
                </div>
              </button>
              <button
                className={`settings-toggle-option ${openToCrossSchoolConnections === 'yes' ? 'active' : ''}`}
                onClick={() => handleUpdateCommunityPreference('yes')}
              >
                <BiGlobe className="settings-toggle-icon" size={24} />
                <div className="settings-toggle-text">
                  <div className="settings-toggle-title">Open to All</div>
                  <div className="settings-toggle-description">Connect with students from all schools</div>
                </div>
              </button>
            </div>
          </div>
        )}

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
          <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="settings-dialog-header">
              <h3 className="settings-dialog-title settings-text-error">Delete Account</h3>
              <button 
                className="settings-dialog-close" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                <CgClose size={25}/>
              </button>
            </div>
            <div className="settings-dialog-content">
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