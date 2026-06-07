const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Carica .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Schema Player
 */
const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  permessi: { type: String, default: "user" },
  id: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  
});

/**
 * Model Player
 */
const Player = mongoose.model("Player", playerSchema);

/**
 * Connessione DB
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI non definita nel file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, { dbName: "phaserGameJamDB" });
    console.log("MongoDB connesso");
  } catch (err) {
    console.error("Errore connessione MongoDB:", err);
  }
};

/**
 * Crea Player
 */
const CreaPlayer = async (playerData) => {
  const player = await Player.create({
    username: playerData.username,
    permessi: playerData.permessi,
    id: String(playerData.id),
    level: playerData.level,
    exp: playerData.exp,
    
  });

  return player;
};

module.exports = { connectDB, CreaPlayer };