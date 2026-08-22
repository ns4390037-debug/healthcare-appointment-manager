import { useEffect, useState } from "react";
import axios from "axios";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const response = await axios.get(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/doctor/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Doctor Appointments:", response.data);

      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error(
        "Failed to fetch doctor appointments:",
        error.response?.data || error.message
      );
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/${id}`,
        {
          status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Appointment updated successfully!");

      fetchDoctorAppointments();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update appointment"
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Doctor Dashboard</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section>
        <h2>My Appointments</h2>

        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="card-grid">
            {appointments.map((appointment) => (
              <div
                className="appointment-card"
                key={appointment._id}
              >
                <h3>
                  Patient: {appointment.patient?.name}
                </h3>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    appointment.appointmentDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {appointment.timeSlot}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.reason}
                </p>

                {appointment.symptoms && (
                  <p>
                    <strong>Symptoms:</strong>{" "}
                    {appointment.symptoms}
                  </p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  {appointment.status}
                </p>

                {appointment.status === "booked" && (
                  <div className="appointment-actions">
                    <button
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment._id,
                          "confirmed"
                        )
                      }
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment._id,
                          "cancelled"
                        )
                      }
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === "confirmed" && (
                  <button
                    onClick={() =>
                      updateAppointmentStatus(
                        appointment._id,
                        "completed"
                      )
                    }
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorDashboard;