/**
 * Classe per gestire l'effetto di pulsazione fluida (ingrandimento e rimpicciolimento) del target.
 */
export default class PulseFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco da far pulsare.
     */
    constructor(target) {
        this.target = target;
        // Salva la scena in sicurezza se target è definito
        this.scene = target ? target.scene : null;
    }

    /**
     * Avvia l'effetto di pulsazione continua sulla scala dell'oggetto.
     * @param {number} duration - Durata totale dell'effetto in millisecondi. di base 1300ms
     * @param {number} intensity - Intensità della variazione di scala (divisa per 10, es: 1 = +0.1 scala).
     * @param {number} speed - Velocità di variazione ad ogni frame (diviso per 100, es: 5 = 0.05).
     * @returns {void}
     */
    PulseFx(duration, intensity, speed) {
        const target = this.target;
        if (!target) {
            console.warn("PulseFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("PulseFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Valori di default
        const actualDuration = (typeof duration === 'number') ? duration : 1300;
        const actualIntensity = (typeof intensity === 'number') ? intensity / 10 : 0.1;
        const actualSpeed = (typeof speed === 'number') ? speed / 100 : 0.005;

        // Se c'è già una pulsazione attiva, la fermiamo per ripristinare lo stato iniziale
        if (target._pulseTween) {
            target._pulseTween.stop();
        }

        // Memorizziamo le scale originali X e Y
        const oScaleX = target.scaleX;
        const oScaleY = target.scaleY;
        let phasePositive = true;     // Stato della pulsazione (true = cresce, false = decresce)
        let variationScale = 0;       // Variazione progressiva accumulata

        // Creiamo il tween fittizio per controllare la durata complessiva
        target._pulseTween = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: actualDuration,
            onUpdate: () => {
                if (phasePositive) {
                    variationScale += actualSpeed;
                    target.scaleX += actualSpeed;
                    target.scaleY += actualSpeed;

                    // Inverte la fase se raggiunge il limite massimo di intensità
                    if (variationScale >= actualIntensity) {
                        phasePositive = false;
                    }
                } else {
                    variationScale -= actualSpeed;
                    target.scaleX -= actualSpeed;
                    target.scaleY -= actualSpeed;

                    // Inverte la fase se scende sotto la dimensione originale
                    if (variationScale <= 0) {
                        phasePositive = true;
                    }
                }
            },
            onComplete: () => {
                // Ripristina la scala di partenza e rimuove l'effetto attivo
                target.setScale(oScaleX, oScaleY);
                target._pulseTween = null;
            },
            onStop: () => {
                // Ripristina la scala di partenza e rimuove l'effetto attivo in caso di stop prematuro
                target.setScale(oScaleX, oScaleY);
                target._pulseTween = null;
            }
        });
    }
}
