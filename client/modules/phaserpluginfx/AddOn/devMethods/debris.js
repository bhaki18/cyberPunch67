/**
 * Classe per l'effetto Debris (frammentazione ed esplosione di detriti).
 */
export default class DebrisFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico di gioco a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target;
        this.scene = target.scene;
    }

    /**
     * Esegue l'effetto di frantumazione sul target.
     * Riconosce automaticamente la presenza di una texture per ritagliare l'immagine
     * in frammenti, o genera piccoli quadrati geometrici colorati se l'oggetto è privo di texture.
     * 
     * @example
     * debrisFx.DebrisFx();
     */
    DebrisFx() {
        const target = this.target;
        if (!target) {
            console.warn("DebrisFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("DebrisFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Se l'oggetto possiede una texture, esegue il frammentatore con texture, altrimenti usa la versione a tinta unita
        if (target.texture) {
            return this.yesTexture(target);
        } else {
            return this.noTexture(target);
        }
    }

    /**
     * Suddivide un oggetto provvisto di texture (es: Sprite, Image) in frammenti ritagliati.
     * 
     * @param {Phaser.GameObjects.GameObject} target - Oggetto target.
     * @returns {Array<Phaser.GameObjects.Image>} Frammenti generati.
     */
    yesTexture(target) {
        const scene = this.scene || target.scene;
        const cols = 8;
        const rows = 8;
        const t_w = target.width;
        const t_H = target.height;
        let frags = [];
        const frameW = t_w / rows;
        const frameH = t_H / cols;

        // Recupera i valori dell'origine e della rotazione del target
        const originX = target.originX !== undefined ? target.originX : 0.5;
        const originY = target.originY !== undefined ? target.originY : 0.5;

        // Cicla lungo la griglia per creare ogni singola porzione ritagliata
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                // Genera l'immagine posizionandola esattamente sulle coordinate del target.
                // Phaser calcolerà l'offset del crop in base all'origin e alla posizione dell'immagine.
                const frag = scene.add.image(
                    target.x,
                    target.y,
                    target.texture.key
                );

                // Eredita le proprietà visive e geometriche dall'oggetto target padre
                frag.setOrigin(originX, originY);
                frag.setScale(target.scaleX, target.scaleY);
                frag.setRotation(target.rotation);
                frag.setAlpha(target.alpha);

                if (target.depth !== undefined) {
                    frag.setDepth(target.depth);
                }
                if (target.tintTopLeft !== undefined) {
                    frag.tint = target.tint;
                }
                if (target.blendMode !== undefined) {
                    frag.setBlendMode(target.blendMode);
                }

                // Eredita l'effetto Barrel Post-FX (e il padding correlato) se attivo sul target
                if (target._baloonBarrelFX && frag.postFX && typeof frag.postFX.addBarrel === 'function') {
                    const fragBarrel = frag.postFX.addBarrel(target._baloonBarrelFX.amount);
                    frag._baloonBarrelFX = fragBarrel;
                    if (typeof frag.setPadding === 'function') {
                        frag.setPadding(40);
                    }
                }

                // Ritaglia la porzione d'immagine corrispondente alla cella
                frag.setCrop(
                    x * frameW,
                    y * frameH,
                    frameW,
                    frameH
                );

                // Memorizza la posizione logica nella griglia
                frag.cellX = x;
                frag.cellY = y;

                frags.push(frag);
            }
        }

        return frags;
    }

    /**
     * Suddivide un oggetto privo di texture (es: Rectangle, Text, Graphics) in frammenti geometrici colorati.
     * 
     * @param {Phaser.GameObjects.GameObject} target - Oggetto target.
     * @returns {Array<Phaser.GameObjects.Rectangle>} Frammenti generati.
     */
    noTexture(target) {
        const scene = this.scene || target.scene;
        const cols = 8;
        const rows = 8;
        const t_w = target.width;
        const t_H = target.height;
        let frags = [];
        const frameW = t_w / rows;
        const frameH = t_H / cols;

        // Determina il colore di fill per i detriti
        let color = 0xffffff;
        if (target.fillColor !== undefined) {
            // Per forme vettoriali dotate di colore di riempimento
            color = target.fillColor;
        } else if (target.style && target.style.color) {
            // Per elementi testuali, converte il codice CSS Hex in formato intero
            const cssColor = target.style.color;
            if (cssColor.startsWith('#')) {
                color = parseInt(cssColor.slice(1), 16);
            }
        } else if (target.tintTopLeft !== undefined && target.tintTopLeft !== 0xffffff) {
            // Se l'oggetto possiede una tinta attiva
            color = target.tintTopLeft;
        }

        // Recupera i valori dell'origine e della rotazione del target
        const originX = target.originX !== undefined ? target.originX : 0.5;
        const originY = target.originY !== undefined ? target.originY : 0.5;
        const displayOriginX = originX * t_w;
        const displayOriginY = originY * t_H;

        const rad = target.rotation || 0;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Crea una griglia di rettangoli colorati al posto dei frammenti di texture
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                // Calcola la posizione locale al centro di questa cella
                const localX = (x + 0.5) * frameW - displayOriginX;
                const localY = (y + 0.5) * frameH - displayOriginY;

                // Ruota e scala le coordinate locali per calcolare le coordinate del mondo
                const rotatedX = (localX * target.scaleX) * cos - (localY * target.scaleY) * sin;
                const rotatedY = (localX * target.scaleX) * sin + (localY * target.scaleY) * cos;
                const fragX = target.x + rotatedX;
                const fragY = target.y + rotatedY;

                const frag = scene.add.rectangle(
                    fragX,
                    fragY,
                    frameW,
                    frameH,
                    color
                );

                // Eredita le proprietà visive dall'oggetto target padre
                frag.setScale(target.scaleX, target.scaleY);
                frag.setAlpha(target.alpha);
                frag.setAngle(target.angle);
                if (target.depth !== undefined) {
                    frag.setDepth(target.depth);
                }
                if (target.blendMode !== undefined) {
                    frag.setBlendMode(target.blendMode);
                }

                // Eredita l'effetto Barrel Post-FX (e il padding correlato) se attivo sul target
                if (target._baloonBarrelFX && frag.postFX && typeof frag.postFX.addBarrel === 'function') {
                    const fragBarrel = frag.postFX.addBarrel(target._baloonBarrelFX.amount);
                    frag._baloonBarrelFX = fragBarrel;
                    if (typeof frag.setPadding === 'function') {
                        frag.setPadding(40);
                    }
                }

                // Memorizza la posizione logica nella griglia
                frag.cellX = x;
                frag.cellY = y;

                frags.push(frag);
            }
        }

        return frags;
    }
}