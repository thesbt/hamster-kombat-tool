import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import LanguageSelector from "./LanguageSelector"; // LanguageSelector import edildi
import styles from "./assets/Login.module.css";
import logoImage from "./assets/img/Logo.webp";

import {
  FaSun,
  FaMoon,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from "react-icons/fa";

import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

const usernameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+$/;

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false); // Yeni eklenen state
  const [resetSuccess, setResetSuccess] = useState(""); // Yeni eklenen state
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetSuccess("");

    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/forgot-password",
        { email }
      );
      setResetSuccess(t("reset_email_sent"));
      setIsResetMode(false);
    } catch (error) {
      setError(t("reset_email_error"));
    } finally {
      setLoading(false);
    }
  };

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
    document.title = "Login | Hamster Kombat Tool";

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

  const handleUsernameChange = (e) => {
    const newValue = e.target.value.toLowerCase();
    if (usernameRegex.test(newValue) || newValue === "") {
      setUsername(newValue);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!usernameRegex.test(username)) {
      setError(t("username_error"));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/login",
        { username: username.toLowerCase(), password }
      );
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      setError(t("login_error"));
      setErrorVisible(true);
      setPassword("");
      console.error("Login error", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            onClick={() => navigate("/register")}
            className={styles["link-button"]}
          >
            <FaUserPlus className={styles["register-icon"]} />
            {t("register")}
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles["login-container"]}>
          <h2>{isResetMode ? t("reset_password") : t("login")}</h2>
          {!isResetMode ? (
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder={t("username")}
                minLength="3"
                maxLength="12"
                value={username}
                onChange={handleUsernameChange}
                required
              />
              <div className={styles["password-input-container"]}>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength="6"
                  maxLength="18"
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <button
                type="submit"
                disabled={loading}
                className={styles["login-button"]}
              >
                {!loading && <FaSignInAlt className={styles["login-icon"]} />}
                {loading ? <div className={styles.spinner}></div> : t("login")}
              </button>
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className={styles["forgot-password"]}
              >
                {t("forgot_password")}
              </button>
              <Link to="/register" className={styles["register-text"]}>
                {t("no_account")}
              </Link>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={styles["login-button"]}
              >
                {loading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  t("send_reset_email")
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className={styles["back-to-login"]}
              >
                {t("back_to_login")}
              </button>
            </form>
          )}
          {error && (
            <p
              className={`${styles["error-message"]} ${
                errorVisible ? styles.visible : ""
              }`}
            >
              {error}
            </p>
          )}
          {resetSuccess && (
            <p className={styles["success-message"]}>{resetSuccess}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
