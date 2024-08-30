import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes, FaUpload } from "react-icons/fa";
import axios from "axios";

const AdminEditCardModal = ({
  isEditCardModalOpen,
  setIsEditCardModalOpen,
  isDarkMode,
  editingCard,
  handleAdminEditCard,
  handleEditCardInputChange,
}) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

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
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
      },
      async (error, result) => {
        if (error) {
          alert("Resim yüklenirken bir hata oluştu.");
          return;
        }
        if (result && result.event === "success") {
          try {
            const updateResponse = await axios.put(
              `https://api.hamsterkombattool.site/api/admin/cards/${editingCard.id}/image`,
              { image_url: result.info.secure_url },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (updateResponse.data.success) {
              setUploadedImageUrl(result.info.secure_url);
              handleEditCardInputChange({
                target: { name: "image_url", value: result.info.secure_url },
              });
              alert("Resim başarıyla yüklendi ve kart güncellendi!");
            } else {
              alert(
                "Resim yüklendi ancak kart güncellenirken bir hata oluştu."
              );
            }
          } catch (updateError) {
            alert("Resim yüklendi ancak kart güncellenirken bir hata oluştu.");
          }
        }
      }
    );
    myWidget.open();
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
          <form onSubmit={handleAdminEditCard}>
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
              <label htmlFor="editImageUrl">Image URL:</label>
              <div className="image-upload-group">
                <input
                  id="editImageUrl"
                  name="image_url"
                  type="text"
                  value={editingCard.image_url || uploadedImageUrl}
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
                Save Changes
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditCardModalOpen(false)}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default AdminEditCardModal;
