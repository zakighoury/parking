const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    credentials: true
  },
});

const PORT = process.env.PORT || 8000;

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
module.exports = { io };
const buildingdetailRoutes = require("./routes/buildingdetailsRoutes.js")
const buildingroutes = require("./routes/buidlingroutes");
const authRoutes = require("./routes/authRoutes");

// Configuring Middlewares
const useMiddlewares = require("./utils/useMiddlewares");
useMiddlewares(app);

// Configuring Routes
const useRoutes = require("./utils/useRoutes.js");
useRoutes(app);

app.use("/api", buildingroutes);
app.use("/api", authRoutes);
app.use("/api/building", buildingdetailRoutes);
// Connecting to MongoDB
const connectDB = require("./utils/db");
connectDB().then(() => {
  // Starting Server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

