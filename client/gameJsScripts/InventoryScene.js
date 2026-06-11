/**
 * @class InventoryScene
 * @extends Phaser.Scene
 * @description Scena dell'Inventario.
 * Gestisce la visualizzazione dell'equipaggiamento sbloccato dal giocatore,
 * la selezione delle skin del personaggio o gli oggetti acquistati.
 */
export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super("InventoryScene");


        this.inventoryBackground;
    }
    /**
     * Inizializzazione della griglia degli oggetti dell'inventario.
     */
    create() {
        this.minY = -768;
        this.maxY = 0;

        const W = 800;

        this.inventoryBackground = this.add.sprite(
            W / 2,
            0,
            "inventoryBackground"
        ).setOrigin(0.5, 0);

        this.scrollY = 0;

        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {

            this.scrollY -= deltaY * 0.5;

            this.scrollY = Phaser.Math.Clamp(
                this.scrollY,
                this.minY,
                this.maxY
            );

        });

    }
    /**
     * Ciclo di aggiornamento.
     */
    update() {
        // TODO: Gestione di animazioni di hover/selezione degli oggetti dell'inventario.
        this.inventoryBackground.y = Phaser.Math.Linear(
            this.inventoryBackground.y,
            this.scrollY,
            0.15
        );
    }
}
