import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function AdminPanel({
  allCards,
  openEditCardModal,
  handleAdminDeleteCard,
  setIsAddCardModalOpen,
  t,
}) {
  // Kartları ada göre sırala
  const sortedCards = [...allCards].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="admin-section">
      <h3 className="admin-panel">{t("admin_panel")}</h3>
      <div className="admin-button-area">
        <button
          className="add-card-button"
          type="submit"
          onClick={() => setIsAddCardModalOpen(true)}
        >
          <FaPlus />
          {t("add_new_card")}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>{t("name")}</th>
            <th>{t("category")}</th>
            <th>{t("base_cost")}</th>
            <th>{t("base_hourly_earnings")}</th>
            <th>{t("has_timer")}</th>
            <th>{t("is_default")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedCards.map((card) => (
            <tr key={card.id}>
              <td>{card.name}</td>
              <td>{card.card_category}</td>
              <td>{card.base_cost}</td>
              <td>{card.base_hourly_earnings}</td>
              <td>{card.has_timer ? t("yes") : t("no")}</td>
              <td>{card.is_default ? t("yes") : t("no")}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => openEditCardModal(card)}
                >
                  <FaEdit />
                  <span>{t("edit")}</span>
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleAdminDeleteCard(card)}
                >
                  <FaTrash />
                  <span>{t("delete")}</span>
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
