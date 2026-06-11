export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("MainMenuScene");
        this.mapMainMenu;
        this.groundLayerMainMenu;
        this.wallsLayerMainMenu;
        this.tilesetMainMenu;
        this.arrayDiLayer = [];
        this.cameraSpeed = 0;
        this.phase = "ACCELERATE";
        this.arenaStartX = 2800; // posizione dove inizia l’arena
        this.cameraCanMove = false;
        this.personaggioPuoApparire = false;
        this.bottoneAttuale = 0;
    }

    create() {

        // 1. crea tilemap dal JSON
        this.mapMainMenu = this.make.tilemap({ key: "MapArenaFluttuante" });

        // 2. collega tileset del JSON con l'immagine caricata
        this.tilesetMainMenu = this.mapMainMenu.addTilesetImage("cyberpunk_tileset", "tilesArenaFluttuante");

        // 3. crea layer (nomi reali dalla mappa, dal basso verso l'alto)
        this.groundLayerMainMenu = this.mapMainMenu.createLayer("ground", this.tilesetMainMenu, 0, 0);
        this.ground2LayerMainMenu = this.mapMainMenu.createLayer("ground2", this.tilesetMainMenu, 0, 0);
        this.ground3LayerMainMenu = this.mapMainMenu.createLayer("ground3", this.tilesetMainMenu, 0, 0);
        this.ground4LayerMainMenu = this.mapMainMenu.createLayer("ground4", this.tilesetMainMenu, 0, 0);
        this.wallsLayerMainMenu = this.mapMainMenu.createLayer("walls1", this.tilesetMainMenu, 0, 0);
        this.walls2LayerMainMenu = this.mapMainMenu.createLayer("walls2", this.tilesetMainMenu, 0, 0);
        this.laserLayer = this.mapMainMenu.createLayer("laserLayer", this.tilesetMainMenu, 0, 0);

        // 4. crea un array di layer per modificarli dopo

        this.arrayDiLayer.push(
            this.groundLayerMainMenu,
            this.ground2LayerMainMenu,
            this.ground3LayerMainMenu,
            this.ground4LayerMainMenu,
            this.wallsLayerMainMenu,
            this.walls2LayerMainMenu,
            this.laserLayer
        );

        this.arrayDiLayer.forEach(a => {
            a.setOrigin(0.5)
            a.x = this.arenaStartX;
            a.y = 100;

        });

        this.groundLayerMainMenu.setY(this.groundLayerMainMenu.y + 10);


        // background map

        this.spaceBg = this.add.tileSprite(
            -32,
            408,
            this.scale.width,
            this.scale.height,
            "space"
        )
            .setScale(9)
            .setDepth(-2);


        setTimeout(() => {
            this.cameraCanMove = true;
        }, 200);



        // BOTTONI  
        const xBtn = 3600;
        const yBtn = 200;
        const XbtnFinale = 2760;

        // PLAY ONLINE BTN
        this.bottonePlayOnline = this.add.image(xBtn, yBtn, "playOnlineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);


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
            console.table(window.player);

        });

        // PLAY OFFLINE BUTTON
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

        });

        // INVENTORY BUTTON 

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

        });

        // INFO BUTTON

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

        });


        this.arrayDiBottoni = [this.bottonePlayOnline, this.bottonePlayOffline, this.bottoneInventory, this.bottoneInfo];

        for (let i = 0; i < this.arrayDiBottoni.length; i++) {
            this.arrayDiBottoni[i].y = yBtn + (i * 90)
        }

        this.tweens.add({
            targets: this.bottonePlayOnline,
            y: this.bottonePlayOnline.y + 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        this.tweens.add({
            targets: this.bottonePlayOffline,
            y: this.bottonePlayOffline.y + 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        this.tweens.add({
            targets: this.bottoneInventory,
            y: this.bottoneInventory.y + 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        this.tweens.add({
            targets: this.bottoneInfo,
            y: this.bottoneInfo.y + 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut"
        });

        // bottone di logIn (diverso dagli altri)

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
            this.scene.launch("LogInScene");

        });


        // PERSONAGGIO CHE DEVE CADERE 
        this.dominantRed = this.add.sprite(this.arenaStartX + 200, -200, "dominantRedFalling")
            .setScale(1)
            .setDepth(3)
            .setOrigin(0.5);

        // OMBRA DEL PERSONAGGIO CHE CADE

        this.dominantRedShadow = this.add.sprite(
            this.arenaStartX + 200,
            -200,
            "dominantRedFalling"
        )
            .setScale(2)
            .setDepth(2.5)
            .setAlpha(0.35)
            .setTint(0x000000);



        // Barra del giocatore

        const XInizialeBarraDelGiocatore = 3500;
        const YInizialeBarraDelGiocatore = 550;

        this.barraGiocatore = this.add.sprite(XInizialeBarraDelGiocatore, YInizialeBarraDelGiocatore, "barraGiocatore")
            .setAlpha(0).setScale(2.5);






    }

    update() {


        this.animationInizialeMainMenu();
        this.arenaCheOscilla();
        this.bottoniCheAppaiono();
        this.BugsHandler();
        this.personaggioCheAppare();
        this.DominantRedCheRespira();
        this.DominantRedCheAspetta();
        this.eliminaBottoneDelLogIn();
        this.faiApparireBarraGiocatore();
        this.aggiornaNomeUtentePostLogIn();

        // Muove lo sfondo spaziale per dare l'effetto di movimento
        if (this.spaceBg) {
            this.spaceBg.tilePositionX += 0.25;
        }

    }


    animationInizialeMainMenu() {

        const cam = this.cameras.main;

        const distance = this.arenaStartX - cam.scrollX;

        if (!this.cameraCanMove) return;

        // ---------------- ACCELERATE
        if (this.phase === "ACCELERATE") {

            this.cameraSpeed += 0.5;

            if (this.cameraSpeed >= 30) {
                this.cameraSpeed = 30;
                this.phase = "CONSTANT";
            }
        }

        // ---------------- CONSTANT
        else if (this.phase === "CONSTANT") {

            this.cameraSpeed = 30;

            if (distance < 500) {
                this.phase = "DECCELERATE";
            }
        }

        // ---------------- DECCELERATE
        else if (this.phase === "DECCELERATE") {

            this.cameraSpeed *= 0.95;

            if (this.cameraSpeed < 2) {
                this.cameraSpeed = 2;
            }

            if (distance < 200) {
                this.phase = "STOP";
            }
        }

        // ---------------- STOP
        else if (this.phase === "STOP") {

            this.cameraSpeed = 0;
            this.cameraCanMove = false;
            setTimeout(() => {
                this.btnsCanFall = true;
            }, 300)

            return;
        }

        cam.scrollX += this.cameraSpeed;
    }


    arenaCheOscilla() {
        const t = this.time.now * 0.002;

        this.arrayDiLayer.forEach(a => {
            a.y = 100 + Math.sin(t) * 5;
        });

        if (this.personaggioPuoOscillare) {
            this.dominantRed.y = 300 + Math.sin(t) * 5;
            this.dominantRedShadow.y = 300 + Math.sin(t) * 5;
        }
    }

    bottoniCheAppaiono() {

        if (this.btnsCanFall) {




            const a = this.arrayDiBottoni[this.bottoneAttuale];

            if (a.x > 2760) {
                a.x -= 20;
            }

            if (a.x < 2760) {
                a.x = 2760;
            }
            if (a.x === 2760) {
                this.cameras.main.shake(200, 0.008);
                this.bottoneAttuale++;
            }


            if (this.arrayDiBottoni[this.arrayDiBottoni.length - 1].x == 2760 ||
                this.arrayDiBottoni[this.arrayDiBottoni.length - 1].x === 2740) {
                this.btnsCanFall = false;

                this.tweens.add({
                    targets: this.logInBtn,
                    y: 40,
                    alpha: 1,
                    duration: 600,
                    ease: "Cubic.Out",
                    onStart: () => {

                        setTimeout(() => {
                            this.time.delayedCall(600, () => {
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
                            });
                        }, 600);
                    }
                });



                setTimeout(() => {
                    this.personaggioPuoApparire = true;
                    this.barraGiocatorePuoApparire = true;
                }, 200);

            }
        }
    }

    personaggioCheAppare() {
        if (this.personaggioPuoApparire) {
            const groundY = 400;
            if (this.dominantRed.y < 300) {
                this.dominantRed.y += 5;



                this.dominantRedShadow.x = this.dominantRed.x + 10;
                this.dominantRedShadow.y = 300; // “terra” fissa


                const t = Phaser.Math.Clamp(
                    (this.dominantRed.y / groundY),
                    0,
                    1
                );

                // più vicino al suolo → ombra più piccola e più scura
                this.dominantRedShadow.setScale(2 - t * 1.4);
                this.dominantRedShadow.setAlpha(0.01 + t * 0.3);





            } else {
                this.personaggioPuoApparire = false;
                this.personaggioPuoOscillare = true;
                this.dominantRed.setTexture("dominantRedLanding");
                this.dominantRedShadow.setTexture("dominantRedLanding");
                this.cameras.main.shake(400, 0.008);
                setTimeout(() => {
                    this.dominantRed.setTexture("dominantRedStanding");
                    this.dominantRedShadow.setTexture("dominantRedStanding");
                    this.dominantRedPuoRespirare = true;
                }, 400)
            }
        }
    }

    BugsHandler() {
        this.arrayDiBottoni.forEach(a => {
            if (a.x === 2740) {
                a.x = 2760;
            }
        })
    }

    DominantRedCheRespira() {
        if (this.dominantRedPuoRespirare) {
            this.dominantRed.play("dominantRedBreathing");
            this.dominantRedShadow.play("dominantRedBreathing");
            this.dominantRedPuoRespirare = false;
            this.dominantRedStaAspettando = true;
        }
    }

    DominantRedCheAspetta() {
        if (this.dominantRedStaAspettando) {
            setInterval(() => {
                this.dominantRed.play("dominantRedWaitingR");
                this.dominantRedShadow.play("dominantRedWaitingR");
                setTimeout(() => {
                    this.dominantRed.play("dominantRedBreathing");
                    this.dominantRedShadow.play("dominantRedBreathing");
                }, 3800);
            }, 10000);
            this.dominantRedStaAspettando = false;
        }
    }

    eliminaBottoneDelLogIn() {
        if (localStorage.getItem("playerLogged") === "true" && this.logInBtn) {
            this.logInBtn.destroy();
            this.logInBtn = null;
        }
    }


    faiApparireBarraGiocatore() {
        if (this.barraGiocatorePuoApparire) {
            this.tweens.add({
                targets: this.barraGiocatore,
                x: 2810,
                alpha: 1,
                duration: 500
            });
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

    aggiornaNomeUtentePostLogIn() {
        if (window.player.username && this.puoiAggiornareNomeUtente) {
            const displayLevel = window.player.level !== undefined ? window.player.level : 1;
            this.nomeUtenteBarraGiocatore.setText(`${window.player.username.toUpperCase()}\nLV. ${displayLevel}`);
            this.nomeUtenteBarraGiocatore.setColor("#ff007f");
            this.nomeUtenteBarraGiocatore.setShadow(0, 0, "#ff007f", 5, false, true);
            this.puoiAggiornareNomeUtente = false;
        }
    }
}