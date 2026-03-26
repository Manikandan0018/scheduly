require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Connect DB
connectDB();

// ✅ CORS (Express)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://scheduly-one.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// Health route
app.get("/", (req, res) => {
  res.json({ message: "🗓️ Scheduly API is running!", status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ CREATE HTTP SERVER (FIRST)
const server = http.createServer(app);

// ✅ CREATE SOCKET.IO (ONLY ONCE)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://scheduly-one.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// make global
global.io = io;

// socket events
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
