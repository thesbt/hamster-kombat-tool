import React from "react";
import Modal from "react-modal";
import { FaCheck, FaTimes } from "react-icons/fa";

const AdminEditCardModal = ({
  isEditCardModalOpen,
  setIsEditCardModalOpen,
  isDarkMode,
  editingCard,
  handleAdminEditCard,
  handleEditCardInputChange,
}) => {
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
              <input
                id="editImageUrl"
                name="image_url"
                type="text"
                value={editingCard.image_url}
                onChange={handleEditCardInputChange}
              />
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
