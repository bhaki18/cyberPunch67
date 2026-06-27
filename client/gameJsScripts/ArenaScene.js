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
        this.playerName = data.nomePlayer;
        console.log(this.personaggioPlayer);

        this.arrayDiAreneESfondiDelleArene = caricaArene();

        this.puoiAnimareLoSfondo = false;
        this.playerCanMove = false;
        this.canJump = false;
        this.playerState = "";
        this.animationCounter = 0;
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
            this.animazioniPlayer(this.playerState);
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
        ).setOrigin(0.5, 1);
        this.player.setCollideWorldBounds(true);
        // Gravità positiva verso il basso per consentire il salto
        this.player.body.setGravityY(500);

        // Body pixel-perfect approssimato: riduce il rettangolo fisico
        // ai pixel visibili dello sprite, escludendo le aree trasparenti.
        // (w, h, offsetX, offsetY) — regola se cambi personaggio.
        const bodyW = this.player.width * 0.45;
        const bodyH = this.player.height * 0.85;
        const offX = (this.player.width - bodyW) / 2;
        const offY = (this.player.height - bodyH);

        this.playerBodyW = bodyW;
        this.playerBodyH = bodyH;

        this.player.body.setSize(bodyW, bodyH, false);
        this.player.body.setOffset(offX, offY);

        this.NPC = this.physics.add.sprite(
            spawnX + 500,
            spawnY,
            this.personaggioPlayer.dati.nome
        )
            .setOrigin(0.5, 1)
            .setFlipX(true)
            .setTint(0xff0000);
        this.NPC.setCollideWorldBounds(true);
        this.NPC.setImmovable(true);
        this.NPC.body.setGravityY(500);

        // Stesso body pixel-perfect per l'NPC
        this.NPC.body.setSize(bodyW, bodyH, false);
        this.NPC.body.setOffset(offX, offY);

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
        this.playerCanAttack = true;
        this.delayAttack = 500; // ms serve per non far spammare il player
        this.counter = 0;

        // Doppio salto: 2 salti disponibili, si azzera toccando terra
        this.jumpsLeft = 2;

        // crea le barre dei giocatori
        this.creaBarreHp(this.personaggioPlayer.dati.hp, this.personaggioPlayer.dati.hp,
            "barraDegliHp", this.playerName, "Bot 1"
        );
    }

    playerMovesOffline() {
        if (!this.playerCanMove || !this.player) return;

        const playerMoves = {
            walking: "walking",
            falling: "falling",
            jumping: "jumping",
            standing: "standing"
        };

        const speed = 200;
        const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;

        // --- Movimento orizzontale ---
        if (this.inputManager.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);

            if (isGrounded) {
                this.playerState = playerMoves.walking;
            }



        } else if (this.inputManager.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);

            if (isGrounded) {
                this.playerState = playerMoves.walking;
            }
        } else {
            // Nessun tasto premuto: ferma il player orizzontalmente
            this.player.setVelocityX(0);

            if (isGrounded) {
                this.playerState = playerMoves.standing;
            }
        }

        // --- Doppio Salto ---
        // Quando il player tocca terra, ricarica i salti disponibili
        if (isGrounded) {
            this.jumpsLeft = 2;
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.up) && this.jumpsLeft > 0) {
            // Primo salto: velocità piena. Secondo salto (aereo): leggermente ridotta
            const jumpForce = this.jumpsLeft === 2 ? -400 : -320;
            this.player.setVelocityY(jumpForce);
            this.jumpsLeft--;
        }

        // --- Airborne State Detection ---
        if (!isGrounded) {
            if (this.player.body.velocity.y < -50) {
                this.playerState = playerMoves.jumping;
            } else if (this.player.body.velocity.y > 50) {
                this.playerState = playerMoves.falling;
            }
        }

        this.playerAttacksOffline();
    }

    playerAttacksOffline() {

        const playerAttacks = {
            attack1: "attacking1",
            attack2: "attacking2",
            superAttack: "superAttacking"
        };


        if (Phaser.Input.Keyboard.JustDown(this.inputManager.attack1)) {
            if (this.playerCanAttack) {
                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.counter = this.delayAttack;
                this.playerState = playerAttacks.attack1;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.attack2)) {
            if (this.playerCanAttack) {
                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.counter = this.delayAttack;
                this.playerState = playerAttacks.attack2;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.superAttack)) {
            if (this.playerCanAttack) {
                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.counter = this.delayAttack;
                this.playerState = playerAttacks.superAttack;
            }
        }

        if (this.counter > 0) {
            this.playerCanAttack = false;
            this.counter--;
        } else {
            this.playerCanAttack = true;
        }


    }


    creaBarreHp(hpPlayer, hpEnemy, refBarraHp, nomePlayer, nomeEnemy) {
        nomePlayer = nomePlayer || "User";
        nomeEnemy = nomeEnemy || "Bot 1";

        this.hpPlayer = hpPlayer;
        this.hpEnemy = hpEnemy;

        const W = 800;

        // --- Barre HP ---
        // setOrigin(0, 0.5): ancoriamo la barra al bordo sinistro (player)
        // setOrigin(1, 0.5): ancoriamo la barra al bordo destro (enemy, già flippata)
        const barraY = 40;

        this.barraHpPlayer = this.add.sprite(0, barraY, refBarraHp)
            .setOrigin(0, 0.5)
            .setScale(0.7)
            .setDepth(3);

        this.barraHpEnemy = this.add.sprite(W, barraY, refBarraHp)
            .setOrigin(1, 0.5)
            .setScale(0.7)
            .setFlipX(true)
            .setDepth(3);

        // --- Nomi ---
        // Player: allineato a sinistra
        // Enemy: allineato a destra (setOrigin(1,0) + x = W)
        const yNomi = 65;
        const nomiStyle = {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#8efcff',
            stroke: '#000000',
            strokeThickness: 4
        };

        this.nomePlayer = this.add.text(10, yNomi, nomePlayer, nomiStyle)
            .setOrigin(0, 0);

        this.nomeEnemy = this.add.text(W - 10, yNomi, nomeEnemy, nomiStyle)
            .setOrigin(1, 0);

        this.percentualeHp = 100;
        const lunghezzaHpPx = 450 * 0.7 - 10; // sarebbe la lunghezza dello spazio vuoto nelle barre degli hp,per ora lascio cosi ma va cambiato perche non è esatto
        const altezzaHpPx = 28;
        const redRectHpPlayer = this.add.rectangle(
            0 + 40,
            barraY - 3,
            lunghezzaHpPx,
            altezzaHpPx,
            0xff0000
        )
            .setOrigin(0, 0.5)
            .setDepth(1);


        const redRectHpEnemy = this.add.rectangle(
            W - 40,
            barraY - 3,
            lunghezzaHpPx,
            altezzaHpPx,
            0xff0000
        )
            .setOrigin(1, 0.5)
            .setDepth(1);


        this.barraHpGreenPlayer = this.add.rectangle(
            0 + 40,
            barraY - 3,
            lunghezzaHpPx,
            altezzaHpPx,
            0x00ff00
        )
            .setOrigin(0, 0.5)
            .setDepth(2);


        this.barraHpGreenEnemy = this.add.rectangle(
            W - 40,
            barraY - 3,
            lunghezzaHpPx,
            altezzaHpPx,
            0x00ff00
        )
            .setOrigin(1, 0.5)
            .setDepth(2);

    }

    animazioniPlayer(playerState) {
        if (!this.player) return;

        // Reapply the locked body size and offset on every frame to prevent Phaser from resetting it on frame changes,
        // dynamically calculating the offsets based on the current frame's dimensions.
        if (this.playerBodyW && this.playerBodyH) {
            const currentOffX = (this.player.width - this.playerBodyW) / 2;
            const currentOffY = this.player.height - this.playerBodyH;
            this.player.body.setSize(this.playerBodyW, this.playerBodyH, false);
            this.player.body.setOffset(currentOffX, currentOffY);
        }

        if (this.animationCounter > 0) {
            this.animationCounter--;
            return;
        }

        const delayAnimation = 30; // fps di attesa
        let animation = `${this.personaggioPlayer.dati.nome}standing`;

        switch (playerState) {
            case "walking":
                animation = `${this.personaggioPlayer.dati.nome}walking`;
                this.player.setScale(64 / 103);
                break;
            case "falling":
                animation = `${this.personaggioPlayer.dati.nome}falling`;

                break;
            case "jumping":
                if (this.anims.exists(`${this.personaggioPlayer.dati.nome}jumping`)) {
                    animation = `${this.personaggioPlayer.dati.nome}jumping`;
                } else {
                    animation = `${this.personaggioPlayer.dati.nome}falling`;
                }
                break;
            case "attacking1":
                animation = `${this.personaggioPlayer.dati.nome}attacking1`;
                this.animationCounter = delayAnimation;
                break;
            case "attacking2":
                animation = `${this.personaggioPlayer.dati.nome}attacking2`;
                this.animationCounter = delayAnimation;
                break;
            case "superAttacking":
                animation = `${this.personaggioPlayer.dati.nome}superAttacking`;
                this.animationCounter = delayAnimation * 2;
                break;
            case "standing":
            default:
                animation = `${this.personaggioPlayer.dati.nome}standing`;
                break;
        }

        if (this.player.anims.isPlaying && this.player.anims.currentAnim && this.player.anims.currentAnim.key === animation) {
            return;
        }


        this.player.anims.play(animation, true);
        if (animation === "walking") {
            this.player.setScale(64 / 103);
        } else {
            this.player.setScale(1);
        }
    }
}