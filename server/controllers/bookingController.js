// controllers/bookingController.js
const Booking = require("../models/Booking");
const Availability = require("../models/Availability");
const User = require("../models/User");
const { sendBookingConfirmation } = require("../utils/emailService");

// @route POST /api/bookings - Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { username, bookedByName, bookedByEmail, date, startTime, endTime, notes } = req.body;

    if (!username || !bookedByName || !bookedByEmail || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Find the user being booked
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse date to Date object (normalize to start of day UTC)
    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    // Check for double booking: same user, same date, overlapping times
    const existingBooking = await Booking.findOne({
      userId: user._id,
      date: bookingDate,
      startTime: startTime,
      status: { $ne: "cancelled" }, // Ignore cancelled bookings
    });

    if (existingBooking) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    // Create the booking
    const booking = await Booking.create({
      userId: user._id,
      bookedByName,
      bookedByEmail,
      date: bookingDate,
      startTime,
      endTime,
      notes: notes || "",
    });

    // Send email notification (non-blocking)
    try {
      await sendBookingConfirmation({
        ownerEmail: user.email,
        ownerName: user.name,
        bookedByName,
        bookedByEmail,
        date: bookingDate,
        startTime,
        endTime,
      });
      // send to dashboard (owner)
      global.io.to(user._id.toString()).emit("new-booking", booking);
      global.io.emit("new-booking", booking);

    } catch (emailError) {
      // Don't fail the booking if email fails
      console.log("Email notification failed:", emailError.message);
    }

    res.status(201).json({ message: "Booking confirmed!", booking });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
};

// @route GET /api/bookings/my - Get authenticated user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// @route GET /api/bookings/slots - Get booked slots for a user on a date (public)
exports.getBookedSlots = async (req, res) => {
  try {
    const { username, date } = req.query;

    if (!username || !date) {
      return res.status(400).json({ message: "Username and date are required" });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      userId: user._id,
      date: bookingDate,
      status: { $ne: "cancelled" },
    }).select("startTime endTime -_id");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booked slots", error: error.message });
  }
};

// @route PATCH /api/bookings/:id/cancel - Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id, // Ensure user owns this booking
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();
    
    global.io.to(req.user.id).emit("booking-cancelled", booking);
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};
