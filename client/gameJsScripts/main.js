

import SystemScene from "./SystemScene.js";
import BootScene from "./BootScene.js";
import PreloadScene from "./PreloadScene.js";
import MainMenuScene from "./MainMenuScene.js";
import LogInScene from "./LogInScene.js";
import HubScene from "./HubScene.js";
import SignUpScene from "./SingUpScene.js";
import ArenaScene from "./ArenaScene.js";
import endMatchScene from "./endMatchScene.js";
import InfoScene from "./InfoScene.js";
import InventoryScene from "./InventoryScene.js";
import PauseScene from "./PauseScene.js";
import UpgradeScene from "./UpgradeScene.js";

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
        MainMenuScene,
        LogInScene,
        SignUpScene,
        HubScene,
        ArenaScene,
        endMatchScene,
        InfoScene,
        InventoryScene,
        PauseScene,
        UpgradeScene]
};

const game = new Phaser.Game(config);

