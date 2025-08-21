import { io } from "socket.io-client";

// Connect to server
const socket = io("https://taaky-tv-api-1.onrender.com/", {
// const socket = io("http://localhost:8001", {
  transports: ["websocket"],
});

// Optional: handle connection errors
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export default socket; // default export
