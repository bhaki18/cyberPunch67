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
     * Fa apparire un testo fluttuante temporaneo con la cifra del danno.
     * @param {number} number - Numero di danno da far apparire.
     * @param {number} size - Dimensione del testo in pixel.
     * @param {string} color - Colore del testo in esadecimale (senza '#' iniziale).
     * @returns {void}
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

        const danno = (number) ? number : 1;
        const grandezza = (size) ? size : 24;
        const colore = (color) ? `#${color}` : "#cc1515ff";

        // Ricava i limiti geometrici dell'oggetto per posizionare il testo perfettamente in alto al centro
        const bounds = target.getBounds();

        // Crea l'oggetto Text nella scena
        const testo = scene.add.text(
            bounds.centerX,
            bounds.top,
            `${danno}`,
            {
                fontFamily: "Orbitron",
                fontSize: `${grandezza}px`,
                fontStyle: "bold",
                color: colore
            }
        ).setOrigin(0.5, 1);

        // Tween per animare il testo (movimento diagonale verso l'alto, rotazione e dissolvenza)
        target._damageNumber = scene.tweens.add({
            targets: testo,
            duration: 1000,
            x: testo.x + grandezza * 5,
            y: testo.y - grandezza * 5,
            alpha: 0,
            angle: testo.angle + 20,
            onComplete: () => {
                // Distrugge l'oggetto Text per liberare memoria
                testo.destroy();
                target._damageNumber = null;
            },
            onStop: () => {
                // Distrugge l'oggetto Text per liberare memoria in caso di interruzione
                testo.destroy();
                target._damageNumber = null;
            }
        });
    }
}
