import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/auth/login",
        {
          email,
          password
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else if (response.data.user.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">
          <div className="brand-icon">◖</div>

          <div>
            <h1>Olive Health</h1>
            <p>APPOINTMENT & FOLLOW-UP MANAGER</p>
          </div>
        </div>

        <div className="auth-hero">
          <span className="hero-label">SMART HEALTHCARE MANAGEMENT</span>

          <h2>
            Your health,
            <br />
            <span>better organized.</span>
          </h2>

          <p>
            Book appointments, manage consultations and keep your healthcare
            journey simple in one place.
          </p>

          <div className="hero-features">
            <div>
              <span>✓</span>
              Easy appointment booking
            </div>

            <div>
              <span>✓</span>
              AI-powered visit summaries
            </div>

            <div>
              <span>✓</span>
              Smart follow-up management
            </div>
          </div>
        </div>

        <div className="auth-footer-text">
          © 2026 Olive Health
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-top-tag">PATIENT • DOCTOR • ADMIN</div>

          <h2>Welcome back</h2>

          <p className="auth-subtitle">
            Sign in to continue managing your healthcare.
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In →
            </button>
          </form>

          <div className="auth-divider">
            <span></span>
            <p>NEW TO OLIVE HEALTH?</p>
            <span></span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;