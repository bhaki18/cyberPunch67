export default class SystemScene extends Phaser.Scene {
    constructor() {
        super("SystemScene");
    }


    create() {

        localStorage.setItem("playerLogged", "false");
        window.player = { username: null };

        // PER LO SCHERMO INTERO
        const f5 = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F5
        );

        f5.on("down", () => {

            if (this.game.scale.isFullscreen) {
                this.game.scale.stopFullscreen();
            } else {
                this.game.scale.startFullscreen();
            }

        });

    }
}