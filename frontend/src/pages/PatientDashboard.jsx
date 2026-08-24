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

      await axios.post(
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

      alert("Appointment booked successfully!");

      setSelectedDoctor("");
      setAppointmentDate("");
      setTimeSlot("");
      setReason("");
      setSymptoms("");
      setAvailableSlots([]);

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

      await axios.put(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
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

  const getStatusClass = (status) => {
    return `status-${status?.toLowerCase() || "booked"}`;
  };

  return (
    <div className="patient-dashboard">

      {/* HEADER */}
      <header className="patient-header">
        <div className="patient-brand">
          <div className="patient-logo">H</div>

          <div>
            <h1>Healthcare Manager</h1>
            <p>APPOINTMENT & FOLLOW-UP MANAGEMENT</p>
          </div>
        </div>

        <div className="patient-header-actions">
          <div className="patient-role-tag">
            PATIENT PORTAL
          </div>

          <button
            className="patient-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* WELCOME */}
      <section className="patient-welcome">
        <div>
          <p className="patient-eyebrow">
            YOUR HEALTHCARE SPACE
          </p>

          <h2>Manage your appointments, simply.</h2>

          <p>
            Book consultations, track appointments and access
            healthcare information from one place.
          </p>
        </div>

        <div className="patient-welcome-badge">
          <span>✓</span>
          Secure Patient Access
        </div>
      </section>

      {/* BOOK APPOINTMENT */}
      <section className="patient-booking-section">
        <div className="patient-section-heading">
          <div>
            <p className="patient-eyebrow">
              APPOINTMENT MANAGEMENT
            </p>
            <h2>Book an Appointment</h2>
            <p>
              Choose your doctor, preferred date and available time slot.
            </p>
          </div>

          <span className="patient-section-tag">
            NEW BOOKING
          </span>
        </div>

        <form
          className="patient-booking-form"
          onSubmit={bookAppointment}
        >
          {/* SELECT DOCTOR */}
          <div className="patient-input-group">
            <label>Select Doctor</label>

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
          </div>

          {/* SELECT DATE */}
          <div className="patient-input-group">
            <label>Appointment Date</label>

            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setTimeSlot("");
              }}
              required
            />
          </div>

          {/* SELECT TIME SLOT */}
          <div className="patient-input-group">
            <label>Available Time Slot</label>

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
          </div>

          {/* REASON */}
          <div className="patient-input-group">
            <label>Reason for Appointment</label>

            <input
              type="text"
              placeholder="Enter the reason for your appointment"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              required
            />
          </div>

          {/* SYMPTOMS */}
          <div className="patient-input-group patient-symptoms-group">
            <label>Symptoms (Optional)</label>

            <textarea
              placeholder="Describe your symptoms or concerns"
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="patient-book-btn"
          >
            Book Appointment →
          </button>
        </form>
      </section>

      {/* AVAILABLE DOCTORS */}
      <section className="patient-content-section">
        <div className="patient-section-heading">
          <div>
            <p className="patient-eyebrow">
              HEALTHCARE PROVIDERS
            </p>
            <h2>Available Doctors</h2>
            <p>
              Explore doctors currently available for consultation.
            </p>
          </div>

          <span className="patient-section-tag">
            {doctors.filter((doctor) => doctor.isAvailable).length} AVAILABLE
          </span>
        </div>

        <div className="patient-doctor-grid">
          {doctors.map((doctor) => (
            <div
              className="patient-doctor-card"
              key={doctor._id}
            >
              <div className="doctor-card-top">
                <div className="doctor-avatar">
                  {doctor.user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "D"}
                </div>

                <span
                  className={
                    doctor.isAvailable
                      ? "availability available"
                      : "availability unavailable"
                  }
                >
                  {doctor.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <h3>
                {doctor.user?.name}
              </h3>

              <p className="doctor-specialization">
                {doctor.specialization}
              </p>

              <div className="doctor-details">
                <div>
                  <span>Experience</span>
                  <strong>
                    {doctor.experience} years
                  </strong>
                </div>

                <div>
                  <span>Consultation Fee</span>
                  <strong>
                    ₹{doctor.consultationFee}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MY APPOINTMENTS */}
      <section className="patient-content-section patient-appointments-section">
        <div className="patient-section-heading">
          <div>
            <p className="patient-eyebrow">
              YOUR SCHEDULE
            </p>
            <h2>My Appointments</h2>
            <p>
              Track your upcoming and previous healthcare visits.
            </p>
          </div>

          <span className="patient-section-tag">
            {appointments.length} TOTAL
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="patient-empty-state">
            <div>📅</div>
            <h3>No appointments found</h3>
            <p>
              Your booked appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="patient-appointment-grid">
            {appointments.map(
              (appointment) => (
                <div
                  className="patient-appointment-card"
                  key={appointment._id}
                >
                  <div className="appointment-card-header">
                    <div>
                      <p className="appointment-label">
                        CONSULTATION
                      </p>

                      <h3>
                        {appointment.doctor?.user?.name ||
                          "Doctor"}
                      </h3>
                    </div>

                    <span
                      className={`appointment-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-info-grid">
                    <div>
                      <span>Date</span>
                      <strong>
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </strong>
                    </div>

                    <div>
                      <span>Time</span>
                      <strong>
                        {appointment.timeSlot}
                      </strong>
                    </div>
                  </div>

                  <div className="appointment-reason">
                    <span>Reason</span>
                    <p>
                      {appointment.reason}
                    </p>
                  </div>

                  {appointment.symptoms && (
                    <div className="appointment-reason">
                      <span>Symptoms</span>
                      <p>
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}

                  {/* AI PRE-VISIT SUMMARY */}
                  {appointment.symptoms &&
                    appointment.status !== "cancelled" && (
                      <div className="ai-summary-section">
                        {!appointment.preVisitSummary?.urgencyLevel ? (
                          <button
                            className="generate-ai-btn"
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
                            <h4>
                              ✨ AI Pre-Visit Summary
                            </h4>

                            <p>
                              <strong>
                                Urgency Level:
                              </strong>{" "}
                              {
                                appointment.preVisitSummary
                                  .urgencyLevel
                              }
                            </p>

                            <p>
                              <strong>
                                Chief Complaint:
                              </strong>{" "}
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
                    <div className="doctor-notes">
                      <span>Doctor Notes</span>
                      <p>
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* AI POST-VISIT SUMMARY */}
                  {appointment.postVisitSummary?.summary && (
                    <div className="post-visit-section">
                      <h4 className="post-visit-title">
                        ✨ AI Post-Visit Summary
                      </h4>

                      <div className="post-visit-grid">

                        <div className="post-visit-card">
                          <h5>📋 Summary</h5>

                          <p>
                            {appointment.postVisitSummary.summary}
                          </p>
                        </div>

                        {appointment.postVisitSummary.medicationSchedule?.length > 0 && (
                          <div className="post-visit-card">
                            <h5>
                              💊 Medication Schedule
                            </h5>

                            <ul>
                              {appointment.postVisitSummary.medicationSchedule.map(
                                (medicine, index) => (
                                  <li key={index}>
                                    {medicine}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {appointment.postVisitSummary.followUpSteps?.length > 0 && (
                          <div className="post-visit-card follow-up-card">
                            <h5>
                              📌 Follow-Up Steps
                            </h5>

                            <ul>
                              {appointment.postVisitSummary.followUpSteps.map(
                                (step, index) => (
                                  <li key={index}>
                                    {step}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {[
                    "booked",
                    "confirmed"
                  ].includes(
                    appointment.status
                  ) && (
                    <button
                      className="patient-cancel-btn"
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

      <footer className="patient-footer">
        <div>
          <strong>Healthcare Manager</strong>
          <span>
            Appointment & Follow-Up Management System
          </span>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </footer>

    </div>
  );
}

export default PatientDashboard;