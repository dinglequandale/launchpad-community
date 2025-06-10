import ConfirmationModal from "../shared/ConfirmationModal";

export default function LogoutVerificationModal({visibility, onCancel, onVerify}) {
  return (
    <ConfirmationModal
      isOpen={visibility}
      onCancel={onCancel}
      onConfirm={onVerify}
      message="You want to logout of your account?"
    />
  );
}