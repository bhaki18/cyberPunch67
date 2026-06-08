const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("../database/database");
const jwt = require("jsonwebtoken");
const express = require("express");
const { LoginPlayer, CreaPlayer } = require("../database/database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;



// Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://cyberpunch67.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});


// LOGIN
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

// SING UP

app.post("/auth/signup", async (req, res) => {
  try {
    const player = await CreaPlayer(
      req.body.username,
      req.body.password
    );

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();

  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

// DB connect
(async () => {
  await connectDB();
})();

io.on("connection", (socket) => {
  console.log("Player loggato:", socket.user.username);

  socket.emit("welcome", {
    message: "Benvenuto",
    user: socket.user
  });

  socket.on("disconnect", () => {
    console.log("Logout:", socket.user.username);
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("HTTP + Socket server attivo su " + PORT);
});