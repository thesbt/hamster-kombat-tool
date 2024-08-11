import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './assets/Register.css';
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hamster Kombat Tool | Register";
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (passwordStrength < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }
  
    try {
      await axios.post('http://localhost:3000/api/register', { username, password, email });
      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const evaluation = zxcvbn(newPassword);
    setPasswordStrength(evaluation.score);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'red';
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'yellow';
      case 4: return 'green';
      default: return 'red';
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Average';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return 'Very Weak';
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <button 
            type="button" 
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="password-strength">
          <div
            className="password-strength-bar"
            style={{ width: `${(passwordStrength + 1) * 20}%`, backgroundColor: getPasswordStrengthColor() }}
          ></div>
        </div>
        <p className="password-strength-label">
          Password Strength: <span style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthLabel()}</span>
        </p>
        <button type="submit">Register</button>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Register;
