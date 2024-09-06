import enTranslations from "../locales/en/translation.json";
import trTranslations from "../locales/tr/translation.json";

const translations = {
  en: enTranslations,
  tr: trTranslations,
};

const getErrorMessage = (key, language) => translations[language][key] || key;

export const validateInput = (
  currentCost,
  currentHourlyEarnings,
  level,
  setError,
  language,
  isCostPphVisible // Yeni parametre
) => {
  if (!/^\d+$/.test(level) || level.length > 3 || parseInt(level) > 999) {
    setError(getErrorMessage("current_level_validate_error", language));
    return false;
  }

  // Eğer cost ve pph alanları readonly ise, bu alanları kontrol etme
  if (isCostPphVisible) {
    return true; // Validation geçerli
  }

  if (!/^\d+$/.test(currentCost) || currentCost.length > 20) {
    setError(getErrorMessage("current_cost_validate_error", language));
    return false;
  }
  if (
    !/^\d+$/.test(currentHourlyEarnings) ||
    currentHourlyEarnings.length > 13
  ) {
    setError(getErrorMessage("current_pph_validate_error", language));
    return false;
  }

  return true;
};

export const validateEditInput = (
  editCost,
  editPph,
  editLevel,
  setEditError,
  language,
  isCostPphVisible // Yeni parametre
) => {
  if (
    !/^\d+$/.test(editLevel) ||
    editLevel.length > 3 ||
    parseInt(editLevel) > 9999
  ) {
    setEditError(getErrorMessage("current_level_validate_error", language));
    return false;
  }

  // Eğer cost ve pph alanları readonly ise, bu alanları kontrol etme
  if (isCostPphVisible) {
    return true; // Validation geçerli
  }

  if (!/^\d+$/.test(editCost) || editCost.length > 20) {
    setEditError(getErrorMessage("current_cost_validate_error", language));
    return false;
  }
  if (!/^\d+$/.test(editPph) || editPph.length > 10) {
    setEditError(getErrorMessage("current_pph_validate_error", language));
    return false;
  }

  return true;
};
