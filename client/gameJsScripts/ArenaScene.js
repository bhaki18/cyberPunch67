import caricaArene from "../modules/arene.js";
import convertArene from "../modules/convertArene.js";
import fx, { fxSystem } from "../modules/phaserpluginfx/phaserFx.js";


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
        this.personaggioPlayer = this.modalita === "online" ? data.mioPersonaggio : data.personaggioSelezionato;
        this.playerName = data.nomePlayer;
        this.livelloPlayer = data.livelloPlayer;
        this.personaggiTot = data.personaggiTot;

        // Validazione dei permessi di Admin per il personaggio speciale "Admin ADP"
        const isAdmin = window.player && window.player.permessi === "admin";
        let characterNameToCheck = "";
        if (this.personaggioPlayer) {
            if (this.modalita === "online") {
                characterNameToCheck = this.personaggioPlayer.nome;
            } else {
                characterNameToCheck = this.personaggioPlayer.dati ? this.personaggioPlayer.dati.nome : "";
            }
        }

        if (characterNameToCheck === "Admin ADP" && !isAdmin) {
            console.warn("[ArenaScene] Tentativo di utilizzo abusivo di Admin ADP. Reset a Dominant Red.");
            const defaultPg = this.personaggiTot.find(p => p.nome === "Dominant Red");
            if (this.modalita === "online") {
                this.personaggioPlayer = { nome: "Dominant Red", dati: defaultPg };
            } else {
                if (this.personaggioPlayer && this.personaggioPlayer.dati) {
                    this.personaggioPlayer.dati = defaultPg;
                } else {
                    this.personaggioPlayer = { dati: defaultPg };
                }
            }
        }

        this.socket = window.socket;
        this.matchEnded = false;

        if (this.modalita === "online") {
            this.roomId = data.roomId;
            this.isPlayer1 = data.isPlayer1;
            this.arenaIndex = data.arenaIndex;
            this.avversarioPersonaggio = data.avversarioPersonaggio;
            this.nomeOpponent = data.nomeOpponent;
            this.npcCharacterName = this.avversarioPersonaggio.dati.nome;
        } else {
            this.npcCharacterName = this.personaggioPlayer.dati.nome;
        }

        this.arrayDiAreneESfondiDelleArene = caricaArene();

        this.puoiAnimareLoSfondo = false;
        this.playerCanMove = false;
        this.canJump = false;
        this.playerState = "";
        this.animationCounter = 0;

        // Inizializzazione variabili NPC/Opponent
        this.npcState = "";
        this.npcAttackCounter = 0;
        this.npcCooldownCounter = 0;
        this.npcJumpsLeft = 2;

        // Inizializzazione variabili Super Attacco
        this.superAttackCharge = 0;
        this.enemySuperAttackCharge = 0;
        this.maxSuperAttackCharge = 300;
        this.superGlowTween = null;
        this.superEnemyGlowTween = null;

        // Inizializzazione stato precedente pulsanti Gamepad
        this.statoGamepadPrecedente = null;

        // Inizializzazione cooldown mosse player
        this.cooldownMossa1 = 0;
        this.cooldownMossa2 = 0;
        this.cooldownSuper = 0;
    }

    /**
     * Inizializzazione degli elementi grafici e fisici dell'arena.
     */
    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Estendi i limiti del mondo di fisica verso il basso per consentire la caduta fuori dallo schermo
        this.physics.world.setBounds(0, 0, 800, 1000);

        // Inizializzazione sistema effetti globali scena
        this.fxSystem = new fxSystem(this);

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
        } else if (this.modalita === "online") {
            this.onlineModGameCreate();
        }

        if (this.socket) {
            this.socket.on("statsAggiornate", (data) => {
                console.log("[Stats] Nuove statistiche ricevute:", data);
                this.livelloPlayer = data.level;
                if (window.player) {
                    window.player.level = data.level;
                    window.player.exp = data.exp;
                }
            });
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
        } else if (this.modalita === "online") {
            this.playerMovesOnline();
            this.animazioniPlayer(this.playerState);
            this.animazioniNPC(this.npcState);

            // Invia dati di movimento e animazione se abilitato
            if (this.playerCanMove && this.player && this.socket) {
                this.socket.emit("playerUpdate", {
                    x: this.player.x,
                    y: this.player.y,
                    vx: this.player.body.velocity.x,
                    vy: this.player.body.velocity.y,
                    flipX: this.player.flipX,
                    state: this.playerState,
                    superCharge: this.superAttackCharge
                });
            }
        }

        this.salvaStatoGamepadPrecedente();
        this.controllaCadutaMappa();
    }

    controllaCadutaMappa() {
        // Se il player cade sotto y = 640 (fuori dallo schermo), muore
        if (this.player && this.player.y > 640 && this.hpPlayer > 0) {
            this.riceviDannoPlayer(this.hpPlayer, false, null, true);
        }
        // Se il bot/nemico cade sotto y = 640 (fuori dallo schermo), muore
        if (this.NPC && this.NPC.y > 640 && this.hpEnemy > 0) {
            this.riceviDannoNPC(this.hpEnemy, false, null, true);
        }
    }

    salvaStatoGamepadPrecedente() {
        const pad = this.input.gamepad.pad1;
        if (pad) {
            this.statoGamepadPrecedente = {
                up: pad.up || pad.buttons[12].pressed || pad.buttons[0].pressed,
                attack1: pad.buttons[2].pressed,
                attack2: pad.buttons[3].pressed,
                superAttack: pad.buttons[1].pressed
            };
        } else {
            this.statoGamepadPrecedente = null;
        }
    }

    isUpJustPressed() {
        const keyboardJustDown = Phaser.Input.Keyboard.JustDown(this.inputManager.up);
        const pad = this.input.gamepad.pad1;
        if (!pad) return keyboardJustDown;

        const currentUp = pad.up || pad.buttons[12].pressed || pad.buttons[0].pressed;
        const prevUp = this.statoGamepadPrecedente ? this.statoGamepadPrecedente.up : false;

        return keyboardJustDown || (currentUp && !prevUp);
    }

    isAttack1JustPressed() {
        const keyboardJustDown = Phaser.Input.Keyboard.JustDown(this.inputManager.attack1);
        const pad = this.input.gamepad.pad1;
        if (!pad) return keyboardJustDown;

        const currentAttack1 = pad.buttons[2].pressed;
        const prevAttack1 = this.statoGamepadPrecedente ? this.statoGamepadPrecedente.attack1 : false;

        return keyboardJustDown || (currentAttack1 && !prevAttack1);
    }

    isAttack2JustPressed() {
        const keyboardJustDown = Phaser.Input.Keyboard.JustDown(this.inputManager.attack2);
        const pad = this.input.gamepad.pad1;
        if (!pad) return keyboardJustDown;

        const currentAttack2 = pad.buttons[3].pressed;
        const prevAttack2 = this.statoGamepadPrecedente ? this.statoGamepadPrecedente.attack2 : false;

        return keyboardJustDown || (currentAttack2 && !prevAttack2);
    }

    isSuperAttackJustPressed() {
        const keyboardJustDown = Phaser.Input.Keyboard.JustDown(this.inputManager.superAttack);
        const pad = this.input.gamepad.pad1;
        if (!pad) return keyboardJustDown;

        const currentSuper = pad.buttons[1].pressed;
        const prevSuper = this.statoGamepadPrecedente ? this.statoGamepadPrecedente.superAttack : false;

        return keyboardJustDown || (currentSuper && !prevSuper);
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
                // Ridotto il caricamento offline a 2 secondi per una transizione più dinamica
                this.time.delayedCall(2000, () => {
                    if (!this.scene.isActive()) return;

                    // Creiamo l'arena e il player a schermo coperto (alpha=1) per evitare pop-in visivi
                    this.creaArenaRandom();
                    this.creaPlayerENPC();

                    this.tweens.add({
                        targets: this.schermataDiCaricamentoOffline,
                        duration: 300,
                        alpha: 0,
                        ease: "power 4",
                        onComplete: () => {
                            if (this.schermataDiCaricamentoOffline) {
                                this.schermataDiCaricamentoOffline.destroy();
                            }
                        }
                    });
                });
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

        // Disabilita inizialmente il movimento per attendere il countdown
        this.playerCanMove = false;
        this.playerCanAttack = true;
        this.delayAttack = 60; // 60 frames = circa 1 secondi a 60fps
        this.counter = 0;

        // Avvia il countdown di inizio incontro (lo stesso dell'online)
        this.avviaCountdownInArena();

        // Doppio salto: 2 salti disponibili, si azzera toccando terra
        this.jumpsLeft = 2;

        // Inizializzazione effetti grafici
        this.player.fx = new fx(this.player);
        this.NPC.fx = new fx(this.NPC);

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
        const pad = this.input.gamepad.pad1;
        const isRightDown = this.inputManager.right.isDown || (pad && (pad.right || pad.buttons[15].pressed || pad.leftStick.x > 0.3));
        const isLeftDown = this.inputManager.left.isDown || (pad && (pad.left || pad.buttons[14].pressed || pad.leftStick.x < -0.3));

        if (isRightDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.walking;
            }
        } else if (isLeftDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.walking;
            }
        } else {
            // Nessun tasto premuto: ferma il player orizzontalmente
            this.player.setVelocityX(0);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.standing;
            }
        }

        // --- Doppio Salto ---
        // Quando il player tocca terra, ricarica i salti disponibili
        if (isGrounded) {
            this.jumpsLeft = 2;
        }

        if (this.isUpJustPressed() && this.jumpsLeft > 0) {
            // Primo salto: velocità piena. Secondo salto (aereo): leggermente ridotta
            const jumpForce = this.jumpsLeft === 2 ? -400 : -320;
            this.player.setVelocityY(jumpForce);
            this.jumpsLeft--;
        }

        // --- Airborne State Detection ---
        if (!isGrounded && !(this.animationCounter > 0)) {
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


        if (this.isAttack1JustPressed() && this.playerCanAttack && this.cooldownMossa1 <= 0 && !(this.animationCounter > 0)) {
            this.player.setTexture(this.personaggioPlayer.dati.nome);
            this.cooldownMossa1 = 40; // Cooldown più breve per mossa 1
            this.playerState = playerAttacks.attack1;
            this.creaHitboxAttacco(this.personaggioPlayer.dati.danniMossa1, 1);
        }

        if (this.isAttack2JustPressed() && this.playerCanAttack && this.cooldownMossa2 <= 0 && !(this.animationCounter > 0)) {
            this.player.setTexture(this.personaggioPlayer.dati.nome);
            this.cooldownMossa2 = 80; // Cooldown più lungo per mossa 2
            this.playerState = playerAttacks.attack2;
            this.creaHitboxAttacco(this.personaggioPlayer.dati.danniMossa2, 2);
        }

        if (this.isSuperAttackJustPressed() && this.playerCanAttack && this.cooldownSuper <= 0 && !(this.animationCounter > 0)) {
            if (this.superAttackCharge >= this.maxSuperAttackCharge) {
                this.superAttackCharge = 0;
                this.aggiornaBarraSuper();

                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.cooldownSuper = 60;
                this.playerState = playerAttacks.superAttack;
                this.creaHitboxAttacco(this.personaggioPlayer.dati.danniSuperAttakc, "super");
            } else {
                console.log("Super attacco non ancora carico!");
            }
        }

        // Decremento indipendente dei cooldown per ogni mossa
        if (this.cooldownMossa1 > 0) this.cooldownMossa1--;
        if (this.cooldownMossa2 > 0) this.cooldownMossa2--;
        if (this.cooldownSuper > 0) this.cooldownSuper--;
    }

    creaHitboxAttacco(danno, tipoMossa = 1) {
        if (!this.player || !this.NPC || this.hpEnemy <= 0) return;

        // Regole dimensione hitbox: mossa 1 (danno minore) ha l'hitbox più grande, mossa 2 (danno maggiore) ha l'hitbox più piccolo.
        let larghezza = 80;
        let altezza = 60;
        let offsetDirezione = this.player.flipX ? -55 : 55;

        if (tipoMossa === 2) {
            larghezza = 36;
            altezza = 30;
            offsetDirezione = this.player.flipX ? -35 : 35;
        } else if (tipoMossa === "super") {
            larghezza = 60;
            altezza = 45;
            offsetDirezione = this.player.flipX ? -45 : 45;
        }

        const hitboxX = this.player.x + offsetDirezione;
        const hitboxY = this.player.y - 30; // Altezza mezza persona (ancorata ai piedi)

        // Crea un oggetto fisico temporaneo e invisibile
        const hitbox = this.physics.add.sprite(hitboxX, hitboxY, null);
        hitbox.setSize(larghezza, altezza);
        hitbox.setVisible(false);
        hitbox.body.setAllowGravity(false);

        let colpoAndatoASegno = false;

        // Rileva l'overlap singolo col nemico
        this.physics.add.overlap(hitbox, this.NPC, () => {
            if (!colpoAndatoASegno) {
                colpoAndatoASegno = true;
                const direzioneKnockback = this.player.flipX ? -1 : 1;
                this.riceviDannoNPC(danno, tipoMossa === "super", direzioneKnockback);
            }
        });

        // Distruggi la hitbox dopo 150 millisecondi
        this.time.delayedCall(150, () => {
            hitbox.destroy();
        });
    }

    riceviDannoNPC(danno, isSuper = false, direzioneKnockback = null, ignoreImmunity = false) {
        if (this.hpEnemy <= 0) return;
        if (!ignoreImmunity && this.NPC && this.NPC._immune) return;

        this.hpEnemy -= danno;
        if (this.hpEnemy < 0) {
            this.hpEnemy = 0;
        }

        // Knockback (sbalzo di lato) e stordimento se è una super
        if (isSuper && this.NPC && this.player) {
            this.npcAttackCounter = 32; // Stordimento esteso per coprire lo shake e lo sbalzo (~530ms)

            // Determina la direzione in base al lato della texture dell'attaccante al momento del colpo
            const dir = direzioneKnockback !== null ? direzioneKnockback : (this.player.flipX ? -1 : 1);

            // Applica lo sbalzo solo dopo la fine dell'effetto ShakeFx (210ms per sicurezza di pulizia tween)
            this.time.delayedCall(210, () => {
                if (this.NPC && this.hpEnemy > 0 && !this.matchEnded) {
                    this.NPC.setVelocityX(dir * 900); // Sbalzo in stile Super Smash Bros
                    this.NPC.setVelocityY(-400); // Lancio verso l'alto
                }
            });
        }

        // Effetto numero di danno fluttuante e vibrazione del personaggio
        if (this.NPC && this.NPC.fx) {
            const size = isSuper ? 36 : 28;
            const color = isSuper ? "ffaa00" : "ff3333";
            this.NPC.fx.DamageNumberFx(danno, size, color);
            this.NPC.fx.ShakeFx(200, isSuper ? 10 : 5);
            this.NPC.fx.ImmuneFx(1000);
        }

        // Incrementa la carica della super (fino al massimo consentito) SOLO se non è un super attacco
        if (!isSuper && this.superAttackCharge < this.maxSuperAttackCharge) {
            this.superAttackCharge += danno;
            if (this.superAttackCharge > this.maxSuperAttackCharge) {
                this.superAttackCharge = this.maxSuperAttackCharge;
            }
            this.aggiornaBarraSuper();
        }

        // Ridimensiona graficamente la barra HP del nemico
        if (this.barraHpGreenEnemy && this.maxHpEnemy) {
            const percentuale = this.hpEnemy / this.maxHpEnemy;
            this.barraHpGreenEnemy.scaleX = percentuale;
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
        if (this.matchEnded) return;
        this.matchEnded = true;

        // Attiva l'effetto slow-motion per 3 secondi alla fine del match
        if (this.fxSystem) {
            this.fxSystem.RallyFx(3000, 0.2);
        }

        if (this.socket) {
            if (this.modalita === "online") {
                this.socket.emit("registraMatchOnline", { vinta: true });
            } else {
                this.socket.emit("registraMatchOffline");
            }
        }

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
                this.time.delayedCall(500, () => {
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
                        "Caricamento risultati...",
                        stileSottoTesto
                    ).setOrigin(0.5).setDepth(10).setAlpha(0);

                    this.tweens.add({
                        targets: sottoTesto,
                        alpha: 1,
                        duration: 300
                    });
                });

                this.mostraSchermataRisultati(true);
            }
        });
    }

    npcBehaviorOffline() {
        if (!this.NPC || !this.player || this.hpEnemy <= 0 || this.hpPlayer <= 0) return;

        // Se il movimento è bloccato (es: durante il countdown), il bot sta fermo
        if (!this.playerCanMove) {
            this.NPC.setVelocityX(0);
            this.npcState = "standing";
            return;
        }

        // Decrementa i contatori
        if (this.npcAttackCounter > 0) {
            this.npcAttackCounter--;
            // Ferma il movimento orizzontale solo se il bot sta effettivamente attaccando
            if (this.npcState === "attacking1" || this.npcState === "attacking2" || this.npcState === "superAttacking") {
                this.NPC.setVelocityX(0);
            }
            return;
        }

        if (this.npcCooldownCounter > 0) {
            this.npcCooldownCounter--;
        }

        const speed = 130; // Velocità NPC
        const isGrounded = this.NPC.body.blocked.down || this.NPC.body.touching.down;

        if (isGrounded) {
            this.npcJumpsLeft = 2;
        }

        const diffX = this.player.x - this.NPC.x;
        const absDiffX = Math.abs(diffX);
        const diffY = this.player.y - this.NPC.y;

        const direzione = diffX > 0 ? 1 : -1;

        // --- INTELLIGENZA CADUTA: Controllo del vuoto davanti ---
        let haTerrenoDavanti = true;
        if (isGrounded && this.layerArenaMuri) {
            // Rileva se c'è terreno a 30px di distanza in orizzontale e 30px in basso
            const checkX = this.NPC.x + direzione * 30;
            const checkY = this.NPC.y + 30;
            const tile = this.layerArenaMuri.getTileAtWorldXY(checkX, checkY);
            if (!tile) {
                haTerrenoDavanti = false;
            }
        }

        // 1. Chasing (Inseguimento) o posizionamento
        if (absDiffX > 65) {
            if (!haTerrenoDavanti) {
                // Se c'è un vuoto davanti, prova a saltarlo
                if (this.npcJumpsLeft > 0) {
                    const jumpForce = this.npcJumpsLeft === 2 ? -400 : -320;
                    this.NPC.setVelocityY(jumpForce);
                    this.NPC.setVelocityX(direzione * speed * 1.3); // Spinta orizzontale extra per superare il vuoto
                    this.npcJumpsLeft--;
                    this.npcState = "jumping";
                } else {
                    // Nessun salto rimasto: si ferma sul bordo per non cadere
                    this.NPC.setVelocityX(0);
                    if (isGrounded) {
                        this.npcState = "standing";
                    }
                }
            } else {
                // Terreno sicuro, cammina verso il player
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
                    this.npcAttackCounter = 30; // Si blocca movimento per 30 frame
                    this.npcCooldownCounter = 40; // Cooldown di 40 frame per mossa 1
                    this.creaHitboxAttaccoNPC(this.personaggioPlayer.dati.danniMossa1, 1);
                } else {
                    this.npcState = "attacking2";
                    this.npcAttackCounter = 30;
                    this.npcCooldownCounter = 80; // Cooldown di 80 frame per mossa 2
                    this.creaHitboxAttaccoNPC(this.personaggioPlayer.dati.danniMossa2, 2);
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

    creaHitboxAttaccoNPC(danno, tipoMossa = 1) {
        if (!this.NPC || !this.player || this.hpPlayer <= 0) return;

        // Regole dimensione hitbox: mossa 1 (danno minore) ha l'hitbox più grande, mossa 2 (danno maggiore) ha l'hitbox più piccolo.
        let larghezza = 80;
        let altezza = 60;
        let offsetDirezione = this.NPC.flipX ? -55 : 55;

        if (tipoMossa === 2) {
            larghezza = 36;
            altezza = 30;
            offsetDirezione = this.NPC.flipX ? -35 : 35;
        } else if (tipoMossa === "super") {
            larghezza = 60;
            altezza = 45;
            offsetDirezione = this.NPC.flipX ? -45 : 45;
        }

        const hitboxX = this.NPC.x + offsetDirezione;
        const hitboxY = this.NPC.y - 30;

        const hitbox = this.physics.add.sprite(hitboxX, hitboxY, null);
        hitbox.setSize(larghezza, altezza);
        hitbox.setVisible(false);
        hitbox.body.setAllowGravity(false);

        let colpoAndatoASegno = false;

        this.physics.add.overlap(hitbox, this.player, () => {
            if (!colpoAndatoASegno) {
                colpoAndatoASegno = true;
                const direzioneKnockback = this.NPC.flipX ? -1 : 1;
                this.riceviDannoPlayer(danno, tipoMossa === "super", direzioneKnockback);
            }
        });

        this.time.delayedCall(150, () => {
            hitbox.destroy();
        });
    }

    riceviDannoPlayer(danno, isSuper = false, direzioneKnockback = null, ignoreImmunity = false) {
        if (this.hpPlayer <= 0) return;
        if (!ignoreImmunity && this.player && this.player._immune) return;

        this.hpPlayer -= danno;
        if (this.hpPlayer < 0) {
            this.hpPlayer = 0;
        }

        // Knockback (sbalzo di lato) e stordimento se è una super
        if (isSuper && this.player && this.NPC) {
            // Stordimento: disabilita temporaneamente i movimenti del player per 530ms (shake + sbalzo)
            this.playerCanMove = false;
            this.time.delayedCall(530, () => {
                if (this.hpPlayer > 0 && !this.matchEnded) {
                    this.playerCanMove = true;
                }
            });

            // Determina la direzione in base al lato della texture dell'attaccante al momento del colpo
            const dir = direzioneKnockback !== null ? direzioneKnockback : (this.NPC.flipX ? -1 : 1);

            // Applica lo sbalzo solo dopo la fine dell'effetto ShakeFx (210ms per sicurezza di pulizia tween)
            this.time.delayedCall(210, () => {
                if (this.player && this.hpPlayer > 0 && !this.matchEnded) {
                    this.player.setVelocityX(dir * 900); // Sbalzo in stile Super Smash Bros
                    this.player.setVelocityY(-400); // Lancio verso l'alto
                }
            });
        }

        // Effetto numero di danno fluttuante e vibrazione del personaggio
        if (this.player && this.player.fx) {
            const isSuper = danno > 25;
            const size = isSuper ? 36 : 28;
            const color = isSuper ? "ffaa00" : "ff3333";
            this.player.fx.DamageNumberFx(danno, size, color);
            this.player.fx.ShakeFx(200, isSuper ? 10 : 5);
            this.player.fx.ImmuneFx(1000);
        }

        // Ridimensiona barra HP del player
        if (this.barraHpGreenPlayer && this.maxHpPlayer) {
            const percentuale = this.hpPlayer / this.maxHpPlayer;
            this.barraHpGreenPlayer.scaleX = percentuale;
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
        if (this.matchEnded) return;
        this.matchEnded = true;

        // Attiva l'effetto slow-motion per 3 secondi alla fine del match
        if (this.fxSystem) {
            this.fxSystem.RallyFx(3000, 0.2);
        }

        if (this.socket) {
            if (this.modalita === "online") {
                this.socket.emit("registraMatchOnline", { vinta: false });
            } else {
                this.socket.emit("registraMatchOffline");
            }
        }

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
                this.time.delayedCall(500, () => {
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
                        "Caricamento risultati...",
                        stileSottoTesto
                    ).setOrigin(0.5).setDepth(10).setAlpha(0);

                    this.tweens.add({
                        targets: sottoTesto,
                        alpha: 1,
                        duration: 300
                    });
                });

                this.mostraSchermataRisultati(false);
            }
        });
    }

    animazioniNPC(npcState) {
        if (!this.NPC) return;

        if (this.npcAttackCounter > 0) {
            if (this.modalita === "online") {
                this.npcAttackCounter--;
            }
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
        let animation = `${this.npcCharacterName}standing`;
        let targetScale = 1;

        switch (npcState) {
            case "walking":
                animation = `${this.npcCharacterName}walking`;
                targetScale = 64 / 103;
                break;
            case "falling":
                animation = `${this.npcCharacterName}falling`;
                break;
            case "jumping":
                if (this.anims.exists(`${this.npcCharacterName}jumping`)) {
                    animation = `${this.npcCharacterName}jumping`;
                    targetScale = 0.5;
                } else {
                    animation = `${this.npcCharacterName}falling`;
                }
                break;
            case "attacking1":
                animation = `${this.npcCharacterName}attacking1`;
                break;
            case "attacking2":
                animation = `${this.npcCharacterName}attacking2`;
                break;
            case "superAttacking":
                animation = `${this.npcCharacterName}superAttacking`;
                targetScale = 0.5;
                break;
            case "standing":
            default:
                animation = `${this.npcCharacterName}standing`;
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
        const yNomi = 75;
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

        // --- Barra Super Colpo (Viola Neon con bordo Cyan) ---
        const superBarY = barraY + 22; // Centrata a Y = 62
        const superBarHeight = 10;

        // Bordo esterno neon cyan
        this.bordoSuperPlayer = this.add.rectangle(
            0 + 40 - 2,
            superBarY,
            lunghezzaHpPx + 4,
            superBarHeight + 4,
            0x8efcff
        )
            .setOrigin(0, 0.5)
            .setDepth(1);

        // Sfondo barra super (viola scurissimo)
        this.sfondoSuperPlayer = this.add.rectangle(
            0 + 40,
            superBarY,
            lunghezzaHpPx,
            superBarHeight,
            0x15002a
        )
            .setOrigin(0, 0.5)
            .setDepth(2);

        // Barra super effettiva (viola elettrico)
        this.barraSuperPlayer = this.add.rectangle(
            0 + 40,
            superBarY,
            0, // Inizialmente vuota
            superBarHeight,
            0xb026ff
        )
            .setOrigin(0, 0.5)
            .setDepth(3);

        // --- Barra Super Colpo Enemy/NPC (Viola Neon con bordo Cyan) ---
        // Bordo esterno neon cyan
        this.bordoSuperEnemy = this.add.rectangle(
            W - 40 + 2,
            superBarY,
            lunghezzaHpPx + 4,
            superBarHeight + 4,
            0x8efcff
        )
            .setOrigin(1, 0.5)
            .setDepth(1);

        // Sfondo barra super (viola scurissimo)
        this.sfondoSuperEnemy = this.add.rectangle(
            W - 40,
            superBarY,
            lunghezzaHpPx,
            superBarHeight,
            0x15002a
        )
            .setOrigin(1, 0.5)
            .setDepth(2);

        // Barra super effettiva (viola elettrico)
        this.barraSuperEnemy = this.add.rectangle(
            W - 40,
            superBarY,
            0, // Inizialmente vuota
            superBarHeight,
            0xb026ff
        )
            .setOrigin(1, 0.5)
            .setDepth(3);

    }

    aggiornaBarraSuper() {
        if (this.barraSuperPlayer && this.maxSuperAttackCharge) {
            const percentuale = this.superAttackCharge / this.maxSuperAttackCharge;
            const lunghezzaHpPx = 450 * 0.7 - 10;
            this.barraSuperPlayer.setSize(lunghezzaHpPx * percentuale, this.barraSuperPlayer.height);

            // Effetto lampeggio (glow) se carica al 100%
            if (this.superAttackCharge >= this.maxSuperAttackCharge) {
                if (!this.superGlowTween) {
                    this.superGlowTween = this.tweens.add({
                        targets: this.barraSuperPlayer,
                        alpha: 0.4,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else {
                if (this.superGlowTween) {
                    this.superGlowTween.stop();
                    this.superGlowTween = null;
                }
                this.barraSuperPlayer.setAlpha(1);
            }
        }
    }

    aggiornaBarraSuperEnemy() {
        if (this.barraSuperEnemy && this.maxSuperAttackCharge) {
            const percentuale = this.enemySuperAttackCharge / this.maxSuperAttackCharge;
            const lunghezzaHpPx = 450 * 0.7 - 10;
            this.barraSuperEnemy.setSize(lunghezzaHpPx * percentuale, this.barraSuperEnemy.height);

            // Effetto lampeggio (glow) se carica al 100%
            if (this.enemySuperAttackCharge >= this.maxSuperAttackCharge) {
                if (!this.superEnemyGlowTween) {
                    this.superEnemyGlowTween = this.tweens.add({
                        targets: this.barraSuperEnemy,
                        alpha: 0.4,
                        duration: 200,
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else {
                if (this.superEnemyGlowTween) {
                    this.superEnemyGlowTween.stop();
                    this.superEnemyGlowTween = null;
                }
                this.barraSuperEnemy.setAlpha(1);
            }
        }
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

    onlineModGameCreate() {
        this.schermataDiCaricamentoOnline = this.add.sprite(
            400,
            300,
            "SchermataDiCaricamentoOffline"
        )
            .setAlpha(0)
            .setScale(0.5)
            .setOrigin(0.5);

        this.tweens.add({
            targets: this.schermataDiCaricamentoOnline,
            duration: 300,
            alpha: 1,
            ease: "power 4",
            onComplete: () => {
                this.creaArenaOnline();
                this.creaPlayerEOpponentOnline();

                this.tweens.add({
                    targets: this.schermataDiCaricamentoOnline,
                    duration: 300,
                    alpha: 0,
                    ease: "power 4",
                    onComplete: () => {
                        if (this.schermataDiCaricamentoOnline) {
                            this.schermataDiCaricamentoOnline.destroy();
                        }

                        if (this.socket) {
                            this.socket.emit("playerReadyInArena");
                        }
                    }
                });
            }
        });

        // Spegnimento della scena per evitare leak
        this.events.once("shutdown", () => {
            this.rimuoviSocketListeners();
        });
    }

    creaArenaOnline() {
        const index = (this.arenaIndex !== undefined) ? (this.arenaIndex % this.arrayDiAreneESfondiDelleArene.length) : 0;
        const arenaSelezionata = this.arrayDiAreneESfondiDelleArene[index];
        const refSfondo = arenaSelezionata.getRefSfondo();
        const refArena = arenaSelezionata.getRefArena();
        const refTiles = arenaSelezionata.getRefTiles();

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

        const map = this.make.tilemap({ key: refArena });
        const tileset = map.addTilesetImage("spritefusion", refTiles);

        this.layerArena = map.createLayer("Layer_0", tileset, 0, 0);
        this.layerArenaMuri = map.createLayer("Layer_1", tileset, 0, 0);
        this.layerArenaMuri.setCollisionByExclusion([-1]);

        const { scaleX, scaleY, x, y } = convertArene({
            mapWidthPx: map.widthInPixels,
            mapHeightPx: map.heightInPixels,
            screenWidth: this.scale.width,
            screenHeight: this.scale.height,
            mode: "stretch"
        });

        this.layerArena.setScale(scaleX, scaleY).setPosition(x, y + 200);
        this.layerArenaMuri.setScale(scaleX, scaleY).setPosition(x, y + 200);

        this.tweens.add({
            targets: this.layerArena,
            y: this.layerArena.y + 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    creaPlayerEOpponentOnline() {
        const spawnPlayerX = this.isPlayer1 ? 150 : 650;
        const spawnOpponentX = this.isPlayer1 ? 650 : 150;
        const spawnY = 150;

        // Player Locale
        this.player = this.physics.add.sprite(
            spawnPlayerX,
            spawnY,
            this.personaggioPlayer.dati.nome
        ).setOrigin(0.5, 1);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(500);

        const bodyW = this.player.width * 0.45;
        const bodyH = this.player.height * 0.85;
        const offX = (this.player.width - bodyW) / 2;
        const offY = (this.player.height - bodyH);

        this.playerBodyW = bodyW;
        this.playerBodyH = bodyH;
        this.player.body.setSize(bodyW, bodyH, false);
        this.player.body.setOffset(offX, offY);

        if (!this.isPlayer1) {
            this.player.setFlipX(true);
        }

        // Opponent
        this.NPC = this.physics.add.sprite(
            spawnOpponentX,
            spawnY,
            this.avversarioPersonaggio.dati.nome
        )
            .setOrigin(0.5, 1)
            .setTint(0xff8888); // Leggermente rossastro per distinzione online

        this.NPC.setCollideWorldBounds(true);
        this.NPC.body.setGravityY(500);
        this.NPC.body.setSize(bodyW, bodyH, false);
        this.NPC.body.setOffset(offX, offY);

        if (this.isPlayer1) {
            this.NPC.setFlipX(true);
        }

        // Collisioni
        this.physics.add.collider(this.player, this.layerArenaMuri);
        this.physics.add.collider(this.NPC, this.layerArenaMuri);
        this.physics.add.collider(this.player, this.NPC);

        this.playerCanMove = false;
        this.playerCanAttack = true;
        this.delayAttack = 60;
        this.counter = 0;
        this.jumpsLeft = 2;

        // Inizializzazione effetti grafici
        this.player.fx = new fx(this.player);
        this.NPC.fx = new fx(this.NPC);

        this.creaBarreHp(
            this.personaggioPlayer.dati.hp,
            this.avversarioPersonaggio.dati.hp,
            "barraDegliHp",
            this.playerName,
            this.nomeOpponent
        );

        // Listeners Socket
        if (this.socket) {
            this.socket.on("startArenaCountdown", () => {
                this.avviaCountdownInArena();
            });

            this.socket.on("opponentUpdate", (data) => {
                if (this.NPC) {
                    this.NPC.setPosition(data.x, data.y);
                    this.NPC.setVelocity(data.vx, data.vy);
                    this.NPC.setFlipX(data.flipX);

                    this.npcState = data.state;

                    if (data.superCharge !== undefined) {
                        this.enemySuperAttackCharge = data.superCharge;
                        this.aggiornaBarraSuperEnemy();
                    }
                }
            });

            this.socket.on("opponentAttack", (data) => {
                if (this.NPC) {
                    this.npcState = data.attackType;

                    if (data.attackType === "attacking1" || data.attackType === "attacking2") {
                        this.npcAttackCounter = 30;
                    } else if (data.attackType === "superAttacking") {
                        this.npcAttackCounter = 60;
                        // Reset carica super per avversario online quando la usa
                        this.enemySuperAttackCharge = 0;
                        this.aggiornaBarraSuperEnemy();
                    }
                }
            });

            this.socket.on("opponentHit", (data) => {
                this.riceviDannoPlayer(data.damage, data.isSuper, data.direzioneKnockback);
            });

            this.socket.on("playerDisconnected", (data) => {
                this.gestisciDisconnessioneAvversario();
            });
        }
    }

    avviaCountdownInArena() {
        const stileConto = {
            fontFamily: 'Orbitron',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#fcee0a',
            stroke: '#000000',
            strokeThickness: 8
        };

        const testoConto = this.add.text(400, 250, "3", stileConto).setOrigin(0.5).setDepth(20);

        let countdown = 3;
        const timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                if (countdown === 2) {
                    testoConto.setText("2");
                } else if (countdown === 1) {
                    testoConto.setText("1");
                } else if (countdown === 0) {
                    testoConto.setText("FIGHT!");
                    testoConto.setColor("#00ff00");
                    testoConto.setFontSize(72);
                    this.playerCanMove = true;
                } else {
                    testoConto.destroy();
                    timer.destroy();
                }
            },
            repeat: 4
        });
    }

    playerMovesOnline() {
        if (!this.playerCanMove || !this.player) return;

        const playerMoves = {
            walking: "walking",
            falling: "falling",
            jumping: "jumping",
            standing: "standing"
        };

        const speed = 200;
        const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;

        const pad = this.input.gamepad.pad1;
        const isRightDown = this.inputManager.right.isDown || (pad && (pad.right || pad.buttons[15].pressed || pad.leftStick.x > 0.3));
        const isLeftDown = this.inputManager.left.isDown || (pad && (pad.left || pad.buttons[14].pressed || pad.leftStick.x < -0.3));

        if (isRightDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.walking;
            }
        } else if (isLeftDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.walking;
            }
        } else {
            this.player.setVelocityX(0);

            if (isGrounded && !(this.animationCounter > 0)) {
                this.playerState = playerMoves.standing;
            }
        }

        if (isGrounded) {
            this.jumpsLeft = 2;
        }

        if (this.isUpJustPressed() && this.jumpsLeft > 0) {
            const jumpForce = this.jumpsLeft === 2 ? -400 : -320;
            this.player.setVelocityY(jumpForce);
            this.jumpsLeft--;
        }

        if (!isGrounded && !(this.animationCounter > 0)) {
            if (this.player.body.velocity.y < -50) {
                this.playerState = playerMoves.jumping;
            } else if (this.player.body.velocity.y > 50) {
                this.playerState = playerMoves.falling;
            }
        }

        this.playerAttacksOnline();
    }

    playerAttacksOnline() {
        const playerAttacks = {
            attack1: "attacking1",
            attack2: "attacking2",
            superAttack: "superAttacking"
        };

        if (this.isAttack1JustPressed() && this.playerCanAttack && this.cooldownMossa1 <= 0 && !(this.animationCounter > 0)) {
            this.player.setTexture(this.personaggioPlayer.dati.nome);
            this.cooldownMossa1 = 40; // Cooldown più breve per mossa 1
            this.playerState = playerAttacks.attack1;
            this.creaHitboxAttaccoOnline(this.personaggioPlayer.dati.danniMossa1, 1);

            if (this.socket) {
                this.socket.emit("playerAttack", { attackType: "attacking1" });
            }
        }

        if (this.isAttack2JustPressed() && this.playerCanAttack && this.cooldownMossa2 <= 0 && !(this.animationCounter > 0)) {
            this.player.setTexture(this.personaggioPlayer.dati.nome);
            this.cooldownMossa2 = 80; // Cooldown più lungo per mossa 2
            this.playerState = playerAttacks.attack2;
            this.creaHitboxAttaccoOnline(this.personaggioPlayer.dati.danniMossa2, 2);

            if (this.socket) {
                this.socket.emit("playerAttack", { attackType: "attacking2" });
            }
        }

        if (this.isSuperAttackJustPressed() && this.playerCanAttack && this.cooldownSuper <= 0 && !(this.animationCounter > 0)) {
            if (this.superAttackCharge >= this.maxSuperAttackCharge) {
                this.superAttackCharge = 0;
                this.aggiornaBarraSuper();

                this.player.setTexture(this.personaggioPlayer.dati.nome);
                this.cooldownSuper = 60;
                this.playerState = playerAttacks.superAttack;
                this.creaHitboxAttaccoOnline(this.personaggioPlayer.dati.danniSuperAttakc, "super");

                if (this.socket) {
                    this.socket.emit("playerAttack", { attackType: "superAttacking" });
                }
            } else {
                console.log("Super attacco non ancora carico!");
            }
        }

        // Decremento indipendente dei cooldown per ogni mossa
        if (this.cooldownMossa1 > 0) this.cooldownMossa1--;
        if (this.cooldownMossa2 > 0) this.cooldownMossa2--;
        if (this.cooldownSuper > 0) this.cooldownSuper--;
    }

    creaHitboxAttaccoOnline(danno, tipoMossa = 1) {
        if (!this.player || !this.NPC || this.hpEnemy <= 0) return;

        // Regole dimensione hitbox: mossa 1 (danno minore) ha l'hitbox più grande, mossa 2 (danno maggiore) ha l'hitbox più piccolo.
        let larghezza = 80;
        let altezza = 60;
        let offsetDirezione = this.player.flipX ? -55 : 55;

        if (tipoMossa === 2) {
            larghezza = 36;
            altezza = 30;
            offsetDirezione = this.player.flipX ? -35 : 35;
        } else if (tipoMossa === "super") {
            larghezza = 60;
            altezza = 45;
            offsetDirezione = this.player.flipX ? -45 : 45;
        }

        const hitboxX = this.player.x + offsetDirezione;
        const hitboxY = this.player.y - 30;

        const hitbox = this.physics.add.sprite(hitboxX, hitboxY, null);
        hitbox.setSize(larghezza, altezza);
        hitbox.setVisible(false);
        hitbox.body.setAllowGravity(false);

        let colpoAndatoASegno = false;

        this.physics.add.overlap(hitbox, this.NPC, () => {
            if (!colpoAndatoASegno) {
                colpoAndatoASegno = true;
                const direzioneKnockback = this.player.flipX ? -1 : 1;
                this.riceviDannoNPC(danno, tipoMossa === "super", direzioneKnockback);

                if (this.socket) {
                    this.socket.emit("playerHit", {
                        damage: danno,
                        isSuper: tipoMossa === "super",
                        direzioneKnockback: direzioneKnockback
                    });
                }
            }
        });

        this.time.delayedCall(150, () => {
            hitbox.destroy();
        });
    }

    gestisciDisconnessioneAvversario() {
        if (this.matchEnded) return;
        this.matchEnded = true;

        if (this.socket) {
            this.socket.emit("registraMatchOnline", { vinta: true });
        }

        this.playerCanMove = false;
        this.playerCanAttack = false;

        if (this.player) this.player.setVelocity(0, 0);
        if (this.NPC) this.NPC.setVelocity(0, 0);

        this.rimuoviSocketListeners();

        const stileDisconnessione = {
            fontFamily: 'Orbitron',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ff007f',
            stroke: '#000000',
            strokeThickness: 6
        };

        const testoDisconnessione = this.add.text(
            400,
            250,
            "AVVERSARIO DISCONNESSO\nVITTORIA A TAVOLINO!",
            stileDisconnessione
        ).setOrigin(0.5).setDepth(20).setAlign("center");

        this.mostraSchermataRisultati(true, true);
    }

    rimuoviSocketListeners() {
        if (this.socket) {
            this.socket.off("startArenaCountdown");
            this.socket.off("opponentUpdate");
            this.socket.off("opponentAttack");
            this.socket.off("opponentHit");
            this.socket.off("playerDisconnected");
            this.socket.off("statsAggiornate");
        }
    }

    mostraSchermataRisultati(vinta, disconnessione = false) {
        const logged = localStorage.getItem("playerLogged") === "true";

        let timeoutAttivato = false;

        const avviaScenaRisultati = (stats) => {
            if (timeoutAttivato) return;
            timeoutAttivato = true;

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.rimuoviSocketListeners();
                this.scene.start("endMatchScene", {
                    vinta: vinta,
                    disconnessione: disconnessione,
                    modalita: this.modalita,
                    nomePlayer: this.playerName,
                    personaggioPlayer: this.personaggioPlayer,
                    personaggiTot: this.personaggiTot,
                    statsAggiornate: stats
                });
            });
        };

        if (logged && this.socket && this.socket.connected) {
            // Registra listener temporaneo per ricevere le statistiche salvate
            this.socket.once("statsAggiornate", (data) => {
                this.time.delayedCall(1500, () => {
                    avviaScenaRisultati(data);
                });
            });

            // Timeout di sicurezza: procedi dopo 4.5 secondi anche in assenza di risposta
            this.time.delayedCall(4500, () => {
                console.warn("[ArenaScene] Attivato timeout di sicurezza per statsAggiornate.");
                avviaScenaRisultati(null);
            });
        } else {
            // Se ospite o non connesso, carica la schermata direttamente dopo 2.5 secondi
            this.time.delayedCall(2500, () => {
                avviaScenaRisultati(null);
            });
        }
    }
}