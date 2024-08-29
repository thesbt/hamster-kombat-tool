import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import styles from "./assets/LandingPage.module.css";
import hamsterImage from "./assets/img/Hamster.webp";
import logoImage from "./assets/img/Logo.webp";
import { FaSun, FaMoon, FaSignInAlt, FaTelegramPlane } from "react-icons/fa";
import LanguageSelector from "./LanguageSelector";

import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [language, setLanguage] = useState("en");
  const t = useCallback(
    (key) => translations[language][key] || key,
    [language]
  );

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

  useEffect(() => {
    document.title = "Hamster Kombat Tool";

    const content = document.querySelector(`.${styles.content}`);
    content.style.opacity = "0";

    content.style.transform = "translateY(20px)";

    setTimeout(() => {
      content.style.transition = "opacity 1s ease, transform 2s ease";

      content.style.opacity = "1";

      content.style.transform = "translateY(0)";
    }, 100);
  }, []);

  return (
    <div
      className={`${styles["landing-page"]} ${isDarkMode ? styles.dark : ""}`}
    >
      <div className={styles.navbar}>
        <img src={logoImage} alt="Logo" className={styles.logo} />

        <div className={styles["header-links"]}>
          <LanguageSelector
            currentLanguage={language}
            onChangeLanguage={handleLanguageChange}
          />

          <button onClick={toggleTheme} className={styles["theme-toggle"]}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={() => navigate("/login")}
            className={styles["link-button"]}
          >
            <FaSignInAlt className={styles["login-icon"]} />

            {t("login")}
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles["image-container"]}>
          <img
            src={hamsterImage}
            alt="Hamster"
            className={styles["main-image"]}
          />
        </div>

        <div className={styles["text-content"]}>
          {language === "en" && (
            <h1 className={styles.welcome}>{t("welcome_to")}</h1>
          )}
          <h1 className={styles.title}>{t("title")}</h1>
          {language === "tr" && (
            <h1 className={styles.welcome}>{t("welcome_to")}</h1>
          )}
          <p className={styles.description}>{t("description")}</p>
          <p className={styles["cta-text"]}>{t("not_playing_yet")}</p>
          <a href="https://t.me/hamster_kombat_bOt/start?startapp=kentId5725201051" target="_blank" rel="noreferrer" className={styles["cta-button"]}>
            <FaTelegramPlane className={styles["telegram-icon"]} />
            <span>{t("start_playing")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
