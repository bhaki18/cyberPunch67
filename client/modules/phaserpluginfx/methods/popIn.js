export default class PopInFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico di gioco a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target || null;
        this.scene = target ? target.scene : null;
    }

    /**
     * Esegue l'effetto di comparsa (pop-in) con una leggera elasticità.
     * @param {number} [duration=500] - Durata dell'effetto in millisecondi.
     * @param {number} [finalScale] - Scala finale desiderata per l'oggetto. Se non fornita, usa la scala originale del target (o 1 se la scala corrente è 0).
     * 
     * @example
     * popInFx.PopInFx(500, 1.5);
     */
    PopInFx(duration, finalScale) {
        const target = this.target;
        if (!target) {
            console.warn("PopInFx: Impossibile trovare il GameObject.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("PopInFx: Impossibile trovare la scena di gioco.");
            return;
        }

        if (target._popIn) {
            target._popIn.stop();
        }


        const oSx = target.scaleX;
        const oSy = target.scaleY;
        const actualDuration = (typeof duration === 'number') ? duration : 500;
        const targetScaleX = (typeof finalScale === 'number') ? finalScale : (oSx > 0 ? oSx : 1);
        const targetScaleY = (typeof finalScale === 'number') ? finalScale : (oSy > 0 ? oSy : 1);

        target._popIn = scene.tweens.add({
            targets: target,
            scaleX: { from: 0, to: targetScaleX },
            scaleY: { from: 0, to: targetScaleY },
            duration: actualDuration,
            ease: 'Back.easeOut',
            onComplete: () => {
                target._popIn = null;
            },
            onStop: () => {
                target.scaleX = targetScaleX;
                target.scaleY = targetScaleY;
                target._popIn = null;
            }
        });
    }
}