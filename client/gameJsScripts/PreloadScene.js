/**
 * @class PreloadScene
 * @extends Phaser.Scene
 * @description Scena di Caricamento Principale (Preload).
 * Carica in memoria tutte le risorse del gioco (immagini, spritesheet, mappe Tiled JSON, sfondi).
 * Mostra a schermo una barra di avanzamento dinamica con effetti di bagliore (glow)
 * e testi descrittivi dello stato dell'inizializzazione del sistema.
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
        
        // Tracciamento particelle e animazioni di ingresso/uscita
        this.parecelleSfondo;
        this.OggettiInPreloadScene = [];
        this.alphaOggettiInPreloadScene = 0;
        this.animationPreloadScene1CanStart;
        this.animationPreloadScene2CanStart;
        this.textCliccaPerIniziare;
        this.OggettiInPreloadSceneAnimation2 = [];
        this.alphaOggettiInPreloadSceneAnimation2 = 0;
        this.animationChangeSceneCanStart = false;
        this.oggettiSoloInPreloadScene = [];
    }

    /**
     * Fase di caricamento degli asset e configurazione della barra di caricamento visiva.
     */
    preload() {
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

        // --- 2. AVVIO DEL CARICAMENTO DEGLI ASSET DI GIOCO (MAIN MENU, ARENE, PLAYER)
        this.loadMainMenu();

        // --- 3. CREAZIONE DELLA BARRA DI CARICAMENTO GRAFICA (PHASER GRAPHICS)
        const x = this.cameras.main.centerX;
        const y = this.cameras.main.centerY;
        const width = 400;

        // Inizializza i due livelli grafici (background nero e fill colorato)
        this.backgroundLineaDiCaricamento = this.add.graphics().setDepth(1).setAlpha(0);
        this.fillLineaDiCaricamento = this.add.graphics().setDepth(2).setAlpha(0);
        
        // Registra gli oggetti per le dissolvenze finali
        this.OggettiInPreloadScene.push(this.backgroundLineaDiCaricamento, this.fillLineaDiCaricamento);
        this.oggettiSoloInPreloadScene.push(this.backgroundLineaDiCaricamento, this.fillLineaDiCaricamento);

        // Disegna la linea di sfondo grigia per la barra
        this.backgroundLineaDiCaricamento.lineStyle(50, 0x222244, 1);
        this.backgroundLineaDiCaricamento.beginPath();
        this.backgroundLineaDiCaricamento.moveTo(x - width / 2, y);
        this.backgroundLineaDiCaricamento.lineTo(x + width / 2, y);
        this.backgroundLineaDiCaricamento.strokePath();

        // --- 4. TEXT FEEDBACK DI CARICAMENTO SISTEMA
        this.loadingText = this.add.text(x, y + 60, "INITIALIZING...", {
            fontFamily: "monospace",
            fontSize: "18px",
            color: "#66ffff",
            letterSpacing: 2
        })
            .setAlpha(0)
            .setOrigin(0.5)
            .setDepth(3);

        this.oggettiSoloInPreloadScene.push(this.loadingText);
        this.OggettiInPreloadScene.push(this.loadingText);

        // Listener sull'avanzamento del caricamento (progresso da 0.0 a 1.0)
        this.load.on("progress", (value) => {
            this.fillLineaDiCaricamento.clear();

            // Disegna il glow esterno sfocato (linea più spessa con alpha basso)
            this.fillLineaDiCaricamento.lineStyle(70, 0x00ffff, 0.15);
            this.fillLineaDiCaricamento.beginPath();
            this.fillLineaDiCaricamento.moveTo(x - width / 2, y);
            this.fillLineaDiCaricamento.lineTo(x - width / 2 + width * value, y);
            this.fillLineaDiCaricamento.strokePath();

            // Disegna il nucleo centrale luminoso della barra
            this.fillLineaDiCaricamento.lineStyle(50, 0x66ffff, 1);
            this.fillLineaDiCaricamento.beginPath();
            this.fillLineaDiCaricamento.moveTo(x - width / 2, y);
            this.fillLineaDiCaricamento.lineTo(x - width / 2 + width * value, y);
            this.fillLineaDiCaricamento.strokePath();

            // Aggiorna dinamicamente i testi in base alla percentuale di caricamento
            if (value < 0.25)
                this.loadingText.setText("INITIALIZING SYSTEMS");
            else if (value < 0.50)
                this.loadingText.setText("LOADING ASSETS");
            else if (value < 0.75)
                this.loadingText.setText("PREPARING ENTITIES");
            else
                this.loadingText.setText("FINALIZING STARTUP");
        });

        // --- 5. TESTO DI ATTESA "CLICK TO START" (DOPO IL PRELOAD)
        this.textCliccaPerIniziare = this.add.text(
            x,
            y + 130,
            "CLICK TO START",
            {
                fontFamily: "monospace",
                fontSize: "32px",
                color: "#ffffff",
                letterSpacing: 6
            }
        )
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(3);
            
        this.OggettiInPreloadSceneAnimation2.push(this.textCliccaPerIniziare);
        this.oggettiSoloInPreloadScene.push(this.textCliccaPerIniziare);

        // Al completamento del caricamento, attende un input utente per avviare il menu principale
        this.load.on("complete", () => {
            this.input.once("pointerdown", () => {
                this.animationChangeSceneCanStart = true;
            });
        });
    }

    /**
     * Inizializzazione della grafica di sfondo e avvio delle particelle.
     */
    create() {
        // Render dello sprite di sfondo
        const bg = this.add.sprite(400, 300, "sfondoPreloadScene")
            .setScale(9)
            .setDepth(-2);
            
        // Setup del sistema di particelle spaziali mobili
        const particellaBg = [];
        const numeroDiParticelle = 25;
        for (let i = 0; i < numeroDiParticelle; i++) {
            const particella = this.add.image(
                Phaser.Math.Between(1, 800), 
                Phaser.Math.Between(1, 600), 
                "particellaSfondo"
            )
                .setScale(0.3)
                .setDepth(-1);
            particellaBg.push(particella);
        }

        this.parecelleSfondo = particellaBg;

        // Registrazione dell'animazione ciclica dello sfondo spaziale
        this.anims.create({
            key: "animsSfondo",
            frames: this.anims.generateFrameNumbers("sfondoPreloadScene", {
                start: 0,
                end: 2
            }),
            frameRate: 1,
            repeat: -1
        });

        // Avvio animazione dello sfondo
        bg.play("animsSfondo");

        // Associazione degli elementi all'array globale per la gestione delle dissolvenze
        this.parecelleSfondo.forEach(a => {
            this.OggettiInPreloadScene.push(a);
        });
        
        this.OggettiInPreloadScene.push(bg);
        
        // Imposta inizialmente a zero l'opacità di tutti gli elementi
        this.OggettiInPreloadScene.forEach(a => {
            a.setAlpha(this.alphaOggettiInPreloadScene);
        });

        this.OggettiInPreloadSceneAnimation2.forEach(a => {
            a.setAlpha(this.alphaOggettiInPreloadSceneAnimation2);
        });

        // Trigger di inizio animazione di ingresso
        setTimeout(() => {
            this.animationPreloadScene1CanStart = true;
        }, 300);

        this.backgroundPreloadingScene = bg;

        // Registrazione delle animazioni del personaggio principale (Dominant Red) nel MainMenu
        this.createAnimationMainMenu();
    }

    /**
     * loop logico di rendering e animazione degli elementi della PreloadScene.
     */
    update() {
        // Movimento costante diagonale delle particelle dello sfondo (effetto vento solare)
        this.parecelleSfondo.forEach(a => {
            const partecellSpeed = 0.2;
            a.x += partecellSpeed;
            a.y -= partecellSpeed;

            // Riposizionamento ciclico delle particelle che escono dai bordi dello schermo
            (a.x > 800) ? a.x = 0 : a.x;
            (a.y < 0) ? a.y = 600 : a.y;
        });

        // --- DISSOLVENZA 1: Ingresso graduale della barra e dello sfondo (fade-in)
        if (this.animationPreloadScene1CanStart) {
            this.alphaOggettiInPreloadScene += 0.003;
            this.OggettiInPreloadScene.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadScene);
            });
            if (this.alphaOggettiInPreloadScene >= 1) {
                this.animationPreloadScene1CanStart = false;
                this.animationPreloadScene2CanStart = true;
            }
        }

        // --- DISSOLVENZA 2: Ingresso della scritta "CLICK TO START"
        if (this.animationPreloadScene2CanStart) {
            this.alphaOggettiInPreloadSceneAnimation2 += 0.01;
            this.OggettiInPreloadSceneAnimation2.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadSceneAnimation2);
            });
            if (this.alphaOggettiInPreloadSceneAnimation2 >= 1) {
                this.animationPreloadScene2CanStart = false;
                this.animationPreloadScene3CanStart = true;
            }
        }

        // --- DISSOLVENZA 3: Effetto pulsante infinito sulla scritta "CLICK TO START"
        if (this.animationPreloadScene3CanStart) {
            this.tweens.add({
                targets: this.textCliccaPerIniziare,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            this.animationPreloadScene3CanStart = false;
        }

        // --- DISSOLVENZA 4: Uscita sequenziale e transizione al MainMenuScene
        if (this.animationChangeSceneCanStart) {
            this.alphaOggettiInPreloadScene -= 0.01;
            this.oggettiSoloInPreloadScene.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadScene);
            });
            this.parecelleSfondo.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadScene);
            });
            this.backgroundPreloadingScene.setAlpha(1); // Mantiene lo sfondo visibile
            
            if (this.alphaOggettiInPreloadScene <= 0) {
                this.scene.start("MainMenuScene");
            }
        }
    }

    /**
     * Carica tutte le risorse del gioco per evitare micro-scatti durante le transizioni.
     */
    loadMainMenu() {
        // Caricamento mappe e tileset esportati da Tiled
        this.load.tilemapTiledJSON(
            "MapArenaFluttuante",
            "../assets/arenaFluttuante/map.json"
        );
        this.load.image("tilesArenaFluttuante", "../assets/arenaFluttuante/spritesheet.png");

        // Sfondo stellato a ripetizione
        this.load.image("space", "../assets/PreloadScene/space.png");

        // --- CARICAMENTO SPRITESHEETS DEI BOTTONI DEL MENU PRINCIPALE
        // Pulsante Gioca Offline (Stato Normale, Hover, Clicked)
        this.load.spritesheet("playOfflineBtn", "../assets/MainMenuScene/playOfflineButtonSpriteSheet.png", {
            frameWidth: 124,
            frameHeight: 41
        });

        // Pulsante Gioca Online
        this.load.spritesheet("playOnlineBtn", "../assets/MainMenuScene/playOnlineButtonSpriteSheet.png", {
            frameWidth: 124,
            frameHeight: 41
        });

        // Pulsante Inventario
        this.load.spritesheet("inventoryBtn", "../assets/MainMenuScene/inventoryButtonSpriteSheet.png", {
            frameWidth: 124,
            frameHeight: 41
        });

        // Pulsante Informazioni/Opzioni
        this.load.spritesheet("infoBtn", "../assets/MainMenuScene/infoButtonSpriteSheet.png", {
            frameWidth: 124,
            frameHeight: 41
        });

        // Pulsante Accesso (LogIn)
        this.load.spritesheet("logInBtn", "../assets/MainMenuScene/logInButtonSpriteSheet.png", {
            frameWidth: 64,
            frameHeight: 64
        });

        // --- CARICAMENTO RISORSE GRAFICHE DEL PERSONAGGIO "DOMINANT RED"
        this.load.image("dominantRedStanding", "../assets/MainMenuScene/dominantRedStanding.png");
        this.load.image("dominantRedLanding", "../assets/MainMenuScene/dominantRedLanding.png");
        this.load.image("dominantRedFalling", "../assets/MainMenuScene/dominantRedFalling.png");
        this.load.image("dominantRedHighKickingR", "../assets/MainMenuScene/dominantRedHighKickingR.png");
        this.load.image("dominantRedHighKickingL", "../assets/MainMenuScene/dominantRedHighKickingL.png");
        this.load.image("dominantRedHighPunchingR", "../assets/MainMenuScene/dominantRedHighPunchingR.png");
        this.load.image("dominantRedHighPunchingL", "../assets/MainMenuScene/dominantRedHighPunchingL.png");
        this.load.image("dominantRedIspira", "../assets/MainMenuScene/dominantRedIspira.png");
        this.load.image("dominantRedEspira", "../assets/MainMenuScene/dominantRedEspira.png");

        // Barra grafica contenente il nome e livello del giocatore loggato
        this.load.image("barraGiocatore", "../assets/MainMenuScene/barraGiocatore.png");
    }

    /**
     * Crea le animazioni globali riutilizzabili per il menu di gioco.
     */
    createAnimationMainMenu() {
        // Animazione del respiro del player (idle breath)
        this.anims.create({
            key: "dominantRedBreathing",
            frames: [
                { key: "dominantRedIspira" },
                { key: "dominantRedStanding" },
                { key: "dominantRedEspira" }
            ],
            frameRate: 1.5,
            repeat: -1
        });

        // Animazione del player in attesa (mosse acrobatiche casuali a schermo)
        this.anims.create({
            key: "dominantRedWaitingR",
            frames: [
                { key: "dominantRedHighKickingR" },
                { key: "dominantRedStanding" },
                { key: "dominantRedHighPunchingR" },
                { key: "dominantRedStanding" }
            ],
            frameRate: 2,
            repeat: -1
        });
    }
}
