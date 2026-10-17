/**
 * @class LeaderboardScene
 * @extends Phaser.Scene
 * @description Scena della Classifica Generale (Leaderboard).
 * Recupera la classifica dei migliori giocatori dal database tramite WebSocket,
 * visualizzandola in una tabella cyberpunk responsive con overlay DOM HTML.
 */
export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super("LeaderboardScene");
    }

    create() {
        this.sound.play("modal_open", { volume: 0.35 });
        this.socket = window.socket;

        // Crea il form contenitore overlay HTML
        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay leaderboard-panel";

        // Renders visualizzazione iniziale (Caricamento in corso)
        this.overlay.innerHTML = `
            <button class="cyber-close-btn" id="leaderboard-close-btn" title="Chiudi">&times;</button>
            <h2 class="cyber-title">CLASSIFICA</h2>
            <div class="cyber-subtitle">// GENERAL DATABASE //</div>
            
            <div class="cyber-loader" id="leaderboard-loader" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 50px 0;">
                <div class="cyber-spinner"></div>
                <span style="font-family: 'Share Tech Mono', monospace; font-size: 13px; color: var(--cyber-cyan); margin-top: 15px; letter-spacing: 2px;">
                    RECUPERO DATI CLASSIFICA...
                </span>
            </div>
            
            <div class="leaderboard-content" id="leaderboard-content-wrapper" style="display: none;">
                <div class="leaderboard-table-container">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th style="width: 15%;">RANK</th>
                                <th style="width: 50%;">PLAYER</th>
                                <th style="width: 15%;">LIVELLO</th>
                                <th style="width: 20%;">PUNTI</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboard-tbody">
                            <!-- Popolato dinamicamente da risposta server -->
                        </tbody>
                    </table>
                </div>
                
                <div class="leaderboard-footer" id="leaderboard-footer-stats">
                    <!-- Statistiche personali sbloccate -->
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Bottone di chiusura
        const closeBtn = this.overlay.querySelector("#leaderboard-close-btn");
        closeBtn.addEventListener("click", () => {
            this.chiudi();
        });

        // Richiedi i dati aggiornati della classifica al server
        if (this.socket) {
            this.socket.emit("richiediClassifica");

            this.socket.once("rispostaClassifica", (data) => {
                this.sound.play("access_granted", { volume: 0.35 });
                this.popolaClassifica(data);
            });
        } else {
            // Se nessun socket è configurato, mostra un errore
            const loader = this.overlay.querySelector("#leaderboard-loader");
            if (loader) {
                loader.innerHTML = `
                    <span class="hl-pink" style="font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: bold;">
                        SYSTEM_ERROR // CONNESSIONE ASSENTE
                    </span>
                `;
            }
        }
    }

    popolaClassifica(data) {
        const loader = this.overlay.querySelector("#leaderboard-loader");
        const wrapper = this.overlay.querySelector("#leaderboard-content-wrapper");
        const tbody = this.overlay.querySelector("#leaderboard-tbody");
        const footer = this.overlay.querySelector("#leaderboard-footer-stats");

        if (loader) loader.style.display = "none";
        if (wrapper) wrapper.style.display = "block";

        if (!data || !data.classifica || data.classifica.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: rgba(255,255,255,0.4); padding: 25px;">
                        Nessun dato disponibile nel database.
                    </td>
                </tr>
            `;
            return;
        }

        // Genera righe della tabella
        let rowsHtml = "";
        const mioUsername = window.player ? window.player.username : "";

        data.classifica.forEach((giocatore, index) => {
            const rank = index + 1;
            let rankDisplay = `#${rank}`;
            let badgeClass = "";

            if (rank === 1) badgeClass = "rank-1";
            else if (rank === 2) badgeClass = "rank-2";
            else if (rank === 3) badgeClass = "rank-3";

            if (badgeClass) {
                rankDisplay = `<span class="rank-badge ${badgeClass}">${rank}</span>`;
            }

            const isMyRow = mioUsername && giocatore.username.toLowerCase() === mioUsername.toLowerCase();
            const rowClass = isMyRow ? 'class="my-row"' : "";

            rowsHtml += `
                <tr ${rowClass}>
                    <td>${rankDisplay}</td>
                    <td style="text-transform: uppercase;">${giocatore.username}</td>
                    <td>LV ${giocatore.level || 1}</td>
                    <td>${giocatore.ptRanked || 0}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;

        // Popola statistiche footer personale
        const posPersonale = data.posizioneMioPlayer > 0 ? `#${data.posizioneMioPlayer}` : "N/D";
        const puntiPersonali = data.puntiMioPlayer !== undefined ? data.puntiMioPlayer : 0;

        footer.innerHTML = `
            <span>IL TUO STATO: <span class="hl-val">${posPersonale} POSIZIONE</span></span>
            <span>PUNTEGGIO: <span class="hl-val">${puntiPersonali} pt</span></span>
        `;
    }

    chiudi() {
        this.sound.play("modal_close", { volume: 0.35 });
        this.shutdown();
        this.scene.stop("LeaderboardScene");
        this.scene.wake("MainMenuScene");
    }

    shutdown() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.socket) {
            this.socket.off("rispostaClassifica");
        }
    }
}
