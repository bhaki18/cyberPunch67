export default class RotateFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco che deve ruotare.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Fa oscillare (ruotare a destra e sinistra) l'oggetto.
     * @param {number} duration - Durata dell'effetto in millisecondi. di base 500ms
     * @param {number} intensity - Limite massimo di rotazione in gradi.
     * @param {number} speed - Velocità di oscillazione per frame in gradi.
     */
    rotate(duration, intensity, speed) {
        const target = this.target;
        if (!target) {
            console.warn("RotateFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("RotateFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const actualDuration = (typeof duration === 'number') ? duration : 500;
        const actualIntensity = (typeof intensity === 'number') ? intensity : 15;
        const actualSpeed = (typeof speed === 'number') ? speed : 2;

        // Ferma l'eventuale rotazione attiva prima di iniziare la nuova
        if (target._rotateTween) {
            target._rotateTween.stop();
        }

        const oR = target.angle;
        let variationAngle = 0;
        let phasePositive = true;

        // Salviamo correttamente su target._rotateTween
        target._rotateTween = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: actualDuration,
            onUpdate: () => {
                if (phasePositive) {
                    target.angle += actualSpeed;
                    variationAngle += actualSpeed;
                    if (variationAngle >= actualIntensity) {
                        phasePositive = false; // Inverte direzione
                    }
                } else {
                    target.angle -= actualSpeed;
                    variationAngle -= actualSpeed;
                    if (variationAngle <= -actualIntensity) {
                        phasePositive = true; // Inverte direzione
                    }
                }
            },
            onComplete: () => {
                target.angle = oR;
                target._rotateTween = null;
            },
            onStop: () => {
                target.angle = oR;
                target._rotateTween = null;
            }
        });
    }

    /**
     * Alias con iniziale maiuscola per compatibilità retroattiva.
     */
    RotateFx(duration, intensity, speed) {
        this.rotate(duration, intensity, speed);
    }
}
