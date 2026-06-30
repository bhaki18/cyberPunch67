import ShakeFx from "./methods/shake.js";
import RotateFx from "./methods/rotate.js";
import PulseFx from "./methods/pulse.js";
import DamageNumberFx from "./methods/damageNumber.js";
import GlowFx from "./methods/glow.js";
import GetBiggerFx from "./methods/getBigger.js";
import GetSmallerFx from "./methods/getSmaller.js";
import ChangeTextureFx from "./methods/changeTexture.js";
import ChainFx from "./utils/chain.js";
import fxSystem from "./fxSystem.js";
import FloatXFx from "./methods/floatX.js";
import FloatYFx from "./methods/floatY.js";
import ClickFx from "./methods/click.js";
import StopFx from "./utils/stop.js";

/**
 * Classe principale fx che si associa ad un GameObject Phaser per esporre effetti grafici e di animazione.
 */
export default class fx {
    /**
     * @param {Phaser.GameObjects.GameObject} target - L'oggetto grafico di gioco a cui applicare gli effetti.
     */
    constructor(target) {
        this.target = target;
        this.scene = target ? target.scene : null;

        this._rotate = new RotateFx(target);
        this._shake = new ShakeFx(target);
        this._pulse = new PulseFx(target);
        this._damageNumber = new DamageNumberFx(target);
        this._glow = new GlowFx(target);
        this._getBigger = new GetBiggerFx(target);
        this._getSmaller = new GetSmallerFx(target);
        this._changeTexture = new ChangeTextureFx(target);
        this._floatX = new FloatXFx(target);
        this._floatY = new FloatYFx(target);
        this._click = new ClickFx(target);
        this._stop = new StopFx(target);
    }

