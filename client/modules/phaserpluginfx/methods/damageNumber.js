/**
 * Classe per l'effetto del numero di danno fluttuante (Damage Number).
 */
export default class DamageNumberFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco sopra il quale far apparire il danno.
     */
    constructor(target) {
        this.target = target;
        // Salva la scena in sicurezza se target è definito
        this.scene = target ? target.scene : null;
    }

    /**
     * Fa apparire un testo fluttuante temporaneo con la cifra del danno in stile Cyberpunk Neon.
     * @param {number} number - Numero di danno da far apparire.
     * @param {number} size - Dimensione del testo in pixel.
     * @param {string} color - Colore del testo in esadecimale (senza '#' iniziale).
     * @returns {void}
     * 
     * @example
     * damageNumberFx.DamageNumberFx(100, 32, "ff0055");
     */
    DamageNumberFx(number, size, color) {
        const target = this.target;
        if (!target) {
            console.warn("DamageNumberFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("DamageNumberFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        const danno = (number !== undefined && number !== null) ? Number(number) : 1;
        const grandezza = size ? size : (danno >= 90 ? 36 : (danno >= 30 ? 28 : 22));

        // Rilevamento intensità colpo per palette Cyberpunk
        const isCritical = danno >= 90;
        const isHeavy = danno >= 30 && !isCritical;

        let formattedText = `-${danno}`;
        let mainColor = "#00f0ff"; // Neon Cyan predefinito
        let glowColor = "#00ffff";
        let strokeColor = "#000000";

        if (color) {
            mainColor = color.startsWith("#") ? color : `#${color}`;
            glowColor = mainColor;
        } else if (isCritical) {
            formattedText = `⚡ -${danno} ⚡`;
            mainColor = "#ff0055"; // Hot Cyber Pink
            glowColor = "#00f0ff"; // Contrasto neon bicromatico
        } else if (isHeavy) {
            formattedText = `-${danno}`;
            mainColor = "#ffe600"; // Giallo ambrato elettrico
            glowColor = "#ff3300";
        }

        // Calcola coordinate con jitter orizzontale casuale per evitare la sovrapposizione di colpi multipli
        const bounds = target.getBounds();
        const offsetX = Phaser.Math.Between(-24, 24);
        const startX = bounds.centerX + offsetX;
        const startY = bounds.top - 10;

        // Crea il testo stilizzato in stile HUD cyberpunk
        const testo = scene.add.text(
            startX,
            startY,
            formattedText,
            {
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                fontSize: `${grandezza}px`,
                fontStyle: "bold",
                color: mainColor,
                stroke: strokeColor,
                strokeThickness: Math.max(3, Math.round(grandezza * 0.16))
            }
        )
        .setOrigin(0.5, 1)
        .setDepth(10000)
        .setScale(0.5)
        .setAlpha(0.95);

        // Glow neon Cyberpunk
        testo.setShadow(0, 0, glowColor, isCritical ? 16 : 8, true, true);

        // Angolo dinamico cyberpunk inclinato all'impatto
        const targetAngle = Phaser.Math.Between(-12, 12);
        testo.setAngle(targetAngle * 0.5);

        // Pop elastico iniziale ad alto impatto (da 0.5 a 1.35x poi si stabilizza)
        scene.tweens.add({
            targets: testo,
            scale: isCritical ? 1.4 : 1.18,
            duration: 110,
            ease: "Back.easeOut",
            onComplete: () => {
                scene.tweens.add({
                    targets: testo,
                    scale: 1.0,
                    duration: 160,
                    ease: "Quad.easeOut"
                });
            }
        });

        // Movimento verso l'alto e dissolvenza fluida
        const floatDistanceY = 48 + grandezza * 0.7;
        const driftX = (offsetX >= 0 ? 1 : -1) * Phaser.Math.Between(8, 20);

        scene.tweens.add({
            targets: testo,
            x: startX + driftX,
            y: startY - floatDistanceY,
            alpha: { from: 1, to: 0 },
            angle: targetAngle,
            duration: isCritical ? 1100 : 850,
            ease: "Cubic.easeOut",
            onComplete: () => {
                testo.destroy();
            }
        });
    }
}