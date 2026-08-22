const express = require("express");
const router = express.Router();

const {
  getDashboardStats
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Admin dashboard statistics
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

module.exports = router;