import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios"; // Axios kütüphanesini ekledik

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
  const [formattedEditCost, setFormattedEditCost] = useState("");
  const [formattedEditPph, setFormattedEditPph] = useState("");
  const [isEditCostDisabled, setIsEditCostDisabled] = useState(false);
  const [isEditPphDisabled, setIsEditPphDisabled] = useState(false);
  const [showCostInput, setShowCostInput] = useState(true);
  const [showPphInput, setShowPphInput] = useState(true);
  const [cardLevels, setCardLevels] = useState([]); // Yeni state eklendi

  const formatNumberWithCommas = useCallback(
    (value) => {
      return new Intl.NumberFormat(
        language === "tr" ? "tr-TR" : "en-US"
      ).format(value);
    },
    [language]
  );

  useEffect(() => {
    setFormattedEditCost(
      editCost === "" ? "" : formatNumberWithCommas(editCost)
    );
  }, [editCost, formatNumberWithCommas]);

  useEffect(() => {
    setFormattedEditPph(editPph === "" ? "" : formatNumberWithCommas(editPph));
  }, [editPph, formatNumberWithCommas]);

  const handleEditCostChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setEditCost(rawValue);
    setFormattedEditCost(
      rawValue === "" ? "" : formatNumberWithCommas(rawValue)
    );
  };

  const handleEditPphChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setEditPph(rawValue);
    setFormattedEditPph(
      rawValue === "" ? "" : formatNumberWithCommas(rawValue)
    );
  };

  useEffect(() => {
    const fetchCardLevels = async () => {
      if (!cardToEdit) return; // cardToEdit yoksa işlemi durdur
      try {
        const response = await axios.get(
          `https://api.hamsterkombattool.site/api/card-levels/${cardToEdit}`
        );
        if (response.data.length > 0) {
          setCardLevels(response.data); // Veriler state'e kaydedildi
        } else {
          setCardLevels([]); // Eşleşme yoksa state'i temizle
        }
      } catch (error) {
        setCardLevels([]); // Hata durumunda state'i temizle
      }
    };

    fetchCardLevels(); // Fonksiyonu çağır
  }, [cardToEdit]); // cardToEdit bağımlılığı

  useEffect(() => {
    const targetLevel = parseInt(editLevel) + 1; // Kullanıcının girdiği level + 1
    const currentLevelData = cardLevels.find(
      (level) => level.level === targetLevel
    );

    if (editLevel === "") {
      setShowCostInput(false);
      setShowPphInput(false);
    } else if (currentLevelData) {
      setEditCost(currentLevelData.base_cost.toString());
      setEditPph(currentLevelData.base_hourly_earnings.toString());
      setIsEditCostDisabled(true);
      setIsEditPphDisabled(true);
      setShowCostInput(false);
      setShowPphInput(false);
    } else {
      // Eğer currentLevelData yoksa, state'leri temizle
      setEditCost(""); // Boş olarak ayarla
      setEditPph(""); // Boş olarak ayarla
      setShowCostInput(true);
      setShowPphInput(true);
      setIsEditCostDisabled(false);
      setIsEditPphDisabled(false);
    }
  }, [editLevel, cardLevels, setEditCost, setEditPph]); // cardLevels bağımlılığı

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
          <div
            className="input-group"
            style={{ display: showCostInput ? "block" : "none" }}
          >
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
              disabled={isEditCostDisabled}
            />
          </div>
          <div
            className="input-group"
            style={{ display: showPphInput ? "block" : "none" }}
          >
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
              disabled={isEditPphDisabled}
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
