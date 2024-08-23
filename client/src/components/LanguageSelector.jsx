import React from "react";
import ReactCountryFlag from "react-country-flag";

const LanguageSelector = ({ currentLanguage, onChangeLanguage }) => {
  return (
    <div className="language-selector">
      {currentLanguage !== "en" && (
        <button
          className="language-button"
          title="Dil Seçici"
          onClick={() => onChangeLanguage("en")}
        >
          <ReactCountryFlag countryCode="GB" svg />
        </button>
      )}
      {currentLanguage !== "tr" && (
        <button
          className="language-button"
          title="Language Selector"
          onClick={() => onChangeLanguage("tr")}
        >
          <ReactCountryFlag countryCode="TR" svg />
        </button>
      )}
    </div>
  );
};

export default LanguageSelector;
