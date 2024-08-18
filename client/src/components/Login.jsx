import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
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

const usernameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+$/;

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

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
      setError(
        "Username can only contain letters, numbers, and Turkish characters"
      );
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
      setError("Invalid username or password");
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
          <button onClick={toggleTheme} className={styles["theme-toggle"]}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => navigate("/register")}
            className={styles["link-button"]}
          >
            <FaUserPlus className={styles["register-icon"]} />
            Register
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles["login-container"]}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
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
                placeholder="Password"
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
              {loading ? <div className={styles.spinner}></div> : "Login"}
            </button>
            <Link to="/register" className={styles["register-text"]}>
              Don't have an account?
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
