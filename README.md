# ⚡ CYBERPUNCH 67

Welcome to **CyberPunch 67**, a futuristic 2D fighting game developed with **Phaser 3**, featuring real-time multiplayer synchronized via **Socket.io** and **Node.js**. The game features a level-based progression system, a balanced character roster, online matchmaking, ranked leaderboards, and an offline survival mode against intelligent AI bots.

---

## 🎮 Game Modes

### 🤖 Offline Mode (Arcade / Survival)
Choose your fighter and face a progressive wave of **100 AI-controlled bots**. While individual bots are statistically weaker, they attempt to overwhelm you with sheer numbers.
* **Objective**: Defeat all 100 enemies to earn Experience Points (EXP) and level up your fighter.

### 🌐 Online Mode (Ranked Multiplayer)
Challenge real players in real-time matches hosted by the server.
* Select your character and set your ready state.
* Every match awards **Ranked Points** for victories (+10 RP) and deducts points for defeats (-9 RP).
* **Mirror Matches**: If both players select the same character, the opponent is rendered with a reddish tint to visually differentiate them during combat.

---

## 🎹 Game Controls

CyberPunch 67 fully supports both **Keyboard** and **Gamepad / Controller**:

| Action | Keyboard Key | Gamepad / Controller |
| :--- | :---: | :---: |
| **Move Left** | `A` | D-Pad Left / Left Analog Stick |
| **Move Right** | `D` | D-Pad Right / Left Analog Stick |
| **Jump / Double Jump** | `SPACE` | D-Pad Up / `A` Button (Bottom) |
| **Attack 1 (Light)** | `C` | `X` Button (Left) |
| **Attack 2 (Heavy)** | `V` | `Y` Button (Top) |
| **Super Attack** | `B` | `B` Button (Right) |

---

## 🚀 Technical Highlights & Core Mechanics

* **Advanced Bot AI**: Offline NPCs perform real-time terrain scanning to detect ledges and gaps, deciding whether to jump with precision or halt at the edge to prevent falling.
* **Free Fall Arena Physics**: Arena bottom bounds are open. Characters knocked or stepping off the platform beneath screen limits suffer instant fatal damage.
* **Super Attack Knockback & Stun**: Executing a Super Attack launches opponents away with an airborne vector while applying a **530ms stun**. Physical knockback triggers after a **200ms delay**, aligning with impact animation and screen shake effects (*ShakeFx*).
* **Dynamic Hitbox Scaling**: Attack hitboxes scale dynamically based on damage output:
  * *Attack 1* (Light): Small footprint (`36x30 px`).
  * *Attack 2* (Heavy): Maximum area (`80x60 px`).
  * *Super Attack* (Focused burst): Medium footprint (`60x45 px`).
* **Conditional Character Unlocks**: Unlock new fighters by leveling up (e.g., *Chrome Black*). Special characters like **Admin ADP** are restricted exclusively to accounts with `"admin"` database privileges.
* **Smooth Scene Transitions**: Full camera fade-in/fade-out transitions between scenes (Hub, Main Menu, Preloader, Results). Background loading reduces offline preloading to 2 seconds without visual pop-in.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (ES6+), [Phaser 3](https://phaser.io/)
* **Backend**: Node.js, Express, [Socket.io](https://socket.io/)
* **Database & Auth**: MongoDB, Mongoose, JSON Web Tokens (JWT), Bcrypt
* **Utilities**: Concurrently, http-server, Phaser FX Plugins

---

## 💻 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) instance (local or MongoDB Atlas)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhaki18/cyberPunch67.git
   cd cyberPunch67
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   cd server && npm install
   cd database && npm install
   cd client && npm install
   cd ..
   ```

3. **Configure Environment Variables**:
   Set `MONGODB_URI` in your environment or server configuration (e.g., `mongodb://localhost:27017/phaserGameJamDB`).

4. **Start the Development Servers**:
   ```bash
   npm run dev
   ```
   *(Or start server and client separately with `npm run server` and `npm run client`)*

5. **Play the Game**:
   Open your browser and navigate to `http://localhost:5500` (or `http://localhost:3000`).

---

## 👏 Credits & Author

**CyberPunch 67** was created, designed, and developed by:

* **Creator & Lead Developer**: **Angelo Del Piano**
* **Email**: [angelodelpiano2317@gmail.com](mailto:angelodelpiano2317@gmail.com)
* **GitHub Profile**: [@bhaki18](https://github.com/bhaki18)

Special credits and recognition to **Angelo Del Piano** for building the entire game architecture, networking logic, custom AI bot behavior, database integration, and combat system.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

