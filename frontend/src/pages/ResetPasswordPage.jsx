import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig"; // Import the configured API instance
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  // If no token is present, redirect or show an error
  useEffect(() => {
    if (!token) {
      setError("Invalid password reset link. No token provided.");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    try {
      // Use the configured API instance instead of direct axios import
      const response = await api.post("/auth/reset-password", { token, password });
      setMessage(response.data.message + " You can now login with your new password.");
      // Optionally redirect to login page after a delay
      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="reset-password-container" style={{ maxWidth: "400px", margin: "auto", paddingTop: "50px" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button 
          type="submit" 
          style={{ 
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }} 
          disabled={!token}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;