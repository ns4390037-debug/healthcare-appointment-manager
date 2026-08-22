const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");

// CREATE DOCTOR
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      workingHours,
      slotDuration
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor user account
    const doctorUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "doctor"
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: doctorUser._id,
      specialization,
      qualification,
      experience,
      consultationFee,
      workingHours,
      slotDuration
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create doctor",
      error: error.message
    });
  }
};

// GET ALL DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name email phone");

    res.status(200).json({
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message
    });
  }
};

// ADMIN UPDATE DOCTOR
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    const {
      specialization,
      qualification,
      experience,
      consultationFee,
      workingHours,
      slotDuration,
      isAvailable
    } = req.body;

    if (specialization !== undefined) {
      doctor.specialization = specialization;
    }

    if (qualification !== undefined) {
      doctor.qualification = qualification;
    }

    if (experience !== undefined) {
      doctor.experience = experience;
    }

    if (consultationFee !== undefined) {
      doctor.consultationFee = consultationFee;
    }

    if (workingHours !== undefined) {
      doctor.workingHours = workingHours;
    }

    if (slotDuration !== undefined) {
      doctor.slotDuration = slotDuration;
    }

    if (isAvailable !== undefined) {
      doctor.isAvailable = isAvailable;
    }

    await doctor.save();

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update doctor",
      error: error.message
    });
  }
};

// ADMIN DEACTIVATE DOCTOR
const deactivateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    doctor.isAvailable = false;

    await doctor.save();

    res.status(200).json({
      message: "Doctor deactivated successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to deactivate doctor",
      error: error.message
    });
  }
};

// DOCTOR ADD LEAVE DATE
const addLeaveDate = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found"
      });
    }

    const { leaveDate } = req.body;

    if (!leaveDate) {
      return res.status(400).json({
        message: "Leave date is required"
      });
    }

    doctor.leaveDates.push(leaveDate);

    await doctor.save();

    res.status(200).json({
      message: "Leave date added successfully",
      leaveDates: doctor.leaveDates
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add leave date",
      error: error.message
    });
  }
};

// GET AVAILABLE TIME SLOTS
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }

    // Check if doctor is available
    if (!doctor.isAvailable) {
      return res.status(400).json({
        message: "Doctor is currently unavailable"
      });
    }

    // Check if doctor is on leave
    const isOnLeave = doctor.leaveDates.some((leaveDate) => {
      return (
        new Date(leaveDate).toISOString().split("T")[0] ===
        date
      );
    });

    if (isOnLeave) {
      return res.status(200).json({
        date,
        availableSlots: [],
        message: "Doctor is on leave on this date"
      });
    }

    // Get already booked appointments for this doctor and date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: date,
      status: {
        $in: ["booked", "confirmed"]
      }
    });

    // Extract booked time slots
    const bookedSlots = bookedAppointments.map(
      (appointment) => appointment.timeSlot
    );

    // Generate all slots based on doctor's working hours
    const availableSlots = [];

    const [startHour, startMinute] =
      doctor.workingHours.start.split(":").map(Number);

    const [endHour, endMinute] =
      doctor.workingHours.end.split(":").map(Number);

    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const hours = String(currentTime.getHours()).padStart(2, "0");
      const minutes = String(currentTime.getMinutes()).padStart(2, "0");

      const slot = `${hours}:${minutes}`;

      if (!bookedSlots.includes(slot)) {
        availableSlots.push(slot);
      }

      currentTime.setMinutes(
        currentTime.getMinutes() + doctor.slotDuration
      );
    }

    res.status(200).json({
      date,
      doctorId: doctor._id,
      slotDuration: doctor.slotDuration,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch available slots",
      error: error.message
    });
  }
};


module.exports = {
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deactivateDoctor,
  addLeaveDate,
  getAvailableSlots
};