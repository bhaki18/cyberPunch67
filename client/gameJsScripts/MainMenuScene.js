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

        // PLAY ONLINE BTN
        this.bottonePlayOnline = this.add.image(xBtn, yBtn, "playOnlineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);
        this.bottonePlayOnline.on("pointerover", () => {
            this.bottonePlayOnline.setFrame(1);
            this.bottonePlayOnline.setScale(2.2);
            this.bottonePlayOnline.x += 20;

        });
        this.bottonePlayOnline.on("pointerout", () => {
            this.bottonePlayOnline.setFrame(0);
            this.bottonePlayOnline.setScale(2);
            this.bottonePlayOnline.x -= 20;

        });
        this.bottonePlayOnline.on("pointerdown", () => {
            this.bottonePlayOnline.setFrame(2);
        });
        this.bottonePlayOnline.on("pointerup", () => {
            this.bottonePlayOnline.setFrame(1);

        });

        // PLAY OFFLINE BUTTON
        this.bottonePlayOffline = this.add.image(xBtn, yBtn, "playOfflineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);

        this.bottonePlayOffline.on("pointerover", () => {
            this.bottonePlayOffline.setFrame(1);
            this.bottonePlayOffline.setScale(2.2);
            this.bottonePlayOffline.x += 20;

        });
        this.bottonePlayOffline.on("pointerout", () => {
            this.bottonePlayOffline.setFrame(0);
            this.bottonePlayOffline.setScale(2);
            this.bottonePlayOffline.x -= 20;

        });
        this.bottonePlayOffline.on("pointerdown", () => {
            this.bottonePlayOffline.setFrame(2);
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
            this.bottoneInventory.setFrame(1);
            this.bottoneInventory.setScale(2.2);
            this.bottoneInventory.x += 20;

        });
        this.bottoneInventory.on("pointerout", () => {
            this.bottoneInventory.setFrame(0);
            this.bottoneInventory.setScale(2);
            this.bottoneInventory.x -= 20;

        });
        this.bottoneInventory.on("pointerdown", () => {
            this.bottoneInventory.setFrame(2);
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
            this.bottoneInfo.setFrame(1);
            this.bottoneInfo.setScale(2.2);
            this.bottoneInfo.x += 20;

        });
        this.bottoneInfo.on("pointerout", () => {
            this.bottoneInfo.setFrame(0);
            this.bottoneInfo.setScale(2);
            this.bottoneInfo.x -= 20;

        });
        this.bottoneInfo.on("pointerdown", () => {
            this.bottoneInfo.setFrame(2);
        });
        this.bottoneInfo.on("pointerup", () => {
            this.bottoneInfo.setFrame(1);

        });


        this.arrayDiBottoni = [this.bottonePlayOnline, this.bottonePlayOffline, this.bottoneInventory, this.bottoneInfo];

        for (let i = 0; i < this.arrayDiBottoni.length; i++) {
            this.arrayDiBottoni[i].y = yBtn + (i * 90)
        }

        // PERSONAGGIO CHE DEVE CADERE 
        this.dominantRed = this.add.image(this.arenaStartX + 200, -200, "dominantRedFalling")
            .setScale(1)
            .setDepth(3)
            .setOrigin(0.5);

        // OMBRA DEL PERSONAGGIO CHE CADE

        this.dominantRedShadow = this.add.image(
            this.arenaStartX + 200,
            -200,
            "dominantRedFalling"
        )
            .setScale(2)
            .setDepth(2.5)
            .setAlpha(0.35)
            .setTint(0x000000);








    }

    update() {


        this.animationInizialeMainMenu();
        this.arenaCheOscilla();
        this.bottoniCheAppaiono();
        this.personaggioCheAppare();



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
                setTimeout(() => {
                    this.personaggioPuoApparire = true;
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
                }, 400)
            }
        }
    }
}