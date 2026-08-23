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

    // AI PRE-VISIT SUMMARY
    preVisitSummary: {
      urgencyLevel: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: null
      },

      chiefComplaint: {
        type: String,
        default: ""
      },

      suggestedQuestions: {
        type: [String],
        default: []
      },

      generatedAt: {
        type: Date,
        default: null
      }
    },

    // DOCTOR CLINICAL NOTES
    notes: {
      type: String,
      default: ""
    },

    // PRESCRIPTION DETAILS
    prescription: [
      {
        medicineName: {
          type: String,
          trim: true
        },

        dosage: {
          type: String,
          trim: true
        },

        frequency: {
          type: String,
          trim: true
        },

        duration: {
          type: String,
          trim: true
        }
      }
    ],

    // AI POST-VISIT SUMMARY
    postVisitSummary: {
      summary: {
        type: String,
        default: ""
      },

      medicationSchedule: {
        type: [String],
        default: []
      },

      followUpSteps: {
        type: [String],
        default: []
      },

      generatedAt: {
        type: Date,
        default: null
      }
    },

    // LLM STATUS / FAILURE HANDLING
    aiStatus: {
      preVisit: {
        type: String,
        enum: ["pending", "success", "failed", "not_requested"],
        default: "not_requested"
      },

      postVisit: {
        type: String,
        enum: ["pending", "success", "failed", "not_requested"],
        default: "not_requested"
      }
    },
    calendarEventId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Database-level duplicate booking protection
appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    timeSlot: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["booked", "confirmed"]
      }
    }
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);