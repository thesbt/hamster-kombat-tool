import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useTheme } from "./ThemeContext";
import "./assets/Dashboard.css";
import hamsterImage from "./assets/img/Lord.webp";
import { validateInput, validateEditInput } from "../utils/validation";
import AdminPanel from "./AdminPanel";
import AdminDeleteModal from "./AdminDeleteModal";
import AddCardModal from "./AddCardModal";
import LogoutModal from "./LogoutModal";
import UserEditCardModal from "./UserEditCardModal";
import AdminEditCardModal from "./AdminEditCardModal";
import UserDeleteModal from "./UserDeleteModal";
import {
  FaSun,
  FaMoon,
  FaSearch,
  FaPlus,
  FaTrash,
  FaSignOutAlt,
  FaTimes,
  FaClock,
  FaPencilAlt,
  FaSpinner,
} from "react-icons/fa";

Modal.setAppElement("#root");

function Dashboard({ setIsAuthenticated }) {
  const [cardsLoading, setCardsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const { isDarkMode, toggleTheme } = useTheme();
  const [cards, setCards] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [level, setLevel] = useState("");
  const [currentCost, setCurrentCost] = useState("");
  const [currentHourlyEarnings, setCurrentHourlyEarnings] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [editLevel, setEditLevel] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editPph, setEditPph] = useState("");
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isAdminDeleteModalOpen, setIsAdminDeleteModalOpen] = useState(false);
  const [cardToAdminDelete, setCardToAdminDelete] = useState(null);
  const [addingCard, setAddingCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sortBy, setSortBy] = useState("ratio");
  const [editError, setEditError] = useState("");
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    image_url: "",
    base_cost: "",
    base_hourly_earnings: "",
    card_category: "",
    has_timer: false,
    is_default: false,
  });

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://hamster-kombat-tool-server.vercel.app/api/user-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsername(response.data.username);
      setIsAdmin(response.data.is_admin);
      if (response.data.is_admin) {
        fetchAllCards();
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, []);

  const handleImageLoad = useCallback((cardId) => {
    setImagesLoaded((prev) => ({ ...prev, [cardId]: true }));
  }, []);

  const fetchUserCards = useCallback(async () => {
    const token = localStorage.getItem("token");
    setCardsLoading(true);
    try {
      const response = await axios.get(
        "https://hamster-kombat-tool-server.vercel.app/api/user-cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCards(response.data);

      // Resimleri önceden yükle
      response.data.forEach((card) => {
        if (card.image_url) {
          const img = new Image();
          img.src = card.image_url;
          img.onload = () => handleImageLoad(card.id);
          img.onerror = () => handleImageLoad(card.id);
        } else {
          // Eğer resim yoksa, bu kartı yüklenmiş olarak işaretle
          handleImageLoad(card.id);
        }
      });
    } catch (error) {
      console.error("Error fetching user cards:", error);
      setError("Failed to fetch user cards. Please try again.");
    } finally {
      setCardsLoading(false);
      window.scrollTo(0, 0);
    }
  }, [handleImageLoad]);

  useEffect(() => {
    document.title = "Dashboard | Hamster Kombat Tool";
    const fetchData = async () => {
      try {
        // await new Promise(resolve => setTimeout(resolve, 30000)); // loading için gecikme
        await Promise.all([fetchUserInfo(), fetchCards(), fetchUserCards()]);
      } catch (error) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchData();
  }, [fetchUserInfo, fetchUserCards]);

  useEffect(() => {
    if (success || error) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setSuccess("");
        setError("");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchAllCards = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://hamster-kombat-tool-server.vercel.app/api/admin/cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCards(response.data);
    } catch (error) {
      console.error("Error fetching all cards:", error);
    }
  };

  const handleAdminInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCard((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdminEditCard = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `https://hamster-kombat-tool-server.vercel.app/api/admin/cards/${editingCard.id}`,
        editingCard,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCards((prevCards) =>
        prevCards.map((card) =>
          card.id === editingCard.id ? response.data : card
        )
      );
      setIsEditCardModalOpen(false);
      setSuccess("Card successfully updated!");
    } catch (error) {
      setError("Failed to update card. Please try again.");
      console.error("Error updating card:", error);
    }
  };

  const openEditCardModal = (card) => {
    setEditingCard({ ...card });
    setIsEditCardModalOpen(true);
  };

  const handleEditCardInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingCard((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdminAddCard = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/admin/cards",
        newCard,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllCards();
      setIsAddCardModalOpen(false);
      setNewCard({
        name: "",
        base_cost: "",
        base_hourly_earnings: "",
        card_category: "",
        is_default: false,
        image_url: "",
        has_timer: false,
      });
      setSuccess("Card added to database successfully.");
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleAdminDeleteCard = (card) => {
    setCardToAdminDelete(card);
    setIsAdminDeleteModalOpen(true);
  };

  const confirmAdminDeleteCard = async () => {
    if (cardToAdminDelete === null) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://hamster-kombat-tool-server.vercel.app/api/admin/cards/${cardToAdminDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllCards();
      setSuccess("Card successfully deleted from database!");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(`Failed to delete card: ${error.response.data.message}`);
      } else {
        setError("Failed to delete card.");
      }
      console.error("Error deleting card:", error);
    } finally {
      setIsAdminDeleteModalOpen(false);
      setCardToAdminDelete(null);
      window.scrollTo(0, 0);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://hamster-kombat-tool-server.vercel.app/api/cards"
      );
      const filteredCards = response.data
        .filter((card) => !card.is_default)
        .sort((a, b) => a.name.localeCompare(b.name));

      setCards(filteredCards);
    } catch (error) {
      throw error;
    }
  };

  const handleAddCardToUser = async (e) => {
    e.preventDefault();
    if (!validateInput(currentCost, currentHourlyEarnings, level, setError)) {
      return;
    }
    setAddingCard(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/user-cards",
        {
          card_id: parseInt(selectedCard),
          level: parseInt(level),
          current_cost: currentCost,
          current_hourly_earnings: currentHourlyEarnings,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserCards();
      setSelectedCard("");
      setLevel("");
      setCurrentCost("");
      setCurrentHourlyEarnings("");
      setSuccess("Card successfully added!");
      setError("");
      setSearchTerm("");
    } catch (error) {
      setError("Failed to add card. Please check values.");
      setSuccess("");
      setSearchTerm("");
    } finally {
      setAddingCard(false);
      window.scrollTo(0, 0);
    }
  };

  const [noChangesError, setNoChangesError] = useState("");

  const handleEditCard = async (e) => {
    e.preventDefault();
    if (!validateEditInput(editCost, editPph, editLevel, setEditError)) {
      return;
    }
    const originalCard = userCards.find((card) => card.id === cardToEdit);
    if (
      originalCard.level === parseInt(editLevel) &&
      originalCard.current_cost === editCost &&
      originalCard.current_hourly_earnings === editPph
    ) {
      setNoChangesError(
        "No changes detected. Please modify the card details before saving."
      );
      setTimeout(() => {
        setNoChangesError("");
      }, 3500);
      return;
    }

    setEditingCard(true);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://hamster-kombat-tool-server.vercel.app/api/user-cards/${cardToEdit}`,
        {
          level: parseInt(editLevel),
          current_cost: editCost,
          current_hourly_earnings: editPph,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserCards();
      setEditLevel("");
      setEditCost("");
      setEditPph("");
      setCardToEdit(null);
      setIsEditModalOpen(false);
      setSuccess("Card successfully updated!");
      setError("");
      setSearchTerm("");
    } catch (error) {
      setEditError("Failed to update card. Please try again.");
      setSuccess("");
      setSearchTerm("");
    } finally {
      setEditingCard(false);
      window.scrollTo(0, 0);
    }
  };

  const handleInputChange = (e, setValue) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setValue(value);
    }
  };

  const openDeleteModal = (cardId) => {
    setCardToDelete(cardId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCardToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCard = async () => {
    if (cardToDelete === null) return;
    setDeletingCard(true);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://hamster-kombat-tool-server.vercel.app/api/user-cards/${cardToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCards((prevCards) =>
        prevCards.filter((card) => card.id !== cardToDelete)
      );
      setSuccess("Card successfully deleted!");
      setError("");
      setSearchTerm("");
    } catch (error) {
      setError("Default cards cannot be deleted.");
      setSuccess("");
      setSearchTerm("");
    } finally {
      closeDeleteModal();
      setDeletingCard(false);
      window.scrollTo(0, 0);
    }
  };

  const openEditModal = (card) => {
    setCardToEdit(card.id);
    setEditLevel(card.level.toString());
    setEditCost(card.current_cost);
    setEditPph(card.current_hourly_earnings);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCardToEdit(null);
    setEditLevel("");
    setEditCost("");
    setEditPph("");
    setIsEditModalOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number);
  };

  const calculateRatio = (cost, pph) => {
    return pph !== 0 ? (cost / pph).toFixed(2) : "N/A";
  };

  const calculateRatioColor = (ratio, ratios) => {
    const sortedRatios = [...ratios].sort((a, b) => a - b);
    const lowerThreshold = sortedRatios[Math.floor(sortedRatios.length * 0.2)];
    const upperThreshold = sortedRatios[Math.floor(sortedRatios.length * 0.7)];

    if (ratio <= lowerThreshold) {
      return "var(--ratio-green)";
    } else if (ratio >= upperThreshold) {
      return "var(--ratio-red)";
    } else {
      return "var(--ratio-orange)";
    }
  };

  const sortedUserCards = useMemo(() => {
    const cards = userCards.map((card) => {
      const cost = parseFloat(card.current_cost);
      const pph = parseFloat(card.current_hourly_earnings);
      return {
        ...card,
        ratio: calculateRatio(cost, pph),
      };
    });

    const ratios = cards
      .map((card) => parseFloat(card.ratio))
      .filter((ratio) => !isNaN(ratio));

    const sortedCards = cards
      .map((card) => ({
        ...card,
        ratioColor: calculateRatioColor(parseFloat(card.ratio), ratios),
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case "ratio":
            return (parseFloat(a.ratio) || 0) - (parseFloat(b.ratio) || 0);
          case "level":
            return a.level - b.level;
          case "cost":
            return parseFloat(a.current_cost) - parseFloat(b.current_cost);
          case "pph":
            return (
              parseFloat(a.current_hourly_earnings) -
              parseFloat(b.current_hourly_earnings)
            );
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

    return sortedCards;
  }, [userCards, sortBy]);

  const filteredCards = sortedUserCards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.card_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCards = cards.filter(
    (card) => !userCards.some((userCard) => userCard.id === card.id)
  );

  const allImagesLoaded = useMemo(() => {
    return filteredCards.every((card) => imagesLoaded[card.id]);
  }, [filteredCards, imagesLoaded]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className={`loading-screen ${isDarkMode ? "dark" : ""}`}>
        <img src={hamsterImage} alt="Loading" className="loading-image" />
        <div className="loader"></div>
        <h3 className="loader-text">Loading...</h3>
      </div>
    );
  }

  return (
    <div
      className={`dashboard ${isDarkMode ? "dark" : ""} ${
        isDeleteModalOpen ||
        isLogoutModalOpen ||
        isEditModalOpen ||
        isAddCardModalOpen
          ? "blur"
          : ""
      }`}
    >
      <div className="dashboard-header">
        <h2>
          Hi, <span>{username}</span>
        </h2>
        <div className="right-buttons">
          <button onClick={toggleTheme} className="theme-toggle">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="logout-button" onClick={openLogoutModal}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
      <h3 className="add-card">Add Card</h3>
      <div className="form-container">
        <form onSubmit={handleAddCardToUser}>
          <select
            required
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
          >
            <option value="">Select Card</option>
            {availableCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min="1"
            max="1000"
            inputMode="numeric"
            placeholder="Current Card Level"
            value={level}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) {
                setLevel(value);
              }
            }}
          />
          <input
            required
            type="text"
            maxLength="13"
            placeholder="Cost to Next Level"
            inputMode="numeric"
            value={currentCost}
            onChange={(e) => handleInputChange(e, setCurrentCost)}
          />
          <input
            required
            type="text"
            maxLength="10"
            placeholder="PPH on Next Level"
            inputMode="numeric"
            value={currentHourlyEarnings}
            onChange={(e) => handleInputChange(e, setCurrentHourlyEarnings)}
          />
          <button
            className="add-card-button"
            type="submit"
            disabled={addingCard}
          >
            {addingCard ? <FaSpinner className="button-spinner" /> : <FaPlus />}
            {addingCard ? "Adding..." : "Add Card"}
          </button>
        </form>
      </div>
      {error && (
        <p className={`message ${!showMessage ? "hidden" : ""} error-message`}>
          {error}
        </p>
      )}
      {success && (
        <p
          className={`message ${!showMessage ? "hidden" : ""} success-message`}
        >
          {success}
        </p>
      )}
      <h3 className="your-cards">Your Cards</h3>
      <div className="search-and-sort-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm ? (
            <FaTimes className="clear-search-icon" onClick={clearSearch} />
          ) : (
            <FaSearch className="search-icon" />
          )}
        </div>
        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="ratio">Sort by Ratio</option>
            <option value="level">Sort by Level</option>
            <option value="cost">Sort by Cost</option>
            <option value="pph">Sort by PPH</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {cardsLoading || !allImagesLoaded ? (
        <div className="loading-cards">
          <div className="spinner"></div>
          <div className="loading-text">Loading cards...</div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="no-results-message">
          <p>No results found for "{searchTerm}".</p>
        </div>
      ) : (
        <div className="cards-container">
          {filteredCards.map((userCard) => {
            const cost = parseFloat(userCard.current_cost);
            const pph = parseFloat(userCard.current_hourly_earnings);

            return (
              <div
                className={`card ${isDarkMode ? "dark" : ""}`}
                key={userCard.id}
              >
                <div className="card-header">
                  {userCard.has_timer && (
                    <FaClock
                      className="timer-icon"
                      title="This card has upgrade cooldown."
                    />
                  )}
                  {userCard.image_url && (
                    <img
                      src={userCard.image_url}
                      alt={userCard.name}
                      className="card-image"
                      onLoad={() => handleImageLoad(userCard.id)}
                      onError={() => handleImageLoad(userCard.id)}
                    />
                  )}
                </div>
                <div className="card-second-header">
                  <h3>{userCard.name}</h3>
                  <p>{userCard.card_category}</p>
                </div>
                <div className="card-line">
                  <hr />
                </div>

                <div className="card-body">
                  <p>Level: {userCard.level}</p>
                  <p>Cost: {formatNumber(cost)}</p>
                  <p>PPH: {formatNumber(pph)}</p>
                  <p>
                    Ratio:{" "}
                    <span style={{ color: userCard.ratioColor }}>
                      {userCard.ratio}
                    </span>
                  </p>
                </div>
                <div className="card-footer">
                  <button
                    className="edit-button"
                    onClick={() => openEditModal(userCard)}
                  >
                    <FaPencilAlt />
                  </button>
                  {!userCard.is_default && (
                    <button
                      className="delete-button"
                      onClick={() => openDeleteModal(userCard.id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <UserEditCardModal
        isEditModalOpen={isEditModalOpen}
        closeEditModal={closeEditModal}
        isDarkMode={isDarkMode}
        cardToEdit={cardToEdit}
        userCards={userCards}
        handleEditCard={handleEditCard}
        noChangesError={noChangesError}
        editError={editError}
        editLevel={editLevel}
        setEditLevel={setEditLevel}
        editCost={editCost}
        setEditCost={setEditCost}
        editPph={editPph}
        setEditPph={setEditPph}
        handleInputChange={handleInputChange}
        editingCard={editingCard}
      />
      <UserDeleteModal
        isDeleteModalOpen={isDeleteModalOpen}
        closeDeleteModal={closeDeleteModal}
        isDarkMode={isDarkMode}
        cardToDelete={cardToDelete}
        userCards={userCards}
        handleDeleteCard={handleDeleteCard}
        deletingCard={deletingCard}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onRequestClose={closeLogoutModal}
        handleLogout={handleLogout}
        loggingOut={loggingOut}
        isDarkMode={isDarkMode}
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onRequestClose={() => setIsAddCardModalOpen(false)}
        newCard={newCard}
        handleAdminInputChange={handleAdminInputChange}
        handleAdminAddCard={handleAdminAddCard}
        isDarkMode={isDarkMode}
      />
      <AdminEditCardModal
        isEditCardModalOpen={isEditCardModalOpen}
        setIsEditCardModalOpen={setIsEditCardModalOpen}
        isDarkMode={isDarkMode}
        editingCard={editingCard}
        handleAdminEditCard={handleAdminEditCard}
        handleEditCardInputChange={handleEditCardInputChange}
      />

      <AdminDeleteModal
        isOpen={isAdminDeleteModalOpen}
        onRequestClose={() => setIsAdminDeleteModalOpen(false)}
        cardToAdminDelete={cardToAdminDelete}
        confirmAdminDeleteCard={confirmAdminDeleteCard}
        isDarkMode={isDarkMode}
      />

      {isAdmin && (
        <AdminPanel
          allCards={allCards}
          openEditCardModal={openEditCardModal}
          handleAdminDeleteCard={handleAdminDeleteCard}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
          isDarkMode={isDarkMode}
        />
      )}
      <footer className="footer">
        <p>&copy; 2024 Hamster Kombat Tool</p>
      </footer>
    </div>
  );
}

export default Dashboard;
