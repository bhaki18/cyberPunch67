/**
 * @param {Phaser.Scene} scene - La scena di gioco.
 */
export default class RallyFx {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Rallenta la velocità della scena (Time Dilation) per una determinata durata.
     * @param {Object|number} options - Oggetto di configurazione o durata in ms.
     * @param {number} [rally] - Fattore di rallentamento (es. 0.2 = tempo al 20%).
     */
    RallyFx(options = {}, rally) {
        const scene = this.scene;

        if (!scene) {
            console.warn("RallyFx: Impossibile trovare la Scena di gioco.");
            return;
        }

        let actualDuration = 1000;
        let actualTime = 0.2;

        // Gestione parametri (se passati come oggetto o singoli)
        if (typeof options === 'object' && options !== null) {
            actualDuration = options.duration !== undefined ? options.duration : 1000;
            actualTime = options.rally !== undefined ? options.rally : 0.2;
        } else {
            actualDuration = options !== undefined ? options : 1000;
            actualTime = rally !== undefined ? rally : 0.2;
        }

        // Memorizziamo lo stato originale di tutti i sistemi di tempo
        const oTime = scene.time.timeScale;
        const otimeTweens = scene.tweens.timeScale;
        let otimePhysics = 1;
        if (scene.physics) {
            otimePhysics = scene.physics.world.timeScale;
        }

        // Se c'è già un effetto rally attivo, puliamo il vecchio timeout prima di avviarne uno nuovo
        if (scene._rally) {
            clearTimeout(scene._rally);
            scene._rally = null;
        }

        // Applichiamo il rallentamento ai vari sistemi (orologio, tweens e fisica)
        scene.time.timeScale = actualTime;
        scene.tweens.timeScale = actualTime;

        if (scene.physics) {
            // Nella fisica di Phaser, la velocità è divisa per la scala (1 / actualTime)
            // Se actualTime è 0 (pausa totale), evitiamo la divisione per zero e impostiamo la fisica a 0
            scene.physics.world.timeScale = actualTime > 0 ? (1 / actualTime) : 0;
        }

        // Usiamo un setTimeout standard per ripristinare il tempo in millisecondi reali (indipendente dal timeScale di Phaser)
        scene._rally = setTimeout(() => {
            scene.time.timeScale = oTime;
            scene.tweens.timeScale = otimeTweens;
            if (scene.physics) {
                scene.physics.world.timeScale = otimePhysics;
            }
            scene._rally = null;
        }, actualDuration);
    }
}