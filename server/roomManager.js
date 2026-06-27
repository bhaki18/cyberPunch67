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
 */
function joinaStanza(socket) {
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
    } else {
        // Crea una nuova stanza
        const nuovoId = generaIdStanza();
        const nuovaStanza = creaNuovaStanza(nuovoId);

        nuovaStanza.playersJoined = 1;
        nuovaStanza.nomiPlayer.push(username);
        nuovaStanza.sockets.push(socket);

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
        sockets: [] // Mantiene i riferimenti alle socket per comunicare direttamente
    };
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

    // Rimuove la socket e il nome del player disconnesso
    stanza.sockets = stanza.sockets.filter((s) => s.id !== socket.id);
    stanza.nomiPlayer = stanza.nomiPlayer.filter((name) => name !== username);
    stanza.playersJoined = stanza.sockets.length;

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
}

module.exports = {
    stanze,
    joinaStanza,
    creaNuovaStanza,
    disconnettiPlayer
};