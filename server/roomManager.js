const stanze = {};
let stanzaIdCounter = 1;

/**
 * Genera un ID stanza in formato esadecimale (es: 0x000000000001)
 * @returns {string}
 */
function generaIdStanza() {
    const hexPart = (stanzaIdCounter++).toString(16).padStart(12, '0');
    return `0x${hexPart}`;
}

/**
 * Gestisce l'ingresso di un player in una stanza.
 * Cerca una stanza con un solo giocatore. Se la trova, il player vi si unisce.
 * Altrimenti, crea una nuova stanza.
 * @param {import("socket.io").Socket} socket
 * @param {import("socket.io").Server} io
 */
function joinaStanza(socket, io) {
    const username = socket.player ? socket.player.username : "Guest";
    let stanzaTrovata = null;

    // Cerca una stanza esistente che ha esattamente 1 player (in attesa del secondo)
    for (const id in stanze) {
        const stanza = stanze[id];
        if (stanza.playersJoined === 1) {
            stanzaTrovata = stanza;
            break;
        }
    }

    if (stanzaTrovata) {
        // Unisciti alla stanza esistente
        stanzaTrovata.playersJoined++;
        stanzaTrovata.nomiPlayer.push(username);
        stanzaTrovata.sockets.push(socket);
        stanzaTrovata.selezioni[username] = "Dominant Red"; // Default pre-selezionato
        stanzaTrovata.pronto[username] = false;

        socket.join(stanzaTrovata.id);
        socket.roomId = stanzaTrovata.id;

        console.log(`[RoomManager] Player ${username} joined room ${stanzaTrovata.id}. Players: ${stanzaTrovata.nomiPlayer.join(", ")}`);

        // Conferma al client l'avvenuto ingresso
        socket.emit("joinedStanza", { id: stanzaTrovata.id, nomiPlayer: stanzaTrovata.nomiPlayer });

        // Notifica entrambi i giocatori che la stanza è piena e la partita può iniziare
        stanzaTrovata.sockets.forEach((s) => {
            s.emit("roomReady", {
                roomId: stanzaTrovata.id,
                players: stanzaTrovata.nomiPlayer
            });
        });

        // Avvia il timer di 1 minuto gestito dal server
        avviaTimerStanza(stanzaTrovata, io);

    } else {
        // Crea una nuova stanza
        const nuovoId = generaIdStanza();
        const nuovaStanza = creaNuovaStanza(nuovoId);

        nuovaStanza.playersJoined = 1;
        nuovaStanza.nomiPlayer.push(username);
        nuovaStanza.sockets.push(socket);
        nuovaStanza.selezioni[username] = "Dominant Red"; // Default pre-selezionato
        nuovaStanza.pronto[username] = false;

        stanze[nuovoId] = nuovaStanza;

        socket.join(nuovoId);
        socket.roomId = nuovoId;

        console.log(`[RoomManager] Created new room ${nuovoId} for player ${username}`);

        socket.emit("joinedStanza", { id: nuovoId, nomiPlayer: nuovaStanza.nomiPlayer });
    }
}

/**
 * Crea la struttura dati di una nuova stanza
 * @param {string} id
 */
function creaNuovaStanza(id) {
    return {
        id: id,
        playersJoined: 0,
        nomiPlayer: [],
        sockets: [], // Mantiene i riferimenti alle socket per comunicare direttamente
        selezioni: {}, // Mappa username -> nome personaggio selezionato
        pronto: {}, // Mappa username -> boolean pronto
        timer: null,
        tempoRimasto: 60,
        arenaReady: {}, // Mappa username -> boolean pronto in ArenaScene
        matchStarted: false
    };
}

/**
 * Avvia il conto alla rovescia di 60 secondi gestito dal server
 * @param {any} stanza
 * @param {import("socket.io").Server} io
 */
function avviaTimerStanza(stanza, io) {
    if (stanza.timer) return; // Già avviato

    stanza.tempoRimasto = 60;
    io.to(stanza.id).emit("timerTick", stanza.tempoRimasto);

    stanza.timer = setInterval(() => {
        stanza.tempoRimasto--;
        io.to(stanza.id).emit("timerTick", stanza.tempoRimasto);

        if (stanza.tempoRimasto <= 0) {
            clearInterval(stanza.timer);
            stanza.timer = null;
            console.log(`[RoomManager] Timer scaduto per la stanza ${stanza.id}. Avvio forzato del match.`);
            avviaMatch(stanza, io);
        }
    }, 1000);
}

/**
 * Gestisce la selezione del personaggio da parte di un player
 * @param {import("socket.io").Socket} socket
 * @param {string} personaggioNome
 */
function selezionaPersonaggio(socket, personaggioNome) {
    const roomId = socket.roomId;
    if (!roomId || !stanze[roomId]) return;

    const stanza = stanze[roomId];
    const username = socket.player ? socket.player.username : "Guest";

    stanza.selezioni[username] = personaggioNome;

    // Invia la selezione all'avversario
    socket.to(roomId).emit("opponentSelectedCharacter", {
        personaggio: personaggioNome
    });
    console.log(`[RoomManager] Player ${username} in ${roomId} selected ${personaggioNome}`);
}

/**
 * Gestisce lo stato di "pronto" del player
 * @param {import("socket.io").Socket} socket
 * @param {boolean} ready
 * @param {import("socket.io").Server} io
 */
