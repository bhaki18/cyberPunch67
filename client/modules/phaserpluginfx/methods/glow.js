

export default class GlowFx {
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Fa pulsare un effetto glow (bagliore) attorno all'oggetto.
     * @param {number} duration - Durata in ms del glow. di base 1000ms
     * @param {number} size - Grandezza in intero del glow.
     * @param {boolean} loop - Booleano per ripetizione all'infinito.
     * 
     * @example
     * glowFx.GlowFx(1000, 2, false);
     */
    GlowFx(duration, size, loop) {
        const target = this.target;
        if (!target) {
            console.warn("GlowFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("GlowFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const infinito = !!loop;
        const durata = (duration && !loop) ? duration : 1000;
        const grandezza = (size) ? size / 10 : 0.2;

        if (target._glow) {
            target._glow.stop();
        }

        let glow = null;
        const type = target.type;

        // Creiamo il clone corretto in base al tipo di GameObject
        switch (type) {
            case "Sprite":
            case "Image":
                glow = scene.add.image(target.x, target.y, target.texture.key, target.frame.name);
                break;

            case "Rectangle":
                glow = scene.add.rectangle(
                    target.x,
                    target.y,
                    target.width,
                    target.height,
                    target.fillColor !== undefined ? target.fillColor : 0xffffff
                );
                break;

            case "Text":
                glow = scene.add.text(target.x, target.y, target.text, target.style);
                break;

            default:
                // Fallback generico per qualsiasi altro tipo di oggetto
                if (target.texture) {
                    glow = scene.add.image(target.x, target.y, target.texture.key, target.frame.name);
                } else {
                    const bounds = target.getBounds();
                    glow = scene.add.rectangle(target.x, target.y, bounds.width, bounds.height, 0xffffff);
                }
                break;
        }

        if (!glow) {
            console.warn("GlowFx: Impossibile creare l'oggetto glow per il tipo " + type);
            return;
        }

        // Allineiamo l'oggetto glow con il target
        glow.setOrigin(target.originX, target.originY);
        glow.setAngle(target.angle);
        glow.setScale(target.scaleX, target.scaleY);
        glow.setAlpha(0.4);
        glow.setDepth(target.depth - 0.1); // Dietro al target

        if (typeof glow.setTint === 'function') {
            glow.setTint(0x6366f1); // Tinta azzurro/indigo per simulare un bagliore neon
        }

        const targetScaleX = target.scaleX;
        const targetScaleY = target.scaleY;

        target._glow = scene.tweens.add({
            targets: glow,
            scaleX: targetScaleX * (1 + grandezza),
            scaleY: targetScaleY * (1 + grandezza),
            alpha: 0,
            loop: infinito ? -1 : 0,
            duration: durata,
            onUpdate: () => {
                glow.x = target.x;
                glow.y = target.y;
            },
            onComplete: () => {
                glow.destroy();
                target._glow = null;
            },
            onStop: () => {
                glow.destroy();
                target._glow = null;
            }
        });
    }
}
