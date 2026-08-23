import { useEffect, useState } from "react";
import axios from "axios";

function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loadingSummary, setLoadingSummary] = useState("");

  // FETCH ALL DOCTORS
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/doctors"
      );

      console.log("Doctors:", response.data);

      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error(
        "Failed to fetch doctors:",
        error.response?.data || error.message
      );
    }
  };

  // FETCH PATIENT APPOINTMENTS
  const fetchAppointments = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      console.log("=== APPOINTMENT DEBUG ===");
      console.log("Current Token:", currentToken);

      if (!currentToken) {
        console.error("No patient token found");
        setAppointments([]);
        return;
      }

      const response = await axios.get(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/my",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      console.log("Full Appointment Response:", response.data);
      console.log(
        "Appointments:",
        response.data.appointments
      );

      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error.response?.data || error.message
      );

      setAppointments([]);
    }
  };

  // FETCH AVAILABLE TIME SLOTS
  const fetchAvailableSlots = async () => {
    try {
      if (!selectedDoctor || !appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots([]);
      setTimeSlot("");

      const response = await axios.get(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/doctors/${selectedDoctor}/slots?date=${appointmentDate}`
      );

      console.log("Available Slots:", response.data);

      setAvailableSlots(
        response.data.availableSlots || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch slots:",
        error.response?.data || error.message
      );

      setAvailableSlots([]);
    }
  };

  // INITIAL DATA FETCH
  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  // FETCH SLOTS WHEN DOCTOR OR DATE CHANGES
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDate]);

  // BOOK APPOINTMENT
  const bookAppointment = async (e) => {
    e.preventDefault();

    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        alert("Please login again");
        return;
      }

      const response = await axios.post(
        "https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments",
        {
          doctorId: selectedDoctor,
          appointmentDate,
          timeSlot,
          reason,
          symptoms
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      console.log(
        "Booking Response:",
        response.data
      );

      alert("Appointment booked successfully!");

      // CLEAR FORM
      setSelectedDoctor("");
      setAppointmentDate("");
      setTimeSlot("");
      setReason("");
      setSymptoms("");
      setAvailableSlots([]);

      // REFRESH APPOINTMENTS
      await fetchAppointments();
    } catch (error) {
      console.error(
        "Booking Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to book appointment"
      );
    }
  };

  // CANCEL APPOINTMENT
  const cancelAppointment = async (id) => {
    try {
      const currentToken = localStorage.getItem("token");

      const response = await axios.put(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      console.log(
        "Cancel Response:",
        response.data
      );

      alert("Appointment cancelled successfully!");

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Cancel Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to cancel appointment"
      );
    }
  };

  // GENERATE PRE-VISIT AI SUMMARY
  const generatePreVisitSummary = async (appointmentId) => {
    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        alert("Please login again");
        return;
      }

      setLoadingSummary(appointmentId);

      const response = await axios.post(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/${appointmentId}/pre-visit-summary`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      console.log(
        "AI Pre-Visit Summary:",
        response.data
      );

      if (response.data.aiStatus === "failed") {
        alert(
          response.data.message ||
            "AI summary could not be generated"
        );
        return;
      }

      await fetchAppointments();

      alert("AI pre-visit summary generated successfully!");
    } catch (error) {
      console.error(
        "AI Summary Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to generate AI summary"
      );
    } finally {
      setLoadingSummary("");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <h1>Patient Dashboard</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* BOOK APPOINTMENT */}
      <section className="booking-section">
        <h2>Book an Appointment</h2>

        <form
          className="booking-form"
          onSubmit={bookAppointment}
        >

          {/* SELECT DOCTOR */}
          <select
            value={selectedDoctor}
            onChange={(e) => {
              setSelectedDoctor(e.target.value);
              setTimeSlot("");
              setAvailableSlots([]);
            }}
            required
          >
            <option value="">
              Select Doctor
            </option>

            {doctors
              .filter((doctor) => doctor.isAvailable)
              .map((doctor) => (
                <option
                  key={doctor._id}
                  value={doctor._id}
                >
                  {doctor.user?.name} -{" "}
                  {doctor.specialization}
                </option>
              ))}
          </select>

          {/* SELECT DATE */}
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              setTimeSlot("");
            }}
            required
          />

          {/* SELECT TIME SLOT */}
          <select
            value={timeSlot}
            onChange={(e) =>
              setTimeSlot(e.target.value)
            }
            required
            disabled={
              !selectedDoctor ||
              !appointmentDate
            }
          >
            <option value="">
              Select Available Time Slot
            </option>

            {availableSlots.map((slot) => (
              <option
                key={slot}
                value={slot}
              >
                {slot}
              </option>
            ))}
          </select>

          {/* REASON */}
          <input
            type="text"
            placeholder="Reason for appointment"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            required
          />

          {/* SYMPTOMS */}
          <textarea
            placeholder="Symptoms (optional)"
            value={symptoms}
            onChange={(e) =>
              setSymptoms(e.target.value)
            }
          />

          {/* BOOK BUTTON */}
          <button type="submit">
            Book Appointment
          </button>
        </form>
      </section>

      {/* AVAILABLE DOCTORS */}
      <section>
        <h2>Available Doctors</h2>

        <div className="card-grid">
          {doctors.map((doctor) => (
            <div
              className="doctor-card"
              key={doctor._id}
            >
              <h3>
                {doctor.user?.name}
              </h3>

              <p>
                <strong>Specialization:</strong>{" "}
                {doctor.specialization}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {doctor.experience} years
              </p>

              <p>
                <strong>Fee:</strong>{" "}
                ₹{doctor.consultationFee}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {doctor.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MY APPOINTMENTS */}
      <section>
        <h2>My Appointments</h2>

        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="card-grid">

            {appointments.map(
              (appointment) => (
                <div
                  className="appointment-card"
                  key={appointment._id}
                >

                  <h3>
                    {appointment.doctor?.user?.name ||
                      "Doctor"}
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
                    <strong>Status:</strong>{" "}
                    {appointment.status}
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

                  {/* AI PRE-VISIT SUMMARY */}
                  {appointment.symptoms &&
                    appointment.status !== "cancelled" && (
                      <div className="ai-summary-section">
                        {!appointment.preVisitSummary?.urgencyLevel ? (
                          <button
                            onClick={() =>
                              generatePreVisitSummary(
                                appointment._id
                              )
                            }
                            disabled={
                              loadingSummary === appointment._id
                            }
                          >
                            {loadingSummary === appointment._id
                              ? "Generating AI Summary..."
                              : "✨ Generate AI Pre-Visit Summary"}
                          </button>
                        ) : (
                          <div className="ai-summary-card">
                            <h4>✨ AI Pre-Visit Summary</h4>

                            <p>
                              <strong>Urgency Level:</strong>{" "}
                              {appointment.preVisitSummary.urgencyLevel}
                            </p>

                            <p>
                              <strong>Chief Complaint:</strong>{" "}
                              {
                                appointment.preVisitSummary
                                  .chiefComplaint
                              }
                            </p>

                            <div>
                              <strong>
                                Questions for Your Doctor:
                              </strong>

                              <ul>
                                {appointment.preVisitSummary.suggestedQuestions?.map(
                                  (question, index) => (
                                    <li key={index}>
                                      {question}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {appointment.notes && (
                    <p>
                      <strong>Doctor Notes:</strong>{" "}
                      {appointment.notes}
                    </p>
                  )}

                  {/* AI POST-VISIT SUMMARY */}
                  {appointment.postVisitSummary?.summary && (
                    <div className="ai-summary-card post-visit-summary">
                      <h4>✨ AI Post-Visit Summary</h4>

                      <p>
                        <strong>Summary:</strong>{" "}
                        {appointment.postVisitSummary.summary}
                      </p>

                      {appointment.postVisitSummary.medicationSchedule?.length > 0 && (
                        <div>
                          <strong>💊 Medication Schedule:</strong>

                          <ul>
                            {appointment.postVisitSummary.medicationSchedule.map(
                              (medicine, index) => (
                                <li key={index}>{medicine}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {appointment.postVisitSummary.followUpSteps?.length > 0 && (
                        <div>
                          <strong>📋 Follow-Up Steps:</strong>

                          <ul>
                            {appointment.postVisitSummary.followUpSteps.map(
                              (step, index) => (
                                <li key={index}>{step}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {[
                    "booked",
                    "confirmed"
                  ].includes(
                    appointment.status
                  ) && (
                    <button
                      onClick={() =>
                        cancelAppointment(
                          appointment._id
                        )
                      }
                    >
                      Cancel Appointment
                    </button>
                  )}

                </div>
              )
            )}

          </div>
        )}
      </section>

    </div>
  );
}

export default PatientDashboard;