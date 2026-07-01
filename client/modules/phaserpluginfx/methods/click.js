import { Tweens } from "phaser";

// Funzione di utilità per scurire matematicamente un colore in formato intero (es: 0x0000ff)
function darkenColor(hex, percent) {
    const r = Math.max(0, Math.floor(((hex >> 16) & 0xff) * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(((hex >> 8) & 0xff) * (1 - percent / 100)));
    const b = Math.max(0, Math.floor((hex & 0xff) * (1 - percent / 100)));
    return (r << 16) + (g << 8) + b;
}

export default class ClickFx {
    constructor(target) {
        this.target = target;
        this.scene = target.scene;
    }

    /**
     * Simula il click di un bottone con uno spostamento verso il basso 
     * e uno scurimento temporaneo del colore (tinta per sprite/immagini, fillColor per forme).
     * 
     * @example
     * clickFx.ClickFx();
     */
    ClickFx() {
        const target = this.target;
        if (!target) {
            console.warn("ClickFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("ClickFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const spostamento = target.height * 0.1;
        const durata = 200;

        if (target._click) {
            target._click.stop();
        }

        const oY = target.y;

        // Memorizziamo il colore originale della forma (se presente)
        const oColor = target.fillColor !== undefined ? target.fillColor : 0xffffff;
        const oAlpha = target.fillAlpha !== undefined ? target.fillAlpha : 1;

        // Generiamo versioni più scure del colore originale per simulare il setTint sulle forme
        const colorStep1 = darkenColor(oColor, 15); // Scurito del 15%
        const colorStep2 = darkenColor(oColor, 30); // Scurito del 30%

        let phase = 0;
        let frameCounter = 0;

        target._click = this.scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: durata,
            onUpdate: () => {
                if (phase === 0) {
                    target.y += spostamento;
                    frameCounter = durata / 2;
                    phase = 1;

                    if (typeof target.setTint === 'function') {
                        target.setTint(0xDDDDDD); // Scurisce lo Sprite/Image
                    } else if (typeof target.setFillStyle === 'function') {
                        // Per i rettangoli/forme, applichiamo la versione scurita del colore originale
                        target.setFillStyle(colorStep1, oAlpha);
                    }

                } else if (phase === 1 && frameCounter === 0) {
                    target.y += spostamento;
                    frameCounter = durata / 2;
                    phase = 2;

                    if (typeof target.setTint === 'function') {
                        target.setTint(0xCCCCCC);
                    } else if (typeof target.setFillStyle === 'function') {
                        target.setFillStyle(colorStep2, oAlpha);
                    }
                }
            },
            onComplete: () => {
                if (typeof target.setTint === 'function') {
                    target.clearTint();
                } else if (typeof target.setFillStyle === 'function') {
                    // Ripristina il colore e l'opacità originale
                    target.setFillStyle(oColor, oAlpha);
                }

                target.y = oY;
                target._click = null;
            },
            onStop: () => {
                if (typeof target.setTint === 'function') {
                    target.clearTint();
                } else if (typeof target.setFillStyle === 'function') {
                    target.setFillStyle(oColor, oAlpha);
                }
                target.y = oY;
                target._click = null;
            }
        });
    }
}