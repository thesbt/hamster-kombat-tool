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
  t,
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
          {noChangesError && <p className="error-message">{t(noChangesError)}</p>}
          {editError && <p className="error-message">{t(editError)}</p>}
          <div className="input-group">
            <label htmlFor="editLevel">{t("current_card_level")}:</label>
            <input
              id="editLevel"
              required
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              placeholder={t("current_card_level")}
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
            <label htmlFor="editCost">{t("cost_to_next_level")}:</label>
            <input
              id="editCost"
              required
              type="text"
              inputMode="numeric"
              maxLength="13"
              placeholder={t("cost_to_next_level")}
              value={editCost}
              onChange={(e) => handleInputChange(e, setEditCost)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="editPph">{t("pph_on_next_level")}:</label>
            <input
              id="editPph"
              required
              type="text"
              inputMode="numeric"
              maxLength="10"
              placeholder={t("pph_on_next_level")}
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
              {editingCard ? t("saving") : t("save")}
            </button>
            <button className="cancel-button" onClick={closeEditModal}>
              <FaTimes />
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserEditCardModal;