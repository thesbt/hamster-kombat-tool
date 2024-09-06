import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { FaSpinner, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import axios from "axios";

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
  const [cardLevels, setCardLevels] = useState([]);
  const [formattedEditCost, setFormattedEditCost] = useState("");
  const [formattedEditPph, setFormattedEditPph] = useState("");
  const [isEditCostDisabled, setIsEditCostDisabled] = useState(false);
  const [isEditPphDisabled, setIsEditPphDisabled] = useState(false);
  const [showCostInput, setShowCostInput] = useState(false);
  const [showPphInput, setShowPphInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardLevels = async () => {
      if (!cardToEdit) return;
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.hamsterkombattool.site/api/card-levels/${cardToEdit}`
        );
        if (response.data.length > 0) {
          setCardLevels(response.data);
        } else {
          setCardLevels([]);
        }
      } catch (error) {
        setCardLevels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardLevels();
  }, [cardToEdit]); // Burada sadece cardToEdit'i izliyoruz

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
    if (isLoading) return;

    const targetLevel = parseInt(editLevel) + 1;
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
      setEditCost("");
      setEditPph("");
      setShowCostInput(true);
      setShowPphInput(true);
      setIsEditCostDisabled(false);
      setIsEditPphDisabled(false);
    }
  }, [editLevel, cardLevels, setEditCost, setEditPph, isLoading]);

  return (
    <Modal
      isOpen={isEditModalOpen}
      onRequestClose={closeEditModal}
      contentLabel="Edit Card"
      className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      {isLoading ? ( // Spinner'ı burada gösteriyoruz
        <div className="loading-spinner">
          <FaSpinner className="button-spinner" />
          <p>{t("getting_card_data")}</p>
        </div>
      ) : (
        <div className="modal-card">
          <div className="card-header">
            {cardToEdit && (
              <img
                src={
                  userCards.find((card) => card.id === cardToEdit)?.image_url
                }
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
            {!isLoading && (
              <>
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
                    maxLength="20"
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
                {showCostInput && (
                  <div className="manual-input-warning-area">
                    <FaInfoCircle />
                    <p
                      className="manual-input-warning"
                      style={{ marginLeft: "10px" }}
                    >
                      {t("manual_input_warning")}
                    </p>
                  </div>
                )}
              </>
            )}
            <div className="modal-buttons">
              <button
                className="confirm-button"
                type="submit"
                disabled={editingCard || isLoading}
              >
                {editingCard || isLoading ? (
                  <FaSpinner className="button-spinner" />
                ) : (
                  <FaCheck />
                )}
                {editingCard || isLoading ? t("saving") : t("save")}
              </button>
              <button className="cancel-button" onClick={closeEditModal}>
                <FaTimes />
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default UserEditCardModal;
