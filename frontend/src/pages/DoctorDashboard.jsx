import { useEffect, useState } from "react";
import axios from "axios";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState("");

  const [notesData, setNotesData] = useState({});
  const [prescriptionData, setPrescriptionData] = useState({});

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
        { status },
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

  const handleNotesChange = (appointmentId, value) => {
    setNotesData((previous) => ({
      ...previous,
      [appointmentId]: value
    }));
  };

  const handlePrescriptionChange = (
    appointmentId,
    field,
    value
  ) => {
    setPrescriptionData((previous) => ({
      ...previous,
      [appointmentId]: {
        ...(previous[appointmentId] || {}),
        [field]: value
      }
    }));
  };

  const generatePostVisitSummary = async (appointment) => {
    try {
      const notes =
        notesData[appointment._id] ||
        appointment.notes ||
        "";

      const prescriptionForm =
        prescriptionData[appointment._id] || {};

      if (!notes.trim()) {
        alert("Please enter clinical notes first.");
        return;
      }

      setLoadingSummary(appointment._id);

      const prescription = [];

      if (
        prescriptionForm.medicineName ||
        prescriptionForm.dosage ||
        prescriptionForm.frequency ||
        prescriptionForm.duration
      ) {
        prescription.push({
          medicineName:
            prescriptionForm.medicineName || "",
          dosage:
            prescriptionForm.dosage || "",
          frequency:
            prescriptionForm.frequency || "",
          duration:
            prescriptionForm.duration || ""
        });
      }

      const response = await axios.post(
        `https://healthcare-appointment-manager-backend-0507.onrender.com/api/appointments/${appointment._id}/post-visit-summary`,
        {
          notes,
          prescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
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

      await fetchDoctorAppointments();

      alert(
        "AI post-visit summary generated successfully!"
      );
    } catch (error) {
      console.error(
        "Post-Visit AI Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to generate AI post-visit summary"
      );
    } finally {
      setLoadingSummary("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const getStatusClass = (status) => {
    return `doctor-status-${status?.toLowerCase() || "booked"}`;
  };

  const bookedCount = appointments.filter(
    (appointment) => appointment.status === "booked"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  return (
    <div className="doctor-dashboard">

      {/* ================= HEADER ================= */}

      <header className="doctor-header">
        <div className="doctor-brand">
          <div className="doctor-logo">
            H
          </div>

          <div>
            <h1>Healthcare Manager</h1>
            <p>APPOINTMENT & FOLLOW-UP MANAGEMENT</p>
          </div>
        </div>

        <div className="doctor-header-actions">
          <div className="doctor-role-tag">
            DOCTOR PORTAL
          </div>

          <button
            className="doctor-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>


      {/* ================= WELCOME ================= */}

      <section className="doctor-welcome">
        <div>
          <p className="doctor-eyebrow">
            HEALTHCARE PROVIDER PORTAL
          </p>

          <h2>Manage your patients with clarity.</h2>

          <p>
            Review appointments, manage patient consultations and
            generate AI-powered post-visit summaries from one place.
          </p>
        </div>

        <button
          className="doctor-refresh-btn"
          onClick={fetchDoctorAppointments}
        >
          ↻ Refresh Appointments
        </button>
      </section>


      {/* ================= OVERVIEW ================= */}

      <section className="doctor-overview-section">
        <div className="doctor-section-heading">
          <div>
            <p className="doctor-eyebrow">
              APPOINTMENT OVERVIEW
            </p>

            <h2>Your Dashboard</h2>

            <p>
              A quick overview of your current patient appointments.
            </p>
          </div>

          <span className="doctor-section-tag">
            LIVE DATA
          </span>
        </div>

        <div className="doctor-overview-grid">

          <div className="doctor-overview-card">
            <span className="overview-label">
              Total Appointments
            </span>

            <h3>{appointments.length}</h3>

            <p>
              All appointment records
            </p>
          </div>

          <div className="doctor-overview-card">
            <span className="overview-label">
              Awaiting Action
            </span>

            <h3>{bookedCount}</h3>

            <p>
              New appointment requests
            </p>
          </div>

          <div className="doctor-overview-card">
            <span className="overview-label">
              Confirmed Visits
            </span>

            <h3>{confirmedCount}</h3>

            <p>
              Upcoming consultations
            </p>
          </div>

          <div className="doctor-overview-card">
            <span className="overview-label">
              Completed
            </span>

            <h3>{completedCount}</h3>

            <p>
              Completed consultations
            </p>
          </div>

        </div>
      </section>


      {/* ================= APPOINTMENTS ================= */}

      <section className="doctor-appointments-section">

        <div className="doctor-section-heading">
          <div>
            <p className="doctor-eyebrow">
              PATIENT CONSULTATIONS
            </p>

            <h2>My Appointments</h2>

            <p>
              Review patient details and manage consultation status.
            </p>
          </div>

          <span className="doctor-section-tag">
            {appointments.length} TOTAL
          </span>
        </div>


        {appointments.length === 0 ? (
          <div className="doctor-empty-state">
            <div className="empty-icon">
              🩺
            </div>

            <h3>No appointments found</h3>

            <p>
              Patient appointments will appear here when they are booked.
            </p>
          </div>
        ) : (
          <div className="doctor-appointment-grid">

            {appointments.map((appointment) => (
              <div
                className="doctor-appointment-card"
                key={appointment._id}
              >

                {/* CARD HEADER */}

                <div className="doctor-appointment-top">

                  <div className="patient-profile">
                    <div className="patient-avatar">
                      {appointment.patient?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </div>

                    <div>
                      <p className="appointment-small-label">
                        PATIENT CONSULTATION
                      </p>

                      <h3>
                        {appointment.patient?.name ||
                          "Patient"}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`doctor-appointment-status ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                </div>


                {/* APPOINTMENT INFO */}

                <div className="doctor-appointment-info">

                  <div className="doctor-info-item">
                    <span>Date</span>

                    <strong>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="doctor-info-item">
                    <span>Time</span>

                    <strong>
                      {appointment.timeSlot}
                    </strong>
                  </div>

                </div>


                {/* REASON */}

                <div className="doctor-detail-box">
                  <span>Reason for Appointment</span>

                  <p>
                    {appointment.reason}
                  </p>
                </div>


                {/* SYMPTOMS */}

                {appointment.symptoms && (
                  <div className="doctor-detail-box">
                    <span>Patient Symptoms</span>

                    <p>
                      {appointment.symptoms}
                    </p>
                  </div>
                )}


                {/* AI PRE-VISIT SUMMARY */}

                {appointment.preVisitSummary?.urgencyLevel && (
                  <div className="doctor-ai-pre-summary">

                    <div className="doctor-ai-title">
                      <span>✨</span>

                      <h4>
                        AI Pre-Visit Summary
                      </h4>
                    </div>

                    <div className="doctor-ai-summary-content">

                      <p>
                        <strong>Urgency Level:</strong>{" "}
                        {
                          appointment.preVisitSummary
                            .urgencyLevel
                        }
                      </p>

                      <p>
                        <strong>Chief Complaint:</strong>{" "}
                        {
                          appointment.preVisitSummary
                            .chiefComplaint
                        }
                      </p>

                    </div>

                  </div>
                )}


                {/* STATUS ACTIONS */}

                {appointment.status === "booked" && (
                  <div className="doctor-appointment-actions">

                    <button
                      className="doctor-confirm-btn"
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment._id,
                          "confirmed"
                        )
                      }
                    >
                      Confirm Appointment
                    </button>

                    <button
                      className="doctor-cancel-btn"
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
                    className="doctor-complete-btn"
                    onClick={() =>
                      updateAppointmentStatus(
                        appointment._id,
                        "completed"
                      )
                    }
                  >
                    Mark as Completed →
                  </button>
                )}


                {/* ================= POST VISIT ================= */}

                {appointment.status === "completed" && (
                  <div className="doctor-post-visit-section">

                    {!appointment.postVisitSummary?.summary ? (
                      <>

                        <div className="doctor-post-visit-heading">
                          <p className="doctor-eyebrow">
                            POST-VISIT MANAGEMENT
                          </p>

                          <h3>
                            Complete Consultation Details
                          </h3>

                          <p>
                            Add clinical notes and prescription details
                            to generate an AI-powered patient summary.
                          </p>
                        </div>


                        {/* CLINICAL NOTES */}

                        <div className="doctor-form-group">

                          <label>
                            Clinical Notes
                          </label>

                          <textarea
                            rows="5"
                            placeholder="Enter diagnosis, treatment details and clinical notes..."
                            value={
                              notesData[appointment._id] ??
                              appointment.notes ??
                              ""
                            }
                            onChange={(event) =>
                              handleNotesChange(
                                appointment._id,
                                event.target.value
                              )
                            }
                          />

                        </div>


                        {/* PRESCRIPTION */}

                        <div className="doctor-prescription-section">

                          <div className="doctor-prescription-heading">
                            <h4>
                              Prescription Details
                            </h4>

                            <span>
                              OPTIONAL
                            </span>
                          </div>


                          <div className="doctor-prescription-grid">

                            <input
                              type="text"
                              placeholder="Medicine name"
                              value={
                                prescriptionData[
                                  appointment._id
                                ]?.medicineName || ""
                              }
                              onChange={(event) =>
                                handlePrescriptionChange(
                                  appointment._id,
                                  "medicineName",
                                  event.target.value
                                )
                              }
                            />

                            <input
                              type="text"
                              placeholder="Dosage (example: 500 mg)"
                              value={
                                prescriptionData[
                                  appointment._id
                                ]?.dosage || ""
                              }
                              onChange={(event) =>
                                handlePrescriptionChange(
                                  appointment._id,
                                  "dosage",
                                  event.target.value
                                )
                              }
                            />

                            <input
                              type="text"
                              placeholder="Frequency (example: Twice daily)"
                              value={
                                prescriptionData[
                                  appointment._id
                                ]?.frequency || ""
                              }
                              onChange={(event) =>
                                handlePrescriptionChange(
                                  appointment._id,
                                  "frequency",
                                  event.target.value
                                )
                              }
                            />

                            <input
                              type="text"
                              placeholder="Duration (example: 5 days)"
                              value={
                                prescriptionData[
                                  appointment._id
                                ]?.duration || ""
                              }
                              onChange={(event) =>
                                handlePrescriptionChange(
                                  appointment._id,
                                  "duration",
                                  event.target.value
                                )
                              }
                            />

                          </div>

                        </div>


                        <button
                          className="doctor-generate-ai-btn"
                          onClick={() =>
                            generatePostVisitSummary(
                              appointment
                            )
                          }
                          disabled={
                            loadingSummary ===
                            appointment._id
                          }
                        >
                          {loadingSummary ===
                          appointment._id
                            ? "Generating AI Summary..."
                            : "✨ Generate AI Post-Visit Summary"}
                        </button>

                      </>
                    ) : (

                      /* ================= AI POST-VISIT RESULT ================= */

                      <div className="doctor-ai-post-result">

                        <div className="doctor-ai-title">
                          <span>✨</span>

                          <h3>
                            AI Post-Visit Summary
                          </h3>
                        </div>


                        <div className="doctor-ai-result-card">

                          <h4>
                            📋 Visit Summary
                          </h4>

                          <p>
                            {
                              appointment.postVisitSummary
                                .summary
                            }
                          </p>

                        </div>


                        {appointment.postVisitSummary
                          .medicationSchedule?.length > 0 && (
                          <div className="doctor-ai-result-card">

                            <h4>
                              💊 Medication Schedule
                            </h4>

                            <ul>
                              {appointment.postVisitSummary
                                .medicationSchedule
                                .map((item, index) => (
                                  <li key={index}>
                                    {item}
                                  </li>
                                ))}
                            </ul>

                          </div>
                        )}


                        {appointment.postVisitSummary
                          .followUpSteps?.length > 0 && (
                          <div className="doctor-ai-result-card doctor-followup-card">

                            <h4>
                              📌 Follow-Up Steps
                            </h4>

                            <ul>
                              {appointment.postVisitSummary
                                .followUpSteps
                                .map((item, index) => (
                                  <li key={index}>
                                    {item}
                                  </li>
                                ))}
                            </ul>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}

          </div>
        )}
      </section>


      {/* ================= FOOTER ================= */}

      <footer className="doctor-footer">

        <div>
          <strong>
            Healthcare Manager
          </strong>

          <span>
            Doctor Appointment & Follow-Up Management
          </span>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>

      </footer>

    </div>
  );
}

export default DoctorDashboard;