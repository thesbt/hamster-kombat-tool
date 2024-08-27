import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import LanguageSelector from "./LanguageSelector";
import styles from "./assets/ResetPassword.module.css";
import logoImage from "./assets/img/Logo.webp";
import { FaKey, FaSun, FaMoon, FaEye, FaEyeSlash } from "react-icons/fa";

import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

function ResetPassword({ setIsAuthenticated }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

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
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      setError(t("invalid_or_missing_token"));
      setErrorVisible(true);
    } else {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  }, [location, setIsAuthenticated, t]);

  useEffect(() => {
    if (error || success) {
      const isError = !!error;
      const setVisibility = isError ? setErrorVisible : setSuccessVisible;
      const clearMessage = isError ? setError : setSuccess;

      setVisibility(true);
      const timer = setTimeout(() => {
        setVisibility(false);
        clearMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      setErrorVisible(true);
      return;
    }
    setLoading(true);
    setError("");

    const token = new URLSearchParams(location.search).get("token");

    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/reset-password",
        {
          token,
          newPassword,
        }
      );
      setSuccess(t("password_reset_success"));
      setSuccessVisible(true);
      setTimeout(() => {
        setIsAuthenticated(false);
        navigate("/login");
      }, 3000);
    } catch (error) {
      setError(t("password_reset_failed"));
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      className={`${styles.resetPasswordPage} ${isDarkMode ? styles.dark : ""}`}
    >
      <div className={styles.navbar}>
        <Link to="/" className={styles.logoContainer}>
          <img src={logoImage} alt="Logo" className={styles.logo} />
          <span className={styles.logoText}>Hamster Kombat Tool</span>
        </Link>
        <div className={styles.headerLinks}>
          <LanguageSelector
            currentLanguage={language}
            onChangeLanguage={handleLanguageChange}
          />
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.resetPasswordContainer}>
          <h2>{t("reset_password")}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.passwordInputContainer}>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder={t("new_password")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                className={styles.togglePassword}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className={styles.passwordInputContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className={styles.togglePassword}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={styles.resetButton}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  <FaKey /> {t("reset_password_button")}
                </>
              )}
            </button>
          </form>
          {error && (
            <p
              className={`${styles.error} ${
                errorVisible ? styles.visible : ""
              }`}
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className={`${styles.success} ${
                successVisible ? styles.visible : ""
              }`}
            >
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
