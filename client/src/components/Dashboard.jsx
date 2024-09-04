import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useTheme } from "./ThemeContext";
import "./assets/Dashboard.css";
import hamsterImage from "./assets/img/Lord.webp";
import hamsterLogo from "./assets/img/Logo.webp";
import coinIcon from "./assets/img/coin.webp";
import { validateInput, validateEditInput } from "../utils/validation";
import AdminPanel from "./AdminPanel";
import AdminDeleteModal from "./AdminDeleteModal";
import AddCardModal from "./AddCardModal";
import LogoutModal from "./LogoutModal";
import UserEditCardModal from "./UserEditCardModal";
import AdminEditCardModal from "./AdminEditCardModal";
import UserDeleteModal from "./UserDeleteModal";
import GamesModal from "./GamesModal";
import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";
import {
  FaSearch,
  FaPlus,
  FaSignOutAlt,
  FaTimes,
  FaClock,
  FaSpinner,
  FaCog,
  FaGamepad,
  FaArrowUp,
} from "react-icons/fa";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

Modal.setAppElement("#root");

function Dashboard({ setIsAuthenticated }) {
  const [language, setLanguage] = useState("en");
  const t = useCallback(
    (key) => translations[language][key] || key,
    [language]
  );
  const [cardsLoading, setCardsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [coinIconLoaded, setCoinIconLoaded] = useState(false);
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
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [formattedCurrentCost, setFormattedCurrentCost] = useState("");
  const [showCostInput, setShowCostInput] = useState(false);
  const [showPphInput, setShowPphInput] = useState(false);
  const [cardLevels, setCardLevels] = useState([]); // Yeni state eklendi

  const [formattedCurrentHourlyEarnings, setFormattedCurrentHourlyEarnings] =
    useState("");
  const [newCard, setNewCard] = useState({
    name: "",
    image_url: "",
    base_cost: "",
    base_hourly_earnings: "",
    card_category: "",
    has_timer: false,
    is_default: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate, setIsAuthenticated]);

  useEffect(() => {
    const img = new Image();
    img.src = coinIcon;
    img.onload = () => setCoinIconLoaded(true);
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://api.hamsterkombattool.site/api/user-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsername(response.data.username);
      setIsAdmin(response.data.is_admin);
      if (response.data.is_admin) {
        fetchAllCards();
      }
    } catch (error) {}
  }, []);

  const handleImageLoad = useCallback((cardId) => {
    setImagesLoaded((prev) => ({ ...prev, [cardId]: true }));
  }, []);

  const fetchUserCards = useCallback(async () => {
    const token = localStorage.getItem("token");
    setCardsLoading(true);
    try {
      const response = await axios.get(
        "https://api.hamsterkombattool.site/api/user-cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCards(response.data);

      response.data.forEach((card) => {
        if (card.image_url) {
          const img = new Image();
          img.src = card.image_url;
          img.onload = () => handleImageLoad(card.id);
          img.onerror = () => handleImageLoad(card.id);
        } else {
          handleImageLoad(card.id);
        }
      });
    } catch (error) {
      setError("fetch_user_cards_error");
    } finally {
      setCardsLoading(false);
      window.scrollTo(0, 0);
    }
  }, [handleImageLoad]);

  useEffect(() => {
    document.title = "Dashboard | Hamster Kombat Tool";
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchCards(),
          fetchUserCards(),
          setShowCostInput(false),
          setShowPphInput(false),
        ]);
      } catch (error) {
        setError("fetch_error");
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

  const fetchGameData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://thesbt.github.io/hamster-kombat-daily-tasks-api/config.json"
      );
      setGameData(response.data);
    } catch (error) {}
  }, []);

  const openGamesModal = () => {
    fetchGameData();
    setIsGamesModalOpen(true);
  };

  const fetchAllCards = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://api.hamsterkombattool.site/api/admin/cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllCards(response.data);
    } catch (error) {}
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
        `https://api.hamsterkombattool.site/api/admin/cards/${editingCard.id}`,
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
      setSuccess(t("admin_card_update_success"));
    } catch (error) {
      setError(t("admin_card_update_error"));
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
        "https://api.hamsterkombattool.site/api/admin/cards",
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
      setSuccess(t("admin_card_add_success"));
    } catch (error) {
      setError(t("admin_card_add_error"));
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
        `https://api.hamsterkombattool.site/api/admin/cards/${cardToAdminDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllCards();
      setSuccess(t("admin_card_delete_success"));
    } catch (error) {
      setError(t("admin_card_delete_error"));
    } finally {
      setIsAdminDeleteModalOpen(false);
      setCardToAdminDelete(null);
      window.scrollTo(0, 0);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get(
        "https://api.hamsterkombattool.site/api/cards"
      );
      const filteredCards = response.data
        .filter((card) => !card.is_default)
        .sort((a, b) => a.name.localeCompare(b.name));

      setCards(filteredCards);
    } catch (error) {
      throw error;
    }
  };

  const fetchCardLevels = useCallback(async () => {
    if (!selectedCard) return; // Eğer selectedCard yoksa, sorgu yapma

    try {
      const response = await axios.get(
        `https://api.hamsterkombattool.site/api/card-levels/${selectedCard}`
      );
      setCardLevels(response.data); // Veriler state'e kaydedildi
    } catch (error) {
      // 404 hatası durumunda kullanıcıdan manuel giriş alabilmesi için inputları göster
      if (error.response && error.response.status === 404) {
        setShowCostInput(true); // Kullanıcıdan cost girmesini sağla
        setShowPphInput(true); // Kullanıcıdan pph girmesini sağla
        setCurrentCost(""); // Boş olarak ayarla
        setCurrentHourlyEarnings(""); // Boş olarak ayarla
      } else {
        setError("fetch_card_levels_error"); // Hata mesajı ayarla
      }
    }
  }, [selectedCard]);

  const handleAddCardToUser = async (e) => {
    e.preventDefault();
    if (
      !validateInput(
        currentCost,
        currentHourlyEarnings,
        level,
        setError,
        language
      )
    ) {
      return;
    }
    setAddingCard(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://api.hamsterkombattool.site/api/user-cards",
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
      setFormattedCurrentCost("");
      setFormattedCurrentHourlyEarnings("");
      setSuccess(t("add_card_success_message"));
      setError("");
      setSearchTerm("");
    } catch (error) {
      setError(t("add_card_error_message"));
      setSuccess("");
      setSearchTerm("");
    } finally {
      setAddingCard(false);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (selectedCard) {
      fetchCardLevels(); // Sadece selectedCard değiştiğinde çağır
    }
  }, [selectedCard, fetchCardLevels]);

  useEffect(() => {
    const targetLevel = parseInt(level) + 1; // Kullanıcının girdiği level + 1
    const currentLevelData = cardLevels.find(
      (card) => card.level === targetLevel
    );

    if (level === "") {
      setShowCostInput(false);
      setShowPphInput(false);
    } else if (currentLevelData) {
      setCurrentCost(currentLevelData.base_cost.toString());
      setCurrentHourlyEarnings(
        currentLevelData.base_hourly_earnings.toString()
      );
      setShowCostInput(false);
      setShowPphInput(false);
    } else {
      setCurrentCost(""); // Boş olarak ayarla
      setCurrentHourlyEarnings(""); // Boş olarak ayarla
      setShowCostInput(true); // Kullanıcıdan cost girmesini sağla
      setShowPphInput(true); // Kullanıcıdan pph girmesini sağla
    }
  }, [level, cardLevels]); // cardLevels bağımlılığa eklendi

  const [noChangesError, setNoChangesError] = useState("");

  const handleEditCard = async (e) => {
    e.preventDefault();
    if (
      !validateEditInput(editCost, editPph, editLevel, setEditError, language)
    ) {
      return;
    }

    const originalCard = userCards.find((card) => card.id === cardToEdit);
    if (!originalCard) {
      // Eşleşen kart yoksa işlemi durdur
      setEditError(t("card_not_found_error")); // Hata mesajı ayarla
      return;
    }

    // Burada editLevel, editCost ve editPph değerlerini orijinal kartın değerleri ile karşılaştırın
    if (
      originalCard.level === parseInt(editLevel) &&
      originalCard.current_cost === editCost &&
      originalCard.current_hourly_earnings === editPph
    ) {
      setNoChangesError(t("no_changes_error"));
      setTimeout(() => {
        setNoChangesError("");
      }, 3500);
      return;
    }

    setEditingCard(true);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://api.hamsterkombattool.site/api/user-cards/${cardToEdit}`,
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
      setSuccess(t("card_edit_success"));
      setError("");
      setSearchTerm("");
    } catch (error) {
      setEditError(t("card_edit_error"));
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

  const openDeleteModal = (cardId, e) => {
    e.stopPropagation();
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
        `https://api.hamsterkombattool.site/api/user-cards/${cardToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCards((prevCards) =>
        prevCards.filter((card) => card.id !== cardToDelete)
      );
      setSuccess(t("card_delete_success"));
      setError("");
      setSearchTerm("");
    } catch (error) {
      setError(t("card_delete_error"));
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
    if (number < 1000) {
      return number.toString();
    }
    const suffixes = ["", "K", "M", "B", "T"];
    const suffixNum = Math.floor(Math.log10(number) / 3);
    const shortValue = (number / Math.pow(1000, suffixNum)).toFixed(2);
    return shortValue.replace(/\.00$/, "") + suffixes[suffixNum];
  };

  // Güncellenmiş fonksiyon: Ratio için özel formatlama
  const formatRatio = (ratio) => {
    if (ratio < 1000) {
      return ratio.toFixed(1).replace(/\.0$/, "");
    }
    const suffixes = ["", "K", "M", "B", "T"];
    const suffixNum = Math.floor(Math.log10(ratio) / 3);
    const shortValue = (ratio / Math.pow(1000, suffixNum)).toFixed(1);
    return shortValue.replace(/\.0$/, "") + suffixes[suffixNum];
  };

  const formatNumberWithCommas = (value) => {
    return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US").format(
      value
    );
  };

  const handleCostChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setCurrentCost(rawValue);
    setFormattedCurrentCost(rawValue ? formatNumberWithCommas(rawValue) : "");
  };

  const handleHourlyEarningsChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setCurrentHourlyEarnings(rawValue);
    setFormattedCurrentHourlyEarnings(
      rawValue ? formatNumberWithCommas(rawValue) : ""
    );
  };

  const calculateRatio = (cost, pph) => {
    return pph !== 0 ? (cost / pph).toFixed(2) : "N/A";
  };

  const calculateRatioColor = (ratio, ratios) => {
    const sortedRatios = [...ratios].sort((a, b) => a - b);
    const lowerThreshold = sortedRatios[Math.floor(sortedRatios.length * 0.2)];
    const upperThreshold = sortedRatios[Math.floor(sortedRatios.length * 0.7)];

    if (ratio <= lowerThreshold) {
      return { color: "var(--ratio-green)", showArrow: true };
    } else if (ratio >= upperThreshold) {
      return { color: "var(--ratio-red)", showArrow: false };
    } else {
      return { color: "var(--ratio-orange)", showArrow: false };
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

  const noResultsMessage =
    language === "en"
      ? `No results found for "${searchTerm}".`
      : `"${searchTerm}" için sonuç bulunamadı.`;

  const availableCards = cards.filter(
    (card) => !userCards.some((userCard) => userCard.id === card.id)
  );

  const allImagesLoaded = useMemo(() => {
    return filteredCards.every((card) => imagesLoaded[card.id]);
  }, [filteredCards, imagesLoaded]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleScroll = () => {
    if (window.scrollY > 1000) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (isDropdownOpen && !event.target.closest(".right-buttons")) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className={`loading-screen ${isDarkMode ? "dark" : ""}`}>
        <img src={hamsterImage} alt="Loading" className="loading-image" />
        <div className="loader"></div>
        <h3 className="loader-text">{t("loading")}</h3>
      </div>
    );
  }

  return (
    <div
      className={`dashboard ${isDarkMode ? "dark" : ""} ${
        isDeleteModalOpen ||
        isLogoutModalOpen ||
        isEditModalOpen ||
        isAddCardModalOpen ||
        isGamesModalOpen
          ? "blur"
          : ""
      }`}
    >
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <img src={hamsterLogo} alt="Logo" className="dashboard-logo" />
          <h2 className="dashboard-title">Hamster Kombat Tool</h2>
        </div>
        <div className="right-buttons">
          <button
            onClick={openGamesModal}
            className="games-button"
            title={t("games")}
          >
            <FaGamepad />
          </button>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="settings-button"
            title={t("settings")}
          >
            <FaCog />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <p>
                {t("welcome_message")},{" "}
                <span className="username">{username}</span>
              </p>
              <div className="dropdown-item language-switch">
                <span>{t("language_selector")}</span>
                <label className="switch language-switch">
                  <input
                    type="checkbox"
                    checked={language === "tr"}
                    onChange={() =>
                      handleLanguageChange(language === "en" ? "tr" : "en")
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="dropdown-item theme-switch">
                <span>{t("theme_selector")}</span>
                <label className="switch theme-switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <button className="logout-button" onClick={openLogoutModal}>
                <FaSignOutAlt />
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="add-card">{t("add_card")}</h3>
      <div className="form-container">
        <form onSubmit={handleAddCardToUser}>
          <select
            required
            value={selectedCard}
            onChange={(e) => {
              setSelectedCard(e.target.value);
              setShowCostInput(false); // Kart seçildiğinde cost ve pph inputlarını gizle
              setShowPphInput(false); // Kart seçildiğinde cost ve pph inputlarını gizle
            }}
          >
            <option value="">{t("select_card")}</option>
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
            max="999"
            inputMode="numeric"
            placeholder={t("current_card_level")}
            value={level}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length < 4) {
                setLevel(value);
              }
            }}
          />
          {showCostInput && (
            <input
              required
              type="text"
              maxLength="17"
              placeholder={t("cost_to_next_level")}
              inputMode="numeric"
              value={formattedCurrentCost}
              onChange={handleCostChange}
            />
          )}
          {showPphInput && (
            <input
              required
              type="text"
              maxLength="13"
              placeholder={t("pph_on_next_level")}
              inputMode="numeric"
              value={formattedCurrentHourlyEarnings}
              onChange={handleHourlyEarningsChange}
            />
          )}
          <button
            className="add-card-button"
            type="submit"
            disabled={addingCard}
          >
            {addingCard ? <FaSpinner className="button-spinner" /> : <FaPlus />}
            {addingCard ? t("adding_card") : t("add_card")}
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
      <h3 className="your-cards">{t("your_cards")}</h3>
      <div className="search-and-sort-container">
        <div className="search-container">
          <input
            type="text"
            placeholder={t("search_cards")}
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
            <option value="" disabled hidden>
              {t("sort_placeholder")}
            </option>
            <option value="ratio">{t("sort_by_ratio")}</option>
            <option value="level">{t("sort_by_level")}</option>
            <option value="cost">{t("sort_by_cost")}</option>
            <option value="pph">{t("sort_by_pph")}</option>
            <option value="name">{t("sort_by_name")}</option>
          </select>
        </div>
      </div>

      {cardsLoading || !allImagesLoaded ? (
        <div className="loading-cards">
          <div className="spinner"></div>
          <div className="loading-text">{t("loading_cards")}</div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="no-results-message">
          <p>{noResultsMessage}</p>
        </div>
      ) : (
        coinIconLoaded && (
          <div className="cards-container">
            {filteredCards.map((userCard) => {
              const cost = parseFloat(userCard.current_cost);
              const pph = parseFloat(userCard.current_hourly_earnings);
              const ratio = cost / pph;
              const ratioColor = calculateRatioColor(
                ratio,
                filteredCards.map(
                  (card) =>
                    parseFloat(card.current_cost) /
                    parseFloat(card.current_hourly_earnings)
                )
              );

              return (
                <div
                  className={`card ${isDarkMode ? "dark" : ""}`}
                  key={userCard.id}
                  onClick={() => openEditModal(userCard)}
                >
                  {userCard.has_timer && (
                    <FaClock
                      className="timer-icon"
                      title={t("cooldown_text")}
                    />
                  )}
                  {!userCard.is_default && (
                    <FaTimes
                      className="user-delete-button"
                      title={t("delete_card")}
                      onClick={(e) => openDeleteModal(userCard.id, e)}
                    />
                  )}
                  <div className="card-header">
                    {userCard.image_url && (
                      <img
                        src={userCard.image_url}
                        alt={userCard.name}
                        className="card-image"
                        onLoad={() => handleImageLoad(userCard.id)}
                        onError={() => handleImageLoad(userCard.id)}
                      />
                    )}
                    <div className="card-title">
                      <h3>{userCard.name}</h3>
                      <p>{userCard.card_category}</p>
                    </div>
                  </div>
                  <div className="card-stats">
                    <div className="stat">
                      <div className="stat-value">
                        {userCard.ratioColor.showArrow && (
                          <FaArrowUp className="upgrade-arrow" />
                        )}
                        {userCard.level}
                      </div>
                      <div className="stat-label">{t("level")}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">
                        <img src={coinIcon} alt="Coin" className="coin-icon" />
                        {formatNumber(cost)}
                      </div>
                      <div className="stat-label">{t("cost")}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">
                        <img src={coinIcon} alt="Coin" className="coin-icon" />
                        {formatNumber(pph)}
                      </div>
                      <div className="stat-label">{t("pph")}</div>
                    </div>
                    <div className="stat">
                      <div
                        className="stat-value"
                        style={{ color: ratioColor.color }}
                      >
                        {formatRatio(ratio)}
                      </div>
                      <div className="stat-label">{t("ratio")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      <UserEditCardModal
        language={language}
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
        t={t}
      />
      <UserDeleteModal
        isDeleteModalOpen={isDeleteModalOpen}
        closeDeleteModal={closeDeleteModal}
        isDarkMode={isDarkMode}
        cardToDelete={cardToDelete}
        userCards={userCards}
        handleDeleteCard={handleDeleteCard}
        deletingCard={deletingCard}
        t={t}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onRequestClose={closeLogoutModal}
        handleLogout={handleLogout}
        loggingOut={loggingOut}
        isDarkMode={isDarkMode}
        t={t}
      />

      <GamesModal
        isOpen={isGamesModalOpen}
        onRequestClose={() => setIsGamesModalOpen(false)}
        gameData={gameData}
        isDarkMode={isDarkMode}
        t={t}
      />

      {isAdmin && (
        <>
          <AdminPanel
            allCards={allCards}
            openEditCardModal={openEditCardModal}
            handleAdminDeleteCard={handleAdminDeleteCard}
            setIsAddCardModalOpen={setIsAddCardModalOpen}
            t={t}
          />

          <AddCardModal
            isOpen={isAddCardModalOpen}
            onRequestClose={() => setIsAddCardModalOpen(false)}
            newCard={newCard}
            handleAdminInputChange={handleAdminInputChange}
            handleAdminAddCard={handleAdminAddCard}
            isDarkMode={isDarkMode}
            t={t}
          />

          <AdminEditCardModal
            isEditCardModalOpen={isEditCardModalOpen}
            setIsEditCardModalOpen={setIsEditCardModalOpen}
            isDarkMode={isDarkMode}
            editingCard={editingCard}
            handleAdminEditCard={handleAdminEditCard}
            handleEditCardInputChange={handleEditCardInputChange}
            t={t}
          />

          <AdminDeleteModal
            isOpen={isAdminDeleteModalOpen}
            onRequestClose={() => setIsAdminDeleteModalOpen(false)}
            cardToAdminDelete={cardToAdminDelete}
            confirmAdminDeleteCard={confirmAdminDeleteCard}
            isDarkMode={isDarkMode}
            t={t}
          />
        </>
      )}
      <footer className="footer">
        <p>&copy; 2024 Hamster Kombat Tool</p>
      </footer>
      <button
        className={`scroll-to-top ${showScrollToTop ? "show" : ""}`}
        onClick={scrollToTop}
      >
        <FaArrowUp />
      </button>
    </div>
  );
}

export default Dashboard;
