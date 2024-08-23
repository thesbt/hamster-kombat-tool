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
  language
) => {
  if (!/^\d+$/.test(currentCost) || currentCost.length > 13) {
    setError(getErrorMessage("current_cost_validate_error", language));
    return false;
  }
  if (
    !/^\d+$/.test(currentHourlyEarnings) ||
    currentHourlyEarnings.length > 10
  ) {
    setError(getErrorMessage("current_pph_validate_error", language));
    return false;
  }
  if (!/^\d+$/.test(level) || level.length > 4 || parseInt(level) > 1000) {
    setError(getErrorMessage("current_level_validate_error", language));
    return false;
  }
  return true;
};

export const validateEditInput = (
  editCost,
  editPph,
  editLevel,
  setEditError,
  language
) => {
  if (!/^\d+$/.test(editCost) || editCost.length > 13) {
    setEditError(getErrorMessage("current_cost_validate_error", language));
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  if (!/^\d+$/.test(editPph) || editPph.length > 10) {
    setEditError(getErrorMessage("current_pph_validate_error", language));
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  if (
    !/^\d+$/.test(editLevel) ||
    editLevel.length > 4 ||
    parseInt(editLevel) > 1000
  ) {
    setEditError(getErrorMessage("current_level_validate_error", language));
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  return true;
};
