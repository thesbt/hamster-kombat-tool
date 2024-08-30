import React, { useEffect } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload } from "react-icons/fa";

function AddCardModal({
  isOpen,
  onRequestClose,
  newCard,
  handleAdminInputChange,
  handleAdminAddCard,
  isDarkMode,
}) {
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

          handleAdminInputChange({
            target: { name: "image_url", value: newImageUrl },
          });
        }
      }
    );
    myWidget.open();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add New Card"
      className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
      overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
    >
      <div className="modal-card">
        <div className="card-header">
          <h2>Add New Card</h2>
        </div>
        <form onSubmit={handleAdminAddCard}>
          <div className="input-group">
            <label htmlFor="addName">Card Name:</label>
            <input
              id="addName"
              type="text"
              name="name"
              value={newCard.name}
              onChange={handleAdminInputChange}
              placeholder="Card Name"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="addImageUrl">Resim URL:</label>
            <div className="image-upload-group">
              <input
                id="addImageUrl"
                type="text"
                name="image_url"
                value={newCard.image_url}
                onChange={handleAdminInputChange}
                placeholder="Resim URL"
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
            <label htmlFor="addBaseCost">Base Cost:</label>
            <input
              id="addBaseCost"
              type="number"
              name="base_cost"
              value={newCard.base_cost}
              onChange={handleAdminInputChange}
              placeholder="Base Cost"
            />
          </div>
          <div className="input-group">
            <label htmlFor="addBaseHourlyEarnings">Base Hourly Earnings:</label>
            <input
              id="addBaseHourlyEarnings"
              type="number"
              name="base_hourly_earnings"
              value={newCard.base_hourly_earnings}
              onChange={handleAdminInputChange}
              placeholder="Base Hourly Earnings"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="addCardCategory">Card Category:</label>
            <input
              id="addCardCategory"
              type="text"
              name="card_category"
              value={newCard.card_category}
              onChange={handleAdminInputChange}
              placeholder="Card Category"
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
              Has Timer
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
              Is Default
            </label>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">
              <FaCheck /> Add Card
            </button>
            <button onClick={onRequestClose} className="cancel-button">
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddCardModal;
