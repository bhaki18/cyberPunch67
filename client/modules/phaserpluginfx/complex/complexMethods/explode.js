import BaloonFx from "./baloon.js";
import ShakeFx from "../../methods/shake.js";
import FireWorksFx from "./fireWorks.js";
import StopDebrisFx from "../../AddOn/devUtils/stopDebris.js";

/**
 * Effetto Esplosione Complesso (ExplodeFx).
 * Combina in sequenza temporizzata:
 * 1. Gonfiamento asimmetrico sferico (BaloonFx - 500ms).
 * 2. Vibrazione contemporanea (ShakeFx - 500ms).
 * 3. Esplosione pirotecnica radiale finale (FireWorksFx - 500ms).
 * Durata complessiva: 1000ms. Il target rimane permanentemente invisibile (distrutto) al termine.
 */
export default class ExplodeFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - Oggetto di gioco da far esplodere.
     */
    constructor(target) {
        this.target = target;
        // Salva la scena in sicurezza se target è definito
        this.scene = target ? target.scene : null;

        this._baloon = new BaloonFx(target);
        this._shake = new ShakeFx(target);
        this._fireWorks = new FireWorksFx(target);
        this._stopDebris = new StopDebrisFx();
    }

    /**
     * Avvia l'effetto sequenziale combinato di esplosione.
     */
    ExplodeFx() {
        const target = this.target;
        if (!target) {
            console.warn("ExplodeFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("ExplodeFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }

        // Se c'è un'esplosione già attiva, la interrompiamo prima di avviarne una nuova
        if (target._activeExplodeFx) {
            target._activeExplodeFx.StopExplodeFx();
        }

        // Segna l'oggetto come esploso per bloccare altri aggiornamenti (animazioni/scale)
        target._exploded = true;

        // Ferma le animazioni correnti
        if (target.anims) {
            target.anims.stop();
        }

        // Disabilita la fisica dell'oggetto
        if (target.body) {
            target.body.enable = false;
        }

        // Memorizza il riferimento a questa istanza di esplosione attiva sul target
        target._activeExplodeFx = this;

        // Avvia il gonfiamento a palloncino (dura 500ms)
        this._baloon.BaloonFx();

        // Avvia la vibrazione contemporanea (dura 500ms)
        this._shake.shake(500);

        // Al termine di Baloon + Shake (500ms), esegue l'esplosione dei fuochi d'artificio (dura 500ms)
        target._explodeTimer = scene.time.delayedCall(500, () => {
            this._fireWorks.FireWorksFx(500);
            target._explodeTimer = null;
            target._activeExplodeFx = null;
        });
    }

    /**
     * Interrompe l'effetto di esplosione in qualsiasi fase si trovi,
     * rimuovendo shader, fermando i tween ed il timer, e ripristinando l'oggetto.
     */
    StopExplodeFx() {
        const target = this.target;
        if (!target) return;

        // 1. Cancella il timer dell'esplosione programmata
        if (target._explodeTimer) {
            target._explodeTimer.destroy();
            target._explodeTimer = null;
        }

        // 2. Interrompe BaloonFx (ripristina scala e rimuove lo shader Barrel dalla GPU)
        this._baloon.StopBaloonFx();

        // 3. Interrompe lo Shake se attivo
        if (target._shakeTween) {
            target._shakeTween.stop();
            target._shakeTween = null;
            if (target._originalX !== undefined) target.x = target._originalX;
            if (target._originalY !== undefined) target.y = target._originalY;
        }

        // 4. Interrompe FireWorksFx ed elimina i detriti/frammenti se l'esplosione era già iniziata
        if (target._FireWorks) {
            target._FireWorks.stop();
            target._FireWorks = null;
        }
        if (target.frags) {
            this._stopDebris.StopDebrisFx(target.frags);
            target.frags = null;
        }

        // Ripristina lo stato
        delete target._exploded;
        if (target.body) {
            target.body.enable = true;
        }

        // Rimuove il riferimento all'esplosione attiva
        target._activeExplodeFx = null;
    }
}