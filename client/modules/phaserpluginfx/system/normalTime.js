export default class NormalTimeFx {
    constructor(scene) {
        this.scene = scene;
    }


    /**
     * imposta un gameTime fisso per bloccare la velocità di gioco
     * è ottimo da usare dopo un rally per evitare errori di sovrascrittura 
     * @param {number} speed - velocità del tempo di gioco. valore di base 1 
     */
    NormalTimeFx(speed) {
        const scene = this.scene;
        if (!scene) {
            console.warn("NormalTimeFx: Impossibile trovare la Scena di gioco.");
            return;
        }

        const ActualSpeed = (speed) ? speed : 1;


        scene.time.timeScale = ActualSpeed
        scene.tweens.timeScale = ActualSpeed
        if (scene.physics) {
            scene.physics.world.timeScale = ActualSpeed;
        };

    }

}
