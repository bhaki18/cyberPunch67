import DebrisFx from "./devMethods/debris.js";
import StopDebrisFx from "./devUtils/stopDebris.js";

/**
 * Classe contenente strumenti di sviluppo per manipolare ed interrompere effetti visuali custom (Add-On).
 */
export default class DevToolsFx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto di gioco a cui associare i dev tools.
     */
    constructor(target) {
        // Istanzia il gestore per l'effetto debris e per lo stop dei frammenti
        this._debris = new DebrisFx(target);
        this._stopDebris = new StopDebrisFx();
    }

    /**
     * Esegue l'effetto di frammentazione ed esplosione detriti (DebrisFx) sul target associato.
     * 
     * @example
     * gameObject.fxDevTools.DebrisFx();
     */
    DebrisFx() {
        return this._debris.DebrisFx();
    }

    /**
     * Interrompe l'effetto distruggendo tutti i frammenti grafici passati come parametro.
     * 
     * @param {Array<Phaser.GameObjects.GameObject>} array - Lista dei frammenti generati da distruggere.
     * 
     * @example
     * gameObject.fxDevTools.StopDebrisFx(frags);
     */
    StopDebrisFx(array) {
        this._stopDebris.StopDebrisFx(array);
    }
}