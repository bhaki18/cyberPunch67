/**
 * Classe per gestire l'effetto di alternanza rapida di texture su un GameObject Phaser.
 */
export default class ChangeTextureFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target;
        // Previene crash se target è nullo/indefinito all'inizializzazione
        this.scene = target ? target.scene : null;
    }

    /**
     * Alterna rapidamente la texture del GameObject tra quella originaria e una nuova texture fornita.
     * @param {string} texture - La chiave della nuova texture da alternare.
     * @param {number} duration - La durata totale dell'effetto in millisecondi. di base 500ms
     * @param {number} speed - La frequenza di alternanza espressa in numero di fotogrammi (frame).
     * @returns {void}
     */
    ChangeTextureFx(texture, duration, speed) {
        const target = this.target;
        if (!target) {
            console.warn("ChangeTextureFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("ChangeTextureFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Verifica che l'oggetto abbia la proprietà setTexture (tipica di Sprite e Image)
        if (target.type !== "Image" && target.type !== "Sprite") {
            console.warn("ChangeTextureFx: Impossibile applicare il metodo a un GameObject senza proprietà texture.");
            return;
        }

        const ActualDuration = (duration) ? duration : 500;
        const ActualTexture = (texture) ? texture : target.texture.key;
        const actualSpeed = (speed) ? speed : 5;

        // Ferma l'effetto se già attivo su questo oggetto prima di memorizzare lo stato originale
        if (target._changeTexture) {
            target._changeTexture.stop();
        }

        const oT = target.texture; // Memorizza la texture originaria
        let frameCounter = 0;      // Contatore dei frame per l'alternanza
        let Phase = "old";         // Stato attuale della texture ("old" o "new")

        // Tween per scandire la durata e aggiornare la texture ad ogni frame
        target._changeTexture = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: ActualDuration,
            onUpdate: () => {
                // Alterna la texture quando il contatore dei frame raggiunge lo zero
                if (Phase === "old" && frameCounter === 0) {
                    target.setTexture(ActualTexture);
                    Phase = "new";
                    frameCounter = actualSpeed;
                } else if (Phase === "new" && frameCounter === 0) {
                    target.setTexture(oT);
                    Phase = "old";
                    frameCounter = actualSpeed;
                }

                // Decrementa il contatore ad ogni frame
                if (frameCounter > 0) {
                    frameCounter--;
                }
            },
            onComplete: () => {
                // Ripristina la texture finale desiderata e pulisce il riferimento
                target.setTexture(ActualTexture);
                target._changeTexture = null;
            },
            onStop: () => {
                // Ripristina la texture finale desiderata e pulisce il riferimento
                target.setTexture(ActualTexture);
                target._changeTexture = null;
            }
        });
    }
}
