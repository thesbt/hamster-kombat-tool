import React, { useState } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

function AdminDeleteModal({
  isOpen,
  onRequestClose,
  cardToAdminDelete,
  confirmAdminDeleteCard,
  isDarkMode,
  t,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    await confirmAdminDeleteCard();
    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={t("confirm_admin_delete")}
      className={`modal delete-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          <h2>{t("delete_card")}</h2>
        </div>
        {cardToAdminDelete && (
          <div className="card-to-delete-info">
            <img
              src={cardToAdminDelete.image_url}
              alt={cardToAdminDelete.name}
              className="card-image"
            />
            <h3>{cardToAdminDelete.name}</h3>            
          </div>
        )}
        <p className="delete-message">
          {t("delete_card_confirmation", { cardName: cardToAdminDelete?.name })}
        </p>
        <div className="modal-buttons">
          <button
            className="confirm-button"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="button-spinner" />
            ) : (
              <FaCheck />
            )}
            {isLoading ? t("deleting") : t("delete")}
          </button>
          <button className="cancel-button" onClick={onRequestClose}>
            <FaTimes />
            {t("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AdminDeleteModal;
