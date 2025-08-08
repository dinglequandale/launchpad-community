import React, { useEffect, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import "./ConfirmationModal.css";

export default function ConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Are you sure",
  message,
  cancelText = "No",
  confirmText = "Yes"
}) {
  const modalRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  const handleConfirm = () => {
    onCancel();
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal" ref={modalRef}>
        <div className="confirmation-modal-header">
          <button className="confirmation-modal-close-btn" onClick={onCancel} title="Close">
            <IoCloseOutline size={20} />
          </button>
        </div>
        
        <div className="confirmation-modal-content">
          <h2 className="confirmation-modal-title">{title}</h2>
          <hr className="confirmation-modal-divider" />
          <p className="confirmation-modal-message">{message}</p>
          
          <div className="confirmation-modal-actions">
            <button
              className="confirmation-modal-button confirmation-modal-button--cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="confirmation-modal-button confirmation-modal-button--confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 