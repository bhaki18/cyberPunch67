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
        this.arrayDiPersonaggi = [];
    }
    /**
     * Inizializzazione della griglia degli oggetti dell'inventario.
     */

    init(data) {

        this.personaggiTot = data.personaggiTot ? [...data.personaggiTot] : [];
        this.livelloPlayer = data.livello;


        this.personaggiSbloccati = this.personaggiTot.filter(pg => {
            if (pg.livelloDiUnlock <= data.livello) return pg;
        });


        this.personaggiNonSbloccati = this.personaggiTot.filter(pg => {
            if (pg.livelloDiUnlock > data.livello) return pg;
        });

        console.log("personaggi totali:");
        console.table(this.personaggiTot);
        console.log("personaggi sbloccati:");
        console.table(this.personaggiSbloccati);
        console.log("personaggi Non sbloccati:");
        console.table(this.personaggiNonSbloccati); /*stranamente funziona tutto alla prima botta*/
    }
    create() {
        this.minY = -766;
        this.maxY = 0;

        const W = 800;

        this.inventoryBackground = this.add.sprite(
            W / 2,
            -this.minY / 2 - 50,
            "inventoryBackground"
        ).setOrigin(0.5);


        // CONTAINER DI COSE DA SCROLLARE
        this.inventoryContainer = this.add.container(0, 0);
        // this.inventoryContainer.add(this.inventoryBackground);

        this.framesInventory = [];
        this.personaggiInventory = [];


        for (let i = 0; i < this.personaggiTot.length; i++) {
            let col = i % 3;
            let row = Math.floor(i / 3);

            let frame = this.add.sprite(
                120 + col * 200 + 75,
                200 + row * 270,
                "framePgInventory"
            ).setScale(4.5);

            let personaggioOverFrame = this.add.sprite(
                frame.x,
                frame.y - 20,
                this.personaggiTot[i].nome
            ).setScale(2.5);

            if (this.personaggiTot[i].livelloDiUnlock > this.livelloPlayer) {
                frame.setTint(0x111111);
                personaggioOverFrame.setTint(0x111111);
            }

            this.personaggiInventory.push(personaggioOverFrame);
            this.framesInventory.push(frame);
            this.inventoryContainer.add(frame);
            this.inventoryContainer.add(personaggioOverFrame);

            frame.setInteractive({ pixelPerfect: true });


            frame.on("pointerover", () => {
                this.tweens.add({
                    targets: frame,
                    scale: 4.7,
                    duration: 200
                });

                this.tweens.add({
                    targets: personaggioOverFrame,
                    scale: 2.6,
                    duration: 200
                });
            });

            frame.on("pointerout", () => {
                this.tweens.add({
                    targets: frame,
                    scale: 4.5,
                    duration: 200
                });

                this.tweens.add({
                    targets: personaggioOverFrame,
                    scale: 2.5,
                    duration: 200
                });
            });


        }





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
        this.inventoryContainer.y = Phaser.Math.Linear(
            this.inventoryContainer.y,
            this.scrollY,
            0.15
        );
    }
}
