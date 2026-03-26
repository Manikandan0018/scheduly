// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookedSlots,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/", createBooking);
router.get("/slots", getBookedSlots);

// Protected routes
router.get("/my", protect, getMyBookings);
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;
