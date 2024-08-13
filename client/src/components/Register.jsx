import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './assets/Register.module.css';
import { useNavigate, Link } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { FaSun, FaMoon, FaUserPlus, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { useTheme } from './ThemeContext';
import logoImage from './assets/img/Logo.webp';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = "Hamster Kombat Tool | Register";
    
    const content = document.querySelector(`.${styles.content}`);
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      content.style.transition = 'opacity 1s ease, transform 2s ease';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 100);
  }, []);

  useEffect(() => {
    if (error) {
      setErrorVisible(true);
      const timer = setTimeout(() => {
        setErrorVisible(false);
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const clearInputs = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setPasswordStrength(0);
  };

  const validateInputs = () => {
    // Kullanıcı adı için regex: Sadece harf ve sayılara izin verir
    const usernameRegex = /^[a-zA-Z0-9]+$/;
  
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters and numbers');
      return false;
    }
    if (username.length < 3 || username.length > 12) {
      setError('Username must be between 3 and 12 characters');
      return false;
    }
    if (password.length < 6 || password.length > 18) {
      setError('Password must be between 6 and 18 characters');
      return false;
    }
    if (email.length > 255) {
      setError('Email is too long');
      return false;
    }
    return true;
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true); // İşlem başladığında loading'i true yapıyoruz
  
    if (passwordStrength < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      setLoading(false); // Hata durumunda loading'i false yapıyoruz
      setPassword('');
      return;
    }
  
    try {
      await axios.post('https://hamster-kombat-tool-server.vercel.app/api/register', { username, password, email });
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
      clearInputs();
      console.error('Registration error', error);
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
      case 0: return 'red';
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'yellow';
      case 4: return 'green';
      default: return 'white';
    }
  };



  return (
    <div className={`${styles['login-page']} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.navbar}>
        <Link to="/" className={styles['logo-container']}>
          <img src={logoImage} alt="Logo" className={styles.logo}/>
          <span className={styles['logo-text']}>Hamster Kombat Tool</span>
        </Link>
        <div className={styles['header-links']}>
          <button onClick={toggleTheme} className={styles['theme-toggle']}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>          
          <button onClick={() => navigate('/login')} className={styles['link-button']}>
            <FaSignInAlt className={styles['login-icon']} />
            Login
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles['login-container']}>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              minLength="3"
              maxLength="12"
              pattern="^[a-zA-Z0-9]+$"
              title="Username can only contain letters and numbers"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className={styles['password-input-container']}>
              <input
                type={showPassword ? "text" : "password"}
                minLength="6"
                maxLength="18"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className={styles['toggle-password']}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className={styles['password-strength']}>
              <div
                className={styles['password-strength-bar']}
                style={{ width: `${(passwordStrength + 1) * 20}%`, backgroundColor: getPasswordStrengthColor() }}
              ></div>
            </div>            
            <button type="submit" disabled={loading} className={styles['register-button']}>
  {!loading && <FaUserPlus className={styles['register-icon']} />}
  {loading ? <div className={styles.spinner}></div> : 'Register'}
</button>
            <Link to="/login" className={styles['register-text']}>Already have an account?</Link>
            {error && (
              <p className={`${styles['error-message']} ${errorVisible ? styles.visible : ''}`}>
                {error}
              </p>
            )}
{success && (
  <p className={`${styles['success-message']} ${success ? styles.visible : ''}`}>
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
