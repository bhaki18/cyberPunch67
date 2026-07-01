export default class FadeOutFx {
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Esegue l'effetto di dissolvenza in uscita (fade-out) portando l'opacità (alpha) dell'oggetto a un valore finale.
     * @param {number} [duration=500] - Durata dell'effetto in millisecondi.
     * @param {number} [finalAlpha=0] - Valore di opacità finale desiderato (tra 0 e 1).
     * 
     * @example
     * fadeOutFx.FadeOutFx(500, 0);
     */
    FadeOutFx(duration, finalAlpha) {
        const target = this.target;
        if (!target) {
            console.warn("FadeOutFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("FadeOutFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        if (target._fadeOut) {
            target._fadeOut.stop();
        }

        const currentAlpha = target.alpha;
        const startAlpha = currentAlpha > 0 ? currentAlpha : 1;
        const actualDuration = (typeof duration === 'number') ? duration : 500;
        const actualFinalAlpha = (typeof finalAlpha === 'number') ? finalAlpha : 0;

        target._fadeOut = scene.tweens.add({
            targets: target,
            alpha: { from: startAlpha, to: actualFinalAlpha },
            duration: actualDuration,
            onComplete: () => {
                target._fadeOut = null;
            },
            onStop: () => {
                target.alpha = actualFinalAlpha;
                target._fadeOut = null;
            }
        });
    }
}