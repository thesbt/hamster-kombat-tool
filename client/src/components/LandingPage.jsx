import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import styles from './assets/LandingPage.module.css';
import hamsterImage from './assets/img/Hamster.webp';
import logoImage from './assets/img/Logo.webp';
import { FaSun, FaMoon } from 'react-icons/fa';

function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  useEffect(() => {
    document.title = "Hamster Kombat Tool";
    
    const content = document.querySelector(`.${styles.content}`);
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      content.style.transition = 'opacity 1s ease, transform 2s ease';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 100);
  }, []);

  return (
    <div className={`${styles['landing-page']} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.navbar}>
        <img src={logoImage} alt="Logo" className={styles.logo}/>
        <div className={styles['header-links']}>
          <button onClick={toggleTheme} className={styles['theme-toggle']}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => navigate('/login')} className={styles['link-button']}>Login</button>
          <button onClick={() => navigate('/register')} className={styles['link-button']}>Register</button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles['image-container']}>
          <img src={hamsterImage} alt="Hamster" className={styles['main-image']} />
        </div>
        <div className={styles['text-content']}>
        <h1 className={styles.welcome}>Welcome to,</h1>
          <h1 className={styles.title}>Hamster Kombat Tool</h1>
          <p className={styles.description}>Take your Hamster Kombat experience to the next level. Our tool helps you easily track your in-game cards and identify the best cards to upgrade for maximum impact. Stay ahead in the game with smarter choices and faster upgrades!</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;