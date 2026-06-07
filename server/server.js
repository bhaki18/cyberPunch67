const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("../database/database");

const PORT = process.env.PORT || 3000;

// HTTP server corretto
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Socket.IO server running");
});

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

// DB connect
(async () => {
  await connectDB();
})();

io.on("connection", (socket) => {
  console.log("Client connesso:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnesso:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server Socket.IO attivo su " + PORT);
});