/**
 * @class endMatchScene
 * @extends Phaser.Scene
 * @description Scena di fine partita (Risultati).
 * Mostra il verdetto finale dell'incontro (VITTORIA / SCONFITTA), le statistiche
 * di combattimento dettagliate e l'esperienza o ricompense accumulate dal giocatore.
 */
export default class endMatchScene extends Phaser.Scene {
    constructor() {
        super("endMatchScene");
    }

    init(data) {
        this.vinta = data.vinta;
        this.disconnessione = data.disconnessione || false;
        this.modalita = data.modalita;
        this.nomePlayer = data.nomePlayer;
        this.personaggioPlayer = data.personaggioPlayer;
        this.personaggiTot = data.personaggiTot;
        this.statsAggiornate = data.statsAggiornate;
    }

    /**
     * Creazione del tabellone dei punteggi finali.
     */
    create() {
        const isLogged = localStorage.getItem("playerLogged") === "true";

        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay end-match-panel";

        const verdictText = this.vinta ? "VITTORIA" : "SCONFITTA";
        const verdictClass = this.vinta ? "verdict-victory" : "verdict-defeat";
        const subtitleText = this.disconnessione ? "AVVERSARIO DISCONNESSO // MATCH TERMINATO" : "MATCH TERMINATO";

        let statsHtml = "";
        if (isLogged && this.statsAggiornate) {
            const expGained = this.modalita === "online" ? (this.vinta ? 5 : 2) : 2;
            const rankedPtDelta = this.modalita === "online" ? (this.vinta ? "+10 ptRanked" : "-9 ptRanked") : "";
            const rankedPtClass = this.vinta ? "positive" : "negative";

            statsHtml = `
                <div class="end-match-stats">
                    <div class="stat-item">
                        <span>MODALITÀ DI GIOCO:</span>
                        <span class="hl-cyan">${this.modalita.toUpperCase()}</span>
                    </div>
                    <div class="stat-item">
                        <span>UNITA SELEZIONATA:</span>
                        <span class="hl-pink">${this.personaggioPlayer.nome}</span>
                    </div>
                    <div class="stat-item">
                        <span>ESPERIENZA GUADAGNATA:</span>
                        <span class="stat-val-gain positive">+${expGained} EXP</span>
                    </div>
                    ${this.modalita === "online" ? `
                    <div class="stat-item">
                        <span>PUNTI RANKED:</span>
                        <span class="stat-val-gain ${rankedPtClass}">${rankedPtDelta}</span>
                    </div>
                    <div class="stat-item">
                        <span>PUNTEGGIO TOTALE:</span>
                        <span class="hl-cyan">${this.statsAggiornate.ptRanked || 0} pt</span>
                    </div>
                    <div class="stat-item">
                        <span>POSIZIONE CLASSIFICA:</span>
                        <span class="hl-pink">#${this.statsAggiornate.rankPosition || "-"}</span>
                    </div>
                    ` : ""}
                </div>

                <div class="exp-progress-container">
                    <div class="exp-level-label">
                        <span>LIVELLO ${this.statsAggiornate.level}</span>
                        <span>${this.statsAggiornate.exp} / 100 EXP</span>
                    </div>
                    <div class="exp-bar-outer">
                        <div class="exp-bar-inner" id="exp-bar-fill" style="width: 0%"></div>
                    </div>
                </div>
            `;
        } else {
            statsHtml = `
                <div class="end-match-stats" style="border-color: var(--cyber-pink); text-align: center;">
                    <div class="hl-pink" style="font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">
                        SYSTEM STATUS: GUEST
                    </div>
                    <div style="font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #fff; line-height: 1.5;">
                        Non sei loggato nel sistema.<br>
                        Le statistiche di questo incontro (EXP, Livello, Rank) non verranno salvate nel database.<br>
                        <span class="hl-cyan" style="cursor: pointer; text-decoration: underline;" id="go-login-direct">Esegui il LogIn per salvare i tuoi progressi!</span>
                    </div>
                </div>
            `;
        }

        const buttonText = this.modalita === "online" ? "RITORNA ALL'HUB // ACCETTA" : "MENU PRINCIPALE // ACCETTA";

        this.overlay.innerHTML = `
            <h2 class="cyber-title ${verdictClass}">${verdictText}</h2>
            <div class="cyber-subtitle">// ${subtitleText} //</div>
            
            ${statsHtml}

            <button class="cyber-submit-btn" id="end-match-accept-btn" style="margin-top: 25px; width: 100%; height: 45px; font-size: 15px; letter-spacing: 2px;">
                ${buttonText}
            </button>
        `;

        document.body.appendChild(this.overlay);

        // Animate EXP progress bar if logged in
        if (isLogged && this.statsAggiornate) {
            setTimeout(() => {
                const fill = document.getElementById("exp-bar-fill");
                if (fill) {
                    fill.style.width = `${this.statsAggiornate.exp}%`;
                }
            }, 100);
        }

        // Close/Accept button listener
        const acceptBtn = this.overlay.querySelector("#end-match-accept-btn");
        acceptBtn.addEventListener("click", () => {
            this.ritorna();
        });

        // If guest clicks log in link
        const loginLink = this.overlay.querySelector("#go-login-direct");
        if (loginLink) {
            loginLink.addEventListener("click", () => {
                this.ritorna(true);
            });
        }
    }

    ritorna(vaiAlLogin = false) {
        this.shutdown();
        this.scene.stop("endMatchScene");
        
        if (vaiAlLogin) {
            this.scene.start("MainMenuScene");
            this.time.delayedCall(200, () => {
                const menu = this.scene.get("MainMenuScene");
                if (menu) {
                    menu.scene.sleep();
                    menu.scene.launch("LogInScene");
                }
            });
        } else if (this.modalita === "online") {
            this.scene.start("HubScene", {
                modalita: this.modalita,
                nomePlayer: this.nomePlayer,
                livelloPlayer: this.statsAggiornate ? this.statsAggiornate.level : 1,
                personaggiTot: this.personaggiTot
            });
        } else {
            this.scene.start("MainMenuScene");
        }
    }

    /**
     * Ciclo di aggiornamento.
     */
    update() {
        // Gestione effetti grafici di fine incontro.
    }

    shutdown() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
}