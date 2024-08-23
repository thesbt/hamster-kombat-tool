import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function AdminPanel({
  allCards,
  openEditCardModal,
  handleAdminDeleteCard,
  setIsAddCardModalOpen,
  isDarkMode,
}) {
  return (
    <div className="admin-section">
      <h3 className="your-cards">Admin Panel</h3>
      <div className="admin-button-area">
        <button
          className="add-card-button"
          type="submit"
          onClick={() => setIsAddCardModalOpen(true)}
        >
          <FaPlus />
          Add New Card
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Base Cost</th>
            <th>Base H.E</th>
            <th>Has Timer</th>
            <th>Is Default</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allCards.map((card) => (
            <tr key={card.id}>
              <td>{card.name}</td>
              <td>{card.card_category}</td>
              <td>{card.base_cost}</td>
              <td>{card.base_hourly_earnings}</td>
              <td>{card.has_timer ? "Yes" : "No"}</td>
              <td>{card.is_default ? "Yes" : "No"}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => openEditCardModal(card)}
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleAdminDeleteCard(card)}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;