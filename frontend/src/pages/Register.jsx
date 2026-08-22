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
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;