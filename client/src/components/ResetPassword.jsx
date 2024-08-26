import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./assets/ResetPassword.module.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      setError("Geçersiz veya eksik token");
    } else {
      localStorage.removeItem("userToken");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    setError("");

    const token = new URLSearchParams(location.search).get("token");

    try {
      await axios.post(
        "https://hamster-kombat-tool-server.vercel.app/api/reset-password",
        {
          token,
          newPassword,
        }
      );
      setSuccess("Şifreniz başarıyla değiştirildi. Yönlendiriliyorsunuz...");
      // Token zaten sıfırlandığı için bu satırı kaldırıyoruz
      // localStorage.removeItem("userToken");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setError("Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <h2>Yeni Şifre Belirle</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Yeni Şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifreyi Onayla"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "İşleniyor..." : "Şifreyi Sıfırla"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
