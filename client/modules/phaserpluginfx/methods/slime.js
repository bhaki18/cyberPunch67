/**
 * Classe per gestire l'effetto di deformazione elastica (slime/squash & stretch) del target.
 */
export default class SlimeFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico di gioco a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Esegue un effetto "slime" comprimendo e allungando l'oggetto in modo elastico,
     * preservando il volume complessivo dell'oggetto (squash & stretch) e smorzando il movimento nel tempo.
     * 
     * Il movimento è regolato da un oscillatore armonico smorzato (damped harmonic oscillator),
     * che garantisce un rimbalzo fluido e indipendente dal frame rate.
     * 
     * @param {number} [duration=1000] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [Speed=1.0] - Fattore moltiplicativo dell'intensità del rimbalzo (ampiezza).
     * @returns {void}
     * 
     * @example
     * slimeFx.SlimeFx(1000, 1.0);
     */
    SlimeFx(duration, Speed) {

        const target = this.target;
        if (!target) {
            console.warn("SlimeFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene;
        if (!scene) {
            console.warn("SlimeFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Se è già presente una deformazione slime in esecuzione, la interrompe per evitare sovrapposizioni
        if (target._slime) {
            target._slime.stop();
        }

        // Impostazione dei parametri di default
        const durata = (duration) ? duration : 1000;
        const intensity = (Speed !== undefined) ? Speed : 1.0;
        
        // Salva la scala iniziale dell'oggetto
        const oSx = target.scaleX;
        const oSy = target.scaleY;

        // Parametri per l'equazione dell'oscillatore armonico smorzato: y(t) = A * e^(-decay * t) * sin(frequency * t)
        const amplitude = 0.45 * intensity;  // Ampiezza iniziale della deformazione (45% a intensità 1.0)
        const frequency = 5 * Math.PI;       // Frequenza dell'oscillazione (2.5 cicli completi di squash/stretch)
        const decay = 4.0;                   // Velocità di smorzamento (l'oscillazione si azzera al termine della durata)

        // Stato locale per pilotare la transizione temporale (progress) in modo indipendente dal frame rate
        const state = { progress: 0 };

        // Avvia il tween in Phaser per aggiornare il progresso dell'animazione
        target._slime = this.scene.tweens.add({
            targets: state,
            progress: 1,
            duration: durata,
            onUpdate: () => {
                const t = state.progress;
                // Calcola lo scostamento sinusoidale smorzato esponenzialmente
                const y = amplitude * Math.exp(-decay * t) * Math.sin(frequency * t);
                
                // Applica lo squash & stretch mantenendo costante l'area (volume)
                // Se scaleX aumenta di (1 + y), scaleY diminuisce dividendosi per (1 + y)
                target.scaleX = oSx * (1 + y);
                target.scaleY = oSy / (1 + y);
            },
            onComplete: () => {
                // Ripristina lo stato iniziale della scala al termine dell'effetto
                target.scaleX = oSx;
                target.scaleY = oSy;
                target._slime = null;
            },
            onStop: () => {
                // Ripristina lo stato iniziale della scala in caso di interruzione forzata (stop)
                target.scaleX = oSx;
                target.scaleY = oSy;
                target._slime = null;
            }
        });
    }

}