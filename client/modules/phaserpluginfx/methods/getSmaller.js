/**
 * Classe per l'effetto di rimpicciolimento temporaneo (flashing/pulsazione) del target.
 */
export default class GetSmallerFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco da rimpicciolire.
     */
    constructor(target) {
        this.target = target;
        // Salva la scena in sicurezza se target è definito
        this.scene = target ? target.scene : null;
    }

    /**
     * Alterna la scala del target tra quella originale e una dimensione rimpicciolita.
     * @param {number} size - Fattore moltiplicativo di riduzione (es: 0.8 = -20%).
     * @param {string} texture - Texture opzionale da alternare.
     * @param {number} duration - Durata in millisecondi dell'effetto. di base 500ms
     * @param {number} speed - Numero di frame in cui l'animazione mantiene ciascuna scala.
     * @returns {void}
     * 
     * @example
     * getSmallerFx.GetSmallerFx(0.8, "nuovaTexture", 500, 5);
     */
    GetSmallerFx(size, texture, duration, speed) {
        const target = this.target;
        if (!target) {
            console.warn("GetSmallerFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("GetSmallerFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Calcola la scala rimpicciolita relativa alla scala X attuale dell'oggetto
        const ActualSize = (size) ? size * target.scaleX : target.scaleX * (1 / 1.2);
        const ActualTexture = (texture) ? texture : target.texture;
        const actualDuration = (duration) ? duration : 500;
        const actualSpeed = (speed) ? speed : 5;

        // Esegue l'effetto differenziato se l'oggetto supporta le texture o meno
        if (target.texture) {
            this.yesTexture(target, ActualSize, ActualTexture, actualDuration, actualSpeed);
        } else {
            this.noTexture(target, ActualSize, actualDuration, actualSpeed);
        }
    }


    yesTexture(target, size, texture, duration, speed) {

        if (target._getBigger) {
            target._getBigger.stop();
        }

        const oS = target.scaleX;
        const oT = target.texture;
        let actualFrame = "small";
        let frameCounter = 0;

        target._getBigger = this.scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: duration,
            onUpdate: () => {

                if (actualFrame === "small" && frameCounter === 0) {
                    target.setScale(size);
                    target.setTexture(texture);
                    actualFrame = "big";
                    frameCounter = speed;
                } else if (actualFrame === "big" && frameCounter === 0) {
                    target.setScale(oS);
                    target.setTexture(oT);
                    actualFrame = "small";
                    frameCounter = speed;
                }

                if (frameCounter > 0) {
                    frameCounter--;
                }
            },
            onStop: () => {
                target._getBigger = null;
                target.setScale(size);
                target.setTexture(texture);
            },
            onComplete: () => {
                target._getBigger = null;
                target.setScale(size);
                target.setTexture(texture);

            }
        })


    }

    noTexture(target, size, duration, speed) {

        if (target._getBigger) {
            target._getBigger.stop();
        }

        const oS = target.scaleX;
        let actualFrame = "small";
        let frameCounter = 0;

        target._getBigger = this.scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: duration,
            onUpdate: () => {

                if (actualFrame === "small" && frameCounter === 0) {
                    target.setScale(size);
                    actualFrame = "big";
                    frameCounter = speed;
                } else if (actualFrame === "big" && frameCounter === 0) {
                    target.setScale(oS);
                    actualFrame = "small";
                    frameCounter = speed;
                }

                if (frameCounter > 0) {
                    frameCounter--;
                }
            },
            onStop: () => {
                target._getBigger = null;
                target.setScale(size);
            },
            onComplete: () => {
                target._getBigger = null;
                target.setScale(size);

            }
        })

    }
}