const socket = io("https://cyberpunch67.onrender.com", {
    autoConnect: false // booleano che decide se il player si connette al server appena avvia il gioco
});
window.socket = socket;

import SystemScene from "./SystemScene.js";
import BootScene from "./BootScene.js";
import PreloadScene from "./PreloadScene.js";
import MainMenuScene from "./MainMenuScene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        SystemScene,
        PreloadScene,
        MainMenuScene]
};

const game = new Phaser.Game(config);

