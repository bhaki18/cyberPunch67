import RallyFx from "./system/rally.js";
import ChainFx from "./utils/chain.js";
import NormalTimeFx from "./system/normalTime.js";

/**
 * Gestore degli effetti globali a livello di Scena Phaser (es. rallentamenti temporali o ripristini).
 */
export default class fxSystem {
    /**
     * @param {Phaser.Scene} scene - La scena di gioco Phaser a cui associare gli effetti globali.
     */
    constructor(scene) {
        this.scene = scene;
        this._rally = new RallyFx(scene);
        this._normalTime = new NormalTimeFx(scene);
    }

    /**
     * Effetto Rally: Rallenta la velocità dello scorrimento del tempo (Time Dilation) nella scena per una certa durata.
     * @param {Object|number} options - Un oggetto di configurazione (es: { duration: 1000, rally: 0.2 }) o la durata in millisecondi.
     * @param {number} [rally=0.2] - Moltiplicatore di velocità del tempo (es. 0.2 = tempo al 20%, valido se options è un numero).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    RallyFx(options, rally) {
        this._rally.RallyFx(options, rally);

        // Ricaviamo la durata per passarla alla catena
        let duration = 1000;
        if (typeof options === 'object' && options !== null) {
            duration = options.duration !== undefined ? options.duration : 1000;
        } else if (typeof options === 'number') {
            duration = options;
        }

        // Ritorna l'anello di partenza per la catena
        return new ChainFx(this, 0, duration);
    }

    /**
     * Ripristina o forza la velocità del tempo (Time Scale) di tutti i sistemi della scena ad un valore specifico.
     * Utile per concludere catene o ripristinare il tempo in sicurezza.
     * @param {number} [speed=1] - Moltiplicatore della velocità del tempo desiderata (1 = velocità normale).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    NormalTimeFx(speed) {
        this._normalTime.NormalTimeFx(speed);
        return new ChainFx(this, 0, 1);
    }
}
