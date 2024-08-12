import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import styles from './assets/Login.module.css';
import logoImage from './assets/img/Logo.webp';
import { FaSun, FaMoon } from 'react-icons/fa';

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = "Hamster Kombat Tool | Login";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://hamster-kombat-tool-server.vercel.app/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid username or password');
      console.error('Login error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles['login-page']} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.navbar}>
        <img src={logoImage} alt="Logo" className={styles.logo}/>
        <div className={styles['header-links']}>
          <button onClick={toggleTheme} className={styles['theme-toggle']}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => navigate('/')} className={styles['link-button']}>Home</button>
          <button onClick={() => navigate('/register')} className={styles['link-button']}>Register</button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles['login-container']}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>Login</button>
            {error && <p className={styles['error-message']}>{error}</p>}
          </form>
          {loading && <div className={styles.spinner}></div>}
        </div>
      </div>
    </div>
  );
}

export default Login;