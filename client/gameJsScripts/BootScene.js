/**
 * @class BootScene
 * @extends Phaser.Scene
 * @description Prima scena del gioco all'avvio.
 * Carica le immagini del logo ed esegue una sequenza temporizzata di dissolvenza
 * (fade in / fade out) simile a un logo introduttivo (es. "Made with Unity"),
 * avviando poi la SystemScene parallela e procedendo alla PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");

        // Proprietà di tracciamento dello stato dell'animazione dei loghi
        this.logoDelGioco;
        this.logoDiPhaserJS;
        this.animationCanStart = false;
        this.logoDelGiocoAlpha = 0;
        this.animation2CanStart = false;
        this.animation3CanStart = false;
        this.logoDiPhaserJSAlpha = 0;
        this.animation4CanStart = false;
    }

    /**
     * Pre-carica gli elementi visivi minimi necessari per l'introduzione
     * e lancia in parallelo la scena persistente di sistema.
     */
    preload() {
        // Avvia la SystemScene in background per gestire fin da subito l'F5 (fullscreen) e stati globali
        this.scene.launch("SystemScene");

        // Caricamento dei loghi introduttivi
        this.load.image("logoDelGioco", "../assets/BootScene/logoDelGioco.png");
        this.load.image("logoDiPhaserJS", "../assets/BootScene/logoDiPhaserJS.png");


        // --- 1. CARICAMENTO DELLE RISORSE LOCALI DELLA SCHERMATA DI PRELOAD
        // Sfondo animato in formato spritesheet
        this.load.spritesheet(
            "sfondoPreloadScene",
            "../assets/PreloadScene/sfondoPreloadScene.png",
            {
                frameWidth: 128,
                frameHeight: 64
            }
        );

        // Immagine delle singole particelle a schermo
        this.load.image("particellaSfondo", "../assets/PreloadScene/particellaPreloadScene.png");

        // Sfondo stellato a ripetizione
        this.load.image("space", "../assets/PreloadScene/space.png");
    }

    /**
     * Inizializzazione della scena, posizionamento dei loghi a centro schermo
     * e configurazione dei controlli di tastiera.
     */
    create() {
        const H = 600;
        const W = 800;

        const centroX = W / 2;
        const centroY = H / 2;

        // Posiziona il logo principale del gioco (invisibile inizialmente)
        this.logoDelGioco = this.add.image(centroX, centroY, "logoDelGioco")
            .setAlpha(0)
            .setScale(0.5);

        // Posiziona il logo di Phaser (invisibile inizialmente)
        this.logoDiPhaserJS = this.add.image(centroX, centroY, "logoDiPhaserJS")
            .setAlpha(0)
            .setScale(0.3);

        // Gestione alternativa dello Schermo Intero tramite tasto F3
        const f11 = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F3
        );

        f11.on("down", () => {
            if (this.game.scale.isFullscreen) {
                this.game.scale.stopFullscreen();
            } else {
                this.game.scale.startFullscreen();
            }
        });

        // Avvio temporizzato della prima animazione dopo 500ms
        setTimeout(() => {
            this.animationCanStart = true;
        }, 500);
    }

    /**
     * Aggiornamento logico dei fotogrammi.
     * Gestisce la macchina a stati sequenziale che regola le dissolvenze dei loghi.
     */
    update() {
        // --- STATO 1: Fade-in del logo principale del gioco
        if (this.animationCanStart) {
            this.logoDelGiocoAlpha += 0.01;
            this.logoDelGioco.setAlpha(this.logoDelGiocoAlpha);
            if (this.logoDelGiocoAlpha >= 1) {
                this.animationCanStart = false;
                setTimeout(() => {
                    this.animation2CanStart = true;
                }, 500); // Rimane visibile per 500ms al massimo splendore
            }
        }

        // --- STATO 2: Fade-out del logo principale del gioco
        if (this.animation2CanStart) {
            this.logoDelGiocoAlpha -= 0.01;
            this.logoDelGioco.setAlpha(this.logoDelGiocoAlpha);
            if (this.logoDelGiocoAlpha <= 0) {
                this.animation2CanStart = false;
                setTimeout(() => {
                    this.animation3CanStart = true;
                }, 300); // Attesa di 300ms prima del prossimo logo
            }
        }

        // --- STATO 3: Fade-in del logo di PhaserJS
        if (this.animation3CanStart) {
            this.logoDiPhaserJSAlpha += 0.01;
            this.logoDiPhaserJS.setAlpha(this.logoDiPhaserJSAlpha);
            if (this.logoDiPhaserJSAlpha >= 1) {
                this.animation3CanStart = false;
                setTimeout(() => {
                    this.animation4CanStart = true;
                }, 500); // Rimane visibile per 500ms
            }
        }

        // --- STATO 4: Fade-out del logo di PhaserJS e transizione finale
        if (this.animation4CanStart) {
            this.logoDiPhaserJSAlpha -= 0.01;
            this.logoDiPhaserJS.setAlpha(this.logoDiPhaserJSAlpha);
            if (this.logoDiPhaserJSAlpha <= 0) {
                this.animation4CanStart = false;
                setTimeout(() => {
                    // Transizione alla scena di caricamento principale degli asset del gioco
                    this.scene.start("PreloadScene");
                }, 300);
            }
        }
    }
}
