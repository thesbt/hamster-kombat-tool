import React, { useState } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload } from "react-icons/fa";
import axios from "axios";

function AddCardModal({
  isOpen,
  onRequestClose,
  newCard,
  handleAdminInputChange,
  handleAdminAddCard,
  isDarkMode,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Lütfen bir dosya seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUploadedImageUrl(response.data.imageUrl);
      handleAdminInputChange({
        target: { name: "image_url", value: response.data.imageUrl },
      });
      alert("Resim başarıyla yüklendi!");
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      alert("Resim yüklenirken bir hata oluştu.");
    }
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
            <label htmlFor="addImageUrl">Image URL:</label>
            <div className="image-upload-group">
              <input
                id="addImageUrl"
                type="text"
                name="image_url"
                value={newCard.image_url || uploadedImageUrl}
                onChange={handleAdminInputChange}
                placeholder="Image URL"
                required
              />
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
                id="fileInput"
              />
              <label htmlFor="fileInput" className="file-input-label">
                Choose File
              </label>
              <button
                type="button"
                onClick={handleUpload}
                className="upload-button"
              >
                <FaUpload /> Upload
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
