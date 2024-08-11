import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/LandingPage.module.css';
import hamsterImage from './assets/img/Hamster.webp';
import logoImage from './assets/img/Logo.webp'; // logonuzun yolu

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <img src={logoImage} alt="Logo" className="logo" />
      <div className="header-links">
        <button onClick={() => navigate('/login')} className="link-button">Login</button>
        <button onClick={() => navigate('/register')} className="link-button">Register</button>
      </div>
    </div>
  );
}

function LandingPage() {
  document.title = "Hamster Kombat Tool";

  return (
    <div className="landing-page">
      <div className="content">
        <div className="image-container">
          <img src={hamsterImage} alt="Hamster" className="main-image" />
        </div>
        <div className="text-content">
          <h1 className="title">Hamster Kombat Tool</h1>
          <p className="description">The ultimate tool for Hamster Kombat enthusiasts. Join now and start your journey!</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
}

export default App;
