export default class FadeInFx {
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Esegue l'effetto di dissolvenza in entrata (fade-in) portando l'opacità (alpha) dell'oggetto a un valore finale.
     * @param {number} [duration=500] - Durata dell'effetto in millisecondi.
     * @param {number} [finalAlpha=1] - Valore di opacità finale desiderato (tra 0 e 1).
     * 
     * @example
     * fadeInFx.FadeInFx(500, 1);
     */
    FadeInFx(duration, finalAlpha) {
        const target = this.target;
        if (!target) {
            console.warn("FadeInFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("FadeInFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        if (target._fadeIn) {
            target._fadeIn.stop();
        }

        const actualDuration = (typeof duration === 'number') ? duration : 500;
        const actualFinalAlpha = (typeof finalAlpha === 'number') ? finalAlpha : 1;

        target._fadeIn = scene.tweens.add({
            targets: target,
            alpha: { from: 0, to: actualFinalAlpha },
            duration: actualDuration,
            onComplete: () => {
                target._fadeIn = null;
            },
            onStop: () => {
                target.alpha = actualFinalAlpha;
                target._fadeIn = null;
            }
        });
    }
}