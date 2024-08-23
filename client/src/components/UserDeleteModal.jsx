import React from "react";
import Modal from "react-modal";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

function UserDeleteModal({
  isDeleteModalOpen,
  closeDeleteModal,
  isDarkMode,
  cardToDelete,
  userCards,
  handleDeleteCard,
  deletingCard,
}) {
  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onRequestClose={closeDeleteModal}
      contentLabel="Confirm Delete"
      className={`modal delete-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          {cardToDelete && (
            <>
              <img
                src={
                  userCards.find((card) => card.id === cardToDelete)?.image_url
                }
                alt="Card"
                className="card-image"
              />
              <h2>
                {userCards.find((card) => card.id === cardToDelete)?.name}
              </h2>
              <p className="card-category">
                {userCards.find((card) => card.id === cardToDelete)
                  ?.card_category}
              </p>
            </>
          )}
        </div>
        <p className="delete-message">
          Are you sure you want to delete this card?
        </p>
        <div className="modal-buttons">
          <button
            className="confirm-button"
            onClick={handleDeleteCard}
            disabled={deletingCard}
          >
            {deletingCard ? (
              <FaSpinner className="button-spinner" />
            ) : (
              <FaCheck />
            )}
            {deletingCard ? "Deleting..." : "Delete"}
          </button>
          <button className="cancel-button" onClick={closeDeleteModal}>
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default UserDeleteModal;