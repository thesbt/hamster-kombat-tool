import React from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes } from "react-icons/fa";

function AdminDeleteModal({
  isOpen,
  onRequestClose,
  cardToAdminDelete,
  confirmAdminDeleteCard,
  isDarkMode,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirm Admin Delete"
      className={`modal delete-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          <h2>Delete Card</h2>
        </div>
        <p className="delete-message">
          Are you sure you want to delete the card "{cardToAdminDelete?.name}"?
        </p>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={confirmAdminDeleteCard}>
            <FaCheck />
            Delete
          </button>
          <button className="cancel-button" onClick={onRequestClose}>
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AdminDeleteModal;
