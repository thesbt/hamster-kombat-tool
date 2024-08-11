import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './assets/LandingPage.module.css';
import hamsterImage from './assets/img/Hamster.webp';
import logoImage from './assets/img/Logo.webp';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Hamster Kombat Tool";
    
    // Sayfa yüklendiğinde animasyon efekti
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
    <>
      <div className={styles.navbar}>
        <img src={logoImage} alt="Logo" className={styles.logo}/>
        <div className={styles['header-links']}>
          <button onClick={() => navigate('/login')} className={styles['link-button']}>Login</button>
          <button onClick={() => navigate('/register')} className={styles['link-button']}>Register</button>
        </div>
      </div>
      <div className={styles['landing-page']}>
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
    </>
  );
}

export default App;