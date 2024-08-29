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
import zxcvbn from "zxcvbn";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

function ResetPassword({ setIsAuthenticated }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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

  const handleInvalidToken = useCallback(() => {
    setError(t("invalid_or_missing_token"));
    setErrorVisible(true);
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  }, [t, navigate, setError, setErrorVisible]);

  const verifyToken = useCallback(
    async (token) => {
      try {
        const response = await axios.post(
          "https://api.hamsterkombattool.site/api/verify-reset-token",
          { token }
        );
        if (response.data.valid) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        } else {
          handleInvalidToken();
        }
      } catch (error) {
        handleInvalidToken();
      }
    },
    [handleInvalidToken, setIsAuthenticated]
  );

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      handleInvalidToken();
    } else {
      verifyToken(token);
    }
  }, [location, handleInvalidToken, verifyToken]);

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

  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    const evaluation = zxcvbn(newPassword);
    setPasswordStrength(evaluation.score);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "red";
      case 2:
        return "orange";
      case 3:
        return "yellow";
      case 4:
        return "green";
      default:
        return "white";
    }
  };

  const validateInputs = () => {
    if (newPassword.length < 6 || newPassword.length > 18) {
      setError(t("register_password_length_error"));
      setErrorVisible(true);
      return false;
    }
    if (passwordStrength < 2) {
      setError(t("register_password_weak_error"));
      setErrorVisible(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
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
        "https://api.hamsterkombattool.site/api/reset-password",
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                type={showPassword ? "text" : "password"}
                placeholder={t("new_password")}
                value={newPassword}
                onChange={handleNewPasswordChange}
                minLength="6"
                maxLength="18"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.togglePassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
                maxLength="18"
                required
              />
            </div>
            <div className={styles.passwordStrength}>
              <div
                className={styles.passwordStrengthBar}
                style={{
                  width: `${(passwordStrength + 1) * 20}%`,
                  backgroundColor: getPasswordStrengthColor(),
                }}
              ></div>
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
