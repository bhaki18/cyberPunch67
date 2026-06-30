# ⚡ CYBERPUNCH 67

Benvenuto in **CyberPunch 67**, un picchiaduro bidimensionale e futuristico sviluppato interamente con il framework **Phaser JS** e sincronizzato in tempo reale tramite **Socket.io** e **Node.js**. Il gioco si basa su un sistema di progressione a livelli, un roster di personaggi bilanciato e un sistema di matchmaking e ranking online.

---

## 🎮 Modalità di Gioco

### 🤖 Modalità Offline (Arcade / Sopravvivenza)
Scegli il tuo combattente e affronta un'ondata progressiva di ben **100 NPC** (robot controllati dal computer). Gli NPC sono statisticamente più deboli singolarmente, ma cercheranno di sopraffarti con il loro numero. 
* **Obiettivo**: Sconfiggi tutti i 100 nemici per guadagnare punti esperienza (EXP) ed incrementare il tuo livello.

### 🌐 Modalità Online (Ranked Multiplayer)
Sfida altri giocatori reali collegandoti a stanze online gestite in tempo reale dal server. 
* Scegliete i vostri personaggi e confermate lo stato di pronto.
* Ogni scontro assegna punti per la classifica **Ranked** in caso di vittoria e ne sottrae in caso di sconfitta.
* Se entrambi i giocatori selezionano lo stesso combattente, l'avversario apparirà con una colorazione rossastra per distinguerlo visivamente ed evitare confusione.

---

## 🎹 Controlli di Gioco

Il gioco supporta pienamente la **tastiera** ed il **Gamepad/Controller**:

| Azione | Tasto Tastiera | Tasto Gamepad |
| :--- | :---: | :---: |
| **Muoviti a Sinistra** | `A` | D-Pad Sinistra / Analogico Sinistro |
| **Muoviti a Destra** | `D` | D-Pad Destra / Analogico Sinistro |
| **Salto / Doppio Salto** | `SPAZIO` | D-Pad Su / Pulsante `A` (Bottom) |
| **Attacco 1 (Leggero)** | `C` | Pulsante `X` (Left) |
| **Attacco 2 (Pesante)** | `V` | Pulsante `Y` (Top) |
| **Super Attacco** | `B` | Pulsante `B` (Right) |

---

## 🚀 Caratteristiche Tecniche e Logiche Speciali

* **Intelligenza Artificiale Avanzata (Bot)**: Gli NPC offline non cadono più facilmente dalle piattaforme. Effettuano una scansione del terreno davanti a loro; se rilevano un vuoto, provano a saltarlo con precisione oppure si fermano sul bordo.
* **Fisica di Caduta Libera**: I bordi inferiori dell'arena sono aperti. Se un combattente cade fuori dalle piattaforme di gioco e scende sotto il limite dello schermo, muore all'istante subendo danno fatale.
* **Super Attacco con Sbalzo (Knockback) e Stordimento**: Colpire con la mossa Super sbalza l'avversario lontano in direzione opposta con una spinta aerea, applicando uno stordimento (stun) totale di 530ms. Lo sbalzo fisico avviene con un ritardo di 200ms, lasciando che l'animazione di impatto e vibrazione dello schermo (*ShakeFx*) si completi per un feedback più potente.
* **Dimensione Dinamica delle Hitbox**: Le aree di impatto delle mosse scalano con il danno causato:
  * *Attacco 1* (Danno minore): area ridotta (`36x30 px`).
  * *Attacco 2* (Danno maggiore): area massima (`80x60 px`).
  * *Super Attacco* (Concentrato): area intermedia (`60x45 px`).
* **Sblocco Condizionale Personaggi**: Alcuni personaggi si sbloccano salendo di livello (es. Chrome Black), mentre il personaggio speciale **Admin ADP** è accessibile unicamente a chi possiede i permessi di `"admin"` salvati nel database.
* **Transizioni Scena Fluide**: Tutte le transizioni (Hub, Menù, Caricamenti, Schermata Risultati) sono accompagnate da sfumature della telecamera (*Fade In* e *Fade Out*). I caricamenti offline sono stati velocizzati a 2 secondi e avvengono interamente in background per evitare il pop-in degli elementi.

---

## 🛠️ Installazione e Avvio Locale

### Requisiti
* [Node.js](https://nodejs.org/) installato sul sistema.

### Procedura
1. Clona il progetto o scarica i sorgenti.
2. Apri il terminale nella cartella del progetto ed installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di gioco:
   ```bash
   npm start
   ```
4. Apri il browser all'indirizzo fornito (generalmente `http://localhost:3000`).

---

## 👥 Sviluppatore e Contatti

* **Sviluppatore Principale**: Angelo Del Piano
* **Email**: [angelodelpiano2317@gmail.com](mailto:angelodelpiano2317@gmail.com)

*Nota: Il gioco è in costante sviluppo e nuove arene o bilanciamenti vengono aggiunti periodicamente.*
