const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const {
  createCalendarEvent
} = require("../services/calendarService");

const {
  generatePreVisitAI,
  generatePostVisitAI
} = require("../services/aiService");

const {
  sendBookingConfirmationEmail,
  sendDoctorBookingNotificationEmail,
  sendPatientCancellationEmail,
  sendDoctorCancellationEmail
} = require("../services/emailService");



// BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      symptoms
    } = req.body;

    // Check required fields
    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        message: "Please provide all required appointment details"
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId)
    .populate("user", "name email");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    // Check doctor availability
    if (!doctor.isAvailable) {
      return res.status(400).json({
        message: "Doctor is currently unavailable"
      });
    }

    // Check if doctor is on leave on selected date
    const selectedDate = new Date(appointmentDate);

    const isOnLeave = doctor.leaveDates.some((leaveDate) => {
      return (
        new Date(leaveDate).toISOString().split("T")[0] ===
        selectedDate.toISOString().split("T")[0]
      );
    });

    if (isOnLeave) {
      return res.status(400).json({
        message: "Doctor is on leave on this date"
      });
    }

    // Prevent duplicate booking for same doctor, date and time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: {
        $in: ["booked", "confirmed"]
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "This time slot is already booked"
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      reason,
      symptoms
    });

    // CREATE GOOGLE CALENDAR EVENT
    try {
      const calendarEvent = await createCalendarEvent({
        patientEmail: req.user.email,

        doctorEmail: doctor.user?.email,

        doctorName: doctor.user?.name || "Doctor",

        appointmentDate,

        appointmentTime: timeSlot
      });

      if (calendarEvent) {
        appointment.calendarEventId = calendarEvent.id;

        await appointment.save();
      }
    } catch (calendarError) {
      console.error(
        "Calendar event creation failed:",
        calendarError.message
      );

      // Appointment booking should continue
      // even if Google Calendar fails
    }

    // Send booking confirmation emails
    sendBookingConfirmationEmail({
      patientEmail: req.user.email,
      patientName: req.user.name,
      doctorName: doctor.user?.name || "Doctor",
      appointmentDate,
      timeSlot
    });

    sendDoctorBookingNotificationEmail({
      doctorEmail: doctor.user?.email,
      doctorName: doctor.user?.name || "Doctor",
      patientName: req.user.name,
      appointmentDate,
      timeSlot,
      reason
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message
    });
  }
};

// GET MY APPOINTMENTS
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone"
        }
      })
      .sort({ appointmentDate: 1, createdAt: -1 });

    res.status(200).json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
};

// GET DOCTOR'S APPOINTMENTS
const getDoctorAppointments = async (req, res) => {
  try {
    // Find doctor profile linked to logged-in user
    const doctor = await Doctor.findOne({
      user: req.user._id
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found"
      });
    }

    // Find appointments for this doctor
    const appointments = await Appointment.find({
      doctor: doctor._id
    })
      .populate("patient", "name email phone")
      .sort({ appointmentDate: 1, createdAt: -1 });

    res.status(200).json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor appointments",
      error: error.message
    });
  }
};

// UPDATE APPOINTMENT STATUS AND NOTES
const updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const doctor = await Doctor.findOne({
      user: req.user._id
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found"
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id
    }).populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "name email"
      }
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (status) {
      const allowedStatuses = ["confirmed", "completed", "cancelled"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid appointment status"
        });
      }

      appointment.status = status;
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update appointment",
      error: error.message
    });
  }
};

// GENERATE PRE-VISIT AI SUMMARY
const generatePreVisitSummary = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (!appointment.symptoms?.trim()) {
      return res.status(400).json({
        message: "Please provide symptoms before generating AI summary"
      });
    }

    try {
      appointment.aiStatus.preVisit = "pending";
      await appointment.save();

      const aiResult = await generatePreVisitAI(
        appointment.symptoms
      );

      appointment.preVisitSummary = {
        urgencyLevel: aiResult.urgencyLevel,
        chiefComplaint: aiResult.chiefComplaint,
        suggestedQuestions: aiResult.suggestedQuestions,
        generatedAt: new Date()
      };

      appointment.aiStatus.preVisit = "success";

      await appointment.save();

      return res.status(200).json({
        message: "Pre-visit AI summary generated successfully",
        preVisitSummary: appointment.preVisitSummary
      });
    } catch (aiError) {
      appointment.aiStatus.preVisit = "failed";
      await appointment.save();

      // Graceful failure: booking/system continues normally
      return res.status(200).json({
        message:
          "Appointment is available, but AI summary could not be generated at this time",
        aiStatus: "failed",
        error: aiError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate pre-visit summary",
      error: error.message
    });
  }
};

// GENERATE POST-VISIT AI SUMMARY
const generatePostVisitSummary = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found"
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const { notes, prescription } = req.body;

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (prescription !== undefined) {
      appointment.prescription = prescription;
    }

    if (!appointment.notes?.trim()) {
      return res.status(400).json({
        message: "Clinical notes are required to generate post-visit summary"
      });
    }

    try {
      appointment.aiStatus.postVisit = "pending";
      await appointment.save();

      const aiResult = await generatePostVisitAI(
        appointment.notes,
        appointment.prescription
      );

      appointment.postVisitSummary = {
        summary: aiResult.summary,
        medicationSchedule: aiResult.medicationSchedule,
        followUpSteps: aiResult.followUpSteps,
        generatedAt: new Date()
      };

      appointment.aiStatus.postVisit = "success";

      await appointment.save();

      return res.status(200).json({
        message: "Post-visit AI summary generated successfully",
        postVisitSummary: appointment.postVisitSummary
      });
    } catch (aiError) {
      appointment.aiStatus.postVisit = "failed";
      await appointment.save();

      return res.status(200).json({
        message:
          "Clinical notes were saved, but AI summary could not be generated at this time",
        aiStatus: "failed",
        error: aiError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate post-visit summary",
      error: error.message
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Completed appointment cannot be cancelled"
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Notify patient
    sendPatientCancellationEmail({
      patientEmail: req.user.email,
      patientName: req.user.name,
      doctorName: appointment.doctor?.user?.name || "Doctor",
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    });

    console.log("DOCTOR DATA:", appointment.doctor);
    console.log("DOCTOR USER DATA:", appointment.doctor?.user);
    console.log("DOCTOR EMAIL:", appointment.doctor?.user?.email);

    // Notify doctor
    sendDoctorCancellationEmail({
      doctorEmail: "ns0028206@gmail.com",
      doctorName: appointment.doctor?.user?.name || "Doctor",
      patientName: req.user.name,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    });

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  cancelAppointment,
  generatePreVisitSummary,
  generatePostVisitSummary
};