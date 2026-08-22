const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    appointmentDate: {
      type: String,
      required: true
    },

    timeSlot: {
      type: String,
      required: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    symptoms: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "booked",
        "confirmed",
        "completed",
        "cancelled"
      ],
      default: "booked"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);