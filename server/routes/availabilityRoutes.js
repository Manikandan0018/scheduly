// routes/availabilityRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMyAvailability,
  setAvailability,
  getAvailabilityByUsername,
} = require("../controllers/availabilityController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes (requires auth)
router.get("/me", protect, getMyAvailability);
router.post("/", protect, setAvailability);

// Public route
router.get("/:username", getAvailabilityByUsername);

module.exports = router;
