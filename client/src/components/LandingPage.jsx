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
      content.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
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
          <h1 className={styles.title}>Hamster Kombat Tool</h1>
          <p className={styles.description}>Enter the world of strategic hamster battles. Train, compete, and become the ultimate Hamster Kombat master!</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;