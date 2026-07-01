const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  permessi: { type: String, default: "user" },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  ptRanked: { type: Number, default: 0 }
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

const AggiungiExp = async (playerId, expDaAggiungere) => {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player non trovato");

  player.exp += expDaAggiungere;

  // Sali di livello ogni 100 exp
  while (player.exp >= 100) {
    player.exp -= 100;
    player.level += 1;
    console.log(`[Database] Player ${player.username} leveled up to level ${player.level}`);
  }

  await player.save();
  return player;
};

const AggiornaRanked = async (playerId, vinta) => {
  const player = await Player.findById(playerId);
  if (!player) throw new Error("Player non trovato");

  const delta = vinta ? 10 : -9;
  if (player.ptRanked === undefined) {
    player.ptRanked = 0;
  }
  player.ptRanked = Math.max(0, player.ptRanked + delta);
  await player.save();
  return player;
};

const OttieniClassifica = async () => {
  return await Player.find({}, "username level ptRanked")
    .sort({ ptRanked: -1 })
    .limit(10);
};

const OttieniPosizionePlayer = async (playerId) => {
  const targetPlayer = await Player.findById(playerId);
  if (!targetPlayer) return -1;

  const count = await Player.countDocuments({
    ptRanked: { $gt: targetPlayer.ptRanked || 0 }
  });
  return count + 1;
};

module.exports = {
  connectDB,
  CreaPlayer,
  LoginPlayer,
  GetPlayerById,
  AggiungiExp,
  AggiornaRanked,
  OttieniClassifica,
  OttieniPosizionePlayer
};