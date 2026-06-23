/**
 * @class SystemScene
 * @extends Phaser.Scene
 * @description Scena di sistema globale e persistente.
 * Gestisce l'inizializzazione dello stato utente locale (localStorage, window.player)
 * e implementa shortcut globali a livello di tastiera (come l'F5 per lo schermo intero).
 */
export default class SystemScene extends Phaser.Scene {
    constructor() {
        // Registra la scena nel gestore di Phaser con un identificativo unico
        super("SystemScene");
    }

    create() {
        // Reset iniziale dello stato di login sul browser per motivi di sicurezza ad ogni avvio
        localStorage.setItem("playerLogged", "false");

        // Inizializza l'oggetto globale player associato all'istanza di window per l'accesso trasversale tra le scene
        window.player = { username: null };

        // Registrazione del tasto di shortcut F5 per il toggle della modalità Schermo Intero
        const f5 = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F5
        );

        // Listener sull'evento di pressione del tasto F5
        f5.on("down", () => {
            // Controlla se la modalità fullscreen è attiva ed esegue il toggle
            if (this.game.scale.isFullscreen) {
                this.game.scale.stopFullscreen();
            } else {
                this.game.scale.startFullscreen();
            }
        });


        // bottone per tornare al menu da inventoryScene
        this.btnTornaAlMenuInventoryScene = this.add.rectangle(
            20,
            20,
            50,
            50,
            0xff0000
        )
            .setOrigin(0.5)
            .setDepth(12)
            .setVisible(false)
            .setInteractive();

        // freccia bianca
        this.frecciaTornaAlMenuInventoryScene = this.add.graphics()
            .setDepth(13)
            .setVisible(false);

        this.frecciaTornaAlMenuInventoryScene.lineStyle(5, 0xffffff);

        // corpo della freccia
        this.frecciaTornaAlMenuInventoryScene.lineBetween(30, 20, 10, 20);

        // punta
        this.frecciaTornaAlMenuInventoryScene.lineBetween(10, 20, 18, 12);
        this.frecciaTornaAlMenuInventoryScene.lineBetween(10, 20, 18, 28);

        this.btnTornaAlMenuInventoryScene.on("pointerup", () => {
            if (this.scene.isActive("InventoryScene")) {
                this.scene.stop("InventoryScene");
                this.scene.wake("MainMenuScene");
            }
        });

    }

    update() {
        this.creaBtnTornAlMenu();
    }

    creaBtnTornAlMenu() {
        const active = this.scene.isActive("InventoryScene");

        if (active) {
            if (!this.btnTornaAlMenuInventoryScene.visible) {
                this.scene.bringToTop();
                this.btnTornaAlMenuInventoryScene.setVisible(true);
                this.frecciaTornaAlMenuInventoryScene.setVisible(true);
            }
        } else {
            if (this.btnTornaAlMenuInventoryScene.visible) {
                this.btnTornaAlMenuInventoryScene.setVisible(false);
                this.frecciaTornaAlMenuInventoryScene.setVisible(false);
            }
        }
    }
}