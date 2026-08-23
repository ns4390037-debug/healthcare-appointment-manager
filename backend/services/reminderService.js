const cron = require("node-cron");

const Appointment = require("../models/Appointment");

const {
  sendAppointmentReminderEmail,
  sendMedicationReminderEmail
} = require("./emailService");

// ==========================================
// APPOINTMENT REMINDER
// ==========================================

const startAppointmentReminder = () => {
  // Every day at 9:00 AM
  cron.schedule(
    "0 9 * * *",
    async () => {
      try {
        console.log(
          "Running appointment reminder job..."
        );

        const tomorrow = new Date();

        tomorrow.setDate(
          tomorrow.getDate() + 1
        );

        const tomorrowDate = tomorrow
          .toISOString()
          .split("T")[0];

        const appointments = await Appointment.find({
          appointmentDate: tomorrowDate,

          status: {
            $in: ["booked", "confirmed"]
          }
        })
          .populate(
            "patient",
            "name email"
          )
          .populate({
            path: "doctor",
            populate: {
              path: "user",
              select: "name email"
            }
          });

        for (const appointment of appointments) {
          await sendAppointmentReminderEmail({
            patientEmail:
              appointment.patient.email,

            patientName:
              appointment.patient.name,

            doctorName:
              appointment.doctor?.user?.name ||
              "Doctor",

            appointmentDate:
              appointment.appointmentDate,

            timeSlot:
              appointment.timeSlot
          });
        }

        console.log(
          `Appointment reminders processed: ${appointments.length}`
        );
      } catch (error) {
        console.error(
          "Appointment reminder job failed:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};


// ==========================================
// MEDICATION REMINDER
// ==========================================

const startMedicationReminder = () => {
  // Runs every day at 8:00 AM
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        console.log(
          "Running medication reminder job..."
        );

        const appointments = await Appointment.find({
          status: "completed",

          prescription: {
            $exists: true,
            $ne: []
          }
        }).populate(
          "patient",
          "name email"
        );

        for (const appointment of appointments) {
          for (
            const medicine of appointment.prescription
          ) {
            if (
              !medicine.medicineName ||
              !medicine.frequency
            ) {
              continue;
            }

            await sendMedicationReminderEmail({
              patientEmail:
                appointment.patient.email,

              patientName:
                appointment.patient.name,

              medicineName:
                medicine.medicineName,

              dosage:
                medicine.dosage || "As prescribed",

              frequency:
                medicine.frequency
            });
          }
        }

        console.log(
          "Medication reminders processed successfully"
        );
      } catch (error) {
        console.error(
          "Medication reminder job failed:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};


module.exports = {
  startAppointmentReminder,
  startMedicationReminder
};