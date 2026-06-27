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
        this.livelloPlayer = data.livelloPlayer;
        this.personaggiTot = data.personaggiTot;
        console.log(this.personaggioPlayer);

        this.arrayDiAreneESfondiDelleArene = caricaArene();

        this.puoiAnimareLoSfondo = false;
        this.playerCanMove = false;
        this.canJump = false;
        this.playerState = "";
        this.animationCounter = 0;

        // Inizializzazione variabili NPC
        this.npcState = "";
        this.npcAttackCounter = 0;
        this.npcCooldownCounter = 0;
        this.npcJumpsLeft = 2;
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

            this.npcBehaviorOffline();
            this.animazioniNPC(this.npcState);
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
        this.NPC.setImmovable(false);
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
        this.delayAttack = 60; // 60 frames = circa 1 secondi a 60fps
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
                this.creaHitboxAttacco(this.personaggioPlayer.dati.danniMossa1);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.attack2)) {
            if (this.playerCanAttack) {
                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.counter = this.delayAttack;
                this.playerState = playerAttacks.attack2;
                this.creaHitboxAttacco(this.personaggioPlayer.dati.danniMossa2);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.inputManager.superAttack)) {
            if (this.playerCanAttack) {
                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.counter = this.delayAttack;
                this.playerState = playerAttacks.superAttack;
                this.creaHitboxAttacco(this.personaggioPlayer.dati.danniSuperAttakc);
            }
        }

        if (this.counter > 0) {
            this.playerCanAttack = false;
            this.counter--;
        } else {
            this.playerCanAttack = true;
        }


    }

    creaHitboxAttacco(danno) {
        if (!this.player || !this.NPC || this.hpEnemy <= 0) return;

        // Sposta la hitbox a sinistra o a destra in base a dove guarda il player
        const offsetDirezione = this.player.flipX ? -60 : 60;
        const hitboxX = this.player.x + offsetDirezione;
        const hitboxY = this.player.y - 30; // Altezza mezza persona (ancorata ai piedi)

        // Crea un oggetto fisico temporaneo e invisibile
        const hitbox = this.physics.add.sprite(hitboxX, hitboxY, null);
        hitbox.setSize(60, 50);
        hitbox.setVisible(false);
        hitbox.body.setAllowGravity(false);

        let colpoAndatoASegno = false;

        // Rileva l'overlap singolo col nemico
        this.physics.add.overlap(hitbox, this.NPC, () => {
            if (!colpoAndatoASegno) {
                colpoAndatoASegno = true;
                this.riceviDannoNPC(danno);
            }
        });

        // Distruggi la hitbox dopo 150 millisecondi
        this.time.delayedCall(150, () => {
            hitbox.destroy();
        });
    }

    riceviDannoNPC(danno) {
        if (this.hpEnemy <= 0) return;

        this.hpEnemy -= danno;
        if (this.hpEnemy < 0) {
            this.hpEnemy = 0;
        }

        // Ridimensiona graficamente la barra HP del nemico
        if (this.barraHpGreenEnemy && this.maxHpEnemy) {
            const percentuale = this.hpEnemy / this.maxHpEnemy;
            const lunghezzaHpPx = 450 * 0.7 - 10;
            this.barraHpGreenEnemy.width = lunghezzaHpPx * percentuale;
        }

        // Effetto colpo: shake dello schermo
        this.cameras.main.shake(100, 0.015);

        // Lampeggio dell'NPC (da rosso a bianco) per 100ms
        const tintOriginale = this.NPC.tintTopLeft;
        this.NPC.setTint(0xffffff);
        this.time.delayedCall(100, () => {
            if (this.NPC && this.hpEnemy > 0) {
                this.NPC.setTint(tintOriginale);
            }
        });

        if (this.hpEnemy === 0) {
            this.gestisciMorteNPC();
        }
    }

    gestisciMorteNPC() {
        this.playerCanMove = false;
        this.playerCanAttack = false;

        this.player.setVelocity(0, 0);
        this.NPC.setVelocity(0, 0);
        this.NPC.setTint(0x333333); // Grigio scuro per nemico sconfitto

        // Testo di Vittoria
        const stileVittoria = {
            fontFamily: 'Orbitron',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { color: '#000000', blur: 10, stroke: true, fill: true }
        };

        const testoVittoria = this.add.text(
            400,
            250,
            "VITTORIA!",
            stileVittoria
        ).setOrigin(0.5).setDepth(10).setAlpha(0);

        testoVittoria.setScale(0.5);
        this.tweens.add({
            targets: testoVittoria,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    const stileSottoTesto = {
                        fontFamily: 'Orbitron',
                        fontSize: '18px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    };
                    
                    const sottoTesto = this.add.text(
                        400,
                        320,
                        "Ritorno all'Hub...",
                        stileSottoTesto
                    ).setOrigin(0.5).setDepth(10).setAlpha(0);
                    
                    this.tweens.add({
                        targets: sottoTesto,
                        alpha: 1,
                        duration: 300
                    });
                });

                // Ritorno all'Hub
                this.time.delayedCall(3000, () => {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start("HubScene", {
                            modalita: this.modalita,
                            nomePlayer: this.playerName,
                            livelloPlayer: this.livelloPlayer,
                            personaggiTot: this.personaggiTot
                        });
                    });
                });
            }
        });
    }

    npcBehaviorOffline() {
        if (!this.NPC || !this.player || this.hpEnemy <= 0 || this.hpPlayer <= 0) return;

        // Decrementa i contatori
        if (this.npcAttackCounter > 0) {
            this.npcAttackCounter--;
            // Ferma il movimento orizzontale durante l'attacco
            this.NPC.setVelocityX(0);
            return;
        }

        if (this.npcCooldownCounter > 0) {
            this.npcCooldownCounter--;
        }

        const speed = 130; // Velocità NPC leggermente inferiore a quella del player (che è 200) per bilanciamento
        const isGrounded = this.NPC.body.blocked.down || this.NPC.body.touching.down;
        
        if (isGrounded) {
            this.npcJumpsLeft = 2;
        }

        const diffX = this.player.x - this.NPC.x;
        const absDiffX = Math.abs(diffX);
        const diffY = this.player.y - this.NPC.y;

        // 1. Chasing (Inseguimento) o posizionamento
        if (absDiffX > 65) {
            // Muoviti verso il player
            const direzione = diffX > 0 ? 1 : -1;
            this.NPC.setVelocityX(direzione * speed);
            this.NPC.setFlipX(direzione < 0);

            if (isGrounded) {
                this.npcState = "walking";
            }

            // Salto se c'è un ostacolo (muro) o se il player è sopra ed è il caso di saltare
            const blockedOnSides = this.NPC.body.blocked.left || this.NPC.body.blocked.right;
            if ((blockedOnSides || (diffY < -50 && Phaser.Math.Between(0, 100) < 5)) && this.npcJumpsLeft > 0) {
                const jumpForce = this.npcJumpsLeft === 2 ? -400 : -320;
                this.NPC.setVelocityY(jumpForce);
                this.npcJumpsLeft--;
                this.npcState = "jumping";
            }
        } else {
            // Siamo vicini: ferma il movimento e decidi l'attacco
            this.NPC.setVelocityX(0);
            this.NPC.setFlipX(diffX < 0);

            if (isGrounded) {
                this.npcState = "standing";
            }

            // Attacco con cooldown
            if (isGrounded && this.npcCooldownCounter === 0 && Phaser.Math.Between(0, 100) < 8) {
                const randomAttacco = Phaser.Math.Between(1, 2);
                if (randomAttacco === 1) {
                    this.npcState = "attacking1";
                    this.npcAttackCounter = 30; // Blocca movimento per 30 frame
                    this.npcCooldownCounter = 60; // Cooldown di 60 frame prima del prossimo attacco
                    this.creaHitboxAttaccoNPC(this.personaggioPlayer.dati.danniMossa1);
                } else {
                    this.npcState = "attacking2";
                    this.npcAttackCounter = 30;
                    this.npcCooldownCounter = 60;
                    this.creaHitboxAttaccoNPC(this.personaggioPlayer.dati.danniMossa2);
                }
            }
        }

        // --- Airborne State Detection ---
        if (!isGrounded) {
            if (this.NPC.body.velocity.y < -50) {
                this.npcState = "jumping";
            } else if (this.NPC.body.velocity.y > 50) {
                this.npcState = "falling";
            }
        }
    }

    creaHitboxAttaccoNPC(danno) {
        if (!this.NPC || !this.player || this.hpPlayer <= 0) return;

        const offsetDirezione = this.NPC.flipX ? -60 : 60;
        const hitboxX = this.NPC.x + offsetDirezione;
        const hitboxY = this.NPC.y - 30;

        const hitbox = this.physics.add.sprite(hitboxX, hitboxY, null);
        hitbox.setSize(60, 50);
        hitbox.setVisible(false);
        hitbox.body.setAllowGravity(false);

        let colpoAndatoASegno = false;

        this.physics.add.overlap(hitbox, this.player, () => {
            if (!colpoAndatoASegno) {
                colpoAndatoASegno = true;
                this.riceviDannoPlayer(danno);
            }
        });

        this.time.delayedCall(150, () => {
            hitbox.destroy();
        });
    }

    riceviDannoPlayer(danno) {
        if (this.hpPlayer <= 0) return;

        this.hpPlayer -= danno;
        if (this.hpPlayer < 0) {
            this.hpPlayer = 0;
        }

        // Ridimensiona barra HP del player
        if (this.barraHpGreenPlayer && this.maxHpPlayer) {
            const percentuale = this.hpPlayer / this.maxHpPlayer;
            const lunghezzaHpPx = 450 * 0.7 - 10;
            this.barraHpGreenPlayer.width = lunghezzaHpPx * percentuale;
        }

        // Shake e flash del player
        this.cameras.main.shake(100, 0.015);

        // Flash rosso temporaneo
        this.player.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (this.player) {
                this.player.clearTint();
            }
        });

        if (this.hpPlayer === 0) {
            this.gestisciMortePlayer();
        }
    }

    gestisciMortePlayer() {
        this.playerCanMove = false;
        this.playerCanAttack = false;

        this.player.setVelocity(0, 0);
        this.NPC.setVelocity(0, 0);
        this.player.setTint(0x333333); // Grigio scuro per player sconfitto

        // Testo di Sconfitta
        const stileSconfitta = {
            fontFamily: 'Orbitron',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { color: '#000000', blur: 10, stroke: true, fill: true }
        };

        const testoSconfitta = this.add.text(
            400,
            250,
            "SCONFITTA",
            stileSconfitta
        ).setOrigin(0.5).setDepth(10).setAlpha(0);

        testoSconfitta.setScale(0.5);
        this.tweens.add({
            targets: testoSconfitta,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    const stileSottoTesto = {
                        fontFamily: 'Orbitron',
                        fontSize: '18px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    };
                    
                    const sottoTesto = this.add.text(
                        400,
                        320,
                        "Ritorno all'Hub...",
                        stileSottoTesto
                    ).setOrigin(0.5).setDepth(10).setAlpha(0);
                    
                    this.tweens.add({
                        targets: sottoTesto,
                        alpha: 1,
                        duration: 300
                    });
                });

                // Ritorno all'Hub
                this.time.delayedCall(3000, () => {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start("HubScene", {
                            modalita: this.modalita,
                            nomePlayer: this.playerName,
                            livelloPlayer: this.livelloPlayer,
                            personaggiTot: this.personaggiTot
                        });
                    });
                });
            }
        });
    }

    animazioniNPC(npcState) {
        if (!this.NPC) return;

        if (this.npcAttackCounter > 0) {
            if (this.playerBodyW && this.playerBodyH) {
                const targetW = this.playerBodyW / this.NPC.scaleX;
                const targetH = this.playerBodyH / this.NPC.scaleY;
                const currentOffX = (this.NPC.width - targetW) / 2;
                const currentOffY = this.NPC.height - targetH;
                this.NPC.body.setSize(targetW, targetH, false);
                this.NPC.body.setOffset(currentOffX, currentOffY);
            }
            return;
        }

        const delayAnimation = 30;
        let animation = `${this.personaggioPlayer.dati.nome}standing`;
        let targetScale = 1;

        switch (npcState) {
            case "walking":
                animation = `${this.personaggioPlayer.dati.nome}walking`;
                targetScale = 64 / 103;
                break;
            case "falling":
                animation = `${this.personaggioPlayer.dati.nome}falling`;
                break;
            case "jumping":
                if (this.anims.exists(`${this.personaggioPlayer.dati.nome}jumping`)) {
                    animation = `${this.personaggioPlayer.dati.nome}jumping`;
                    targetScale = 0.5;
                } else {
                    animation = `${this.personaggioPlayer.dati.nome}falling`;
                }
                break;
            case "attacking1":
                animation = `${this.personaggioPlayer.dati.nome}attacking1`;
                break;
            case "attacking2":
                animation = `${this.personaggioPlayer.dati.nome}attacking2`;
                break;
            case "superAttacking":
                animation = `${this.personaggioPlayer.dati.nome}superAttacking`;
                targetScale = 0.5;
                break;
            case "standing":
            default:
                animation = `${this.personaggioPlayer.dati.nome}standing`;
                break;
        }

        if (this.NPC.anims.isPlaying && this.NPC.anims.currentAnim && this.NPC.anims.currentAnim.key === animation) {
            if (this.playerBodyW && this.playerBodyH) {
                const targetW = this.playerBodyW / this.NPC.scaleX;
                const targetH = this.playerBodyH / this.NPC.scaleY;
                const currentOffX = (this.NPC.width - targetW) / 2;
                const currentOffY = this.NPC.height - targetH;
                this.NPC.body.setSize(targetW, targetH, false);
                this.NPC.body.setOffset(currentOffX, currentOffY);
            }
            return;
        }

        this.NPC.anims.play(animation, true);
        this.NPC.setScale(targetScale);

        if (this.playerBodyW && this.playerBodyH) {
            const targetW = this.playerBodyW / this.NPC.scaleX;
            const targetH = this.playerBodyH / this.NPC.scaleY;
            const currentOffX = (this.NPC.width - targetW) / 2;
            const currentOffY = this.NPC.height - targetH;
            this.NPC.body.setSize(targetW, targetH, false);
            this.NPC.body.setOffset(currentOffX, currentOffY);
        }
    }


    creaBarreHp(hpPlayer, hpEnemy, refBarraHp, nomePlayer, nomeEnemy) {
        nomePlayer = nomePlayer || "User";
        nomeEnemy = nomeEnemy || "Bot 1";

        this.hpPlayer = hpPlayer;
        this.hpEnemy = hpEnemy;
        this.maxHpPlayer = hpPlayer;
        this.maxHpEnemy = hpEnemy;

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

        if (this.animationCounter > 0) {
            this.animationCounter--;
            if (this.playerBodyW && this.playerBodyH) {
                const targetW = this.playerBodyW / this.player.scaleX;
                const targetH = this.playerBodyH / this.player.scaleY;
                const currentOffX = (this.player.width - targetW) / 2;
                const currentOffY = this.player.height - targetH;
                this.player.body.setSize(targetW, targetH, false);
                this.player.body.setOffset(currentOffX, currentOffY);
            }
            return;
        }

        const delayAnimation = 30; // 30 frames = circa 0.5 secondi a 60fps
        let animation = `${this.personaggioPlayer.dati.nome}standing`;
        let targetScale = 1;

        switch (playerState) {
            case "walking":
                animation = `${this.personaggioPlayer.dati.nome}walking`;
                targetScale = 64 / 103;
                break;
            case "falling":
                animation = `${this.personaggioPlayer.dati.nome}falling`;
                break;
            case "jumping":
                if (this.anims.exists(`${this.personaggioPlayer.dati.nome}jumping`)) {
                    animation = `${this.personaggioPlayer.dati.nome}jumping`;
                    targetScale = 0.5; // texture 128x128, visual 64x64
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
                targetScale = 0.5; // texture 128x128, visual 64x64
                break;
            case "standing":
            default:
                animation = `${this.personaggioPlayer.dati.nome}standing`;
                break;
        }

        if (this.player.anims.isPlaying && this.player.anims.currentAnim && this.player.anims.currentAnim.key === animation) {
            if (this.playerBodyW && this.playerBodyH) {
                const targetW = this.playerBodyW / this.player.scaleX;
                const targetH = this.playerBodyH / this.player.scaleY;
                const currentOffX = (this.player.width - targetW) / 2;
                const currentOffY = this.player.height - targetH;
                this.player.body.setSize(targetW, targetH, false);
                this.player.body.setOffset(currentOffX, currentOffY);
            }
            return;
        }

        // 1. Play the animation first to instantly update the texture frame dimensions (width and height)
        this.player.anims.play(animation, true);

        // 2. Set the target scale on the new frame
        this.player.setScale(targetScale);

        // 3. Calculate and apply the physics body size and offset using the new frame's dimensions and scale
        if (this.playerBodyW && this.playerBodyH) {
            const targetW = this.playerBodyW / this.player.scaleX;
            const targetH = this.playerBodyH / this.player.scaleY;
            const currentOffX = (this.player.width - targetW) / 2;
            const currentOffY = this.player.height - targetH;
            this.player.body.setSize(targetW, targetH, false);
            this.player.body.setOffset(currentOffX, currentOffY);
        }
    }
}