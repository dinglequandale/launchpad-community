import { useState } from 'react';
import './FeedbackPage.css';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { IoCloudUploadOutline, IoCloseOutline, IoCheckmarkCircle } from 'react-icons/io5';
import LegalityGoBack from '../../components/Legality Footer/LegalityGoBack.jsx';
import CustomSelect from '../../components/CustomSelect/CustomSelect.jsx';

const FeedbackPage = () => {
  const [feedbackType, setFeedbackType] = useState('Bug');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const feedbackTypes = ['Bug', 'Inconvenience', 'Suggestion', 'Other'];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      toast.error('Please upload image files only');
      return;
    }

    if (attachedFiles.length + files.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

    setAttachedFiles([...attachedFiles, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      toast.error('Please upload image files only');
      return;
    }

    if (attachedFiles.length + files.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

    setAttachedFiles([...attachedFiles, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (attachedFiles.length === 0) return [];

    const storage = getStorage();
    const uploadPromises = attachedFiles.map(async (file) => {
      const timestamp = Date.now();
      const fileName = `feedback/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!feedbackDetails.trim()) {
      toast.error('Please provide feedback details');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading('Submitting feedback...');

      // Upload files if any
      const fileURLs = await uploadFiles();

      // Send feedback via cloud function
      const sendFeedback = httpsCallable(getFunctions(), 'sendFeedback');
      await sendFeedback({
        feedbackType,
        feedbackDetails,
        attachments: fileURLs
      });

      toast.dismiss();
      setShowSuccessModal(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFeedbackType('Bug');
        setFeedbackDetails('');
        setAttachedFiles([]);
        setShowSuccessModal(false);
      }, 2500);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.dismiss();
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-page-holder">
      <LegalityGoBack />
      <div className="feedback-page-container">
        <div className="feedback-page-header">
          <h1 className="feedback-page-title">Send Feedback</h1>
          <p className="feedback-page-subtitle">
            Help us improve Launchpad by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>
        </div>

        <div className="feedback-form">
          <div className="feedback-field">
            <label className="feedback-label">Feedback Type</label>
            <CustomSelect
              options={feedbackTypes}
              value={feedbackType}
              onChange={setFeedbackType}
              placeholder="Select feedback type"
              isDisabled={isSubmitting}
            />
          </div>

          <div className="feedback-field">
            <label className="feedback-label">Details</label>
            <textarea
              className="feedback-textarea"
              placeholder="Please provide detailed feedback..."
              value={feedbackDetails}
              onChange={(e) => setFeedbackDetails(e.target.value)}
              disabled={isSubmitting}
              rows={6}
            />
          </div>

          <div className="feedback-field">
            <label className="feedback-label">
              Screenshots <span className="feedback-optional">(Optional)</span>
            </label>
            <div
              className={`feedback-dropzone ${isDragging ? 'feedback-dropzone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <IoCloudUploadOutline size={48} className="feedback-upload-icon" />
              <p className="feedback-dropzone-text">
                Drag and drop images here, or click to select
              </p>
              <p className="feedback-dropzone-subtext">
                Maximum 3 files (PNG, JPG, GIF)
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={isSubmitting}
              />
            </div>

            {attachedFiles.length > 0 && (
              <div className="feedback-files-list">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="feedback-file-item">
                    <span className="feedback-file-name">{file.name}</span>
                    <button
                      className="feedback-file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={isSubmitting}
                    >
                      <IoCloseOutline size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="feedback-actions">
            <button
              className="feedback-btn feedback-btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="feedback-success-overlay">
          <div className="feedback-success-modal">
            <IoCheckmarkCircle size={64} className="feedback-success-icon" />
            <h2 className="feedback-success-title">Thank You!</h2>
            <p className="feedback-success-message">
              Your feedback has been submitted successfully. We appreciate your help in making Launchpad better!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
