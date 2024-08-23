export const validateInput = (currentCost, currentHourlyEarnings, level, setError) => {
  if (!/^\d+$/.test(currentCost) || currentCost.length > 13) {
    setError("Current Cost must be a valid number and 13 characters or less.");
    return false;
  }
  if (!/^\d+$/.test(currentHourlyEarnings) || currentHourlyEarnings.length > 10) {
    setError("Current Hourly Earnings must be a valid number and 10 characters or less.");
    return false;
  }
  if (!/^\d+$/.test(level) || level.length > 4 || parseInt(level) > 1000) {
    setError("Level must be a valid number, no more than 1000.");
    return false;
  }
  return true;
};

export const validateEditInput = (editCost, editPph, editLevel, setEditError) => {
  if (!/^\d+$/.test(editCost) || editCost.length > 13) {
    setEditError("Cost must be a valid number and 13 characters or less.");
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  if (!/^\d+$/.test(editPph) || editPph.length > 10) {
    setEditError("PPH must be a valid number and 10 characters or less.");
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  if (!/^\d+$/.test(editLevel) || editLevel.length > 4 || parseInt(editLevel) > 1000) {
    setEditError("Level must be a valid number, no more than 1000.");
    setTimeout(() => {
      setEditError("");
    }, 3500);
    return false;
  }
  return true;
};