// components/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/LandingPage.css'; // CSS dosyasını ekle

function LandingPage() {
  const navigate = useNavigate();
  document.title = "Hamster Kombat Tool";

  return (
    <div className="landing-page">
      <div className="content">
        <h1 className="title">Hamster Kombat Tool</h1>
        <p className="description">The ultimate tool for Hamster Kombat enthusiasts. Join now and start your journey!</p>
        <div className="buttons">
          <button onClick={() => navigate('/login')} className="button">Login</button>
          <button onClick={() => navigate('/register')} className="button">Register</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
