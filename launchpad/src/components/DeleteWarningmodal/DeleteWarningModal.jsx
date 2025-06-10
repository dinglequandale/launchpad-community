import ConfirmationModal from "../shared/ConfirmationModal";

export default function DeleteWarningModal({visibility, onCancel, onVerify, objectOfDeletation}) {
  return (
    <ConfirmationModal
      isOpen={visibility}
      onCancel={onCancel}
      onConfirm={onVerify}
      message={
        <>
          You want to delete your{" "}
          <span className="confirmation-modal__highlight">
            {objectOfDeletation.toLowerCase()}
          </span>{" "}
          display card?
        </>
      }
    />
  );
}