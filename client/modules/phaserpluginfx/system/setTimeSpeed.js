/**
 * Classe per gestire la velocità fissa dello scorrimento del tempo (Time Speed) nella scena.
 */
export default class SetTimeSpeedFx {
    /**
     * @param {Phaser.Scene} scene - La scena di gioco Phaser a cui applicare l'effetto.
     */
    constructor(scene) {
        this.scene = scene || null;
    }

    /**
     * Imposta la velocità del tempo (Time Scale) di tutti i sistemi della scena ad un valore fisso.
     * @param {number} speed - Moltiplicatore di velocità del tempo desiderato (es. 0.5 = 50% velocità).
     * @returns {void}
     */
    SetTimeSpeedFx(speed) {
        const scene = this.scene;
        if (!scene) {
            console.warn("SetTimeSpeedFx: Impossibile trovare la scena di gioco");
            return;
        }

        const actualTime = (speed) ? speed : 0.5;

        // Applichiamo il rallentamento ai vari sistemi (orologio, tweens e fisica)
        scene.time.timeScale = actualTime;
        scene.tweens.timeScale = actualTime;

        if (scene.physics) {
            // Nella fisica di Phaser, la velocità è divisa per la scala (1 / actualTime)
            // Se actualTime è 0 (pausa totale), evitiamo la divisione per zero e impostiamo la fisica a 0
            scene.physics.world.timeScale = actualTime > 0 ? (1 / actualTime) : 0;
        }

    }
}