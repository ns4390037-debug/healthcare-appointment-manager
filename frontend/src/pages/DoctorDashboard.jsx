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

      console.log(
        "AI Post-Visit Summary:",
        response.data
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

                {appointment.preVisitSummary?.urgencyLevel && (
                  <div className="ai-summary-card">
                    <h4>
                      ✨ AI Pre-Visit Summary
                    </h4>

                    <p>
                      <strong>Urgency:</strong>{" "}
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

                {/* POST-VISIT SECTION */}
                {appointment.status === "completed" && (
                  <div className="post-visit-section">
                    {!appointment.postVisitSummary?.summary ? (
                      <>
                        <h3>
                          Post-Visit Details
                        </h3>

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

                        <h4>
                          Prescription
                        </h4>

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

                        <button
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
                      <div className="ai-summary-card">
                        <h3>
                          ✨ AI Post-Visit Summary
                        </h3>

                        <p>
                          {
                            appointment.postVisitSummary
                              .summary
                          }
                        </p>

                        <h4>
                          💊 Medication Schedule
                        </h4>

                        <ul>
                          {appointment.postVisitSummary.medicationSchedule?.map(
                            (item, index) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>

                        <h4>
                          📋 Follow-Up Steps
                        </h4>

                        <ul>
                          {appointment.postVisitSummary.followUpSteps?.map(
                            (item, index) => (
                              <li key={index}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
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