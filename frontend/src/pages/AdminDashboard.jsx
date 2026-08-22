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
        "https://healthcare-appointment-manager-backend-057.onrender.com/api/admin/dashboard",
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
    return <h2>Loading Admin Dashboard...</h2>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <h2>System Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p>{stats.totalPatients}</p>
        </div>

        <div className="stat-card">
          <h3>Total Doctors</h3>
          <p>{stats.totalDoctors}</p>
        </div>

        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p>{stats.totalAppointments}</p>
        </div>
      </div>

      <h2>Appointment Status</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Booked</h3>
          <p>{stats.appointmentStatus?.booked || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Confirmed</h3>
          <p>{stats.appointmentStatus?.confirmed || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>{stats.appointmentStatus?.completed || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Cancelled</h3>
          <p>{stats.appointmentStatus?.cancelled || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;