import { io } from "socket.io-client";

// remove /api because socket connects to root
const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace("/api", "");

const socket = io(BASE_URL, {
  withCredentials: true,
});

export default socket;
