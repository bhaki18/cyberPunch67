const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { connectDB, LoginPlayer, CreaPlayer } = require("../database/database");

const PORT = process.env.PORT || 3000;

const app = express();

// ---------------- MIDDLEWARE
app.use(express.json());

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]
}));

// ---------------- HTTP SERVER
const server = http.createServer(app);

// ---------------- SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500"
    ],
    methods: ["GET", "POST"]
  }
});

// CONNESSIONE AL DATABASE

(async () => {
  await connectDB();

  server.listen(PORT, "0.0.0.0", () => {
    console.log("Server avviato");
  });

})();

app.post("/auth/login", async (req, res) => {
  try {
    const player = await LoginPlayer(
      req.body.username,
      req.body.password
    );

    const token = jwt.sign(
      {
        userId: player._id,
        username: player.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/auth/signup", async (req, res) => {
  try {
    await CreaPlayer(req.body.username, req.body.password);
    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();

  } catch (err) {
    next(new Error("Unauthorized"));
  }
});



io.on("connection", (socket) => {
  console.log("Player loggato:", socket.user.username);

  socket.emit("welcome", {
    user: socket.user
  });

  socket.on("disconnect", () => {
    console.log("Logout:", socket.user.username);
  });
});


server.listen(PORT, "0.0.0.0", () => {
  console.log("Server attivo su " + PORT);
});