const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  cancelAppointment
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

// Doctor views own appointments
router.get(
  "/doctor/my",
  protect,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

// Doctor updates own appointment
router.put(
  "/:id",
  protect,
  authorizeRoles("doctor"),
  updateAppointment
);

router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("patient"),
  cancelAppointment
);

module.exports = router;