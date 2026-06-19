/**
 * @class InfoScene
 * @extends Phaser.Scene
 * @description Scena delle Informazioni di Gioco (Info e Crediti).
 * Mostra le istruzioni sui comandi di gioco, le modalità di gioco,
 * e i crediti del team di sviluppo tramite un overlay DOM cyberpunk.
 */
export default class InfoScene extends Phaser.Scene {
    constructor() {
        super("InfoScene");
    }

    create() {
        this.overlay = document.createElement("div");
        this.overlay.className = "cyber-modal-overlay info-panel";
        this.overlay.innerHTML = `
            <button class="cyber-close-btn" id="info-close-btn" title="Close">&#215;</button>

            <h2 class="cyber-title">CYBERPUNCH<span class="cyber-accent">67</span></h2>
            <div class="cyber-subtitle">// INTEL DATABASE //</div>

            <div class="info-tabs">
                <button class="info-tab active" data-tab="game">GIOCO</button>
                <button class="info-tab" data-tab="controls">TASTI</button>
                <button class="info-tab" data-tab="credits">CREDITI</button>
            </div>

            <div class="info-content">

                <!-- TAB: GIOCO -->
                <div class="tab-panel active" id="tab-game">
                    <p class="info-intro">
                        Picchiaduro 2D sviluppato con <span class="hl-cyan">PhaserJS</span>.
                        Sistema di <span class="hl-pink">ranking a punti</span> basato su vittorie e sconfitte.
                        Personaggi sbloccabili salendo di livello.
                    </p>

                    <div class="info-mode-card">
                        <div class="mode-badge offline">OFFLINE</div>
                        <p>Affronta <span class="hl-cyan">100 NPC</span> in ondate da 2.
                        I bot sono deboli singolarmente — la forza sta nei numeri.
                        Sconfiggili tutti con ogni personaggio per guadagnare <span class="hl-pink">EXP</span>.</p>
                    </div>

                    <div class="info-mode-card">
                        <div class="mode-badge online">ONLINE</div>
                        <p>Picchiaduro classico <span class="hl-cyan">1v1</span> gestito dal server.
                        Connettiti a una room, scegli il tuo personaggio e combatti.
                        Vinci per salire in <span class="hl-pink">Ranked</span>, perdi e scendi.</p>
                    </div>

                    <div class="info-tag-row">
                        <span class="info-tag">&#9670; Arena casuale ad ogni match</span>
                        <span class="info-tag">&#9670; Gioco in sviluppo</span>
                    </div>
                </div>

                <!-- TAB: TASTI -->
                <div class="tab-panel" id="tab-controls">
                    <div class="controls-grid">
                        <div class="key-row">
                            <div class="key-group movement">
                                <div class="key-label">MOVIMENTO</div>
                                <div class="key-layout">
                                    <div class="key ghost"></div>
                                    <div class="key">W</div>
                                    <div class="key ghost"></div>
                                    <div class="key">A</div>
                                    <div class="key">S</div>
                                    <div class="key">D</div>
                                </div>
                            </div>
                            <div class="key-group attacks">
                                <div class="key-label">ATTACCHI</div>
                                <div class="key-layout flat">
                                    <div class="key cyan">Z<span class="key-desc">ATK 1</span></div>
                                    <div class="key pink">X<span class="key-desc">ATK 2</span></div>
                                    <div class="key yellow">C<span class="key-desc">SPECIAL</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="info-tag-row" style="margin-top:18px">
                        <span class="info-tag">&#9670; WASD per muoversi e saltare</span>
                        <span class="info-tag">&#9670; Z X C per attaccare</span>
                    </div>
                </div>

                <!-- TAB: CREDITI -->
                <div class="tab-panel" id="tab-credits">
                    <div class="credits-card">
                        <div class="credits-role">SVILUPPATORE</div>
                        <div class="credits-name">Angelo Del Piano</div>
                        <a class="credits-email" href="mailto:angelodelpiano2317@gmail.com">
                            &#9993; angelodelpiano2317@gmail.com
                        </a>
                    </div>
                    <div class="credits-tech">
                        <div class="credits-role" style="margin-bottom:10px">STACK TECNOLOGICO</div>
                        <div class="tech-pills">
                            <span class="tech-pill">PhaserJS</span>
                            <span class="tech-pill">Node.js</span>
                            <span class="tech-pill">Socket.io</span>
                            <span class="tech-pill">Tiled</span>
                        </div>
                    </div>
                    <div class="info-tag-row" style="margin-top:18px">
                        <span class="info-tag">&#9670; Ver. Alpha &mdash; In sviluppo</span>
                    </div>
                </div>

            </div>
        `;

        document.body.appendChild(this.overlay);

        // --- TAB SWITCHING
        const tabs = this.overlay.querySelectorAll(".info-tab");
        const panels = this.overlay.querySelectorAll(".tab-panel");

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));
                tab.classList.add("active");
                this.overlay.querySelector(`#tab-${tab.dataset.tab}`).classList.add("active");
            });
        });

        // --- CLOSE BUTTON (DOM)
        const closeBtn = this.overlay.querySelector("#info-close-btn");
        closeBtn.addEventListener("click", () => {
            this.shutdown();
            this.scene.stop("InfoScene");
            this.scene.wake("MainMenuScene");
        });
    }

    update() {}

    shutdown() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
}