import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoCloseOutline } from "react-icons/io5";
import { BiPlus, BiTrash } from "react-icons/bi";
import { LuMail, LuUser, LuUsers } from "react-icons/lu";
import './InviteContactsModal.css';

export default function InviteContactsModal({ visibility, onClose, userName }) {
  const [recipients, setRecipients] = useState([{ id: 0, userName: "", email: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (key, value, id) => {
    setRecipients(recipients.map((recipient) =>
      recipient.id === id ? { ...recipient, [key]: value } : recipient
    ));
  };

  const handleAddRecipient = () => {
    if (recipients.length < 4) {
      setRecipients([...recipients, { id: recipients.length, userName: "", email: "" }]);
    }
  };

  const handleRemoveRecipient = (id) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((recipient) => recipient.id !== id));
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = () => {
    return recipients.every(
      (recipient) =>
        recipient.userName.trim() !== "" &&
        recipient.email.trim() !== "" &&
        isValidEmail(recipient.email)
    );
  };

  const onInviteSend = async () => {
    if (!canSubmit()) {
      toast.error('Please fill in all fields with valid email addresses');
      return;
    }

    setIsSubmitting(true);

    // Show initial toast and close modal immediately
    toast.loading('Sending invitations ...');

    // Store data for background processing
    const recipientDataToSend = [...recipients];
    const inviteCount = recipients.length;

    // Close modal immediately - don't make user wait
    onClose();

    // Send invitations in background (fire-and-forget)
    const sendInvitations = httpsCallable(getFunctions(), "sendInviteEmail");
    sendInvitations({ recipientData: recipientDataToSend, senderName: userName })
      .then(() => {
        toast.success(`Successfully sent ${inviteCount} invitation${inviteCount > 1 ? 's' : ''}!`);
      })
      .catch((error) => {
        toast.error('Failed to send invitations. Please try again.');
        console.error('Error sending invitations:', error);
      });
  };

  if (!visibility) return null;

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="invite-modal-header">
          <button className="invite-modal-close-btn" onClick={onClose} title="Close">
            <IoCloseOutline size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="invite-modal-content">
          <div className="invite-modal-title-section">
            <div className="invite-modal-icon-wrapper">
              <LuUsers size={24} />
            </div>
            <h2 className="invite-modal-title">Invite to Launchpad</h2>
            <p className="invite-modal-subtitle">
              Share the power of professional networking with your friends, family, and colleagues
            </p>
          </div>

          {/* Recipients */}
          <div className="invite-modal-recipients">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="invite-recipient-card">
                <div className="invite-recipient-header">
                  <span className="invite-recipient-number">Recipient {index + 1}</span>
                  {recipients.length > 1 && (
                    <button
                      className="invite-remove-btn"
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      title="Remove recipient"
                    >
                      <BiTrash size={18} />
                    </button>
                  )}
                </div>

                <div className="invite-recipient-fields">
                  <div className="invite-input-group">
                    <div className="invite-input-icon">
                      <LuUser size={16} />
                    </div>
                    <input
                      type="text"
                      className="invite-input"
                      placeholder="Full Name"
                      value={recipient.userName}
                      onChange={(e) => handleInputChange("userName", e.target.value, recipient.id)}
                    />
                  </div>

                  <div className="invite-input-group">
                    <div className="invite-input-icon">
                      <LuMail size={16} />
                    </div>
                    <input
                      type="email"
                      className="invite-input"
                      placeholder="Email Address"
                      value={recipient.email}
                      onChange={(e) => handleInputChange("email", e.target.value, recipient.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {recipients.length < 4 && (
            <button className="invite-add-btn" onClick={handleAddRecipient}>
              <BiPlus size={20} />
              Add Another Recipient
            </button>
          )}

          {/* Action Buttons */}
          <div className="invite-modal-actions">
            <button className="invite-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              className="invite-btn-primary"
              onClick={onInviteSend}
              disabled={!canSubmit() || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : `Send ${recipients.length} Invitation${recipients.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
