// models/Booking.js - Booking schema
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // The user whose calendar is being booked
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Name of the person booking the slot
    bookedByName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Email of the person booking
    bookedByEmail: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    // Date of booking (YYYY-MM-DD format, stored as Date)
    date: {
      type: Date,
      required: true,
    },
    // Start time in "HH:MM" format (UTC)
    startTime: {
      type: String,
      required: true,
    },
    // End time in "HH:MM" format (UTC)
    endTime: {
      type: String,
      required: true,
    },
    // Optional message from booker
    notes: {
      type: String,
      default: "",
    },
    // Booking status
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

// Compound index to efficiently check for double-booking
bookingSchema.index({ userId: 1, date: 1, startTime: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
