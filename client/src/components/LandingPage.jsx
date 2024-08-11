import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/LandingPage.css';
import hamsterImage from './assets/img/Hamster.webp';
import logoImage from './assets/img/Logo.png'; // logonuzun yolu

function LandingPage() {
  const navigate = useNavigate();
  document.title = "Hamster Kombat Tool";

  return (
    <div className="landing-page">
      {/* Logo */}
      <img src={logoImage} alt="Logo" className="logo" />

      <div className="content">
        {/* Resim */}
        <div className="image-container">
          <img src={hamsterImage} alt="Hamster" />
        </div>

        {/* Başlık ve Açıklama */}
        <div className="text-content">
          <h1 className="title">Hamster Kombat Tool</h1>
          <p className="description">The ultimate tool for Hamster Kombat enthusiasts. Join now and start your journey!</p>
        </div>
      </div>

      {/* Login ve Register Butonları */}
      <div className="header-links">
        <button onClick={() => navigate('/login')} className="link-button">Login</button>
        <button onClick={() => navigate('/register')} className="link-button">Register</button>
      </div>
    </div>
  );
}

export default LandingPage;
