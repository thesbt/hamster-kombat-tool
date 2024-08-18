import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useTheme } from "./ThemeContext";
import "./assets/Dashboard.css";
import hamsterImage from "./assets/img/Lord.webp";
import {
  FaSun,
  FaMoon,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaClock,
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
  const [sortBy, setSortBy] = useState("ratio");
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [newCard, setNewCard] = useState({
    name: "",
    image_url: "",
    base_cost: "",
    base_hourly_earnings: "",
    card_category: "",
    has_timer: false,
    is_default: false,
  });
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

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
      }
    };
    fetchData();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (success || error) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setSuccess("");
        setError("");
      }, 5000);
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

  const handleAddCard = async (e) => {
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

  const fetchUserCards = async () => {
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
    }
  };

  const validateInput = () => {
    if (!/^\d+$/.test(currentCost)) {
      setError("Current Cost must be a valid number.");
      return false;
    }
    if (!/^\d+$/.test(currentHourlyEarnings)) {
      setError("Current Hourly Earnings must be a valid number.");
      return false;
    }
    return true;
  };

  const handleAddOrUpdateCard = async (e) => {
    e.preventDefault();
    if (!validateInput()) {
      return;
    }
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
    }
  };

  const handleEditCard = async (e) => {
    e.preventDefault();
    if (
      !/^\d+$/.test(editCost) ||
      !/^\d+$/.test(editPph) ||
      !/^\d+$/.test(editLevel)
    ) {
      setError("Level, Cost, and PPH must be valid numbers.");
      return;
    }

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
      setError("Failed to update card. Please try again.");
      setSuccess("");
      setSearchTerm("");
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

  const handleImageLoad = useCallback((cardId) => {
    setImagesLoaded((prev) => ({ ...prev, [cardId]: true }));
  }, []);

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
      <h3 className="your-cards">Add Card</h3>
      <div className="form-container">
        <form onSubmit={handleAddOrUpdateCard}>
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
            maxLength="4"
            placeholder="Current Card Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <input
            required
            type="text"
            maxLength="13"
            placeholder="Cost to Next Level"
            value={currentCost}
            onChange={(e) => handleInputChange(e, setCurrentCost)}
          />
          <input
            required
            type="text"
            maxLength="10"
            placeholder="PPH on Next Level"
            value={currentHourlyEarnings}
            onChange={(e) => handleInputChange(e, setCurrentHourlyEarnings)}
          />
          <button className="add-card-button" type="submit">
            <FaPlus />
            Add Card
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
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => openDeleteModal(userCard.id)}
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Card"
        className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
        overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
      >
        <div className="modal-card">
          <div className="card-header">
            {cardToEdit && (
              <img
                src={
                  userCards.find((card) => card.id === cardToEdit)?.image_url
                }
                alt="Card"
                className="card-image"
              />
            )}
            <h2>{userCards.find((card) => card.id === cardToEdit)?.name}</h2>
            <p className="card-category">
              {" "}
              {userCards.find((card) => card.id === cardToEdit)?.card_category}
            </p>
          </div>
          <form onSubmit={handleEditCard}>
            <div className="input-group">
              <label htmlFor="editLevel">Current Card Level:</label>
              <input
                id="editLevel"
                required
                type="number"
                min="1"
                max="1000"
                maxLength="4"
                placeholder="Current Card Level"
                value={editLevel}
                onChange={(e) => handleInputChange(e, setEditLevel)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="editCost">Cost to Next Level:</label>
              <input
                id="editCost"
                required
                type="text"
                maxLength="13"
                placeholder="Cost to Next Level"
                value={editCost}
                onChange={(e) => handleInputChange(e, setEditCost)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="editPph">PPH on Next Level:</label>
              <input
                id="editPph"
                required
                type="text"
                maxLength="10"
                placeholder="PPH on Next Level"
                value={editPph}
                onChange={(e) => handleInputChange(e, setEditPph)}
              />
            </div>
            <div className="modal-buttons">
              <button className="confirm-button" type="submit">
                <FaCheck />
                Save
              </button>
              <button className="cancel-button" onClick={closeEditModal}>
                <FaTimes />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirm Delete"
        className={`modal delete-modal ${isDarkMode ? "dark" : ""}`}
        overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
      >
        <div className="modal-card">
          <div className="card-header">
            {cardToDelete && (
              <>
                <img
                  src={
                    userCards.find((card) => card.id === cardToDelete)
                      ?.image_url
                  }
                  alt="Card"
                  className="card-image"
                />
                <h2>
                  {userCards.find((card) => card.id === cardToDelete)?.name}
                </h2>
                <p className="card-category">
                  Category:{" "}
                  {
                    userCards.find((card) => card.id === cardToDelete)
                      ?.card_category
                  }
                </p>
              </>
            )}
          </div>
          <p className="delete-message">
            Are you sure you want to delete this card?
          </p>
          <div className="modal-buttons">
            <button className="confirm-button" onClick={handleDeleteCard}>
              <FaCheck />
              Delete
            </button>
            <button className="cancel-button" onClick={closeDeleteModal}>
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isLogoutModalOpen}
        onRequestClose={closeLogoutModal}
        contentLabel="Confirm Logout"
        className={`modal logout-modal ${isDarkMode ? "dark" : ""}`}
        overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
      >
        <div className="modal-card">
          <div className="card-header">
            <h2>Logout Confirmation</h2>
          </div>
          <p className="logout-message">Are you sure you want to log out?</p>
          <div className="modal-buttons">
            <button className="confirm-button" onClick={handleLogout}>
              <FaCheck />
              Logout
            </button>
            <button className="cancel-button" onClick={closeLogoutModal}>
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isAddCardModalOpen}
        onRequestClose={() => setIsAddCardModalOpen(false)}
        contentLabel="Add New Card"
        className={`modal edit-modal ${isDarkMode ? "dark" : ""}`}
        overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
      >
        <div className="modal-card">
          <div className="card-header">
            <h2>Add New Card</h2>
          </div>
          <form onSubmit={handleAddCard}>
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
              <input
                id="addImageUrl"
                type="text"
                name="image_url"
                value={newCard.image_url}
                onChange={handleAdminInputChange}
                placeholder="Image URL"
              />
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
              <label htmlFor="addBaseHourlyEarnings">
                Base Hourly Earnings:
              </label>
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
              <button
                onClick={() => setIsAddCardModalOpen(false)}
                className="cancel-button"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
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

      <Modal
        isOpen={isAdminDeleteModalOpen}
        onRequestClose={() => setIsAdminDeleteModalOpen(false)}
        contentLabel="Confirm Admin Delete"
        className={`modal delete-modal ${isDarkMode ? "dark" : ""}`}
        overlayClassName={`modal-overlay ${isDarkMode ? "dark" : ""}`}
      >
        <div className="modal-card">
          <div className="card-header">
            <h2>Delete Card</h2>
          </div>
          <p className="delete-message">
            Are you sure you want to delete the card "{cardToAdminDelete?.name}
            "?
          </p>
          <div className="modal-buttons">
            <button className="confirm-button" onClick={confirmAdminDeleteCard}>
              <FaCheck />
              Yes, Delete
            </button>
            <button
              className="cancel-button"
              onClick={() => setIsAdminDeleteModalOpen(false)}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {isAdmin && (
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
      )}
    </div>
  );
}

export default Dashboard;
