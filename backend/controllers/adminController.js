const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// ADMIN DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({
      role: "patient"
    });

    const totalDoctors = await Doctor.countDocuments();

    const totalAppointments = await Appointment.countDocuments();

    const bookedAppointments = await Appointment.countDocuments({
      status: "booked"
    });

    const confirmedAppointments = await Appointment.countDocuments({
      status: "confirmed"
    });

    const completedAppointments = await Appointment.countDocuments({
      status: "completed"
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: "cancelled"
    });

    res.status(200).json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentStatus: {
        booked: bookedAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};