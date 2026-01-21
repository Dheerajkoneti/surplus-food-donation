const express = require("express");
const cors = require("cors");
const http = require("http");
const Food = require("./models/Food");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
require("./config/db");

const app = express();
const server = http.createServer(app);

// SOCKET.IO
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
// ROUTES
app.use("/food", require("./routes/foodRoutes"));

// 🧹 AUTO DELETE EXPIRED
setInterval(async () => {
  await Food.deleteMany({ expiryTime: { $lt: new Date() } });
}, 10 * 60 * 1000);

server.listen(5000, () =>
  console.log("Server running on port 5000")
);
