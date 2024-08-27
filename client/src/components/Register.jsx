import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./assets/Register.module.css";
import { useNavigate, Link } from "react-router-dom";
import zxcvbn from "zxcvbn";
import {
  FaSun,
  FaMoon,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from "react-icons/fa";
import { useTheme } from "./ThemeContext";
import LanguageSelector from "./LanguageSelector";
import logoImage from "./assets/img/Logo.webp";

import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const usernameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+$/;

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();
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
    document.title = "Register | Hamster Kombat Tool";

    const content = document.querySelector(`.${styles.content}`);
    content.style.opacity = "0";
    content.style.transform = "translateY(20px)";

    setTimeout(() => {
      content.style.transition = "opacity 1s ease, transform 2s ease";
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    }, 100);
  }, []);

  useEffect(() => {
    if (error) {
      setErrorVisible(true);
      const timer = setTimeout(() => {
        setErrorVisible(false);
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const clearInputs = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setPasswordStrength(0);
  };

  const validateInputs = () => {
    if (!usernameRegex.test(username)) {
      setError(t("reigster_username_error"));
      return false;
    }
    if (username.length < 3 || username.length > 12) {
      setError(t("register_username_length_error"));
      return false;
    }
    if (password.length < 6 || password.length > 18) {
      setError(t("register_password_length_error"));
      return false;
    }
    if (email.length > 100) {
      setError(t("register_email_length_error"));
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    if (passwordStrength < 2) {
      setError(t("register_password_weak_error"));
      setLoading(false);
      setPassword("");
      return;
    }

    if (!validateEmail(email)) {
      setError(t("register_invalid_email_error"));
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/register",
        { username, password, email }
      );
      setSuccess(t("registration_success"));
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || t("registration_error"));
      clearInputs();
      console.error("Registration error", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const evaluation = zxcvbn(newPassword);
    setPasswordStrength(evaluation.score);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "red";
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

  const handleUsernameChange = (e) => {
    const newValue = e.target.value.toLowerCase();
    if (usernameRegex.test(newValue) || newValue === "") {
      setUsername(newValue);
    }
  };

  return (
    <div className={`${styles["login-page"]} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.navbar}>
        <Link to="/" className={styles["logo-container"]}>
          <img src={logoImage} alt="Logo" className={styles.logo} />
          <span className={styles["logo-text"]}>Hamster Kombat Tool</span>
        </Link>
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
        <div className={styles["login-container"]}>
          <h2>{t("register")}</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder={t("username")}
              minLength="3"
              maxLength="12"
              value={username}
              onChange={handleUsernameChange}
              required
            />

            <input
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) {
                  setError("");
                }
              }}
              onSubmit={() => {
                if (!validateEmail(email)) {
                  setError(t("invalid_email_format"));
                }
              }}
              required
            />
            <div className={styles["password-input-container"]}>
              <input
                type={showPassword ? "text" : "password"}
                minLength="6"
                maxLength="18"
                placeholder={t("password")}
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles["toggle-password"]}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className={styles["password-strength"]}>
              <div
                className={styles["password-strength-bar"]}
                style={{
                  width: `${(passwordStrength + 1) * 20}%`,
                  backgroundColor: getPasswordStrengthColor(),
                }}
              ></div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={styles["register-button"]}
            >
              {!loading && <FaUserPlus className={styles["register-icon"]} />}
              {loading ? <div className={styles.spinner}></div> : t("register")}
            </button>
            <Link to="/login" className={styles["register-text"]}>
              {t("already_have_account")}
            </Link>
            {error && (
              <p
                className={`${styles["error-message"]} ${
                  errorVisible ? styles.visible : ""
                }`}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                className={`${styles["success-message"]} ${
                  success ? styles.visible : ""
                }`}
              >
                {success}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
