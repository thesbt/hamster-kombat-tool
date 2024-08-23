import React from "react";
import Modal from "react-modal";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

const UserEditCardModal = ({
  isEditModalOpen,
  closeEditModal,
  isDarkMode,
  cardToEdit,
  userCards,
  handleEditCard,
  noChangesError,
  editError,
  editLevel,
  setEditLevel,
  editCost,
  setEditCost,
  editPph,
  setEditPph,
  handleInputChange,
  editingCard,
}) => {
  return (
    <Modal
      isOpen={isEditModalOpen}
      onRequestClose={closeEditModal}
      contentLabel="Edit Card"
      className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          {cardToEdit && (
            <img
              src={userCards.find((card) => card.id === cardToEdit)?.image_url}
              alt="Card"
              className="card-image"
            />
          )}
          <h2>{userCards.find((card) => card.id === cardToEdit)?.name}</h2>
          <p className="card-category">
            {userCards.find((card) => card.id === cardToEdit)?.card_category}
          </p>
        </div>
        <form onSubmit={handleEditCard}>
          {noChangesError && <p className="error-message">{noChangesError}</p>}
          {editError && <p className="error-message">{editError}</p>}
          <div className="input-group">
            <label htmlFor="editLevel">Current Card Level:</label>
            <input
              id="editLevel"
              required
              type="number"
              min="1"
              max="1000"
              placeholder="Current Card Level"
              value={editLevel}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 4) {
                  setEditLevel(value);
                }
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="editCost">Cost to Next Level:</label>
            <input
              id="editCost"
              required
              type="text"
              maxLength="13"
              placeholder="Cost to Next Level"
              value={editCost}
              onChange={(e) => handleInputChange(e, setEditCost)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="editPph">PPH on Next Level:</label>
            <input
              id="editPph"
              required
              type="text"
              maxLength="10"
              placeholder="PPH on Next Level"
              value={editPph}
              onChange={(e) => handleInputChange(e, setEditPph)}
            />
          </div>
          <div className="modal-buttons">
            <button
              className="confirm-button"
              type="submit"
              disabled={editingCard}
            >
              {editingCard ? (
                <FaSpinner className="button-spinner" />
              ) : (
                <FaCheck />
              )}
              {editingCard ? "Saving..." : "Save"}
            </button>
            <button className="cancel-button" onClick={closeEditModal}>
              <FaTimes />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserEditCardModal;