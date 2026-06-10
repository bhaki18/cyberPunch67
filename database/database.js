const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  permessi: { type: String, default: "user" },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 }
}, { timestamps: true });

const Player = mongoose.model("Player", playerSchema);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI non definita");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "phaserGameJamDB"
    });

    console.log("MongoDB connesso");

  } catch (err) {
    console.error("MongoDB error:", err);
  }
};

const CreaPlayer = async (username, password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return await Player.create({
    username,
    passwordHash,
    permessi: "user",
    level: 1,
    exp: 0
  });
};

const LoginPlayer = async (username, password) => {
  const player = await Player.findOne({ username });

  if (!player) throw new Error("User non trovato");

  const ok = await bcrypt.compare(password, player.passwordHash);

  if (!ok) throw new Error("Password errata");

  return player;
};

async function GetPlayerById(id) {
  return await Player.findById(id);
}

module.exports = {
  connectDB,
  CreaPlayer,
  LoginPlayer,
  GetPlayerById
};