function impostaPronto(socket, ready, io) {
    const roomId = socket.roomId;
    if (!roomId || !stanze[roomId]) return;

    const stanza = stanze[roomId];
    const username = socket.player ? socket.player.username : "Guest";

    stanza.pronto[username] = ready;

    // Comunica all'avversario che il player è pronto
    socket.to(roomId).emit("opponentReady", { ready });
    console.log(`[RoomManager] Player ${username} in ${roomId} set ready: ${ready}`);

    // Controlla se tutti i giocatori uniti (esattamente 2) sono pronti
    const tuttiPronti = stanza.playersJoined === 2 &&
                        stanza.nomiPlayer.every(name => stanza.pronto[name] === true);

    if (tuttiPronti) {
        avviaMatch(stanza, io);
    }
}

/**
 * Avvia il match inviando l'evento startMatch a entrambi i giocatori
 * @param {any} stanza
 * @param {import("socket.io").Server} io
 */
function avviaMatch(stanza, io) {
    // Pulisce il timer se attivo
    if (stanza.timer) {
        clearInterval(stanza.timer);
        stanza.timer = null;
    }

    console.log(`[RoomManager] Starting online match for room ${stanza.id}`);
    stanza.matchStarted = true;

    // Genera un indice di arena casuale (es. tra 0 e 9)
    const arenaIndex = Math.floor(Math.random() * 10);

    // Invia i dati di avvio a entrambi i giocatori
    io.to(stanza.id).emit("startMatch", {
        roomId: stanza.id,
        players: stanza.nomiPlayer,
        selezioni: stanza.selezioni,
        arenaIndex: arenaIndex
    });
}

/**
 * Gestisce la disconnessione o l'abbandono di un player
 * @param {import("socket.io").Socket} socket
 */
function disconnettiPlayer(socket) {
    const roomId = socket.roomId;
    if (!roomId || !stanze[roomId]) return;

    const stanza = stanze[roomId];
    const username = socket.player ? socket.player.username : "Guest";

    // Pulisce il timer
    if (stanza.timer) {
        clearInterval(stanza.timer);
        stanza.timer = null;
    }

    // Rimuove la socket e il nome del player disconnesso
    stanza.sockets = stanza.sockets.filter((s) => s.id !== socket.id);
    stanza.nomiPlayer = stanza.nomiPlayer.filter((name) => name !== username);
    stanza.playersJoined = stanza.sockets.length;

    // Rimuove selezioni, pronto e stato arena
    delete stanza.selezioni[username];
    delete stanza.pronto[username];
    delete stanza.arenaReady[username];

    console.log(`[RoomManager] Player ${username} disconnected from room ${roomId}. Remaining: ${stanza.playersJoined}`);

    if (stanza.playersJoined === 0) {
        // Cancella la stanza se è vuota
        delete stanze[roomId];
        console.log(`[RoomManager] Room ${roomId} deleted because it is empty.`);
    } else {
        // Notifica il giocatore rimanente che l'avversario si è disconnesso
        stanza.sockets.forEach((s) => {
            s.emit("playerDisconnected", { username });
        });
    }

    socket.roomId = null;
}

/**
 * Gestisce lo stato di pronto in arena del player
 * @param {import("socket.io").Socket} socket
 * @param {import("socket.io").Server} io
 */
function impostaPlayerProntoInArena(socket, io) {
    const roomId = socket.roomId;
    if (!roomId || !stanze[roomId]) return;

    const stanza = stanze[roomId];
    const username = socket.player ? socket.player.username : "Guest";

    stanza.arenaReady[username] = true;
    console.log(`[RoomManager] Player ${username} ready in arena for room ${roomId}`);

    const entrambiPronti = stanza.playersJoined === 2 &&
                          stanza.nomiPlayer.every(name => stanza.arenaReady[name] === true);

    if (entrambiPronti) {
        console.log(`[RoomManager] Both players ready in arena for room ${roomId}. Emitting startArenaCountdown.`);
        io.to(roomId).emit("startArenaCountdown");
    }
}

/**
 * Invia l'aggiornamento di posizione/velocità all'avversario
 * @param {import("socket.io").Socket} socket
 * @param {any} data
 */
function gestisciPlayerUpdate(socket, data) {
    const roomId = socket.roomId;
    if (!roomId) return;
    socket.to(roomId).emit("opponentUpdate", data);
}

/**
 * Invia l'attacco all'avversario
 * @param {import("socket.io").Socket} socket
 * @param {any} data
 */
function gestisciPlayerAttack(socket, data) {
    const roomId = socket.roomId;
    if (!roomId) return;
    socket.to(roomId).emit("opponentAttack", data);
}

/**
 * Invia la collisione dell'attacco all'avversario per togliergli vita
 * @param {import("socket.io").Socket} socket
 * @param {any} data
 */
function gestisciPlayerHit(socket, data) {
    const roomId = socket.roomId;
    if (!roomId) return;
    socket.to(roomId).emit("opponentHit", data);
}

module.exports = {
    stanze,
    joinaStanza,
    creaNuovaStanza,
    selezionaPersonaggio,
    impostaPronto,
    disconnettiPlayer,
    impostaPlayerProntoInArena,
    gestisciPlayerUpdate,
    gestisciPlayerAttack,
    gestisciPlayerHit
};