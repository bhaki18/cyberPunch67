# ⚡ CYBERPUNCH 67

[![Phaser 3](https://img.shields.io/badge/Phaser-3.80+-e74c3c.svg?logo=phaser)](https://phaser.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101.svg?logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

*Leggi questo documento in altre lingue: [English 🇬🇧](README.md)*

Benvenuto in **CyberPunch 67**, un picchiaduro 2D futuristico a tema cyberpunk sviluppato con **Phaser 3**, dotato di multiplayer in tempo reale sincronizzato tramite **Socket.io** e **Node.js**. Il gioco include un sistema di progressione a livelli, un roster bilanciato di combattenti con unità speciali per amministratori, matchmaking online classificato, modalità sopravvivenza offline contro bot IA intelligenti, menu impostazioni con rimappatura tasti, mixer audio con controllo volume e meccaniche di combattimento competitive moderne (hitstop, hitsparks al neon, aure overdrive e interpolazione del netcode).

---

## 📑 Indice dei Contenuti

- [🎮 Modalità di Gioco](#-modalità-di-gioco)
- [🥋 Roster dei Personaggi](#-roster-dei-personaggi)
- [🎹 Comandi e Controlli](#-comandi-e-controlli)
- [⚙️ Menu Impostazioni di Sistema (ESC)](#-menu-impostazioni-di-sistema-esc)
- [💥 Meccaniche di Combattimento Avanzate e Netcode](#-meccaniche-di-combattimento-avanzate-e-netcode)
- [🎵 Architettura Audio ed Effetti Sonori](#-architettura-audio-ed-effetti-sonori)
- [🛠️ Stack Tecnologico](#-stack-tecnologico)
- [💻 Installazione e Configurazione Locale](#-installazione-e-configurazione-locale)
- [📁 Struttura delle Cartelle del Progetto](#-struttura-delle-cartelle-del-progetto)
- [👏 Riconoscimenti e Autore](#-riconoscimenti-e-autore)
- [📄 Licenza](#-licenza)

---

## 🎮 Modalità di Gioco

### 🤖 Modalità Offline (Arcade / Sopravvivenza)
Affronta un'ondata progressiva di **100 bot controllati dall'IA**. Mentre i singoli bot hanno statistiche base inferiori, il loro numero e la loro pressione aumentano costantemente con l'avanzare delle ondate.
* **IA con Scansione dei Bordi**: I bot eseguono scansioni continue del terreno per rilevare i bordi delle piattaforme, decidendo dinamicamente se saltare oltre i precipizi o fermarsi prima di cadere nel vuoto.
* **Progressione ed Esperienza**: Sconfiggi i bot per accumulare Punti Esperienza (EXP), salire di livello e sbloccare nuovi combattenti.

### 🌐 Modalità Online (Multiplayer Classificato)
Scendi nell'arena competitiva contro veri giocatori con architettura gestita dal server.
* **Lobby e Sistema di Pronto**: Scegli il tuo combattente preferito, conferma lo stato di pronto e inizia il match non appena entrambi i giocatori sono sincronizzati.
* **Punteggio Classificato (RP)**: Ogni vittoria assegna **+10 RP**; ogni sconfitta sottrae **-9 RP**. I punteggi sono salvati su MongoDB e aggiornano la classifica globale in tempo reale.
* **Gestione Mirror Match**: Quando entrambi i giocatori scelgono lo stesso personaggio, l'avversario viene colorato con una tinta olografica alternativa per distinguerlo chiaramente in battaglia.

---

## 🥋 Roster dei Personaggi

| Combattente | Archetipo | HP | Mossa 1 (Leggera) | Mossa 2 (Pesante) | Super Attacco | Requisito di Sblocco |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Dominant Red** | Bilanciato / All-Rounder | 1000 | Pugno Rapido (15 DMG) | Calcio Rotante (30 DMG) | Pugno Devastante (150 DMG) | Predefinito (Sbloccato) |
| **Kyra Mist** | Velocista Agile | 900 | Taglio della Nebbia (18 DMG) | Turbine Furtivo (32 DMG) | Danza dell'Illusione (180 DMG) | Predefinito (Sbloccato) |
| **Chrome Black** | Colosso Corazzato | 1200 | Impatto Titanico (25 DMG) | Maglio di Cromo (45 DMG) | Terremoto Meccanico (220 DMG) | Livello 10 |
| **Scarlet Nova** | Cannone Energetico (Glass Cannon) | 800 | Scintilla Nova (28 DMG) | Lancia Fiamme Laser (52 DMG) | Supernova Termonucleare (350 DMG) | Livello 15 |
| **SYNDelta** | Controllo Elettrico ad Area | 950 | Pulsazione Shock (22 DMG) | Catena di Fulmini (40 DMG) | Sovraccarico Delta (290 DMG) | Livello 20 |
| **Hellbyte Unit** | Berserker Malware | 1100 | Infezione Malware (35 DMG) | Artigli del Demone (60 DMG) | Protocollo Apocalisse (330 DMG) | Livello 25 |
| **Admin ADP** | Unità Suprema Amministratore | 9999 | Ban Hammer (99 DMG) | Cancella File (199 DMG) | BSOD - Blue Screen (999 DMG) | **Solo Account Admin** |

> [!NOTE]
> **Sicurezza Admin ADP**: L'accesso a Admin ADP è protetto sia sul client (`InventoryScene`, `HubScene`) sia a livello server (`roomManager.js`). Qualsiasi tentativo di selezionare Admin ADP senza avere i permessi `"admin"` registrati nel database viene rifiutato e reimpostato automaticamente su *Dominant Red*.

---

## 🎹 Comandi e Controlli

Il gioco offre pieno supporto sia per **Tastiera** che per **Controller / Gamepad** nativi (USB o Bluetooth):

| Azione | Tastiera Predefinita | Gamepad / Controller | Descrizione |
| :--- | :---: | :---: | :--- |
| **Muovi a Sinistra** | `A` | D-Pad Sinistra / Analogico SX | Spostamento a sinistra |
| **Muovi a Destra** | `D` | D-Pad Destra / Analogico SX | Spostamento a destra |
| **Salto / Doppio Salto** | `SPACE` | D-Pad Su / Pulsante `A` (Basso) | Salto da terra o balzo a mezz'aria |
| **Attacco 1 (Leggero)** | `C` | Pulsante `X` (Sinistra) | Colpo rapido a basso tempo di recupero |
| **Attacco 2 (Pesante)** | `V` | Pulsante `Y` (Alto) | Colpo pesante ad alto impatto |
| **Super Attacco** | `B` | Pulsante `B` (Destra) | Mossa speciale devastante a barra piena |
| **Menu Impostazioni** | `ESC` | `Start` / `Options` / `Menu` | Apre l'overlay delle impostazioni |

---

## ⚙️ Menu Impostazioni di Sistema (ESC)

Premendo `ESC` (o `Start` su controller) in qualunque schermata si apre il menu **SystemScene**:

1. **Rimappatura Dinamica dei Tasti**:
   - È possibile riassegnare qualunque comando da tastiera (`Sinistra`, `Destra`, `Salto`, `Attacco 1`, `Attacco 2`, `Super Attacco`) cliccando sulla voce desiderata e premendo il nuovo tasto.
   - Le modifiche vengono salvate istantaneamente nel `localStorage` del browser e mantenute tra le sessioni di gioco.
2. **Mixer Audio e Funzione Mute**:
   - Cursori indipendenti per il **Volume Generale (Master)**, **Musica di Sottofondo (BGM)** ed **Effetti Sonori (SFX)**.
   - Pulsante di **Muto Immediato** con icona e feedback visivo.
3. **Diagnostica e Stato del Gamepad**:
   - Rilevamento in tempo reale dei controller collegati con anteprima dell'input attivo.
4. **Navigazione Rapida**:
   - Ritorno immediato alla partita o uscita pulita verso il Menu Principale.

---

## 💥 Meccaniche di Combattimento Avanzate e Netcode

### 🥊 Hitstop (Micro-Freeze all'Impatto)
All'impatto con attacchi pesanti o Super Attacchi, entrambi i personaggi subiscono un impercettibile fermo-immagine (**hitstop**). Questo effetto, tipico dei migliori picchiaduro 2D, amplifica il feedback e la potenza del colpo.

### ✨ Scintille al Neon Cyberpunk (Hitsparks)
Emettitori di particelle generano scariche luminose di scintille al neon (ciano, magenta e giallo ambrato) allineate all'angolo di attacco e alla direzione di respinta.

### ⏱️ Slow Motion Drammatico (K.O.)
Al momento del colpo decisivo che decreta la vittoria nell'Arena, il gioco applica una transizione in **slow motion** cinematico mediante interpolazione temporale (`timeScale`), valorizzando l'impatto finale prima della schermata di fine match.

### ⚡ Aura Energetica Overdrive
Quando la carica per il Super Attacco raggiunge il 100%, il lottatore viene avvolto da un'aura pulsante al neon che segnala la letalità imminente all'avversario.

### 🚀 Indipendenza dal Framerate
La fisica e le velocità di movimento sono normalizzate rispetto al delta-time (`dt`), garantendo salti, attacchi e velocità identiche su schermi a 60Hz, 120Hz, 144Hz e 240Hz.

### 🌐 Rate-Limiting e Interpolazione (Netcode)
La sincronizzazione del multiplayer online implementa:
* **Limitazione della Frequenza dei Pacchetti (Rate-Limiting)**: Riduce la trasmissione di rete a 30/60 invii al secondo per non saturare la banda.
* **Interpolazione Lineare sul Client (LERP)**: Le coordinate dell'avversario vengono interpellate fluidamente tra i pacchetti ricevuti, eliminando scatti e disallineamenti visivi.

---

## 🎵 Architettura Audio ed Effetti Sonori

CyberPunch 67 include una colonna sonora ed effetti audio dedicati per ogni scena:

* **Tracce Musicali d'Ambiente**:
  * `MainMenuScene`: Tema synthwave cyberpunk.
  * `HubScene`: Sottofondo elettronico d'attesa nell'hangar.
  * `InventoryScene`: BGM high-tech per la schermata dell'inventario.
  * `LeaderboardScene`: Traccia per il terminale della classifica globale.
  * `ArenaScene`: Colonne sonore dinamiche ed energiche per i combattimenti.
* **Effetti di Combattimento (SFX)**:
  * Suoni di pugni leggeri e pesanti, salti, cariche energetiche del super attacco, impatti, urti e jingle di vittoria/sconfitta.
* **Gestione del Ciclo di Vita Audio**:
  * Gestore centrale con listener di scena (`sleep`, `wake`, `shutdown`) per prevenire duplicazioni o sovrapposizioni musicali durante i cambi di schermata.

---

## 🛠️ Stack Tecnologico

- **Motore Grafico Client**: [Phaser 3](https://phaser.io/) (rendering WebGL e Canvas, Arcade Physics, Post-FX personalizzati)
- **Architettura Frontend**: JavaScript ES6+ modulare, Web Audio API, HTML5 Gamepad API
- **Rete e Sincronizzazione**: [Socket.io](https://socket.io/) (WebSockets con fallback HTTP, gestione stanze e sincronizzazione)
- **Backend**: Node.js ed Express
- **Database**: MongoDB e Mongoose (validazione schemi, hashing password con bcrypt, sessioni JWT)
- **Strumenti di Sviluppo**: Concurrently, http-server

---

## 💻 Installazione e Configurazione Locale

### Prerequisiti
* [Node.js](https://nodejs.org/) (versione 18 o superiore consigliata)
* [npm](https://www.npmjs.com/) (versione 8 o superiore)
* Istanza [MongoDB](https://www.mongodb.com/) locale (`mongodb://127.0.0.1:27017/phaserGameJamDB`) o URI MongoDB Atlas

### 1. Clonare la Repository
```bash
git clone https://github.com/bhaki18/cyberPunch67.git
cd cyberPunch67
```

### 2. Installare le Dipendenze
```bash
# Dipendenze principali
npm install

# Dipendenze dei sottomoduli server, database e client
cd server && npm install
cd ../database && npm install
cd ../client && npm install
cd ..
```

### 3. Configurazione del Database
Assicurati che MongoDB sia avviato localmente sulla porta `27017` oppure definisci la variabile d'ambiente `MONGODB_URI`:
```bash
export MONGODB_URI="mongodb://127.0.0.1:27017/phaserGameJamDB"
```

### 4. Avvio dei Server di Sviluppo
Avvia contemporaneamente sia il server backend (API e Socket.io) sia il client web statico:
```bash
npm run dev
```
* **Client di Gioco**: `http://localhost:5500`
* **Server di Gioco**: `http://localhost:3000`

---

## 📁 Struttura delle Cartelle del Progetto

```text
cyberPunch67/
├── client/
│   ├── assets/
│   │   ├── ArenaScene/           # Sfondi dell'arena, piattaforme, asset di battaglia
│   │   ├── HubScene/             # Tasto pronto, icone della lobby
│   │   ├── InventoryScene/       # Sprite personaggi, cornici, piedistallo
│   │   │   └── personaggi/       # Cartelle dei personaggi (DominantRed, KyraMist, AdminAdp, ecc.)
│   │   ├── MainMenuScene/        # Titoli, pulsanti, sfondo principale
│   │   └── sounds/               # Tracce musicali ed effetti sonori per ogni scena
│   ├── gameJsScripts/
│   │   ├── ArenaScene.js         # Fisica del match, hitstop, particelle, loop di combattimento
│   │   ├── BootScene.js          # Inizializzazione e proporzioni dello schermo
│   │   ├── PreloadScene.js       # Pipeline di caricamento asset e spritesheet
│   │   ├── MainMenuScene.js      # Interfaccia del menu principale e musica
│   │   ├── HubScene.js           # Lobby multiplayer e selezione personaggio
│   │   ├── InventoryScene.js     # Griglia inventario, anteprima piedistallo e statistiche
│   │   ├── LeaderboardScene.js   # Classifica globale dei giocatori
│   │   ├── LogInScene.js         # Modulo di accesso utente
│   │   ├── SingUpScene.js        # Modulo di registrazione nuovo utente
│   │   ├── SystemScene.js        # Menu impostazioni: rimappatura tasti, barre audio, controller
│   │   ├── endMatchScene.js      # Schermata di vittoria o sconfitta post-partita
│   │   └── main.js               # Configurazione di Phaser.Game e registrazione scene
│   └── modules/
│       ├── personaggi.js         # Definizione dei personaggi, statistiche base e livelli di sblocco
│       ├── arene.js              # Dimensioni e configurazione delle arene
│       └── phaserpluginfx/       # Plugin per effetti visivi (shake, slow-mo, particelle)
├── server/
│   ├── server.js                 # Server Express e inizializzazione Socket.io
│   ├── roomManager.js            # Gestione stanze, sincronizzazione netcode e controlli anti-cheat
│   └── routes/                   # Endpoint di autenticazione e profili giocatore
├── database/
│   ├── connection.js             # Connessione Mongoose al database
│   └── models/                   # Schemi utente e statistiche di gioco
├── package.json
├── README.md                     # Documentazione in inglese
└── README.it.md                  # Documentazione in italiano
```

---

## 👏 Riconoscimenti e Autore

**CyberPunch 67** è stato interamente ideato, progettato e sviluppato da:

* **Creatore e Sviluppatore Principale**: **Angelo Del Piano**
* **Profilo GitHub**: [@bhaki18](https://github.com/bhaki18)
* **Email**: [angelodelpiano2317@gmail.com](mailto:angelodelpiano2317@gmail.com)

*L'intero codice sorgente, le meccaniche di combattimento, il netcode in tempo reale, l'IA dei bot con platform scanning, l'integrazione del database e l'architettura audio sono opera di Angelo Del Piano.*

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza open-source [ISC License](LICENSE).
