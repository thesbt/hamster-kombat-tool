import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

function GamesModal({ isOpen, onRequestClose, gameData, isDarkMode, t }) {
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('tr-TR');
  };

  const formatCardName = (cardName) => {
    return cardName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const morseCodeMap = {
    'A': '🟠➖', 'B': '➖🟠🟠🟠', 'C': '➖🟠➖🟠', 'D': '➖🟠🟠', 'E': '🟠', 'F': '🟠🟠➖🟠',
    'G': '➖➖🟠', 'H': '🟠🟠🟠🟠', 'I': '🟠🟠', 'J': '🟠➖➖➖', 'K': '➖🟠➖', 'L': '🟠➖🟠🟠',
    'M': '➖➖', 'N': '➖🟠', 'O': '➖➖➖', 'P': '🟠➖➖🟠', 'Q': '➖➖🟠➖', 'R': '🟠➖🟠',
    'S': '🟠🟠🟠', 'T': '➖', 'U': '🟠🟠➖', 'V': '🟠🟠🟠➖', 'W': '🟠➖➖', 'X': '➖🟠🟠➖',
    'Y': '➖🟠➖➖', 'Z': '➖➖🟠🟠', '0': '➖➖➖➖➖', '1': '🟠➖➖➖➖', '2': '🟠🟠➖➖➖',
    '3': '🟠🟠🟠➖➖', '4': '🟠🟠🟠🟠➖', '5': '🟠🟠🟠🟠🟠', '6': '➖🟠🟠🟠🟠', '7': '➖➖🟠🟠🟠',
    '8': '➖➖➖🟠🟠', '9': '➖➖➖➖🟠'
  };

  const convertToMorse = (text) => {
    return text.toUpperCase().split('').map(char => {
      return morseCodeMap[char] || char;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Oyun Verileri"
      className={`games-modal ${isDarkMode ? 'dark' : ''}`}
      overlayClassName="games-modal-overlay"
    >
        <div className="games-card-container">        
      <button onClick={onRequestClose} className="close-button">
        <FaTimes />
      </button>
      <h2 className="game-data-title">{t("game_data")}</h2>
      {gameData ? (
        <div className="game-data">
          <h3>{t("daily_cards")}</h3>
          <ul>
            {gameData.dailyCards.map((card, index) => (
              <li key={index}>{formatCardName(card)}</li>
            ))}
          </ul>
          <h3>{t("morse_code")}</h3>          
          <div className="morse-code-conversion">
            {convertToMorse(gameData.morseCode).map((morse, index) => (
              <p key={index} className="morse-code-item">
                <span className="morse-letter">{gameData.morseCode[index]}:</span>
                <span className="morse-code">{morse}</span>
              </p>
            ))}
          </div>
          <div className="last-update-container">
          <h3>{t("last_update")}</h3>
          <p>{formatDate(gameData.updated)}</p>
          </div>
        </div>
        
      ) : (
        <div className="loading-container">
          <div className="loader"></div>
          <p>{t("loading_game_data")}</p>
        </div>
      )}
      </div>
    </Modal>
  );
}

export default GamesModal;