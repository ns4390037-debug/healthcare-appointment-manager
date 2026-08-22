const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    specialization: {
      type: String,
      required: true,
      trim: true
    },

    qualification: {
      type: String,
      default: ""
    },

    experience: {
      type: Number,
      default: 0
    },

    consultationFee: {
      type: Number,
      default: 0
    },

    workingHours: {
      start: {
        type: String,
        required: true,
        default: "09:00"
      },

      end: {
        type: String,
        required: true,
        default: "17:00"
      }
    },

    slotDuration: {
      type: Number,
      default: 30
    },

    leaveDates: [
      {
        type: Date
      }
    ],

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);