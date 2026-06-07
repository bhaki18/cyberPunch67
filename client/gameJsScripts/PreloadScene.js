export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
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

    preload() {

        // SFONDO ANIMATO
        this.load.spritesheet(
            "sfondoPreloadScene",
            "../assets/PreloadScene/sfondoPreloadScene.png",
            {
                frameWidth: 128,
                frameHeight: 64
            }
        );

        // particelle dello sfondo
        this.load.image("particellaSfondo", "../assets/PreloadScene/particellaPreloadScene.png");

        // caricamento degli assets del menu

        this.loadMainMenu();

        // barra di caricamento

        const x = this.cameras.main.centerX;
        const y = this.cameras.main.centerY;

        const width = 400;

        this.backgroundLineaDiCaricamento = this.add.graphics().setDepth(1).setAlpha(0);
        this.fillLineaDiCaricamento = this.add.graphics().setDepth(2).setAlpha(0);
        this.OggettiInPreloadScene.push(this.backgroundLineaDiCaricamento, this.fillLineaDiCaricamento);
        this.oggettiSoloInPreloadScene.push(this.backgroundLineaDiCaricamento, this.fillLineaDiCaricamento);

        // linea di sfondo
        this.backgroundLineaDiCaricamento.lineStyle(50, 0x222244, 1);
        this.backgroundLineaDiCaricamento.beginPath();
        this.backgroundLineaDiCaricamento.moveTo(x - width / 2, y);
        this.backgroundLineaDiCaricamento.lineTo(x + width / 2, y);
        this.backgroundLineaDiCaricamento.strokePath();



        this.load.on("progress", (value) => {

            this.fillLineaDiCaricamento.clear();

            // glow esterno
            this.fillLineaDiCaricamento.lineStyle(70, 0x00ffff, 0.15);
            this.fillLineaDiCaricamento.beginPath();
            this.fillLineaDiCaricamento.moveTo(x - width / 2, y);
            this.fillLineaDiCaricamento.lineTo(x - width / 2 + width * value, y);
            this.fillLineaDiCaricamento.strokePath();

            // nucleo luminoso
            this.fillLineaDiCaricamento.lineStyle(50, 0x66ffff, 1);
            this.fillLineaDiCaricamento.beginPath();
            this.fillLineaDiCaricamento.moveTo(x - width / 2, y);
            this.fillLineaDiCaricamento.lineTo(x - width / 2 + width * value, y);
            this.fillLineaDiCaricamento.strokePath();




        });

        // scritte di caricamento
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

        this.load.on("progress", value => {

            if (value < 0.25)
                this.loadingText.setText("INITIALIZING SYSTEMS");

            else if (value < 0.50)
                this.loadingText.setText("LOADING ASSETS");

            else if (value < 0.75)
                this.loadingText.setText("PREPARING ENTITIES");

            else
                this.loadingText.setText("FINALIZING STARTUP");

        });


        // scritta clicca per iniziare

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

        this.load.on("complete", () => {
            this.input.once("pointerdown", () => {
                this.animationChangeSceneCanStart = true;
            });
        });
    }

    create() {
        // background sprite
        const bg = this.add.sprite(400, 300, "sfondoPreloadScene")
            .setScale(9)
            .setDepth(-2);
        const particellaBg = [];
        const numeroDiParticelle = 25;
        for (let i = 0; i < numeroDiParticelle; i++) {
            const particella = this.add.image(Phaser.Math.Between(1, 800), Phaser.Math.Between(1, 600), "particellaSfondo")
                .setScale(0.3)
                .setDepth(-1);
            particellaBg.push(particella);
        }

        this.parecelleSfondo = particellaBg;


        // animazione (qui è il posto giusto)
        // ANIMAZIONI SFONDO
        this.anims.create({
            key: "animsSfondo",
            frames: this.anims.generateFrameNumbers("sfondoPreloadScene", {
                start: 0,
                end: 2
            }),
            frameRate: 1,
            repeat: -1
        });
        // animazioni bottoni del main menu



        // cose della preload scene
        bg.play("animsSfondo");

        this.parecelleSfondo.forEach(a => {
            this.OggettiInPreloadScene.push(a);
        })
        this.OggettiInPreloadScene.push(bg);
        this.OggettiInPreloadScene.forEach(a => {
            a.setAlpha(this.alphaOggettiInPreloadScene);
        });

        this.OggettiInPreloadSceneAnimation2.forEach(a => {
            a.setAlpha(this.alphaOggettiInPreloadSceneAnimation2)
        });
        setTimeout(() => {
            this.animationPreloadScene1CanStart = true;
        }, 300);

        this.backgroundPreloadingScene = bg;



    }

    update() {
        this.parecelleSfondo.forEach(a => {
            const partecellSpeed = 0.2;
            a.x += partecellSpeed;
            a.y -= partecellSpeed;

            (a.x > 800) ? a.x = 0 : a.x;
            (a.y < 0) ? a.y = 600 : a.y;
        });

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

        if (this.animationPreloadScene2CanStart) {
            this.alphaOggettiInPreloadSceneAnimation2 += 0.01;
            this.OggettiInPreloadSceneAnimation2.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadSceneAnimation2)
            });
            if (this.alphaOggettiInPreloadSceneAnimation2 >= 1) {
                this.animationPreloadScene2CanStart = false;
                this.animationPreloadScene3CanStart = true;
            }
        };

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

        if (this.animationChangeSceneCanStart) {
            this.alphaOggettiInPreloadScene -= 0.01
            this.oggettiSoloInPreloadScene.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadScene);
            });
            this.parecelleSfondo.forEach(a => {
                a.setAlpha(this.alphaOggettiInPreloadScene);
            })
            this.backgroundPreloadingScene.setAlpha(1);
            if (this.alphaOggettiInPreloadScene <= 0) {
                this.scene.start("MainMenuScene");
            }
        }







    }

    loadMainMenu() {
        this.load.tilemapTiledJSON(
            "MapArenaFluttuante",
            "../assets/arenaFluttuante/map.json"
        );

        this.load.image("tilesArenaFluttuante", "../assets/arenaFluttuante/spritesheet.png");

        // spazio
        this.load.image("space", "../assets/PreloadScene/space.png");

        // bottoni

        // PLAY OFFLINE BTN
        this.load.spritesheet("playOfflineBtn", "../assets/MainMenuScene/playOfflineButtonSpriteSheet.png",
            {
                frameWidth: 124,
                frameHeight: 41
            }
        );

        // PLAY ONLINE BTN

        this.load.spritesheet("playOnlineBtn", "../assets/MainMenuScene/playOnlineButtonSpriteSheet.png",
            {
                frameWidth: 124,
                frameHeight: 41
            }
        );


        // INVENTORY BTN
        this.load.spritesheet("inventoryBtn", "../assets/MainMenuScene/inventoryButtonSpriteSheet.png",
            {
                frameWidth: 124,
                frameHeight: 41
            }
        );

        // INFO BTN
        this.load.spritesheet("infoBtn", "../assets/MainMenuScene/infoButtonSpriteSheet.png",
            {
                frameWidth: 124,
                frameHeight: 41
            }
        );




    }
}



