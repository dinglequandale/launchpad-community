import Modal from "react-modal";
import "./ConfirmationModal.css";
import { CgClose } from "react-icons/cg";

export default function ConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Are you sure",
  message,
  cancelText = "No",
  confirmText = "Yes"
}) {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '5',
      minWidth: '320px',
      maxWidth: '90%',
      padding: '0',
      border: 'none',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      zIndex: '4',
    }
  };

  const handleConfirm = () => {
    onCancel();
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      style={customStyles}
      contentLabel="Confirmation Modal"
    >
      <div className="confirmation-modal__content">
        <button className='btnClose' onClick={onCancel} style={{background:"none"}}><CgClose size={25}/></button>
        <h2 className="confirmation-modal__title">{title}</h2>
        <hr className="confirmation-modal__divider" />
        <p className="confirmation-modal__message">{message}</p>
        <div className="confirmation-modal__actions">
          <button
            className="confirmation-modal__button confirmation-modal__button--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="confirmation-modal__button confirmation-modal__button--confirm"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
} 