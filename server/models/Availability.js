// models/Availability.js - User availability schedule
const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One availability doc per user
    },
    // Days of week with time slots: 0=Sun, 1=Mon ... 6=Sat
    schedule: [
      {
        day: {
          type: Number, // 0-6
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        slots: [
          {
            start: { type: String, required: true }, // "09:00" in UTC
            end: { type: String, required: true },   // "17:00" in UTC
          },
        ],
      },
    ],
    // Duration of each meeting in minutes
    meetingDuration: {
      type: Number,
      default: 30, // 30 minutes per slot
    },
    // Buffer time between meetings in minutes
    bufferTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
