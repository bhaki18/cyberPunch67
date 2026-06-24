/**
 * @class MainMenuScene
 * @extends Phaser.Scene
 * @description Scena del Menu Principale del gioco.
 * Gestisce l'introduzione cinematografica (movimento telecamera, caduta e oscillazione dell'arena),
 * l'apparizione e le interazioni dei pulsanti principali (Gioca Online/Offline, Inventario, Info, LogIn),
 * la caduta controllata del personaggio del giocatore con ombra proiettata,
 * e il rendering dei dati del giocatore loggato (nome e livello) con font pixel-art.
 */

import caricaPersonaggiTot from "../modules/personaggi.js";
export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("MainMenuScene");

        // --- PROPRIETÀ DELLA MAPPA E DEL TILESET
        this.mapMainMenu;
        this.groundLayerMainMenu;
        this.wallsLayerMainMenu;
        this.tilesetMainMenu;
        this.arrayDiLayer = [];

        // --- STATO DELLA TELECAMERA E SCROLLING
        this.cameraSpeed = 0;
        this.phase = "ACCELERATE"; // Fasi: ACCELERATE -> CONSTANT -> DECCELERATE -> STOP
        this.arenaStartX = 2800;    // Coordinata X finale dove si posiziona l'arena
        this.cameraCanMove = false;
        this.cameraCanMoveY = false;
        this.phaseY = "ACCELERATE";

        // animazioni di avvio
        this.animationPlayOfflineCanStart = false;
        this.animationPlayOnlineCanStart = false;

        // --- GESTIONE DEI PULSANTI
        this.bottoneAttuale = 0;    // Indice per far scendere i bottoni in sequenza
        this.arrayDiBottoni = [];
        this.btnsCanFall = false;

        // --- STATO DEL PERSONAGGIO (DOMINANT RED)
        this.personaggioPuoApparire = false;
        this.personaggioPuoOscillare = false;
        this.dominantRedPuoRespirare = false;
        this.dominantRedStaAspettando = false;

        // --- STATO DELLA BARRA GIOCATORE HUD
        this.barraGiocatorePuoApparire = false;
        this.puoiAggiornareNomeUtente = false;
    }

    init() {
        // --- PROPRIETÀ DELLA MAPPA E DEL TILESET
        this.arrayDiLayer = [];

        // --- STATO DELLA TELECAMERA E SCROLLING
        this.cameraSpeed = 0;
        this.phase = "ACCELERATE";
        this.cameraCanMove = false;
        this.cameraCanMoveY = false;
        this.phaseY = "ACCELERATE";

        // --- GESTIONE DEI PULSANTI
        this.bottoneAttuale = 0;
        this.arrayDiBottoni = [];
        this.btnsCanFall = false;

        // --- STATO DEL PERSONAGGIO (DOMINANT RED)
        this.personaggioPuoApparire = false;
        this.personaggioPuoOscillare = false;
        this.dominantRedPuoRespirare = false;
        this.dominantRedStaAspettando = false;

        // --- STATO DELLA BARRA GIOCATORE HUD
        this.barraGiocatorePuoApparire = false;
        this.puoiAggiornareNomeUtente = false;
    }

    /**
     * Inizializzazione della scena. Crea la mappa, configura gli sfondi mobili,
     * istanzia i bottoni con i loro eventi interattivi e avvia le timeline.
     */
    create() {

        // carica i personaggi totali
        this.personaggiTot = caricaPersonaggiTot();
        this.livelloPlayer = window.player.level !== undefined ? window.player.level : 1;


        const { width, height } = this.scale;

        // --- 1. SETUP TILEMAP E STRUTTURA SCENICA
        // Genera la tilemap caricando il JSON precedentemente precaricato
        this.mapMainMenu = this.make.tilemap({ key: "MapArenaFluttuante" });
        // Associa il tileset del JSON all'immagine effettiva degli sprite
        this.tilesetMainMenu = this.mapMainMenu.addTilesetImage("cyberpunk_tileset", "tilesArenaFluttuante");

        // Istanziazione ordinata di tutti i layer della mappa esportati da Tiled
        this.groundLayerMainMenu = this.mapMainMenu.createLayer("ground", this.tilesetMainMenu, 0, 0);
        this.ground2LayerMainMenu = this.mapMainMenu.createLayer("ground2", this.tilesetMainMenu, 0, 0);
        this.ground3LayerMainMenu = this.mapMainMenu.createLayer("ground3", this.tilesetMainMenu, 0, 0);
        this.ground4LayerMainMenu = this.mapMainMenu.createLayer("ground4", this.tilesetMainMenu, 0, 0);
        this.wallsLayerMainMenu = this.mapMainMenu.createLayer("walls1", this.tilesetMainMenu, 0, 0);
        this.walls2LayerMainMenu = this.mapMainMenu.createLayer("walls2", this.tilesetMainMenu, 0, 0);
        this.laserLayer = this.mapMainMenu.createLayer("laserLayer", this.tilesetMainMenu, 0, 0);

        // Raggruppa i layer in un array per manipolarli contemporaneamente (es. farli oscillare all'unisono)
        this.arrayDiLayer.push(
            this.groundLayerMainMenu,
            this.ground2LayerMainMenu,
            this.ground3LayerMainMenu,
            this.ground4LayerMainMenu,
            this.wallsLayerMainMenu,
            this.walls2LayerMainMenu,
            this.laserLayer
        );

        // Imposta l'origine di tutti i layer al centro e posizionali alle coordinate X di destinazione
        this.arrayDiLayer.forEach(layer => {
            layer.setOrigin(0.5);
            layer.x = this.arenaStartX;
            layer.y = 100;
        });

        // Correzione di offset verticale per il ground base
        this.groundLayerMainMenu.setY(this.groundLayerMainMenu.y + 10);

        // --- 2. SFONDO SPAZIALE RIPETUTO (TILE SPRITE)
        this.spaceBg = this.add.tileSprite(
            -32,
            408,
            width,
            height,
            "space"
        )
            .setScale(9)
            .setDepth(-2);

        // Ritardo di 200ms prima di consentire il movimento introduttivo della telecamera
        setTimeout(() => {
            this.cameraCanMove = true;
        }, 200);

        // --- LISTENER DI RISVEGLIO (wake): aggiorna i dati player senza ricreare la scena
        this.events.on("wake", () => {
            if (window.player.username && this.nomeUtenteBarraGiocatore) {
                const displayLevel = window.player.level !== undefined ? window.player.level : 1;
                this.livelloPlayer = displayLevel;
                this.nomeUtenteBarraGiocatore.setText(`${window.player.username.toUpperCase()}\nLV. ${displayLevel}`);
                this.nomeUtenteBarraGiocatore.setColor("#ff007f");
                this.nomeUtenteBarraGiocatore.setShadow(0, 0, "#ff007f", 5, false, true);
            }
        });

        // --- 3. CREAZIONE E CONFIGURAZIONE DEI BOTTONI INTERATTIVI DEL MENU
        const xBtn = 3600;      // Coordinata X iniziale (fuori dallo schermo destro)
        const yBtn = 200;       // Coordinata Y iniziale per il primo bottone
        const XbtnFinale = 2760; // Coordinata X finale dove si fermeranno i pulsanti

        // --- PULSANTE PLAY ONLINE
        this.bottonePlayOnline = this.add.image(xBtn, yBtn, "playOnlineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);

        // Effetti grafici per l'hover sul pulsante online
        this.bottonePlayOnline.on("pointerover", () => {
            this.tweens.add({
                targets: this.bottonePlayOnline,
                scale: 2.25,
                duration: 120,
                ease: "Sine.easeOut"
            });
            this.tweens.add({
                targets: this.bottonePlayOnline,
                x: XbtnFinale + 25,
                duration: 120,
                ease: "Sine.easeOut"
            });
        });

        // Ripristino dello stato quando il mouse esce dal pulsante online
        this.bottonePlayOnline.on("pointerout", () => {
            this.bottonePlayOnline.setFrame(0);
            this.tweens.add({
                targets: this.bottonePlayOnline,
                scale: 2,
                x: XbtnFinale,
                duration: 180,
                ease: "Sine.easeOut"
            });
        });

        // Effetto grafico alla pressione (click down)
        this.bottonePlayOnline.on("pointerdown", () => {
            this.bottonePlayOnline.setFrame(2);
            this.tweens.add({
                targets: this.bottonePlayOnline,
                angle: -2,
                duration: 50,
                yoyo: true
            });
        });

        this.bottonePlayOnline.on("pointerup", () => {
            this.bottonePlayOnline.setFrame(1);
            this.animationPlayOnlineCanStart = true;
            this.animazioneToHub();
        });

        // --- PULSANTE PLAY OFFLINE
        this.bottonePlayOffline = this.add.image(xBtn, yBtn, "playOfflineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);

        this.bottonePlayOffline.on("pointerover", () => {
            this.tweens.add({
                targets: this.bottonePlayOffline,
                scale: 2.25,
                duration: 120,
                ease: "Sine.easeOut"
            });
            this.tweens.add({
                targets: this.bottonePlayOffline,
                x: XbtnFinale + 25,
                duration: 120,
                ease: "Sine.easeOut"
            });
        });

        this.bottonePlayOffline.on("pointerout", () => {
            this.bottonePlayOffline.setFrame(0);
            this.tweens.add({
                targets: this.bottonePlayOffline,
                scale: 2,
                x: XbtnFinale,
                duration: 180,
                ease: "Sine.easeOut"
            });
        });

        this.bottonePlayOffline.on("pointerdown", () => {
            this.bottonePlayOffline.setFrame(2);
            this.tweens.add({
                targets: this.bottonePlayOffline,
                angle: -2,
                duration: 50,
                yoyo: true
            });
        });

        this.bottonePlayOffline.on("pointerup", () => {
            this.bottonePlayOffline.setFrame(1);
            // this.scene.start("HubScene", { modalita: "offline", livello: this.livelloPlayer });
            this.animationPlayOfflineCanStart = true;
            this.animazioneToHub();
        });

        // --- PULSANTE INVENTARIO
        this.bottoneInventory = this.add.image(xBtn, yBtn, "inventoryBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);

        this.bottoneInventory.on("pointerover", () => {
            this.tweens.add({
                targets: this.bottoneInventory,
                scale: 2.25,
                duration: 120,
                ease: "Sine.easeOut"
            });
            this.tweens.add({
                targets: this.bottoneInventory,
                x: XbtnFinale + 25,
                duration: 120,
                ease: "Sine.easeOut"
            });
        });

        this.bottoneInventory.on("pointerout", () => {
            this.bottoneInventory.setFrame(0);
            this.tweens.add({
                targets: this.bottoneInventory,
                scale: 2,
                x: XbtnFinale,
                duration: 180,
                ease: "Sine.easeOut"
            });
        });

        this.bottoneInventory.on("pointerdown", () => {
            this.bottoneInventory.setFrame(2);
            this.tweens.add({
                targets: this.bottoneInventory,
                angle: -2,
                duration: 50,
                yoyo: true
            });
        });

        this.bottoneInventory.on("pointerup", () => {
            this.bottoneInventory.setFrame(1);
            // Sospende MainMenu e avvia InventoryScene (così al ritorno riprende da dove era)
            this.scene.sleep("MainMenuScene");
            this.scene.launch("InventoryScene", { personaggiTot: this.personaggiTot, livello: this.livelloPlayer });
        });

        // --- PULSANTE INFORMAZIONI (INFO)
        this.bottoneInfo = this.add.image(xBtn, yBtn, "infoBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);

        this.bottoneInfo.on("pointerover", () => {
            this.tweens.add({
                targets: this.bottoneInfo,
                scale: 2.25,
                duration: 120,
                ease: "Sine.easeOut"
            });
            this.tweens.add({
                targets: this.bottoneInfo,
                x: XbtnFinale + 25,
                duration: 120,
                ease: "Sine.easeOut"
            });
        });

        this.bottoneInfo.on("pointerout", () => {
            this.bottoneInfo.setFrame(0);
            this.tweens.add({
                targets: this.bottoneInfo,
                scale: 2,
                x: XbtnFinale,
                duration: 180,
                ease: "Sine.easeOut"
            });
        });

        this.bottoneInfo.on("pointerdown", () => {
            this.bottoneInfo.setFrame(2);
            this.tweens.add({
                targets: this.bottoneInfo,
                angle: -2,
                duration: 50,
                yoyo: true
            });
        });

        this.bottoneInfo.on("pointerup", () => {
            this.bottoneInfo.setFrame(1);
            // Sospende MainMenu e avvia InfoScene (così al ritorno riprende da dove era)
            this.scene.sleep("MainMenuScene");
            this.scene.launch("InfoScene");
        });

        // --- 4. DISPOSIZIONE E ANIMAZIONE CONTINUA DEI BOTTONI
        this.arrayDiBottoni = [this.bottonePlayOnline, this.bottonePlayOffline, this.bottoneInventory, this.bottoneInfo];

        // Distribuisce verticalmente i bottoni a distanze regolari di 90px
        for (let i = 0; i < this.arrayDiBottoni.length; i++) {
            this.arrayDiBottoni[i].y = yBtn + (i * 90);
        }

        // Applica un'oscillazione verticale sinusoidale continua a ciascun bottone per un effetto galleggiante
        this.arrayDiBottoni.forEach(btn => {
            this.tweens.add({
                targets: btn,
                y: btn.y + 5,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: "Sine.inOut"
            });
        });

        // --- 5. PULSANTE DI LOG IN
        this.logInBtn = this.add.sprite(XbtnFinale + 600, 120, "logInBtn")
            .setInteractive({ useHandCursor: true }, { pixelPerfect: true })
            .setDepth(10)
            .setAlpha(0);

        this.logInBtn.on("pointerover", () => {
            this.tweens.add({
                targets: this.logInBtn,
                scale: 1.25,
                duration: 120,
                ease: "Sine.easeOut"
            });
        });

        this.logInBtn.on("pointerout", () => {
            this.logInBtn.setFrame(0);
            this.tweens.add({
                targets: this.logInBtn,
                scale: 1,
                duration: 180,
                ease: "Sine.easeOut"
            });
        });

        this.logInBtn.on("pointerdown", () => {
            this.logInBtn.setFrame(2);
        });

        this.logInBtn.on("pointerup", () => {
            this.logInBtn.setFrame(1);
            // Avvio overlay di Login
            this.scene.launch("LogInScene");
        });

        // --- 6. ASSET VISIVI DEL PERSONAGGIO (DOMINANT RED) E SUA OMBRA
        this.dominantRed = this.add.sprite(this.arenaStartX + 200, -200, "dominantRedFalling")
            .setScale(1)
            .setDepth(3)
            .setOrigin(0.5);

        this.dominantRedShadow = this.add.sprite(this.arenaStartX + 200, -200, "dominantRedFalling")
            .setScale(2)
            .setDepth(2.5)
            .setAlpha(0.35)
            .setTint(0x000000); // Tinta nera per renderla un'ombra proiettata

        // --- 7. HUD BAR DEL GIOCATORE (NOME UTENTE & LIVELLO)
        const XInizialeBarraDelGiocatore = 3500;
        const YInizialeBarraDelGiocatore = 550;

        this.barraGiocatore = this.add.sprite(XInizialeBarraDelGiocatore, YInizialeBarraDelGiocatore, "barraGiocatore")
            .setAlpha(0)
            .setScale(2.5);
    }

    /**
     * Loop principale di aggiornamento dei fotogrammi (60 FPS).
     * Esegue in ordine tutte le sotto-funzioni di animazione, movimento e controlli di stato.
     */
    update() {
        this.animationInizialeMainMenu(); // Movimento introduttivo telecamera
        this.arenaCheOscilla();           // Oscillazione dell'arena nel vuoto
        this.bottoniCheAppaiono();        // Discesa a catena dei bottoni
        this.BugsHandler();               // Prevenzione di piccoli bug di posizionamento X
        this.personaggioCheAppare();      // Caduta del personaggio sul terreno
        this.DominantRedCheRespira();     // Animazione idle di respirazione
        this.DominantRedCheAspetta();     // Animazioni acrobatiche casuali dell'attesa
        this.eliminaBottoneDelLogIn();    // Ritiro del pulsante Login se l'utente è già loggato
        this.faiApparireBarraGiocatore(); // Scivolamento della barra HUD
        this.aggiornaNomeUtentePostLogIn(); // Aggiornamento scritte nome e livello post-login

        // Muove lo sfondo spaziale per dare l'effetto di movimento
        if (this.spaceBg) {
            this.spaceBg.tilePositionX += 0.25;
        }
    }

    /**
     * Gestisce la cinematica iniziale di scorrimento laterale della telecamera principale.
     * Con una sequenza Accelerazione -> Velocità Costante -> Decelerazione -> Stop.
     */
    animationInizialeMainMenu() {
        const cam = this.cameras.main;
        const distance = this.arenaStartX - cam.scrollX;

        if (!this.cameraCanMove) return;

        // FASE ACCELERATE
        if (this.phase === "ACCELERATE") {
            this.cameraSpeed += 0.5;
            if (this.cameraSpeed >= 30) {
                this.cameraSpeed = 30;
                this.phase = "CONSTANT";
            }
        }
        // FASE CONSTANT
        else if (this.phase === "CONSTANT") {
            this.cameraSpeed = 30;
            if (distance < 500) {
                this.phase = "DECCELERATE";
            }
        }
        // FASE DECCELERATE
        else if (this.phase === "DECCELERATE") {
            this.cameraSpeed *= 0.95;
            if (this.cameraSpeed < 2) {
                this.cameraSpeed = 2;
            }
            if (distance < 200) {
                this.phase = "STOP";
            }
        }
        // FASE STOP
        else if (this.phase === "STOP") {
            this.cameraSpeed = 0;
            this.cameraCanMove = false;
            // Abilita la discesa dei bottoni dopo che la telecamera si ferma
            setTimeout(() => {
                this.btnsCanFall = true;
            }, 300);
            return;
        }

        cam.scrollX += this.cameraSpeed;
    }

    /**
     * Applica un'oscillazione sinusoidale verticale sia all'arena che al personaggio
     * per simularne il galleggiamento nello spazio siderale.
     */
    arenaCheOscilla() {
        const t = this.time.now * 0.002;

        // Oscilla i layer dell'arena
        this.arrayDiLayer.forEach(layer => {
            layer.y = 100 + Math.sin(t) * 5;
        });

        // Oscilla il player stando sulla piattaforma
        if (this.personaggioPuoOscillare) {
            this.dominantRed.y = 300 + Math.sin(t) * 5;
            this.dominantRedShadow.y = 300 + Math.sin(t) * 5;
        }
    }

    /**
     * Fa entrare lateralmente i bottoni del menu uno alla volta,
     * producendo un piccolo sussulto dello schermo (shake) a ogni impatto.
     */
    bottoniCheAppaiono() {
        if (this.btnsCanFall) {
            const btn = this.arrayDiBottoni[this.bottoneAttuale];

            // Muove il pulsante corrente verso la coordinata finale
            if (btn.x > 2760) {
                btn.x -= 20;
            }
            if (btn.x < 2760) {
                btn.x = 2760;
            }
            if (btn.x === 2760) {
                // Impatto: piccolo scuotimento di camera e passa al bottone successivo
                this.cameras.main.shake(200, 0.008);
                this.bottoneAttuale++;
            }

            // Una volta che tutti i bottoni sono posizionati, avvia l'ingresso del pulsante Login
            if (this.arrayDiBottoni[this.arrayDiBottoni.length - 1].x == 2760 ||
                this.arrayDiBottoni[this.arrayDiBottoni.length - 1].x === 2740) {
                this.btnsCanFall = false;

                // Transizione elastica del login button
                if (this.logInBtn) {
                    this.tweens.add({
                        targets: this.logInBtn,
                        y: 40,
                        alpha: 1,
                        duration: 600,
                        ease: "Cubic.Out",
                        onStart: () => {
                            setTimeout(() => {
                                this.time.delayedCall(600, () => {
                                    if (this.logInBtn) {
                                        this.tweens.add({
                                            targets: this.logInBtn,
                                            scaleX: 1.35,
                                            scaleY: 0.65,
                                            duration: 120,
                                            ease: "Quad.Out",
                                            yoyo: true
                                        });

                                        this.tweens.add({
                                            targets: this.logInBtn,
                                            scaleX: 0.95,
                                            scaleY: 1.05,
                                            duration: 180,
                                            delay: 120,
                                            ease: "Elastic.Out(1, 0.4)"
                                        });
                                    }
                                });
                            }, 600);
                        }
                    });
                }

                // Abilita la caduta del giocatore e l'apparizione dell'HUD
                setTimeout(() => {
                    this.personaggioPuoApparire = true;
                    this.barraGiocatorePuoApparire = true;
                }, 200);
            }
        }
    }

    /**
     * Gestisce la simulazione fisica della caduta (landing) del giocatore sul terreno dell'arena,
     * aggiornando dinamicamente la grandezza e opacità dell'ombra al suolo.
     */
    personaggioCheAppare() {
        if (this.personaggioPuoApparire) {
            const groundY = 400;
            if (this.dominantRed.y < 300) {
                this.dominantRed.y += 5;

                // L'ombra rimane fissa sull'asse orizzontale e verticale del terreno
                this.dominantRedShadow.x = this.dominantRed.x + 10;
                this.dominantRedShadow.y = 300;

                const t = Phaser.Math.Clamp(
                    (this.dominantRed.y / groundY),
                    0,
                    1
                );

                // Più il player si avvicina al suolo, più l'ombra si rimpicciolisce e scurisce
                this.dominantRedShadow.setScale(2 - t * 1.4);
                this.dominantRedShadow.setAlpha(0.01 + t * 0.3);
            } else {
                // Atterrato: scuote la telecamera, cambia la texture in Landing e poi imposta lo stato Idle
                this.personaggioPuoApparire = false;
                this.personaggioPuoOscillare = true;
                this.dominantRed.setTexture("dominantRedLanding");
                this.dominantRedShadow.setTexture("dominantRedLanding");
                this.cameras.main.shake(400, 0.008);

                setTimeout(() => {
                    this.dominantRed.setTexture("dominantRedStanding");
                    this.dominantRedShadow.setTexture("dominantRedStanding");
                    this.dominantRedPuoRespirare = true;
                }, 400);
            }
        }
    }

    /**
     * Allinea i bottoni in caso di lievi discrepanze di pixel nel posizionamento X.
     */
    BugsHandler() {
        this.arrayDiBottoni.forEach(btn => {
            if (btn.x === 2740) {
                btn.x = 2760;
            }
        });
    }

    /**
     * Attiva l'animazione di respirazione a ciclo continuo quando il giocatore è a terra.
     */
    DominantRedCheRespira() {
        if (this.dominantRedPuoRespirare) {
            this.dominantRed.play("dominantRedBreathing");
            this.dominantRedShadow.play("dominantRedBreathing");
            this.dominantRedPuoRespirare = false;
            this.dominantRedStaAspettando = true;
        }
    }

    /**
     * Alterna ogni 10 secondi l'animazione di respiro con una mossa acrobatica casuale
     * (calcio/pugno a vuoto) per rendere il personaggio vivo durante l'attesa nel menu.
     */
    DominantRedCheAspetta() {
        if (this.dominantRedStaAspettando) {
            this.waitingTimer = this.time.addEvent({
                delay: 10000,
                callback: () => {
                    if (this.dominantRed && this.dominantRed.active) {
                        this.dominantRed.play("dominantRedWaitingR");
                        this.dominantRedShadow.play("dominantRedWaitingR");
                        this.time.delayedCall(3800, () => {
                            if (this.dominantRed && this.dominantRed.active) {
                                this.dominantRed.play("dominantRedBreathing");
                                this.dominantRedShadow.play("dominantRedBreathing");
                            }
                        });
                    }
                },
                loop: true
            });
            this.dominantRedStaAspettando = false;
        }
    }

    /**
     * Rimuove il pulsante di Login se l'utente ha completato l'accesso con successo.
     */
    eliminaBottoneDelLogIn() {
        if (localStorage.getItem("playerLogged") === "true" && this.logInBtn) {
            this.logInBtn.destroy();
            this.logInBtn = null;
        }
    }

    /**
     * Fa scorrere e apparire la barra HUD del profilo giocatore a fine caricamento.
     */
    faiApparireBarraGiocatore() {
        if (this.barraGiocatorePuoApparire) {
            // Animazione di slide-in per la barra grafica del giocatore
            this.tweens.add({
                targets: this.barraGiocatore,
                x: 2810,
                alpha: 1,
                duration: 500
            });

            // Crea il testo delle statistiche con stile retro-game pixelated
            this.nomeUtenteBarraGiocatore = this.add.text(
                this.barraGiocatore.x - 30,
                this.barraGiocatore.y - 5,
                "USER\nLV. 1",
                {
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "12px",
                    lineSpacing: 4,
                    color: "#00f0ff",
                    stroke: "#000000",
                    strokeThickness: 2,
                    shadow: {
                        offsetX: 0,
                        offsetY: 0,
                        color: "#00f0ff",
                        blur: 3,
                        stroke: false,
                        fill: true
                    }
                }
            ).setAlpha(0).setOrigin(0, 0.5);

            // Animazione di slide-in parallela per la scritta delle statistiche
            this.tweens.add({
                targets: this.nomeUtenteBarraGiocatore,
                x: 2730,
                alpha: 1,
                duration: 500
            });

            this.barraGiocatorePuoApparire = false;
            this.puoiAggiornareNomeUtente = true;
        }
    }

    /**
     * Sostituisce il testo di default "USER" con il nome utente e livello effettivi del player
     * non appena viene effettuato il login e ricevuti i dati dal server.
     * Cambia anche il bagliore in rosa fucsia.
     */
    aggiornaNomeUtentePostLogIn() {
        if (window.player.username && this.puoiAggiornareNomeUtente) {
            const displayLevel = window.player.level !== undefined ? window.player.level : 1;
            this.livelloPlayer = window.player.level !== undefined ? window.player.level : 1;

            // Aggiorna il testo su due linee
            this.nomeUtenteBarraGiocatore.setText(`${window.player.username.toUpperCase()}\nLV. ${displayLevel}`);

            // Applica la variazione di colore a stile caldo cyberpunk
            this.nomeUtenteBarraGiocatore.setColor("#ff007f");
            this.nomeUtenteBarraGiocatore.setShadow(0, 0, "#ff007f", 5, false, true);

            this.puoiAggiornareNomeUtente = false;
        }
    }

    animazioneToHub() {
        if (!this.animationPlayOfflineCanStart && !this.animationPlayOnlineCanStart) return;
        if (this.cameraCanMoveY) return; // già in esecuzione

        this.cameraCanMoveY = true;

        const TileLimitY = -1500;
        const cam = this.cameras.main;
        const modalitaGioco = this.animationPlayOnlineCanStart ? "online" : "offline";

        // Disabilita tutti i bottoni prima di partire
        this.arrayDiBottoni.forEach(b => b.disableInteractive());

        // Calcola la distanza da percorrere per calibrare la durata
        const distanza = Math.abs(cam.scrollY - TileLimitY);
        const durata = Phaser.Math.Clamp(distanza * 30, 1200, 3000);

        this.tweens.add({
            targets: cam,
            scrollY: TileLimitY,
            duration: durata,
            ease: "Quad.InOut",
            onComplete: () => {
                this.cameraCanMoveY = false;
                this.animationPlayOfflineCanStart = false;
                this.animationPlayOnlineCanStart = false;

                this.time.delayedCall(300, () => {
                    this.scene.start("HubScene", { modalita: modalitaGioco, livelloPlayer: this.livelloPlayer, personaggiTot: this.personaggiTot });
                });
            }
        });
    }


}