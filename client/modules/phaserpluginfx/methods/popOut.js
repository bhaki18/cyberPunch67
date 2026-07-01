export default class PopOutFx {
    constructor(target) {
        this.target = target || null;
        this.scene = target ? target.scene : null;
    }

    /**
     * Esegue l'effetto di scomparsa (pop-out) riducendo la scala a zero con una leggera elasticità.
     * @param {number} [duration=500] - Durata dell'effetto in millisecondi.
     * @param {number} [startScale] - Scala iniziale da cui far partire il pop-out. Se non fornita, parte dalla scala corrente (o da 1 se la scala corrente è 0).
     * 
     * @example
     * popOutFx.PopOutFx(500, 1.5);
     */
    PopOutFx(duration, startScale) {
        const target = this.target;
        if (!target) {
            console.warn("PopOutFx: Impossibile trovare il GameObject.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("PopOutFx: Impossibile trovare la scena di gioco.");
            return;
        }

        if (target._popOut) {
            target._popOut.stop();
        }

        const currentScaleX = target.scaleX;
        const currentScaleY = target.scaleY;
        const oSx = (typeof startScale === 'number') ? startScale : (currentScaleX > 0 ? currentScaleX : 1);
        const oSy = (typeof startScale === 'number') ? startScale : (currentScaleY > 0 ? currentScaleY : 1);
        const actualDuration = (typeof duration === 'number') ? duration : 500;

        target._popOut = scene.tweens.add({
            targets: target,
            scaleX: { from: oSx, to: 0 },
            scaleY: { from: oSy, to: 0 },
            duration: actualDuration,
            ease: 'Back.easeIn',
            onComplete: () => {
                target._popOut = null;
            },
            onStop: () => {
                target.scaleX = 0;
                target.scaleY = 0;
                target._popOut = null;
            }
        });
    }
}