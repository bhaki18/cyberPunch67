export default class FloatXFx {
    constructor(target) {
        this.target = target;
        this.scene = target.scene;
    }

    /**
     * Fa oscillare orizzontalmente l'oggetto seguendo un moto armonico semplice.
     * @param {number} distance - raggio del'effetto in px, di base 50
     * @param {number} duration - durata in ms dell'effetto,di base 1000
     * @param {boolean} loop - se infinito.di base false
     * @param {number} speed - velocità del float in px. di base 5
     * @returns {void}
     * 
     * @example
     * floatXFx.FloatXFx(50, 1000, true, 5);
     */
    FloatXFx(distance, duration, loop, speed) {
        const target = this.target;
        if (!target) {
            console.warn("FloatXFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("FloatXFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const ActualDistance = (distance) ? distance : 50;
        const ActualDuration = (duration) ? duration : 1000;
        const ActualLoop = (loop) ? loop : false;
        const actualSpeed = (speed) ? speed : 5;

        const oX = target.x;
        if (target._floatX) {
            target._floatX.stop();
        }

        target._floatX = this.scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: ActualDuration,
            loop: ActualLoop ? -1 : 0,
            onUpdate: (tween, targetObj) => {
                // Calcola l'angolo basato sul progresso (da 0 a 2 * PI per un ciclo completo)
                const angle = targetObj.val * Math.PI * 2;
                // Moto armonico semplice: x(t) = x0 + A * sin(omega * t)
                target.x = oX + Math.sin(angle) * ActualDistance;
            },
            onComplete: () => {
                target.x = oX;
                target._floatX = null;
            },
            onStop: () => {
                target.x = oX;
                target._floatX = null;
            }
        })
    }
}