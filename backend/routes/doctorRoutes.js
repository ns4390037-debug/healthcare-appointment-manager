const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deactivateDoctor,
  addLeaveDate,
  getAvailableSlots
} = require("../controllers/doctorController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Admin creates a doctor
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createDoctor
);

// Admin updates doctor details
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateDoctor
);

// Admin deactivates doctor
router.put(
  "/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateDoctor
);

router.post(
  "/leave",
  protect,
  authorizeRoles("doctor"),
  addLeaveDate
);

// Get available slots for a doctor
router.get(
  "/:id/slots",
  getAvailableSlots
);

// Get all doctors
router.get("/", getAllDoctors);

module.exports = router;