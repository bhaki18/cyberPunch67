const http = require("http");
const { Server } = require("socket.io");

const { connectDB, CreaPlayer } = require("../database/database");

// PORT
const PORT = process.env.PORT || 3000;

// Server HTTP
const server = http.createServer();

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Avvio DB PRIMA del socket server
(async () => {
  await connectDB();
})();

io.on("connection", (socket) => {
  console.log("Client connesso:", socket.id);



  socket.on("disconnect", () => {
    console.log("Client disconnesso:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Server Socket.IO attivo su " + PORT);
});