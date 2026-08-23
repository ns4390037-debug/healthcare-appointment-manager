const nodemailer = require("nodemailer");

const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  requireTLS: true,

  tls: {
    minVersion: "TLSv1.2"
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

// Send booking confirmation email
const sendBookingConfirmationEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: patientEmail,

      subject: "Appointment Booking Confirmed",

      html: `
        <h2>Appointment Confirmed</h2>

        <p>Hello <strong>${patientName}</strong>,</p>

        <p>Your appointment has been successfully booked.</p>

        <h3>Appointment Details</h3>

        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>

        <p>Please be available at the scheduled time.</p>

        <br/>

        <p>Regards,</p>
        <p><strong>Healthcare Appointment Manager</strong></p>
      `
    });

    console.log("Booking confirmation email sent successfully");
  } catch (error) {
    console.error(
      "Failed to send booking confirmation email:",
      error.message
    );
  }
};

// Send new appointment notification to doctor
const sendDoctorBookingNotificationEmail = async ({
  doctorEmail,
  doctorName,
  patientName,
  appointmentDate,
  timeSlot,
  reason
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: doctorEmail,

      subject: "New Appointment Booked",

      html: `
        <h2>New Appointment Booked</h2>

        <p>Hello Dr. <strong>${doctorName}</strong>,</p>

        <p>A new patient appointment has been booked.</p>

        <h3>Appointment Details</h3>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p><strong>Reason:</strong> ${reason}</p>

        <br/>

        <p><strong>Healthcare Appointment Manager</strong></p>
      `
    });

    console.log("Doctor booking notification sent successfully");
  } catch (error) {
    console.error(
      "Failed to send doctor notification email:",
      error.message
    );
  }
};

// Send cancellation email to patient
const sendPatientCancellationEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: "Appointment Cancelled",

      html: `
        <h2>Appointment Cancelled</h2>

        <p>Hello <strong>${patientName}</strong>,</p>

        <p>Your appointment has been cancelled.</p>

        <h3>Cancelled Appointment Details</h3>

        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>

        <p>You may book another appointment at a convenient time.</p>

        <br/>
        <p><strong>Healthcare Appointment Manager</strong></p>
      `
    });

    console.log("Patient cancellation email sent successfully");
  } catch (error) {
    console.error(
      "Failed to send patient cancellation email:",
      error.message
    );
  }
};


// Send cancellation notification to doctor
const sendDoctorCancellationEmail = async ({
  doctorEmail,
  doctorName,
  patientName,
  appointmentDate,
  timeSlot
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: doctorEmail,
      subject: "Appointment Cancelled by Patient",

      html: `
        <h2>Appointment Cancelled</h2>

        <p>Hello Dr. <strong>${doctorName}</strong>,</p>

        <p>The following appointment has been cancelled by the patient.</p>

        <h3>Appointment Details</h3>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>

        <br/>
        <p><strong>Healthcare Appointment Manager</strong></p>
      `
    });

    console.log("Doctor cancellation email sent successfully");
  } catch (error) {
    console.error(
      "Failed to send doctor cancellation email:",
      error.message
    );
  }
};

const sendAppointmentReminderEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: "Reminder: Your Appointment is Tomorrow",

      html: `
        <h2>Appointment Reminder</h2>

        <p>Hello <strong>${patientName}</strong>,</p>

        <p>This is a reminder for your upcoming appointment.</p>

        <h3>Appointment Details</h3>

        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>

        <p>Please make sure to be available at the scheduled time.</p>

        <br/>
        <p><strong>Healthcare Appointment Manager</strong></p>
      `
    });

    console.log("Appointment reminder email sent successfully");
  } catch (error) {
    console.error(
      "Failed to send appointment reminder email:",
      error.message
    );
  }
};


const sendMedicationReminderEmail = async ({
  patientEmail,
  patientName,
  medicineName,
  dosage,
  frequency
}) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: patientEmail,

      subject: `Medication Reminder: ${medicineName}`,

      html: `
        <h2>💊 Medication Reminder</h2>

        <p>Hello <strong>${patientName}</strong>,</p>

        <p>This is your medication reminder.</p>

        <h3>Medicine Details</h3>

        <p><strong>Medicine:</strong> ${medicineName}</p>
        <p><strong>Dosage:</strong> ${dosage}</p>
        <p><strong>Frequency:</strong> ${frequency}</p>

        <p>Please follow your doctor's prescribed instructions.</p>

        <br/>

        <p>
          <strong>Healthcare Appointment Manager</strong>
        </p>
      `
    });

    console.log(
      `Medication reminder sent: ${medicineName}`
    );
  } catch (error) {
    console.error(
      "Failed to send medication reminder:",
      error.message
    );
  }
};


module.exports = {
  sendBookingConfirmationEmail,
  sendDoctorBookingNotificationEmail,
  sendPatientCancellationEmail,
  sendDoctorCancellationEmail,
  sendAppointmentReminderEmail,
  sendMedicationReminderEmail
};