    /**
     * Fa oscillare (ruotare a destra e sinistra) l'oggetto attorno all'angolo di riposo originario.
     * @param {number} [duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [intensity=15] - Limite massimo dell'oscillazione in gradi.
     * @param {number} [speed=2] - Velocità angolare di oscillazione per singolo frame.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    RotateFx(duration, intensity, speed) {
        this._rotate.rotate(duration, intensity, speed);
        return new ChainFx(this, 0, duration || 500);
    }

    /**
     * Applica una scossa posizionale casuale sull'oggetto.
     * @param {number} [duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [intensity=5] - Distanza massima di spostamento casuale in pixel.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ShakeFx(duration, intensity) {
        this._shake.shake(duration, intensity);
        return new ChainFx(this, 0, duration || 500);
    }

    /**
     * Fa pulsare continuamente l'oggetto ingrandendolo e rimpicciolendolo in modo ciclico.
     * @param {number} [duration=1300] - Durata totale dell'effetto in millisecondi.
     * @param {number} [intensity=1] - Intensità della pulsazione (es. 1 corrisponde a un incremento di +0.1 della scala).
     * @param {number} [speed=5] - Velocità di pulsazione (variazione di scala per frame, es: 5 = 0.05).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    PulseFx(duration, intensity, speed) {
        this._pulse.PulseFx(duration, intensity, speed);
        return new ChainFx(this, 0, duration || 1300);
    }

    /**
     * Crea un effetto numero di danno fluttuante con rimbalzo ed evanescenza.
     * @param {number} number - Il numero di danno da mostrare a schermo.
     * @param {number} [size=32] - Dimensione in pixel del carattere del testo.
     * @param {string} [color="00ff00"] - Colore esadecimale del testo sotto forma di stringa (es: "ff0000").
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    DamageNumberFx(number, size, color) {
        this._damageNumber.DamageNumberFx(number, size, color);
        return new ChainFx(this, 0, 1000);
    }

    /**
     * Crea un alone luminoso oscillante dietro all'oggetto per simularne il bagliore neon.
     * @param {number} [duration=1000] - Durata dell'effetto in millisecondi (valido se loop è false).
     * @param {number} [size=2] - Spessore e raggio del bagliore generato (moltiplicato internamente).
     * @param {boolean} [loop=false] - Se impostato a true, l'effetto pulsa all'infinito.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GlowFx(duration, size, loop) {
        this._glow.GlowFx(duration, size, loop);
        return new ChainFx(this, 0, duration || 1000);
    }

    /**
     * Effetto flash: ingrandisce rapidamente l'oggetto a intervalli regolari alternando opzionalmente la texture.
     * @param {number} [size=1.2] - Fattore moltiplicativo di ingrandimento (es: 1.4 = +40% dimensione).
     * @param {string} [texture] - Texture alternativa opzionale da scambiare durante l'ingrandimento.
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GetBiggerFx(size, texture, duration, speed) {
        this._getBigger.GetBiggerFx(size, texture, duration, speed);
        return new ChainFx(this, 0, duration || 500);
    }

    /**
     * Effetto flash: rimpicciolisce rapidamente l'oggetto a intervalli regolari alternando opzionalmente la texture.
     * @param {number} [size=0.8] - Fattore moltiplicativo di riduzione (es: 0.7 = -30% dimensione).
     * @param {string} [texture] - Texture alternativa opzionale da scambiare durante il rimpicciolimento.
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GetSmallerFx(size, texture, duration, speed) {
        this._getSmaller.GetSmallerFx(size, texture, duration, speed);
        return new ChainFx(this, 0, duration || 500);
    }

    /**
     * Alterna rapidamente la texture corrente dell'oggetto con una nuova ad intervalli regolari.
     * @param {string} texture - La chiave della texture da alternare.
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ChangeTextureFx(texture, duration, speed) {
        this._changeTexture.ChangeTextureFx(texture, duration, speed);
        return new ChainFx(this, 0, duration || 500);
    }

    /**
     * Fa oscillare orizzontalmente l'oggetto seguendo un moto armonico semplice (onda sinusoidale).
     * @param {number} [distance=50] - Raggio massimo dell'oscillazione orizzontale in pixel.
     * @param {number} [duration=1000] - Durata completa di una singola oscillazione in millisecondi.
     * @param {boolean} [loop=false] - Se ripetere l'oscillazione all'infinito.
     * @param {number} [speed=5] - Parametro mantenuto per compatibilità, la velocità è gestita dal moto armonico.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FloatXFx(distance, duration, loop, speed) {
        this._floatX.FloatXFx(distance, duration, loop, speed);
        return new ChainFx(this, 0, duration || 1000);
    }

    /**
     * Fa oscillare verticalmente l'oggetto seguendo un moto armonico semplice (onda sinusoidale).
     * @param {number} [distance=50] - Raggio massimo dell'oscillazione verticale in pixel.
     * @param {number} [duration=1000] - Durata completa di una singola oscillazione in millisecondi.
     * @param {boolean} [loop=false] - Se ripetere l'oscillazione all'infinito.
     * @param {number} [speed=5] - Parametro mantenuto per compatibilità, la velocità è gestita dal moto armonico.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FloatYFx(distance, duration, loop, speed) {
        this._floatY.FloatYFx(distance, duration, loop, speed);
        return new ChainFx(this, 0, duration || 1000);
    }

    /**
     * Simula la pressione di un bottone di interfaccia (click) spostando l'oggetto in basso e scurendolo temporaneamente.
     * Supporta sia Sprite/Image (con setTint) che oggetti Shape/Rettangoli (calcolando le sfumature del fillColor).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ClickFx() {
        this._click.ClickFx();
        return new ChainFx(this, 0, 200);
    }

    /**
     * Ferma gli effetti attivi su questo oggetto. Se specificato, ferma solo l'effetto indicato.
     * @param {string} [effectName] - Il nome del metodo dell'effetto da fermare (es. 'FloatXFx', 'click').
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    StopFx(effectName) {
        this._stop.StopFx(effectName);
        return new ChainFx(this, 0, 0);
    }

    /**
     * Alias del metodo StopFx. Ferma un singolo effetto o tutti.
     * @param {string} [effectName] - Il nome del metodo dell'effetto da fermare (es. 'click', 'PulseFx').
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    Stop(effectName) {
        return this.StopFx(effectName);
    }

    /**
     * Scorciatoia per fermare e pulire istantaneamente tutti gli effetti e ripristinare l'oggetto alle condizioni iniziali.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    StopAllFx() {
        return this.StopFx();
    }
}

export { fxSystem };
