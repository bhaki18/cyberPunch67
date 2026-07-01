/**
 * Effetto palloncino con distorsione Barrel Post-FX.
 * Gonfia progressivamente il GameObject ingrandendolo prima uniformemente
 * poi in modo più accentuato sull'asse X, simulando il gonfiamento di un palloncino.
 * Utilizza lo shader Barrel (Phaser 3.60+ WebGL) per aggiungere una deformazione
 * sferica tridimensionale alla texture che rimane persistente al completamento.
 */
export default class BaloonFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico a cui applicare l'effetto.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
    }

    /**
     * Avvia il gonfiamento progressivo del target.
     * Ogni chiamata accumulare il gonfiamento a partire dalla scala attuale.
     */
    BaloonFx() {

        const target = this.target;
        if (!target) {
            console.warn("BaloonFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("BaloonFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        if (target._baloon) {
            target._baloon.stop();
        }

        // Calcolata la durata effettiva a 60FPS per completare le fasi dell'onUpdate moltiplicativo (~7 frame)
        const fixedDuration = 500;

        // Calcola i target di scala basandosi sulla scala corrente per permettere gonfiamenti successivi
        const startScaleX = target.scaleX;
        const startScaleY = target.scaleY;

        // Memorizza la scala originale di base (se non già presente) per lo stop completo
        if (target._baloonOriginalScaleX === undefined) {
            target._baloonOriginalScaleX = startScaleX;
            target._baloonOriginalScaleY = startScaleY;
        }

        const maxScaleX = startScaleX * 1.2 * 1.5;
        const maxScaleY = startScaleY * 1.2 * 1.2;
        const limitBoth = startScaleX * 1.2;

        const speed = 1.02;
        let phase = "both";

        // Aggiunge o riutilizza l'effetto Barrel Post-FX (solo WebGL Phaser 3.60+)
        let barrelFX = target._baloonBarrelFX || null;
        if (!barrelFX && target.postFX && typeof target.postFX.addBarrel === 'function') {
            barrelFX = target.postFX.addBarrel(1.0);
            target._baloonBarrelFX = barrelFX;
            if (typeof target.setPadding === 'function') {
                target.setPadding(40);
            }
        }

        const startBarrelAmount = barrelFX ? barrelFX.amount : 1.0;
        const targetBarrelAmount = startBarrelAmount + 0.5;

        target._baloon = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: fixedDuration,
            onUpdate: () => {
                if (phase === "both") {
                    // Gonfia uniformemente
                    if (target.scaleX >= limitBoth) {
                        phase = "moreX";
                    } else {
                        target.setScale(target.scaleX * speed, target.scaleY * speed);
                    }
                }

                if (phase === "moreX") {
                    // Gonfia maggiormente l'asse X (larghezza) e Y a velocità normale
                    const nextX = target.scaleX * (1 + (speed - 1) * 2);
                    const nextY = target.scaleY * speed;

                    target.scaleX = nextX < maxScaleX ? nextX : maxScaleX;
                    target.scaleY = nextY < maxScaleY ? nextY : maxScaleY;
                }

                // Sincronizza l'effetto Barrel con la scala raggiunta
                if (barrelFX) {
                    const progressX = (target.scaleX - startScaleX) / (maxScaleX - startScaleX);
                    barrelFX.amount = startBarrelAmount + progressX * 0.5;
                }
            },
            onComplete: () => {
                target._baloon = null;
                target.setScale(maxScaleX, maxScaleY);
                if (barrelFX) {
                    barrelFX.amount = targetBarrelAmount;
                }
            },
            onStop: () => {
                target._baloon = null;
                target.setScale(maxScaleX, maxScaleY);
                if (barrelFX) {
                    barrelFX.amount = targetBarrelAmount;
                }
            }
        });
    }

    /**
     * Interrompe l'effetto palloncino, ripristina la scala iniziale
     * e rimuove lo shader Barrel Post-FX liberando memoria GPU.
     */
    StopBaloonFx() {
        const target = this.target;
        if (!target) {
            console.warn("StopBaloonFx: Impossibile trovare il target di gioco");
            return;
        }

        // Arresta l'eventuale tween attivo dell'effetto
        if (target._baloon) {
            target._baloon.stop();
            target._baloon = null;
        }

        // Ripristina all'istante le dimensioni originarie precedenti al gonfiamento
        if (target._baloonOriginalScaleX !== undefined) {
            target.setScale(target._baloonOriginalScaleX, target._baloonOriginalScaleY);
            delete target._baloonOriginalScaleX;
            delete target._baloonOriginalScaleY;
        }

        // Rimuove lo shader Barrel Post-FX per liberare memoria
        if (target._baloonBarrelFX && target.postFX) {
            target.postFX.remove(target._baloonBarrelFX);
            delete target._baloonBarrelFX;
        }
    }
}
