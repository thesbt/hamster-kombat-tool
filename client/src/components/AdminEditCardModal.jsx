import React, { useEffect } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload } from "react-icons/fa";

const AdminEditCardModal = ({
  isEditCardModalOpen,
  setIsEditCardModalOpen,
  isDarkMode,
  editingCard,
  handleAdminEditCard,
  handleEditCardInputChange,
}) => {
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
          alert("Resim yüklenirken bir hata oluştu.");
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
    await handleAdminEditCard(e);
    setIsEditCardModalOpen(false);
  };

  return (
    <Modal
      isOpen={isEditCardModalOpen}
      onRequestClose={() => setIsEditCardModalOpen(false)}
      contentLabel="Edit Card"
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
              Category: {editingCard.card_category}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="editName">Card Name:</label>
              <input
                id="editName"
                name="name"
                type="text"
                value={editingCard.name}
                onChange={handleEditCardInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editImageUrl">Resim URL:</label>
              <div className="image-upload-group">
                <input
                  id="editImageUrl"
                  name="image_url"
                  type="text"
                  value={editingCard.image_url}
                  onChange={handleEditCardInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  className="upload-button"
                >
                  <FaUpload /> Yükle
                </button>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="editBaseCost">Base Cost:</label>
              <input
                id="editBaseCost"
                name="base_cost"
                type="number"
                value={editingCard.base_cost}
                onChange={handleEditCardInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editBaseHourlyEarnings">
                Base Hourly Earnings:
              </label>
              <input
                id="editBaseHourlyEarnings"
                name="base_hourly_earnings"
                type="number"
                value={editingCard.base_hourly_earnings}
                onChange={handleEditCardInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="editCategory">Card Category:</label>
              <input
                id="editCategory"
                name="card_category"
                type="text"
                value={editingCard.card_category}
                onChange={handleEditCardInputChange}
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
                Has Timer
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
                Is Default
              </label>
            </div>
            <div className="modal-buttons">
              <button className="confirm-button" type="submit">
                <FaCheck />
                Değişiklikleri Kaydet
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditCardModalOpen(false)}
              >
                <FaTimes />
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default AdminEditCardModal;
