import React from "react";
import ReactCountryFlag from "react-country-flag";
import styles from "./assets/LandingPage.module.css"; // CSS modülü olarak import

const LanguageSelector = ({ currentLanguage, onChangeLanguage }) => {
  return (
    <div className={styles.languageSelector}>
      {currentLanguage !== "en" && (
        <button
          className={styles.languageButton} // className prop'u doğru şekilde kullanılıyor
          title="Dil Seçici"
          onClick={() => onChangeLanguage("en")}
        >
          <ReactCountryFlag 
            countryCode="GB" 
            svg 
            style={{width: '24px', height: '24px' }} // otomatik gelen stiller kaldırıldı ve inline stil eklendi
          />
        </button>
      )}
      {currentLanguage !== "tr" && (
        <button
          className={styles.languageButton} // className prop'u doğru şekilde kullanılıyor
          title="Language Selector"
          onClick={() => onChangeLanguage("tr")}
        >
          <ReactCountryFlag 
            countryCode="TR" 
            svg 
            style={{width: '24px', height: '24px' }} // otomatik gelen stiller kaldırıldı ve inline stil eklendi
          />
        </button>
      )}
    </div>
  );
};

export default LanguageSelector;
