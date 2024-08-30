import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload, FaSpinner } from "react-icons/fa";

function AddCardModal({
  isOpen,
  onRequestClose,
  newCard,
  handleAdminInputChange,
  handleAdminAddCard,
  isDarkMode,
  t, // Dil çevirisi için t fonksiyonunu ekledik
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpload = async () => {
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dquxlbwmd",
        uploadPreset: "ml_default",
      },
      async (error, result) => {
        if (error) {
          alert(t("image_upload_error"));
          return;
        }
        if (result && result.event === "success") {
          const newImageUrl = result.info.secure_url;

          handleAdminInputChange({
            target: { name: "image_url", value: newImageUrl },
          });
        }
      }
    );
    myWidget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await handleAdminAddCard(e);
    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={t("add_new_card")}
      className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          <h2>{t("add_new_card")}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="addName">{t("card_name")}:</label>
            <input
              id="addName"
              type="text"
              name="name"
              value={newCard.name}
              onChange={handleAdminInputChange}
              placeholder={t("card_name_placeholder")}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="addImageUrl">{t("image_url")}:</label>
            <div className="image-upload-group">
              <input
                id="addImageUrl"
                type="text"
                name="image_url"
                value={newCard.image_url}
                onChange={handleAdminInputChange}
                placeholder={t("image_url_placeholder")}
              />
              <button
                type="button"
                onClick={handleUpload}
                className="upload-button"
              >
                <FaUpload /> {t("upload")}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="addBaseCost">{t("base_cost")}:</label>
            <input
              id="addBaseCost"
              type="number"
              name="base_cost"
              value={newCard.base_cost}
              onChange={handleAdminInputChange}
              placeholder={t("base_cost_placeholder")}
            />
          </div>
          <div className="input-group">
            <label htmlFor="addBaseHourlyEarnings">
              {t("base_hourly_earnings")}:
            </label>
            <input
              id="addBaseHourlyEarnings"
              type="number"
              name="base_hourly_earnings"
              value={newCard.base_hourly_earnings}
              onChange={handleAdminInputChange}
              placeholder={t("base_hourly_earnings_placeholder")}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="addCardCategory">{t("card_category")}:</label>
            <input
              id="addCardCategory"
              type="text"
              name="card_category"
              value={newCard.card_category}
              onChange={handleAdminInputChange}
              placeholder={t("card_category_placeholder")}
              required
            />
          </div>
          <div className="input-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="has_timer"
                checked={newCard.has_timer}
                onChange={handleAdminInputChange}
              />
              {t("has_timer")}
            </label>
          </div>
          <div className="input-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_default"
                checked={newCard.is_default}
                onChange={handleAdminInputChange}
              />
              {t("is_default")}
            </label>
          </div>
          <div className="modal-buttons">
            <button
              type="submit"
              className="confirm-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="button-spinner" />
              ) : (
                <FaCheck />
              )}
              {isLoading ? t("admin_adding_card") : t("add")}
            </button>
            <button onClick={onRequestClose} className="cancel-button">
              <FaTimes /> {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddCardModal;
