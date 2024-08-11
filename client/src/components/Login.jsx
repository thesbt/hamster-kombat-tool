import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './assets/Login.css';

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Hamster Kombat Tool | Login";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://hamster-kombat-tool-server.vercel.app/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid username or password');
      console.error('Login error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      {loading && <div className='spinner'></div>}
    </div>
  );
}

export default Login;
