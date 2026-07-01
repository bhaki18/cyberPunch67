/**
 * Classe per l'effetto visivo di immunità/lampeggio (ImmuneFx).
 * Gestisce l'oscillazione dell'opacità (alpha) di un GameObject.
 */
export default class ImmuneFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico di gioco a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Modifica l'opacità (alpha) dell'oggetto target in modo intermittente e oscillante
     * per simulare uno stato temporaneo di invulnerabilità/immunità.
     * @param {number} [duration=1000] - Durata dell'effetto di immunità in millisecondi.
     * 
     * @example
     * immuneFx.ImmuneFx(1000);
     */
    ImmuneFx(duration) {
        const target = this.target;
        if (!target) {
            console.warn("ImmuneFx: Nessun oggetto target impostato.");
            return;
        }

        const scene = this.scene;
        if (!scene) {
            console.warn("ImmuneFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Se un tween di immunità è già attivo su questo oggetto, lo fermiamo
        if (target._immune) {
            target._immune.stop();
        }

        // Imposta la durata predefinita a 1000ms se non fornita
        const durata = (duration) ? duration : 1000;

        // Memorizziamo il valore di alpha originario dell'oggetto
        const oA = target.alpha;

        // Moltiplicatore di velocità per la variazione di opacità
        const speed = 1.05;

        // Soglia minima di alpha (l'opacità scenderà al massimo fino alla metà del valore originario)
        const minAlpha = oA / 2;

        // Fase iniziale dell'oscillazione: "minus" indica decremento dell'opacità
        let phase = "minus";

        // Avvia il tween per l'animazione dell'effetto
        target._immune = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: durata,
            onUpdate: () => {
                if (phase === "minus") {
                    // Riduce l'opacità
                    target.alpha /= speed;
                    // Se raggiunge o supera la soglia minima, passa alla fase di incremento
                    phase = (target.alpha <= minAlpha) ? "plus" : "minus";
                } else if (phase === "plus") {
                    // Incrementa l'opacità
                    target.alpha *= speed;
                    // Se ripristina il valore iniziale originario, passa alla fase di decremento
                    phase = (target.alpha >= oA) ? "minus" : "plus";
                }
            },
            onComplete: () => {
                // Al completamento ripristina l'opacità originale ed elimina il riferimento al tween
                target.alpha = oA;
                target._immune = null;
            },
            onStop: () => {
                // In caso di interruzione (es. StopFx) ripristina l'opacità originale ed elimina il riferimento
                target.alpha = oA;
                target._immune = null;
            }
        });
    }
}