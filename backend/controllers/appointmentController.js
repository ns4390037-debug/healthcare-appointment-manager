const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

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
    const doctor = await Doctor.findById(doctorId);

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
  cancelAppointment
};