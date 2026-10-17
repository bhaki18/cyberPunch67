/**
 * @class endMatchScene
 * @extends Phaser.Scene
 * @description Scena di fine partita (Risultati).
 * Mostra a sinistra il personaggio utilizzato in grande scala con titolo neon
 * "VITTORIA" o "SCONFITTA" e a destra una barra laterale DOM HTML di statistiche
 * dettagliate (EXP, Punti Ranked, Posizione in Classifica e Posizione Precedente).
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
     * Creazione degli elementi grafici e DOM di fine incontro.
     */
    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Avvia la musica dei risultati di fine match
        if (!this.sound.get("bgm_results") || !this.sound.get("bgm_results").isPlaying) {
            this.sound.play("bgm_results", { loop: true, volume: 0.35 });
        }

        const isLogged = localStorage.getItem("playerLogged") === "true";
        const { width, height } = this.scale;

        // --- 1. SFONDO SPAZIALE ANIMATO (TILE SPRITE)
        this.spaceBg = this.add.tileSprite(0, 0, width, height, "space")
            .setOrigin(0)
            .setDepth(-2);

        // --- 2. SPRITE DEL PERSONAGGIO A SINISTRA (SCALATO IN GRANDE)
        const charName = this.personaggioPlayer.dati.nome;
        let textureKey = `${charName}standing`;
        
        if (!this.textures.exists(textureKey)) {
            // Tentativo alternativo col refName
            const refName = this.personaggioPlayer.dati.nomeImgRef;
            if (this.textures.exists(`${refName}standing`)) {
                textureKey = `${refName}standing`;
            } else {
                textureKey = "framePgInventory";
            }
        }

        this.heroSprite = this.add.sprite(180, 380, textureKey)
            .setScale(4.5)
            .setDepth(2);

        // Avvio animazione di stand/respiro se configurata
        const animKey = `${charName}standing`;
        if (this.anims.exists(animKey) && textureKey !== "framePgInventory") {
            this.heroSprite.play(animKey);
        }

        // Colorazione sprite a tinta spenta se si ha perso
        if (!this.vinta) {
            this.heroSprite.setTint(0xff8888);
        }

        // --- 3. SCRITTA NEON VITTORIA / SCONFITTA FLOATING A SINISTRA
        const verdictText = this.vinta ? "VITTORIA" : "SCONFITTA";
        const colorGlow = this.vinta ? "#00ff66" : "#ff003c";
        
        const verdictStyle = {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "46px",
            fontWeight: "900",
            color: colorGlow,
            stroke: "#000000",
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: colorGlow,
                blur: 15,
                stroke: true,
                fill: true
            }
        };

        this.add.text(180, 110, verdictText, verdictStyle)
            .setOrigin(0.5)
            .setDepth(3);

        // --- 4. CARICA OVERLAY DI DESTRA (SIDEBAR STATS IN HTML DOM)
        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay end-match-panel";

        const subtitleText = this.disconnessione ? "AVVERSARIO SCOLLEGATO" : "MATCH TERMINATO";

        // Estrazione valori di guadagno e standing
        const expGained = this.modalita === "online" ? (this.vinta ? 5 : 2) : 2;
        const ptsGainedVal = this.modalita === "online" ? (this.vinta ? 10 : -9) : 0;
        
        const ptsGainedSign = ptsGainedVal > 0 ? `+${ptsGainedVal}` : `${ptsGainedVal}`;
        const ptsGainedClass = ptsGainedVal >= 0 ? "positive" : "negative";

        let rankPosition = "-";
        let rankPositionPrecedente = "-";
        
        if (isLogged && this.statsAggiornate) {
            rankPosition = this.statsAggiornate.rankPosition || "-";
            rankPositionPrecedente = this.statsAggiornate.rankPositionPrecedente || "-";
        }

        let statsCardHtml = "";
        if (isLogged) {
            statsCardHtml = `
                <div class="end-match-stats" style="flex-grow: 1; margin: 15px 0; display: flex; flex-direction: column; justify-content: center; gap: 14px;">
                    <div class="stat-item" style="border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 8px;">
                        <span>MODALITÀ DI GIOCO:</span>
                        <span class="hl-cyan">${this.modalita.toUpperCase()}</span>
                    </div>
                    <div class="stat-item" style="border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 8px;">
                        <span>EXP GUADAGNATO:</span>
                        <span class="stat-val-gain positive">+${expGained} EXP</span>
                    </div>
                    <div class="stat-item" style="border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 8px;">
                        <span>PUNTI GUADAGNATI:</span>
                        <span class="stat-val-gain ${ptsGainedClass}">${ptsGainedSign} pt Ranked</span>
                    </div>
                    <div class="stat-item" style="border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 8px;">
                        <span>POSIZIONE ATTUALE:</span>
                        <span class="hl-cyan">#${rankPosition}</span>
                    </div>
                    <div class="stat-item" style="padding-bottom: 4px;">
                        <span>POSIZIONE PRECEDENTE:</span>
                        <span class="hl-pink">#${rankPositionPrecedente}</span>
                    </div>
                </div>

                ${this.statsAggiornate ? `
                <div class="exp-progress-container" style="margin-bottom: 15px;">
                    <div class="exp-level-label">
                        <span>LIVELLO ${this.statsAggiornate.level}</span>
                        <span>${this.statsAggiornate.exp} / 100 EXP</span>
                    </div>
                    <div class="exp-bar-outer">
                        <div class="exp-bar-inner" id="exp-bar-fill" style="width: 0%"></div>
                    </div>
                </div>
                ` : `
                <div style="font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; margin-bottom: 15px; line-height: 1.3;">
                    (Connessione instabile. Dati salvati sul server, ma aggiornamento grafico non sincronizzato)
                </div>
                `}
            `;
        } else {
            statsCardHtml = `
                <div class="end-match-stats" style="flex-grow: 1; border-color: var(--cyber-pink); text-align: center; display: flex; flex-direction: column; justify-content: center; gap: 15px; margin: 20px 0;">
                    <div class="hl-pink" style="font-family: 'Orbitron', sans-serif; font-size: 15px; font-weight: bold;">
                        SYSTEM STATUS: GUEST
                    </div>
                    <div style="font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #fff; line-height: 1.5;">
                        Non sei loggato nel sistema.<br>
                        Le statistiche di questo incontro non verranno salvate nel database.<br>
                        <span class="hl-cyan" style="cursor: pointer; text-decoration: underline;" id="go-login-direct">Esegui il LogIn per salvare i tuoi progressi!</span>
                    </div>
                </div>
            `;
        }

        const buttonText = this.modalita === "online" ? "ACCETTA // ALL'HUB" : "ACCETTA // MENU";

        this.overlay.innerHTML = `
            <h2 class="cyber-title" style="font-size: 20px; letter-spacing: 3px; border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 10px; margin-bottom: 10px;">DATI INCONTRO</h2>
            <div class="cyber-subtitle" style="font-size: 10px;">// ${subtitleText} //</div>
            
            ${statsCardHtml}

            <button class="cyber-submit-btn" id="end-match-accept-btn" style="width: 100%; height: 42px; font-size: 13px; letter-spacing: 2px; margin-top: auto;">
                ${buttonText}
            </button>
        `;

        document.body.appendChild(this.overlay);

        // Funzione per posizionare e scalare l'overlay HTML esattamente a destra del canvas di Phaser
        const posizionaOverlay = () => {
            if (!this.overlay || !this.game || !this.game.canvas) return;

            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = rect.width / 800;
            const scaleY = rect.height / 600;

            this.overlay.style.position = "absolute";
            this.overlay.style.setProperty("left", `${rect.left + 390 * scaleX}px`, "important");
            this.overlay.style.setProperty("right", "auto", "important");
            this.overlay.style.setProperty("top", `${rect.top + 50 * scaleY}px`, "important");
            this.overlay.style.setProperty("transform", "none", "important");
            this.overlay.style.setProperty("width", `${380 * scaleX}px`, "important");
            this.overlay.style.setProperty("height", `${500 * scaleY}px`, "important");
            
            // Imposta il fattore di scala per le proprietà CSS interne (padding, margin, font-size)
            this.overlay.style.setProperty("--scale-factor", scaleY);
            
            // Imposta la dimensione font base e padding in base allo scaling
            const baseFontSize = Math.max(11, 14 * scaleY);
            this.overlay.style.fontSize = `${baseFontSize}px`;
            this.overlay.style.padding = `${26 * scaleY}px ${24 * scaleX}px`;

            // Scala proporzionalmente i titoli e i pulsanti
            const title = this.overlay.querySelector(".cyber-title");
            if (title) title.style.fontSize = `${20 * scaleY}px`;

            const btn = this.overlay.querySelector("#end-match-accept-btn");
            if (btn) btn.style.height = `${42 * scaleY}px`;
        };

        posizionaOverlay();

        // Registra i listener di resize per ricalcolare la posizione
        this.posizionaOverlayListener = posizionaOverlay;
        this.scale.on("resize", posizionaOverlay);
        window.addEventListener("resize", posizionaOverlay);

        // Animazione della progress bar dell'esperienza
        if (isLogged && this.statsAggiornate) {
            setTimeout(() => {
                const fill = document.getElementById("exp-bar-fill");
                if (fill) {
                    fill.style.width = `${this.statsAggiornate.exp}%`;
                }
            }, 100);
        }

        // Listener del bottone di accettazione/ritorno
        const acceptBtn = this.overlay.querySelector("#end-match-accept-btn");
        acceptBtn.addEventListener("mouseenter", () => {
            this.sound.play("btn_hover", { volume: 0.25 });
        });
        acceptBtn.addEventListener("click", () => {
            this.sound.play("btn_click", { volume: 0.45 });
            this.ritorna();
        });

        const loginLink = this.overlay.querySelector("#go-login-direct");
        if (loginLink) {
            loginLink.addEventListener("click", () => {
                this.sound.play("btn_click", { volume: 0.45 });
                this.ritorna(true);
            });
        }
    }

    /**
     * Ciclo di aggiornamento.
     */
    update() {
        if (this.spaceBg) {
            this.spaceBg.tilePositionX += 0.25;
        }
    }

    ritorna(vaiAlLogin = false) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
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
        });
    }

    shutdown() {
        this.sound.stopByKey("bgm_results");
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.posizionaOverlayListener) {
            this.scale.off("resize", this.posizionaOverlayListener);
            window.removeEventListener("resize", this.posizionaOverlayListener);
            this.posizionaOverlayListener = null;
        }
    }
}