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
        }, 300);



        // BOTTONI  
        const xBtn = 2760;
        const yBtn = -200;

        // PLAY ONLINE BTN
        this.bottonePlayOnline = this.add.image(xBtn, yBtn, "playOnlineBtn")
            .setInteractive({ pixelPerfect: true })
            .setScale(2)
            .setDepth(2);
        this.bottonePlayOnline.on("pointerover", () => {
            this.bottonePlayOnline.setFrame(1);
            this.bottonePlayOnline.setScale(2.2);
            this.bottonePlayOnline.x = xBtn + 20;

        });
        this.bottonePlayOnline.on("pointerout", () => {
            this.bottonePlayOnline.setFrame(0);
            this.bottonePlayOnline.setScale(2);
            this.bottonePlayOnline.x = xBtn;

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
            this.bottonePlayOffline.x = xBtn + 20;

        });
        this.bottonePlayOffline.on("pointerout", () => {
            this.bottonePlayOffline.setFrame(0);
            this.bottonePlayOffline.setScale(2);
            this.bottonePlayOffline.x = xBtn;

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
            this.bottoneInventory.x = xBtn + 20;

        });
        this.bottoneInventory.on("pointerout", () => {
            this.bottoneInventory.setFrame(0);
            this.bottoneInventory.setScale(2);
            this.bottoneInventory.x = xBtn;

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
            this.bottoneInfo.x = xBtn + 20;

        });
        this.bottoneInfo.on("pointerout", () => {
            this.bottoneInfo.setFrame(0);
            this.bottoneInfo.setScale(2);
            this.bottoneInfo.x = xBtn;

        });
        this.bottoneInfo.on("pointerdown", () => {
            this.bottoneInfo.setFrame(2);
        });
        this.bottoneInfo.on("pointerup", () => {
            this.bottoneInfo.setFrame(1);

        });


        this.arrayDiBottoni = [this.bottonePlayOnline, this.bottonePlayOffline, this.bottoneInventory, this.bottoneInfo];








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
        this.time.addEvent({
            loop: true,
            delay: 16,
            callback: () => {
                const t = this.time.now * 0.002;


                this.arrayDiLayer.forEach(a => {
                    a.y = Math.sin(t) * 5;
                    a.y += 100;
                })

            }
        });
    }

    bottoniCheAppaiono() {

        if (this.btnsCanFall) {
            for (let i = 0; i < this.arrayDiBottoni.length; i++) {
                const a = this.arrayDiBottoni[i];

                a.setDepth(10);
                if (a.y < 200 + 90 * i) {
                    a.y += 10;
                }

            }

            if (this.arrayDiBottoni[this.arrayDiBottoni.length - 1].y >= 200 + 90 * this.arrayDiBottoni.length) {
                this.btnsCanFall = false;
                setTimeout(() => {
                    this.personaggioPuoApparire = true;
                }, 200)

            }
        }
    }

    personaggioCheAppare() {
        if (this.personaggioPuoApparire) {

        }
    }
}