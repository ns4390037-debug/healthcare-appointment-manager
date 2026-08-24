import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(response.data);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to load dashboard"
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!stats) {
    return (
      <div className="olive-loading">
        <h2>Loading Healthcare Manager Dashboard...</h2>
      </div>
    );
  }

  const totalStatus =
    (stats.appointmentStatus?.booked || 0) +
    (stats.appointmentStatus?.confirmed || 0) +
    (stats.appointmentStatus?.completed || 0) +
    (stats.appointmentStatus?.cancelled || 0);

  return (
    <div className="olive-dashboard">

      {/* ================= HEADER ================= */}

      <header className="olive-header">

        <div className="olive-brand">
          <div className="olive-logo-circle"></div>
          <div>
            <h1>Healthcare Manager</h1>

            <p>
              APPOINTMENT & FOLLOW-UP MANAGER
            </p>
          </div>
        </div>


        <nav className="role-switcher">
          <span>Patient</span>
          <span>Doctor</span>
          <span className="active-role">Admin</span>
        </nav>


        <div className="header-actions">

          <div className="notification-icon">
            🔔
            <span>3</span>
          </div>

          <div className="calendar-icon">
            🗓️
          </div>

          <div className="profile-circle">
            AD
          </div>

        </div>

      </header>


      {/* ================= NAVIGATION ================= */}

      <div className="olive-navigation">

        <button className="nav-active">
          Dashboard
        </button>

        <button>
          Manage Doctors
        </button>

        <button>
          Manage Patients
        </button>

        <button>
          Appointments
        </button>

        <button>
          System Logs
        </button>

        <button
          className="logout-nav-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {/* ================= WELCOME ================= */}

      <section className="admin-welcome">

        <div>
          <p className="eyebrow">
            SYSTEM CONTROL CENTER
          </p>

          <h2>Good Morning, Admin</h2>

          <p>
            Monitor patients, doctors and appointment activity
            from one centralized dashboard.
          </p>
        </div>


        <button
          className="refresh-btn"
          onClick={fetchDashboard}
        >
          ↻ Refresh Data
        </button>

      </section>


      {/* ================= SYSTEM OVERVIEW ================= */}

      <section className="admin-section">

        <div className="section-heading">

          <div>
            <h2>System Overview</h2>

            <p>
              Real-time overview of your healthcare platform.
            </p>
          </div>

          <span className="section-tag">
            LIVE DATA
          </span>

        </div>


        <div className="overview-grid">

          {/* PATIENTS */}

          <div className="overview-card">

            <div className="overview-top">

              <span>
                Total Patients
              </span>

              <div className="overview-icon">
                👥
              </div>

            </div>

            <h3>
              {stats.totalPatients || 0}
            </h3>

            <p>
              Registered patient accounts
            </p>

          </div>


          {/* DOCTORS */}

          <div className="overview-card">

            <div className="overview-top">

              <span>
                Total Doctors
              </span>

              <div className="overview-icon">
                🩺
              </div>

            </div>

            <h3>
              {stats.totalDoctors || 0}
            </h3>

            <p>
              Active healthcare professionals
            </p>

          </div>


          {/* APPOINTMENTS */}

          <div className="overview-card">

            <div className="overview-top">

              <span>
                Total Appointments
              </span>

              <div className="overview-icon">
                📅
              </div>

            </div>

            <h3>
              {stats.totalAppointments || 0}
            </h3>

            <p>
              Appointments created in the system
            </p>

          </div>

        </div>

      </section>


      {/* ================= APPOINTMENT STATUS ================= */}

      <section className="admin-section appointment-overview">

        <div className="section-heading">

          <div>
            <h2>Appointment Status</h2>

            <p>
              {totalStatus} total appointment records currently tracked.
            </p>
          </div>

          <span className="section-tag">
            STATUS OVERVIEW
          </span>

        </div>


        <div className="status-grid">

          {/* BOOKED */}

          <div className="status-card booked-status">

            <div className="status-label">
              <span className="status-dot"></span>
              Booked
            </div>

            <h3>
              {stats.appointmentStatus?.booked || 0}
            </h3>

            <p>
              Appointments waiting for confirmation
            </p>

          </div>


          {/* CONFIRMED */}

          <div className="status-card confirmed-status">

            <div className="status-label">
              <span className="status-dot"></span>
              Confirmed
            </div>

            <h3>
              {stats.appointmentStatus?.confirmed || 0}
            </h3>

            <p>
              Confirmed upcoming appointments
            </p>

          </div>


          {/* COMPLETED */}

          <div className="status-card completed-status">

            <div className="status-label">
              <span className="status-dot"></span>
              Completed
            </div>

            <h3>
              {stats.appointmentStatus?.completed || 0}
            </h3>

            <p>
              Successfully completed consultations
            </p>

          </div>


          {/* CANCELLED */}

          <div className="status-card cancelled-status">

            <div className="status-label">
              <span className="status-dot"></span>
              Cancelled
            </div>

            <h3>
              {stats.appointmentStatus?.cancelled || 0}
            </h3>

            <p>
              Cancelled appointment records
            </p>

          </div>

        </div>

      </section>


      {/* ================= SYSTEM INSIGHT ================= */}

      <section className="system-insight">

        <div className="insight-header">

          <div className="insight-title">

            <span className="insight-dot"></span>

            <span className="eyebrow">
              PLATFORM INSIGHT
            </span>

          </div>


          <span className="system-status">
            ● System Active
          </span>

        </div>


        <h2>
          Your healthcare platform is running smoothly.
        </h2>


        <p>
          Monitor patient registrations, doctor availability and
          appointment activity in real time from one centralized
          administrative dashboard.
        </p>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="olive-footer">

        <div>
          <strong>
            Healthcare Manager Admin Portal
          </strong>

          <span>
            Appointment & Follow-Up Management System
          </span>
        </div>


        <button onClick={handleLogout}>
          Logout from Admin Panel
        </button>

      </footer>

    </div>
  );
}

export default AdminDashboard;