import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/auth/register",
        formData
      );

      alert("Registration successful! Please login.");
      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">◖</div>

          <div>
            <h1>Healthcare Manager</h1>
            <p>APPOINTMENT & FOLLOW-UP MANAGER</p>
          </div>
        </div>

        <div className="auth-hero">
          <span className="hero-label">START YOUR HEALTHCARE JOURNEY</span>

          <h2>
            Healthcare,
            <br />
            <span>made simpler.</span>
          </h2>

          <p>
            Create your account and get access to smarter appointments,
            reminders and healthcare management.
          </p>

          <div className="hero-features">
            <div>
              <span>✓</span>
              Find and book doctors easily
            </div>

            <div>
              <span>✓</span>
              Manage your appointments
            </div>

            <div>
              <span>✓</span>
              Get smart healthcare insights
            </div>
          </div>
        </div>

        <div className="auth-footer-text">
          © 2026 Healthcare Manager
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper register-form">
          <div className="auth-top-tag">CREATE YOUR ACCOUNT</div>

          <h2>Join Healthcare Manager</h2>

          <p className="auth-subtitle">
            Set up your account and start managing your healthcare smarter.
          </p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Create Account →
            </button>
          </form>

          <div className="auth-divider">
            <span></span>
            <p>ALREADY HAVE AN ACCOUNT?</p>
            <span></span>
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;