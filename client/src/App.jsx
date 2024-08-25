import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import "./App.css";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document.getElementById("root").classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <Router>
      <div className={`App ${isDarkMode ? "dark" : ""}`}>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
