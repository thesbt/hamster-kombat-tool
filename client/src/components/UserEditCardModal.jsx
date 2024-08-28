import React, { useState, useEffect, useCallback } from "react";
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
  editingCard,
  language,
  t,
}) => {
  // Yeni state'ler ekleyin
  const [formattedEditCost, setFormattedEditCost] = useState("");
  const [formattedEditPph, setFormattedEditPph] = useState("");

  // Formatlama fonksiyonu ekleyin
  const formatNumberWithCommas = useCallback(
    (value) => {
      return new Intl.NumberFormat(
        language === "tr" ? "tr-TR" : "en-US"
      ).format(value);
    },
    [language]
  );

  // useEffect ile başlangıç değerlerini ayarlayın
  useEffect(() => {
    setFormattedEditCost(formatNumberWithCommas(editCost));
    setFormattedEditPph(formatNumberWithCommas(editPph));
  }, [editCost, editPph, formatNumberWithCommas]);

  // Yeni input değişiklik işleyicileri ekleyin
  const handleEditCostChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setEditCost(rawValue);
    setFormattedEditCost(formatNumberWithCommas(rawValue));
  };

  const handleEditPphChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setEditPph(rawValue);
    setFormattedEditPph(formatNumberWithCommas(rawValue));
  };

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
          {noChangesError && (
            <p className="error-message">{t(noChangesError)}</p>
          )}
          {editError && <p className="error-message">{t(editError)}</p>}
          <div className="input-group">
            <label htmlFor="editLevel">{t("current_card_level")}:</label>
            <input
              id="editLevel"
              required
              type="number"
              inputMode="numeric"
              min="1"
              max="999"
              placeholder={t("current_card_level")}
              value={editLevel}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 3) {
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
              maxLength="17"
              placeholder={t("cost_to_next_level")}
              value={formattedEditCost}
              onChange={handleEditCostChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="editPph">{t("pph_on_next_level")}:</label>
            <input
              id="editPph"
              required
              type="text"
              inputMode="numeric"
              maxLength="13"
              placeholder={t("pph_on_next_level")}
              value={formattedEditPph}
              onChange={handleEditPphChange}
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
