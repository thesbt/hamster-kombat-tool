import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload, FaSpinner } from "react-icons/fa";

const AdminEditCardModal = ({
  isEditCardModalOpen,
  setIsEditCardModalOpen,
  isDarkMode,
  editingCard,
  handleAdminEditCard,
  handleEditCardInputChange,
  t, // Dil çevirisi için t fonksiyonunu ekledik
}) => {
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

          handleEditCardInputChange({
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
    await handleAdminEditCard(e);
    setIsLoading(false);
    setIsEditCardModalOpen(false);
  };

  return (
    <Modal
      isOpen={isEditCardModalOpen}
      onRequestClose={() => setIsEditCardModalOpen(false)}
      contentLabel={t("edit_card")}
      className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      {editingCard && (
        <div className="modal-card">
          <div className="card-header">
            <img
              src={editingCard.image_url}
              alt={editingCard.name}
              className="card-image"
            />
            <h2>{editingCard.name}</h2>
            <p className="card-category">
              {t("category")}: {editingCard.card_category}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="editName">{t("card_name")}:</label>
              <input
                id="editName"
                name="name"
                type="text"
                value={editingCard.name}
                onChange={handleEditCardInputChange}
                placeholder={t("card_name_placeholder")}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editImageUrl">{t("image_url")}:</label>
              <div className="image-upload-group">
                <input
                  id="editImageUrl"
                  name="image_url"
                  type="text"
                  value={editingCard.image_url}
                  onChange={handleEditCardInputChange}
                  placeholder={t("image_url_placeholder")}
                  required
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
              <label htmlFor="editBaseCost">{t("base_cost")}:</label>
              <input
                id="editBaseCost"
                name="base_cost"
                type="number"
                value={editingCard.base_cost}
                onChange={handleEditCardInputChange}
                placeholder={t("base_cost_placeholder")}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editBaseHourlyEarnings">
                {t("base_hourly_earnings")}:
              </label>
              <input
                id="editBaseHourlyEarnings"
                name="base_hourly_earnings"
                type="number"
                value={editingCard.base_hourly_earnings}
                onChange={handleEditCardInputChange}
                placeholder={t("base_hourly_earnings_placeholder")}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editCategory">{t("card_category")}:</label>
              <input
                id="editCategory"
                name="card_category"
                type="text"
                value={editingCard.card_category}
                onChange={handleEditCardInputChange}
                placeholder={t("card_category_placeholder")}
                required
              />
            </div>
            <div className="input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="has_timer"
                  checked={editingCard.has_timer}
                  onChange={handleEditCardInputChange}
                />
                {t("has_timer")}
              </label>
            </div>
            <div className="input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={editingCard.is_default}
                  onChange={handleEditCardInputChange}
                />
                {t("is_default")}
              </label>
            </div>
            <div className="modal-buttons">
              <button
                className="confirm-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <FaSpinner className="button-spinner" />
                ) : (
                  <FaCheck />
                )}
                {isLoading ? t("admin_update_card") : t("update")}
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditCardModalOpen(false)}
              >
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

export default AdminEditCardModal;
