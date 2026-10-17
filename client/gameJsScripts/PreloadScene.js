/**
 * @class PreloadScene
 * @extends Phaser.Scene
 * @description Scena di Caricamento Principale (Preload).
 * Carica in memoria tutte le risorse del gioco (immagini, spritesheet, mappe Tiled JSON, sfondi).
 * Mostra a schermo una barra di avanzamento dinamica con effetti di bagliore (glow)
 * e testi descrittivi dello stato dell'inizializzazione del sistema.
 */
import caricaPersonaggiTot from "../modules/personaggi.js";
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


        // --- 2. AVVIO DEL CARICAMENTO DEGLI ASSET DI GIOCO (MAIN MENU, ARENE, PLAYER, AUDIO)
        this.loadMainMenu();
        this.loadInventory();
        this.loadHub();
        this.loadArena();
        this.loadAudio();

        // --- 3. CREAZIONE DELLA BARRA DI CARICAMENTO GRAFICA (PHASER GRAPHICS)
        // --- 1. SFONDO E PARTICELLE (CARICATI DA BOOTSCENE) ---
        this.backgroundPreloadingScene = this.add.sprite(400, 300, "sfondoPreloadScene")
            .setScale(9)
            .setDepth(-2);
        this.OggettiInPreloadScene.push(this.backgroundPreloadingScene);

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
            this.OggettiInPreloadScene.push(particella);
        }
        this.parecelleSfondo = particellaBg;

        const x = this.cameras.main.centerX;
        const y = this.cameras.main.centerY;
        const width = 400;

        // Inizializza i due livelli grafici (background nero e fill colorato) a piena opacità
        this.backgroundLineaDiCaricamento = this.add.graphics().setDepth(1);
        this.fillLineaDiCaricamento = this.add.graphics().setDepth(2);

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
                this.sound.play("game_start", { volume: 0.5 });
                this.animationChangeSceneCanStart = true;
            });
        });
    }

    /**
     * Inizializzazione della grafica di sfondo e avvio delle particelle.
     */
    create() {
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
        this.backgroundPreloadingScene.play("animsSfondo");

        // Poiché gli oggetti sono già visibili a schermo durante il caricamento,
        // impostiamo alpha a 1 e passiamo direttamente alla visualizzazione di "CLICK TO START"
        this.alphaOggettiInPreloadScene = 1;
        this.animationPreloadScene2CanStart = true;

        // Registrazione delle animazioni del personaggio principale (Dominant Red) nel MainMenu
        this.createAnimationMainMenu();
        // registrazione delle animazioni dei personaggi
        this.createAnimationPersonaggi();
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

    loadInventory() {

        // sfondo della scene
        this.load.image("inventoryBackground", "../assets/InventoryScene/inventoryBackground.png");

        // frame dei personaggi nell'inventario 
        this.load.image("framePgInventory", "../assets/InventoryScene/frameInventoryCharacters.png");

        this.loadPersonaggi();
    }

    loadPersonaggi() {
        this.personaggi = caricaPersonaggiTot();

        this.personaggi.forEach(personaggio => {
            this.load.image(personaggio.nome, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}.png`);
            this.load.image(`${personaggio.nome}falling`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Falling.png`);
            this.load.image(`${personaggio.nome}attacking1`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Attacking1.png`);
            this.load.image(`${personaggio.nome}attacking2`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Attacking2.png`);
            this.load.image(`${personaggio.nome}standing`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Standing.png`);
            this.load.image(`${personaggio.nome}superAttacking`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}SuperAttacking.png`);
            this.load.image(`${personaggio.nome}jumping`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Jumping.png`);
            this.load.spritesheet(`${personaggio.nome}walking`, `../assets/InventoryScene/personaggi/${personaggio.nomeImgRef}/${personaggio.nomeImgRef}Walking.png`,
                {
                    frameWidth: 64,
                    frameHeight: 103
                }
            )
        });



    }

    loadHub() {
        this.load.image("tastoPronto", "../assets/HubScene/tastoReady.png");
    }

    loadArena() {
        this.load.image("SchermataDiCaricamentoOffline", "../assets/ArenaScene/offline/schermataDiCaricamentoOffline.png");
        this.load.image("barraDegliHp", "../assets/ArenaScene/both/barraDegliHp.png");

        // --- ARENA 1 (map 1) ---
        this.load.tilemapTiledJSON("arena1Map", "../assets/ArenaScene/offline/arene/map (1)/map.json");
        this.load.image("arena1Tiles", "../assets/ArenaScene/offline/arene/map (1)/spritesheet.png");
        this.load.spritesheet("arena1Background", "../assets/ArenaScene/offline/arene/map (1)/Background.png", {
            frameWidth: 576,
            frameHeight: 324
        });
    }

    /**
     * Carica tutte le risorse audio ed effetti sonori del gioco.
     */
    loadAudio() {
        // --- MAIN MENU SCENE ---
        this.load.audio("bgm_menu", "../assets/sounds/MainMenuScene/bgm_menu.mp3");
        this.load.audio("btn_hover", "../assets/sounds/MainMenuScene/btn_hover.wav");
        this.load.audio("btn_click", "../assets/sounds/MainMenuScene/btn_click.wav");
        this.load.audio("btn_whoosh", "../assets/sounds/MainMenuScene/btn_whoosh.wav");

        // --- HUB SCENE ---
        this.load.audio("char_select", "../assets/sounds/HubScene/char_select.wav");
        this.load.audio("ready_toggle", "../assets/sounds/HubScene/ready_toggle.wav");
        this.load.audio("match_found", "../assets/sounds/HubScene/match_found.wav");

        // --- ARENA SCENE COMBAT & BGM ---
        this.load.audio("bgm_battle", "../assets/sounds/ArenaScene/bgm_battle.mp3");
        this.load.audio("light_punch", "../assets/sounds/ArenaScene/light_punch.wav");
        this.load.audio("heavy_punch", "../assets/sounds/ArenaScene/heavy_punch.wav");
        this.load.audio("hit_impact", "../assets/sounds/ArenaScene/hit_impact.wav");
        this.load.audio("super_laser", "../assets/sounds/ArenaScene/super_laser.wav");
        this.load.audio("super_charge", "../assets/sounds/ArenaScene/super_charge.wav");
        this.load.audio("jump", "../assets/sounds/ArenaScene/jump.wav");
        this.load.audio("land", "../assets/sounds/ArenaScene/land.wav");
        this.load.audio("fall_void", "../assets/sounds/ArenaScene/fall_void.wav");
        this.load.audio("super_impact", "../assets/sounds/ArenaScene/super_impact.wav");
        this.load.audio("victory_jingle", "../assets/sounds/ArenaScene/victory_jingle.mp3");
        this.load.audio("defeat_jingle", "../assets/sounds/ArenaScene/defeat_jingle.mp3");

        // --- PRELOAD & INTRO ---
        this.load.audio("game_start", "../assets/sounds/PreloadScene/game_start.wav");

        // --- INVENTORY SCENE ---
        this.load.audio("inventory_bgm", "../assets/sounds/InventoryScene/inventory_bgm.mp3");
        this.load.audio("equip_select", "../assets/sounds/InventoryScene/equip_select.wav");
        this.load.audio("card_hover", "../assets/sounds/InventoryScene/card_hover.wav");

        // --- RESULTS SCENE ---
        this.load.audio("bgm_results", "../assets/sounds/endMatchScene/bgm_results.mp3");

        // --- SYSTEM & MODALS ---
        this.load.audio("modal_open", "../assets/sounds/SystemScene/modal_open.wav");
        this.load.audio("modal_close", "../assets/sounds/SystemScene/modal_close.wav");
        this.load.audio("access_granted", "../assets/sounds/SystemScene/access_granted.wav");
        this.load.audio("access_denied", "../assets/sounds/SystemScene/access_denied.wav");

        // --- ARENA SCENE ANNOUNCER ---
        this.load.audio("voice_ready", "../assets/sounds/ArenaScene/voice_ready.wav");
        this.load.audio("voice_3", "../assets/sounds/ArenaScene/voice_3.wav");
        this.load.audio("voice_2", "../assets/sounds/ArenaScene/voice_2.wav");
        this.load.audio("voice_1", "../assets/sounds/ArenaScene/voice_1.wav");
        this.load.audio("voice_go", "../assets/sounds/ArenaScene/voice_go.wav");
        this.load.audio("voice_you_win", "../assets/sounds/ArenaScene/voice_you_win.wav");
        this.load.audio("voice_you_lose", "../assets/sounds/ArenaScene/voice_you_lose.wav");
        this.load.audio("voice_game_over", "../assets/sounds/ArenaScene/voice_game_over.wav");
    }

    createAnimationPersonaggi() {
        this.personaggi.forEach(personaggio => {
            this.anims.create({
                key: `${personaggio.nome}walking`,
                frames: this.anims.generateFrameNumbers(`${personaggio.nome}walking`, {
                    start: 0,
                    end: 4
                }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}falling`,
                frames: [{ key: `${personaggio.nome}falling` }],
                frameRate: 1,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}attacking1`,
                frames: [{ key: `${personaggio.nome}attacking1` }],
                frameRate: 1,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}attacking2`,
                frames: [{ key: `${personaggio.nome}attacking2` }],
                frameRate: 1,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}standing`,
                frames: [{ key: `${personaggio.nome}standing` }],
                frameRate: 1,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}jumping`,
                frames: [{ key: `${personaggio.nome}jumping` }],
                frameRate: 1,
                repeat: -1
            });

            this.anims.create({
                key: `${personaggio.nome}superAttacking`,
                frames: [{ key: `${personaggio.nome}superAttacking` }],
                frameRate: 1,
                repeat: -1
            });


        })

    }
}
