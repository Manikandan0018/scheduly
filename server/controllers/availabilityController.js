// controllers/availabilityController.js
const Availability = require("../models/Availability");
const User = require("../models/User");

// @route GET /api/availability/me - Get current user's availability
exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({ userId: req.user.id });
    if (!availability) {
      // Return default schedule if none set
      return res.json({ schedule: [], meetingDuration: 30, bufferTime: 0 });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch availability", error: error.message });
  }
};

// @route POST /api/availability - Set/Update availability
exports.setAvailability = async (req, res) => {
  try {
    const { schedule, meetingDuration, bufferTime } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: "Schedule is required" });
    }

    // Upsert: update if exists, create if not
    const availability = await Availability.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, schedule, meetingDuration, bufferTime },
      { new: true, upsert: true, runValidators: true },
    );

    // send to owner dashboard
    global.io.to(req.user.id).emit("availability-updated", availability);

    // 🔥 ALSO send globally (for booking page)
    global.io.emit("availability-updated", availability);

    res.json({ message: "Availability saved successfully", availability });
  } catch (error) {
    res.status(500).json({ message: "Failed to save availability", error: error.message });
  }
};

// @route GET /api/availability/:username - Get availability by username (public)
exports.getAvailabilityByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const availability = await Availability.findOne({ userId: user._id });
    if (!availability) {
      return res.status(404).json({ message: "No availability set for this user" });
    }

    res.json({ user, availability });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch availability", error: error.message });
  }
};
