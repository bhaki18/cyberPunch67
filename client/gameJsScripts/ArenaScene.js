import caricaArene from "../modules/arene.js";
import convertArene from "../modules/convertArene.js";


/**
 * @class ArenaScene
 * @extends Phaser.Scene
 * @description Scena dell'Arena di Combattimento principale.
 * Questa scena gestirà lo stato attivo del match, il movimento dei giocatori,
 * le collisioni, le hitbox degli attacchi e il rendering dei livelli di combattimento.
 */
export default class ArenaScene extends Phaser.Scene {
    constructor() {
        super("ArenaScene");
    }

    init(data) {
        this.modalita = data.modalita;
        this.personaggioPlayer = data.personaggioSelezionato;
        console.log(this.personaggioPlayer);

        this.arrayDiAreneESfondiDelleArene = caricaArene();

        this.puoiAnimareLoSfondo = false;
        this.playerCanMove = false;
        this.canJump = false;
    }

    /**
     * Inizializzazione degli elementi grafici e fisici dell'arena.
     */
    create() {
        // --- INPUTS ---
        // addKeys registra i tasti sul keyboard plugin di Phaser.
        // Ogni proprietà dell'oggetto diventa un Key ascoltabile con .isDown / JustDown.
        this.inputManager = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.SPACE,
            attack1: Phaser.Input.Keyboard.KeyCodes.C,
            attack2: Phaser.Input.Keyboard.KeyCodes.V,
            superAttack: Phaser.Input.Keyboard.KeyCodes.B
        });

        if (this.modalita === "offline") {
            this.offlineModGameCreate();
        }
    }

    /**
     * Ciclo di aggiornamento logico dell'arena (eseguito a ogni frame).
     * Gestisce la fisica dei movimenti e il controllo degli input durante la battaglia.
     */
    update() {
        this.animaSfondo();

        if (this.modalita === "offline") {
            this.playerMovesOffline();
        }
    }

    offlineModGameCreate() {
        this.schermataDiCaricamentoOfflineMod();
    }

    schermataDiCaricamentoOfflineMod() {
        this.schermataDiCaricamentoOffline = this.add.sprite(
            400,
            300,
            "SchermataDiCaricamentoOffline"
        )
            .setAlpha(0)
            .setScale(0.5)
            .setOrigin(0.5);

        this.tweens.add({
            targets: this.schermataDiCaricamentoOffline,
            duration: 300,
            alpha: 1,
            ease: "power 4",
            onStart: () => {
                setTimeout(() => {
                    this.tweens.add({
                        targets: this.schermataDiCaricamentoOffline,
                        duration: 300,
                        alpha: 0,
                        ease: "power 4",
                        onComplete: () => {
                            this.schermataDiCaricamentoOffline.destroy();
                        },
                        onStart: () => {
                            this.creaArenaRandom();
                            this.creaPlayerENPC();
                        }
                    });

                }, 5000);
            }
        });

    }

    creaArenaRandom() {
        const random = Phaser.Math.Between(0, this.arrayDiAreneESfondiDelleArene.length - 1);

        const arenaRandom = this.arrayDiAreneESfondiDelleArene[random];
        const refSfondo = arenaRandom.getRefSfondo();
        const refArena = arenaRandom.getRefArena();
        const refTiles = arenaRandom.getRefTiles();

        // --- SFONDO ---
        // Il tileSprite copre l'intera area dello schermo (800x600).
        // setTileScale scala la "tile" in modo che riempia lo schermo una sola volta,
        // senza ripetersi (effetto "doppio"). La dimensione reale viene letta dalla texture.
        this.sfondo = this.add.tileSprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.scale.width,
            this.scale.height,
            refSfondo
        ).setDepth(-1);

        const bgFrame = this.textures.getFrame(refSfondo);
        this.sfondo.setTileScale(
            this.scale.width / bgFrame.realWidth,
            this.scale.height / bgFrame.realHeight
        );

        this.puoiAnimareLoSfondo = true;

        // --- TILEMAP ---
        // 1. Crea la mappa dal JSON caricato in PreloadScene
        const map = this.make.tilemap({ key: refArena });

        // 2. Aggiunge il tileset (nome del tileset nel JSON di Tiled, chiave Phaser dell'immagine)
        // SpriteFusion esporta i tileset con il nome "spritefusion" all'interno del JSON.
        const tileset = map.addTilesetImage("spritefusion", refTiles);

        // 3. Crea i layer dalla mappa (Layer_0 e Layer_1 sono i nomi dei layer in SpriteFusion)
        this.layerArena = map.createLayer("Layer_0", tileset, 0, 0);
        this.layerArenaMuri = map.createLayer("Layer_1", tileset, 0, 0);

        // Abilita la collisione su tutte le tile presenti nel layer dei muri.
        // -1 = tile vuota (nessuna collisione), tutte le altre tile saranno solide.
        this.layerArenaMuri.setCollisionByExclusion([-1]);


        // --- ADATTAMENTO ALLO SCHERMO ---
        // Usa convertArene per calcolare scala e posizione (mode: "stretch" = mapWidth x mapHeight)
        const { scaleX, scaleY, x, y } = convertArene({
            mapWidthPx: map.widthInPixels,
            mapHeightPx: map.heightInPixels,
            screenWidth: this.scale.width,
            screenHeight: this.scale.height,
            mode: "stretch"
        });

        this.layerArena.setScale(scaleX, scaleY).setPosition(x, y + 200);
        this.layerArenaMuri.setScale(scaleX, scaleY).setPosition(x, y + 200);

        // Tween DOPO setPosition: this.layerArena.y è ora il valore finale corretto.
        // Lo sbalzo è esattamente +2px rispetto alla posizione definitiva.
        this.tweens.add({
            targets: this.layerArena,
            y: this.layerArena.y + 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });


    }

    animaSfondo() {
        if (this.puoiAnimareLoSfondo) {
            this.sfondo.tilePositionX += 2;
        }
    }

    creaPlayerENPC() {

        const spawnX = 150;
        const spawnY = 150;

        this.player = this.physics.add.sprite(
            spawnX,
            spawnY,
            this.personaggioPlayer.dati.nome
        );
        this.player.setCollideWorldBounds(true);
        // Gravità positiva verso il basso per consentire il salto
        this.player.body.setGravityY(500);

        this.NPC = this.physics.add.sprite(
            spawnX + 500,
            spawnY,
            this.personaggioPlayer.dati.nome
        )
            .setFlipX(true)
            .setTint(0xff0000);
        this.NPC.setCollideWorldBounds(true);
        this.NPC.setImmovable(true);
        this.NPC.body.setGravityY(500);

        // Collisione player <-> muri della mappa
        this.physics.add.collider(
            this.player,
            this.layerArenaMuri
        );

        // Collisione NPC <-> muri della mappa
        this.physics.add.collider(
            this.NPC,
            this.layerArenaMuri
        );

        // Collisione player <-> NPC (impedisce che si trapassino)
        this.physics.add.collider(
            this.player,
            this.NPC
        );

        // Abilita il movimento del player dopo la creazione
        this.playerCanMove = true;
    }

    playerMovesOffline() {
        if (!this.playerCanMove || !this.player) return;

        const speed = 200;

        // --- Movimento orizzontale ---
        if (this.inputManager.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        } else if (this.inputManager.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else {
            // Nessun tasto premuto: ferma il player orizzontalmente
            this.player.setVelocityX(0);
        }

        // --- Salto (solo se a terra, con JustDown per evitare salti continui) ---
        this.canJump = this.player.body.blocked.down;

        if (this.canJump && Phaser.Input.Keyboard.JustDown(this.inputManager.up)) {
            this.player.setVelocityY(-400);
        }
    }
}