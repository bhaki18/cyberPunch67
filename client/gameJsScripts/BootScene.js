export default class BootScene // questa è la prima scena del gioco. non il caricamente degli assets ma la scena che fa vedere il logo con una transizione elegante come i giochi fatti con unity che scrivono a inizio gioco "made with unity". dura circa 1 secondo o poco più
    extends Phaser.Scene {
    constructor() {
        super("BootScene");

        this.logoDelGioco;
        this.logoDiPhaserJS;
        this.animationCanStart = false;
        this.logoDelGiocoAlpha = 0;
        this.animation2CanStart = false;
        this.animation3CanStart = false;
        this.logoDiPhaserJSAlpha = 0;
        this.animation4CanStart = false;
    }

    preload() {
        this.scene.launch("SystemScene");

        this.load.image("logoDelGioco", "../assets/BootScene/logoDelGioco.png");
        this.load.image("logoDiPhaserJS", "../assets/BootScene/logoDiPhaserJS.png");

    }

    create() {
        const H = 600;
        const W = 800;

        const centroX = W / 2;
        const centroY = H / 2;

        this.logoDelGioco = this.add.image(centroX, centroY, "logoDelGioco")
            .setAlpha(0)
            .setScale(0.5);

        this.logoDiPhaserJS = this.add.image(centroX, centroY, "logoDiPhaserJS")
            .setAlpha(0)
            .setScale(0.3)


        // PER LO SCHERMO INTERO
        const f11 = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F3
        );

        f11.on("down", () => {

            if (this.game.scale.isFullscreen) {
                this.game.scale.stopFullscreen();
            } else {
                this.game.scale.startFullscreen();
            }

        });

        setTimeout(() => {
            this.animationCanStart = true;
        }, 500);

    }

    update() {

        if (this.animationCanStart) {
            this.logoDelGiocoAlpha += 0.01;
            this.logoDelGioco.setAlpha(this.logoDelGiocoAlpha);
            if (this.logoDelGiocoAlpha >= 1) {
                this.animationCanStart = false;
                setTimeout(() => {
                    this.animation2CanStart = true;
                }, 500);

            }
        }

        if (this.animation2CanStart) {
            this.logoDelGiocoAlpha -= 0.01;
            this.logoDelGioco.setAlpha(this.logoDelGiocoAlpha);
            if (this.logoDelGiocoAlpha <= 0) {
                this.animation2CanStart = false;
                setTimeout(() => {
                    this.animation3CanStart = true;
                }, 300);
            }
        }

        if (this.animation3CanStart) {
            this.logoDiPhaserJSAlpha += 0.01;
            this.logoDiPhaserJS.setAlpha(this.logoDiPhaserJSAlpha);
            if (this.logoDiPhaserJSAlpha >= 1) {
                this.animation3CanStart = false;
                setTimeout(() => {
                    this.animation4CanStart = true;
                }, 500);
            }
        }

        if (this.animation4CanStart) {
            this.logoDiPhaserJSAlpha -= 0.01;
            this.logoDiPhaserJS.setAlpha(this.logoDiPhaserJSAlpha);
            if (this.logoDiPhaserJSAlpha <= 0) {
                this.animation4CanStart = false;
                setTimeout(() => {
                    this.scene.start("PreloadScene");
                }, 300)
            }

        }

    }


}


