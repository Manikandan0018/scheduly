// utils/emailService.js - Nodemailer email notifications
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

exports.sendBookingConfirmation = async ({
  ownerEmail,
  ownerName,
  bookedByName,
  bookedByEmail,
  date,
  startTime,
  endTime,
}) => {
  // Skip if email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email not configured, skipping notification");
    return;
  }

  const transporter = createTransporter();
  const formattedDate = formatDate(date);

  // Email to calendar owner
  await transporter.sendMail({
    from: `"Scheduly" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New booking from ${bookedByName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">📅 New Booking!</h2>
        <p>Hi ${ownerName},</p>
        <p><strong>${bookedByName}</strong> has booked a meeting with you.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime} UTC</p>
          <p><strong>Booker Email:</strong> ${bookedByEmail}</p>
        </div>
        <p>Log in to Scheduly to manage your bookings.</p>
      </div>
    `,
  });

  // Confirmation email to booker
  await transporter.sendMail({
    from: `"Scheduly" <${process.env.EMAIL_USER}>`,
    to: bookedByEmail,
    subject: `Booking confirmed with ${ownerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">✅ Booking Confirmed!</h2>
        <p>Hi ${bookedByName},</p>
        <p>Your meeting with <strong>${ownerName}</strong> is confirmed!</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime} UTC</p>
        </div>
        <p>We look forward to seeing you!</p>
      </div>
    `,
  });
};
