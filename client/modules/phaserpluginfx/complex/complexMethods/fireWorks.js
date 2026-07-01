import DebrisFx from "../../AddOn/devMethods/debris.js";
import StopDebrisFx from "../../AddOn/devUtils/stopDebris.js";
import * as Phaser from 'phaser';


/**
 * Effetto Fuochi d'Artificio (FireWorksFx).
 * Scompone il GameObject target in una griglia di frammenti (debris) che vengono
 * lanciati radialmente verso l'esterno a 360 gradi a partire dal centro geometrico,
 * con attrito dell'aria (decelerazione drag) e dissolvenza progressiva.
 * Al completamento dell'animazione, il target rimane permanentemente invisibile (distrutto).
 */
export default class FireWorksFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico da far esplodere.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;
        this._debrisFireWorks = new DebrisFx(target);
        this._stopDebris = new StopDebrisFx();
    }

    /**
     * Avvia l'effetto esplosione fuochi d'artificio.
     * 
     * @param {number} [duration=1000] - Durata totale dell'animazione dell'esplosione in millisecondi.
     */
    FireWorksFx(duration) {
        const target = this.target;
        if (!target) {
            console.warn("FireWorksFx: Nessun oggetto target impostato nel costruttore.");
            return;
        }

        const scene = this.scene || target.scene;
        if (!scene) {
            console.warn("FireWorksFx: Impossibile trovare la scena Phaser associata all'oggetto.");
            return;
        }


        if (target._FireWorks) {
            target._FireWorks.stop();
        }
        if (target.frags) {
            this._stopDebris.StopDebrisFx(target.frags);
            target.frags = null;
        }

        const ActualDuration = (duration) ? duration : 1000;

        // Chiamata corretta all'istanza locale di DebrisFx
        const frags = this._debrisFireWorks.DebrisFx() || [];
        target.frags = frags;


        frags.forEach(frag => {
            // Calcola la direzione radiale in base alla cella logica di provenienza (cellX, cellY)
            // partendo sempre dal centro geometrico dell'oggetto (indipendentemente dal displayOrigin)
            const frameW = target.width / 8;
            const frameH = target.height / 8;

            const localX = (frag.cellX + 0.5) * frameW - target.width / 2;
            const localY = (frag.cellY + 0.5) * frameH - target.height / 2;

            let angle = Math.atan2(localY, localX);
            if (localX === 0 && localY === 0) {
                angle = Math.random() * Math.PI * 2;
            }

            // Aggiunge la rotazione del target e una variazione casuale per naturalezza
            angle += target.rotation || 0;
            angle += Phaser.Math.FloatBetween(-0.2, 0.2);

            // Velocità radiale aumentata per un'espansione leggermente più energica e decisa
            const speed = Phaser.Math.Between(220, 420);

            frag.vx = Math.cos(angle) * speed;
            frag.vy = Math.sin(angle) * speed;
            frag.rotationSpeed = Phaser.Math.FloatBetween(-2, 2);

            frag._startScaleX = frag.scaleX;
            frag._startScaleY = frag.scaleY;
        });

        // Nessuna gravità, l'espansione è puramente radiale a 360 gradi
        const gravity = 0;
        const alpha = target.alpha;

        // CRITICO: usiamo un oggetto fittizio come target in modo che onUpdate venga eseguito
        // una sola volta a frame, invece che 64 volte (evita sbalzi assurdi e accelerazioni anomale)
        target._FireWorks = scene.tweens.add({
            targets: { val: 0 },
            val: 1,
            duration: ActualDuration,
            onStart: () => {
                target.alpha = 0;
            },
            onUpdate: (tween) => {
                const dt = scene.game.loop.delta / 1000;
                const progress = tween.progress;

                // Conserva circa il 25% della velocità al secondo per permettere uno slancio maggiore prima del rallentamento
                const dragFactor = Math.pow(0.25, dt);

                frags.forEach(frag => {
                    if (frag && frag.active) {
                        // Applica l'attrito (eseguito solo 1 volta per frame)
                        frag.vx *= dragFactor;
                        frag.vy *= dragFactor;
                        frag.rotationSpeed *= dragFactor;

                        // Spostamento radiale verso l'esterno
                        frag.x += frag.vx * dt;
                        frag.y += frag.vy * dt;
                        frag.rotation += frag.rotationSpeed * dt;

                        // Dissolvenza e rimpicciolimento manuale dei frammenti
                        frag.alpha = alpha - progress;
                        frag.scaleX = frag._startScaleX * (alpha - progress * 0.8);
                        frag.scaleY = frag._startScaleY * (alpha - progress * 0.8);
                    }
                });
            },
            onComplete: () => {
                target._FireWorks = null;
                target.frags = null;
                this._stopDebris.StopDebrisFx(frags);
            },
            onStop: () => {
                target._FireWorks = null;
                target.frags = null;
                this._stopDebris.StopDebrisFx(frags);
            }
        });
    }
}