/**
 * @file main.js
 * @description Punto di ingresso principale del client di gioco.
 * Inizializza la configurazione globale di Phaser e carica le scene di gioco.
 */

// Importazione di tutte le scene di gioco
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

/**
 * Configurazione principale del motore di gioco Phaser.
 */
const config = {
    // Tipo di rendering: Phaser.AUTO sceglie automaticamente WebGL se supportato, altrimenti Canvas
    type: Phaser.AUTO,
    
    // Dimensioni base del canvas di gioco (risoluzione logica interna)
    width: 800,
    height: 600,
    
    // Disabilita l'antialias per preservare l'estetica pixel-art nitida e pulita
    pixelArt: true,
    
    // Configurazione del target dei fotogrammi al secondo (FPS)
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    
    // Ridimensionamento e centramento automatico del gioco all'interno della finestra del browser
    scale: {
        mode: Phaser.Scale.FIT, // Adatta il canvas alla finestra mantenendo le proporzioni (800x600)
        autoCenter: Phaser.Scale.CENTER_BOTH // Centra sia in orizzontale che in verticale
    },
    
    // Configurazione del motore di fisica bidimensionale (Arcade Physics)
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }, // Gravità zero di default (movimento libero multidirezionale)
            debug: false       // Impostare su true per visualizzare i corpi fisici e le hitbox
        }
    },
    
    // Elenco ordinato delle scene registrate nel motore di gioco.
    // La prima scena dell'array (BootScene) viene avviata automaticamente all'avvio.
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
        UpgradeScene
    ]
};

// Istanziazione del gioco con la configurazione definita
const game = new Phaser.Game(config);
