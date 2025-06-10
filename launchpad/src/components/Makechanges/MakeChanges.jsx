import ConfirmationModal from "../shared/ConfirmationModal";

export default function MakeChanges({visibility, onCancel, onVerify}) {
  return (
    <ConfirmationModal
      isOpen={visibility}
      onCancel={onCancel}
      onConfirm={onVerify}
      message="You want to lose your changes?"
    />
  );
}