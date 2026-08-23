const express = require("express");

const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  cancelAppointment,
  generatePreVisitSummary,
  generatePostVisitSummary
} = require("../controllers/appointmentController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Patient books an appointment
router.post(
  "/",
  protect,
  authorizeRoles("patient"),
  bookAppointment
);

// Patient views own appointments
router.get(
  "/my",
  protect,
  authorizeRoles("patient"),
  getMyAppointments
);

// Generate AI pre-visit symptom summary
router.post(
  "/:id/pre-visit-summary",
  protect,
  authorizeRoles("patient"),
  generatePreVisitSummary
);

// Doctor views own appointments
router.get(
  "/doctor/my",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

// Doctor generates AI post-visit summary
router.post(
  "/:id/post-visit-summary",
  protect,
  authorizeRoles("doctor"),
  generatePostVisitSummary
);

// Doctor updates own appointment
router.put(
  "/:id",
  protect,
  authorizeRoles("doctor"),
  updateAppointment
);

// Patient cancels own appointment
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("patient"),
  cancelAppointment
);

module.exports = router;