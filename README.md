# ⚡ CYBERPUNCH 67

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-e74c3c.svg?logo=phaser)](https://phaser.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101.svg?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

*Read this in other languages: [Italiano 🇮🇹](README.it.md)*

Welcome to **CyberPunch 67**, a fast-paced, futuristic 2D cyberpunk fighting game developed with **Phaser 3**, featuring real-time multiplayer synchronized via **Socket.io** and **Node.js**. The game includes level-based progression, a comprehensive character roster with special admin units, online ranked matchmaking, offline survival against intelligent AI bots, dynamic in-game settings, audio mixing, and modern fighting game mechanics like hitstop, neon hitsparks, overdrive auras, and client-side netcode interpolation.

---

## 📑 Table of Contents

- [🎮 Game Modes](#-game-modes)
- [🥋 Character Roster](#-character-roster)
- [🎹 Controls & Customization](#-controls--customization)
- [⚙️ System & Settings Menu](#-system--settings-menu)
- [💥 Advanced Combat Mechanics & Netcode](#-advanced-combat-mechanics--netcode)
- [🎵 Audio & Soundscape Architecture](#-audio--soundscape-architecture)
- [🛠️ Tech Stack & Architecture](#-tech-stack--architecture)
- [💻 Installation & Local Setup](#-installation--local-setup)
- [📁 Project Directory Structure](#-project-directory-structure)
- [👏 Credits & Author](#-credits--author)
- [📄 License](#-license)

---

## 🎮 Game Modes

### 🤖 Offline Mode (Arcade / Survival)
Face a progressive gauntlet of **100 AI-controlled bots**. While individual bots have lower base stats, their numbers and coordination scale up as waves advance.
* **Smart Platform AI**: Bots execute real-time raycast/ledge scanning to detect platform boundaries, calculating whether to jump across gaps or halt before dropping into the void.
* **Progression & Rewards**: Defeat enemies and complete waves to earn Experience Points (EXP) and unlock new fighters.

### 🌐 Online Mode (Ranked Multiplayer)
Enter the competitive cyber arena against real players with server-authoritative matchmaking.
* **Matchmaking & Ready System**: Choose your fighter, synchronize readiness, and enter combat once both combatants confirm.
* **Ranked Rating (RP)**: Victories reward **+10 RP**; defeats deduct **-9 RP**. All ratings are stored in MongoDB and reflected on the global leaderboard.
* **Mirror Match Shaders / Tints**: If both players select the same character, the opponent is rendered with an altered holographic hue to ensure crisp visual differentiation.

---

## 🥋 Character Roster

| Fighter | Role / Archetype | HP | Move 1 (Light) | Move 2 (Heavy) | Super Attack | Unlock Requirement |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Dominant Red** | Balanced All-Rounder | 1000 | Pugno Rapido (15 DMG) | Calcio Rotante (30 DMG) | Pugno Devastante (150 DMG) | Default (Unlocked) |
| **Kyra Mist** | Agile Speedster | 900 | Taglio della Nebbia (18 DMG) | Turbine Furtivo (32 DMG) | Danza dell'Illusione (180 DMG) | Default (Unlocked) |
| **Chrome Black** | Armored Bruiser | 1200 | Impatto Titanico (25 DMG) | Maglio di Cromo (45 DMG) | Terremoto Meccanico (220 DMG) | Level 10 |
| **Scarlet Nova** | Energy Glass Cannon | 800 | Scintilla Nova (28 DMG) | Lancia Fiamme Laser (52 DMG) | Supernova Termonucleare (350 DMG) | Level 15 |
| **SYNDelta** | Electric Zone Controller | 950 | Pulsazione Shock (22 DMG) | Catena di Fulmini (40 DMG) | Sovraccarico Delta (290 DMG) | Level 20 |
| **Hellbyte Unit** | Malware Berserker | 1100 | Infezione Malware (35 DMG) | Artigli del Demone (60 DMG) | Protocollo Apocalisse (330 DMG) | Level 25 |
| **Admin ADP** | Supreme Developer Unit | 9999 | Ban Hammer (99 DMG) | Cancella File (199 DMG) | BSOD - Blue Screen (999 DMG) | **Admin Accounts Only** |

> [!NOTE]
> **Admin ADP Security**: Access to Admin ADP is strictly enforced on both the client (`InventoryScene`, `HubScene`) and the server (`roomManager.js`). Attempting to select Admin ADP without `permessi: "admin"` in the database will be rejected and automatically reverted to *Dominant Red*.

---

## 🎹 Controls & Customization

CyberPunch 67 offers comprehensive input options, supporting standard keyboard controls and native USB / Bluetooth Gamepads:

| Action | Default Keyboard | Gamepad / Controller | Description |
| :--- | :---: | :---: | :--- |
| **Move Left** | `A` | D-Pad Left / Left Analog | Walk left |
| **Move Right** | `D` | D-Pad Right / Left Analog | Walk right |
| **Jump / Double Jump** | `SPACE` | D-Pad Up / `A` Button (Bottom) | Jump or execute mid-air second leap |
| **Attack 1 (Light)** | `C` | `X` Button (Left) | Fast startup, low recovery light strike |
| **Attack 2 (Heavy)** | `V` | `Y` Button (Top) | High-impact heavy strike with knockdown |
| **Super Attack** | `B` | `B` Button (Right) | Devastating special attack (requires full meter) |
| **System Settings** | `ESC` | `Start` / `Options` / `Menu` | Opens in-game settings overlay |

---

## ⚙️ System & Settings Menu

Pressing `ESC` (or `Start` on controller) at any moment opens the **SystemScene** overlay:

1. **Interactive Control Remapping**:
   - Rebind any action (`Move Left`, `Move Right`, `Jump`, `Attack 1`, `Attack 2`, `Super Attack`) by clicking and pressing any key.
   - All custom bindings are automatically saved to browser `localStorage` and persist across play sessions.
2. **Audio Mixer & Mute**:
   - Independent sliders for **Master Volume**, **BGM (Music)**, and **SFX (Sound Effects)**.
   - Instant one-click **Mute Toggle** with visual volume indicator.
3. **Controller Status & Diagnostics**:
   - Live visual detection for connected Gamepads, showing active button presses and mappings.
4. **Navigation & Exit**:
   - Resume gameplay instantly or return cleanly to the Main Menu.

---

## 💥 Advanced Combat Mechanics & Netcode

### 🥊 Hitstop (Freeze Frames)
Landing heavy hits or Super Attacks triggers **micro-freezes (hitstop)** on both the attacker and defender. This classic fighting-game technique delivers punchy, visceral feedback on impact.

### ✨ Cyberpunk Neon Hitsparks
Custom particle emitter bursts produce vibrant cyan, magenta, and amber neon hitsparks aligned with strike angles and impact vectors.

### ⏱️ Cinematic Slow Motion (K.O. Finish)
When a match-ending blow is landed in the Arena, the engine activates a dramatic time-dilation effect (`timeScale` interpolation), highlighting the final strike before transitioning to the victory screen.

### ⚡ Overdrive Energy Aura
When a combatant's Super Attack is fully charged, an energized neon aura envelops the character sprite, signalling maximum lethality to opponents.

### 🔢 Cyberpunk Floating Damage Numbers
Every strike generates dynamic, neon-styled floating damage numbers in Orbitron typography with high-contrast outlines, elastic pop-in animations, random impact jitter, and electric lightning indicators on critical hits (`⚡ -150 ⚡`).

### 🔄 Instant Rematch System
The post-match results screen features an instant **RIGIOCA // REMATCH** button allowing players to immediately restart offline battles without reloading menus, or quickly re-enter the online lobby.

### 🚀 Framerate Independence & Physics Timestep
Combat logic and physics updates are normalized using delta-time scaling (`dt`), ensuring identical jump heights, attack speeds, and movement velocity on 60Hz, 120Hz, 144Hz, and 240Hz monitors.

### 🌐 Netcode Rate-Limiting & Interpolation
Multiplayer synchronization utilizes:
* **Server-side Tick Rate Limiting**: Throttles position and state broadcasts to 30/60 updates per second, eliminating network packet congestion.
* **Client Linear Interpolation (LERP)**: Opponent coordinates are smoothly interpolated between received network frames, removing stutter and visual jitter.

---

## 🎵 Audio & Soundscape Architecture

CyberPunch 67 features a full-scene audio architecture:

* **Scene-Specific Soundtracks**:
  * `MainMenuScene`: Atmospheric cyberpunk synthwave theme.
  * `HubScene`: High-tech lobby ambient loop.
  * `InventoryScene`: Crisp terminal console background track.
  * `LeaderboardScene`: Cyber-grid data track.
  * `ArenaScene`: Adrenaline-fueled combat battle music.
* **Combat Sound Effects**:
  * Distinct light and heavy punch swooshes, impact smashes, jump whooshes, super attack energy charges, beam explosions, and victory/defeat stingers.
* **Zero Audio Duplication Engine**:
  * Centralized audio lifecycle manager (`stopByKey`, sleep/wake event listeners) preventing audio overlap when switching between scenes, leaderboards, inventories, and settings.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Engine**: [Phaser 3](https://phaser.io/) (WebGL & Canvas rendering, Arcade Physics, Custom Post-FX pipelines)
- **Client Architecture**: Modular ES6+ JavaScript, Web Audio API, HTML5 Gamepad API
- **Networking**: [Socket.io](https://socket.io/) (WebSockets with HTTP fallback, room management, state broadcast)
- **Backend**: Node.js & Express
- **Database**: MongoDB & Mongoose (Schema validation, bcrypt password hashing, JWT sessions)
- **Development Tools**: Concurrently, http-server

---

## 💻 Installation & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ recommended)
* [npm](https://www.npmjs.com/) (version 8+)
* [MongoDB](https://www.mongodb.com/) running locally (`mongodb://127.0.0.1:27017/phaserGameJamDB`) or a MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/bhaki18/cyberPunch67.git
cd cyberPunch67
```

### 2. Install Dependencies
```bash
# Install root development dependencies
npm install

# Install server, database, and client dependencies
cd server && npm install
cd ../database && npm install
cd ../client && npm install
cd ..
```

### 3. Configure Database Connection
Ensure MongoDB is running locally on port `27017` or define the `MONGODB_URI` environment variable:
```bash
export MONGODB_URI="mongodb://127.0.0.1:27017/phaserGameJamDB"
```

### 4. Run Development Servers
Launch both the backend API/Socket server and the static client simultaneously:
```bash
npm run dev
```
* **Game Client**: `http://localhost:5500`
* **Game Server**: `http://localhost:3000`

---

## 📁 Project Directory Structure

```text
cyberPunch67/
├── client/
│   ├── assets/
│   │   ├── ArenaScene/           # Arena backgrounds, platforms, battle assets
│   │   ├── HubScene/             # Ready button, hub icons
│   │   ├── InventoryScene/       # Character sprites, frames, pedestals
│   │   │   └── personaggi/       # Character folders (DominantRed, KyraMist, AdminAdp, etc.)
│   │   ├── MainMenuScene/        # Titles, buttons, main background
│   │   └── sounds/               # SFX and BGM audio files categorized by scene
│   ├── gameJsScripts/
│   │   ├── ArenaScene.js         # Match physics, hitstop, hitsparks, combat loop
│   │   ├── BootScene.js          # Initialization and display scaling
│   │   ├── PreloadScene.js       # Asset and spritesheet loading pipeline
│   │   ├── MainMenuScene.js      # Main menu interface and BGM
│   │   ├── HubScene.js           # Multiplayer lobby and character selector
│   │   ├── InventoryScene.js     # Character cards, pedestal preview, stats inspection
│   │   ├── LeaderboardScene.js   # Global player rankings
│   │   ├── LogInScene.js         # User login form
│   │   ├── SingUpScene.js        # User registration form
│   │   ├── SystemScene.js        # Settings overlay: key remapping, audio sliders, controller info
│   │   ├── endMatchScene.js      # Post-match victory/defeat screen
│   │   └── main.js               # Phaser.Game configuration and scene registration
│   └── modules/
│       ├── personaggi.js         # Character definitions, base stats, unlock levels
│       ├── arene.js              # Arena layouts and dimensions
│       └── phaserpluginfx/       # Custom visual effects plugin (shake, pulse, slow-mo)
├── server/
│   ├── server.js                 # Express server & Socket.io initialization
│   ├── roomManager.js            # Match rooms, netcode synchronization & anti-cheat
│   └── routes/                   # Authentication and profile API routes
├── database/
│   ├── connection.js             # Mongoose connection handler
│   └── models/                   # User and match schemas
├── package.json
└── README.md
```

---

## 👏 Credits & Author

**CyberPunch 67** was designed, programmed, and brought to life by:

* **Creator & Lead Developer**: **Angelo Del Piano**
* **GitHub Profile**: [@bhaki18](https://github.com/bhaki18)
* **Email**: [angelodelpiano2317@gmail.com](mailto:angelodelpiano2317@gmail.com)

*All code, combat systems, custom AI bot pathfinding, netcode architecture, database integration, and audio pipelines were engineered by Angelo Del Piano.*

---

## 📄 License

This project is open-source and released under the [ISC License](LICENSE).
