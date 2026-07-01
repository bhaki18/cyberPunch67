import ChainFx from "../utils/chain.js";
import BaloonFx from "./complexMethods/baloon.js";
import FireWorksFx from "./complexMethods/fireWorks.js";

/**
 * Gruppo di metodi complessi (Add-On) che gestiscono effetti grafici concatenati.
 */
export default class fxComplex {
    /**
     * @param {Phaser.GameObjects.GameObject} target - Oggetto target di gioco.
     * @param {Object} fxInstance - Istanza principale del plugin fx.
     */
    constructor(target, fxInstance) {
        this.target = target;
        this.fxInstance = fxInstance;
        this._baloon = new BaloonFx(target);
        this._fireWorks = new FireWorksFx(target);
    }

    /**
     * Applica l'effetto palloncino che gonfia progressivamente il target ad ogni chiamata.
     * 
     * @example
     * sprite.fx.BaloonFx();
     * 
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    BaloonFx() {
        this._baloon.BaloonFx();
        return new ChainFx(this.fxInstance, 0, 500);
    }

    /**
     * Interrompe e rimuove completamente l'effetto palloncino e i relativi shader di distorsione.
     * 
     * @example
     * sprite.fx.StopBaloonFx();
     * 
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    StopBaloonFx() {
        this._baloon.StopBaloonFx();
        return new ChainFx(this.fxInstance, 0, 0);
    }

    /**
     * Applica l'effetto fuochi d'artificio che frantuma l'oggetto in detriti che esplodono verso l'esterno.
     * 
     * @param {number} [duration=500] - Durata dell'effetto in millisecondi.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FireWorksFx(duration) {
        this._fireWorks.FireWorksFx(duration);
        return new ChainFx(this.fxInstance, 0, duration || 500);
    }
}