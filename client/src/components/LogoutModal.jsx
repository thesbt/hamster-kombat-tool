import React from "react";
import Modal from "react-modal";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

const LogoutModal = ({
  isOpen,
  onRequestClose,
  handleLogout,
  loggingOut,
  isDarkMode,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirm Logout"
      className={`modal logout-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <p className="logout-message">Are you sure you want to log out?</p>
        <div className="modal-buttons">
          <button
            className="confirm-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <FaSpinner className="button-spinner" />
            ) : (
              <FaCheck />
            )}
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
          <button className="cancel-button" onClick={onRequestClose}>
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutModal;
