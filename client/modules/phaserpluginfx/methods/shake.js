/**
 * Classe per l'effetto di vibrazione (shake) su un oggetto Phaser.
 */
export default class ShakeFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco che deve vibrare.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Fa vibrare l'oggetto puntato.
     * @param {number} duration - Durata dello shake in millisecondi. di base 500ms
     * @param {number} intensity - Intensità dello shake in pixel.
     *
     */
    shake(duration, intensity) {
        const target = this.target;
        if (!target) {
            console.warn("ShakeFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("ShakeFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const actualDuration = (typeof duration === 'number') ? duration : 500;
        const actualIntensity = (typeof intensity === 'number') ? intensity : 5;

        // Se c'è già uno shake attivo, lo interrompiamo per ripristinare la posizione originale
        if (target._shakeTween) {
            target._shakeTween.stop();
        }

        const ox = target.x;
        const oy = target.y;

        // Creiamo un tween che anima un valore dummy per gestire la durata dello shake
        target._shakeTween = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: actualDuration,
            onUpdate: () => {
                target.x = ox + Phaser.Math.Between(-actualIntensity, actualIntensity);
                target.y = oy + Phaser.Math.Between(-actualIntensity, actualIntensity);
            },
            onComplete: () => {
                target.x = ox;
                target.y = oy;
                target._shakeTween = null;
            },
            onStop: () => {
                target.x = ox;
                target.y = oy;
                target._shakeTween = null;
            }
        });
    }
}
