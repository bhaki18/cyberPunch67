const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { connectDB, LoginPlayer, CreaPlayer, GetPlayerById, AggiungiExp, AggiornaRanked, OttieniClassifica, OttieniPosizionePlayer } = require("../database/database");
const { joinaStanza, disconnettiPlayer, selezionaPersonaggio, impostaPronto, impostaPlayerProntoInArena, gestisciPlayerUpdate, gestisciPlayerAttack, gestisciPlayerHit } = require("./roomManager");

const PORT = process.env.PORT || 3000;

const app = express();




// ---------------- MIDDLEWARE
app.use(express.json());

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://mellow-paprenjak-b3d7d3.netlify.app"
  ]
}));

// ---------------- HTTP SERVER
const server = http.createServer(app);

// ---------------- SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://mellow-paprenjak-b3d7d3.netlify.app"
    ],
    methods: ["GET", "POST"]
  }
});


app.post("/auth/login", async (req, res) => {
  try {
    const user = await LoginPlayer(
      req.body.username,
      req.body.password
    );


    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username
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


io.use(async (socket, next) => {
  try {

    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const player = await GetPlayerById(decoded.userId);

    socket.user = decoded;
    socket.player = player;

    next();

  } catch (err) {
    next(new Error("Unauthorized"));
  }
});


io.on("connection", (socket) => {

  console.log("Player loggato:", socket.user.username);

  socket.emit("playerLoggato", socket.player);

  socket.on("joinStanza", () => {
    joinaStanza(socket, io);
    console.log("il player:" + socket.user.username + " si è unito a una stanza");
  });

  socket.on("onlineSelectCharacter", (data) => {
    selezionaPersonaggio(socket, data.characterName);
  });

  socket.on("onlineSetReady", (data) => {
    impostaPronto(socket, data.ready, io);
  });

  socket.on("playerReadyInArena", () => {
    impostaPlayerProntoInArena(socket, io);
  });

  socket.on("playerUpdate", (data) => {
    gestisciPlayerUpdate(socket, data);
  });

  socket.on("playerAttack", (data) => {
    gestisciPlayerAttack(socket, data);
  });

  socket.on("playerHit", (data) => {
    gestisciPlayerHit(socket, data);
  });

  socket.on("registraMatchOffline", async () => {
    try {
      if (socket.player && socket.player._id) {
        const rankPosition = await OttieniPosizionePlayer(socket.player._id);
        const updatedPlayer = await AggiungiExp(socket.player._id, 2);
        socket.player = updatedPlayer;
        socket.emit("statsAggiornate", {
          level: updatedPlayer.level,
          exp: updatedPlayer.exp,
          ptRanked: updatedPlayer.ptRanked || 0,
          rankPosition: rankPosition,
          rankPositionPrecedente: rankPosition
        });
        console.log(`[Server] Offline match registered for ${updatedPlayer.username}. EXP +2. Current level: ${updatedPlayer.level}, exp: ${updatedPlayer.exp}`);
      }
    } catch (err) {
      console.error("Errore registrazione match offline:", err);
    }
  });

  socket.on("registraMatchOnline", async (data) => {
    try {
      if (socket.player && socket.player._id) {
        const expGained = data.vinta ? 5 : 2;
        const rankPositionPrima = await OttieniPosizionePlayer(socket.player._id);
        
        let updatedPlayer = await AggiungiExp(socket.player._id, expGained);
        updatedPlayer = await AggiornaRanked(socket.player._id, data.vinta);
        socket.player = updatedPlayer;
        
        const rankPositionDopo = await OttieniPosizionePlayer(socket.player._id);
        socket.emit("statsAggiornate", {
          level: updatedPlayer.level,
          exp: updatedPlayer.exp,
          ptRanked: updatedPlayer.ptRanked || 0,
          rankPosition: rankPositionDopo,
          rankPositionPrecedente: rankPositionPrima
        });
        console.log(`[Server] Online match registered for ${updatedPlayer.username} (Win: ${data.vinta}). EXP +${expGained}, ptRanked delta: ${data.vinta ? "+10" : "-9"}. Current level: ${updatedPlayer.level}, Rank pt: ${updatedPlayer.ptRanked}, Rank pos: ${rankPositionDopo}`);
      }
    } catch (err) {
      console.error("Errore registrazione match online:", err);
    }
  });

  socket.on("richiediClassifica", async () => {
    try {
      if (socket.player && socket.player._id) {
        const classifica = await OttieniClassifica();
        const pos = await OttieniPosizionePlayer(socket.player._id);
        socket.emit("rispostaClassifica", {
          classifica: classifica.map(p => ({
            username: p.username,
            level: p.level,
            ptRanked: p.ptRanked || 0
          })),
          posizioneMioPlayer: pos,
          puntiMioPlayer: socket.player.ptRanked || 0
        });
      }
    } catch (err) {
      console.error("Errore recupero classifica:", err);
    }
  });

  socket.on("leaveStanza", () => {
    disconnettiPlayer(socket);
  });

  socket.on("disconnect", () => {
    console.log("Logout:", socket.user.username);
    disconnettiPlayer(socket);
  });

});


(async () => {
  await connectDB();

  server.listen(PORT, "0.0.0.0", () => {
    console.log("Server attivo su " + PORT);
  });

})();