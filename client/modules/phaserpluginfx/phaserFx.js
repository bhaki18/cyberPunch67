import fxComplex from "./complex/fxComplex.js";
import fxSystem from "./AddOn/fxSystem.js";

import ShakeFx from "./methods/shake.js";
import RotateFx from "./methods/rotate.js";
import PulseFx from "./methods/pulse.js";
import DamageNumberFx from "./methods/damageNumber.js";
import GlowFx from "./methods/glow.js";
import GetBiggerFx from "./methods/getBigger.js";
import GetSmallerFx from "./methods/getSmaller.js";
import ChangeTextureFx from "./methods/changeTexture.js";
import ChainFx from "./utils/chain.js";
import FloatXFx from "./methods/floatX.js";
import FloatYFx from "./methods/floatY.js";
import ClickFx from "./methods/click.js";
import StopFx from "./utils/stop.js";
import SlimeFx from "./methods/slime.js";
import ImmuneFx from "./methods/immune.js";
import PopInFx from "./methods/popIn.js";
import PopOutFx from "./methods/popOut.js";
import FadeInFx from "./methods/fadeIn.js";
import FadeOutFx from "./methods/fadeOut.js";
import DebrisFx from "./AddOn/devMethods/debris.js";
import ExplodeFx from "./complex/complexMethods/explode.js";


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
        this._slime = new SlimeFx(target);
        this._immune = new ImmuneFx(target);
        this._popIn = new PopInFx(target);
        this._popOut = new PopOutFx(target);
        this._fadeIn = new FadeInFx(target);
        this._fadeOut = new FadeOutFx(target);

        // Gruppo di effetti complessi (gestiscono pipeline PostFX e stati persistenti)
        this._complex = new fxComplex(target, this);
        this._debris = new DebrisFx(target);
        this._explode = new ExplodeFx(target);

    }

    /**
     * Fa oscillare (ruotare a destra e sinistra) l'oggetto attorno all'angolo di riposo originario.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.RotateFx(500, 15, 2);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.RotateFx({ duration: 500, intensity: 15, speed: 2 });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in ms, o oggetto con i parametri.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.intensity=15] - Limite massimo dell'oscillazione in gradi.
     * @param {number} [durationOrConfig.speed=2] - Velocità angolare di oscillazione per singolo frame.
     * @param {number} [intensity=15] - Limite massimo dell'oscillazione in gradi (se usato con parametri posizionali).
     * @param {number} [speed=2] - Velocità angolare di oscillazione per singolo frame (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    RotateFx(durationOrConfig, intensity, speed) {
        let d = durationOrConfig;
        let i = intensity;
        let s = speed;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            i = durationOrConfig.intensity;
            s = durationOrConfig.speed;
        }

        this._rotate.rotate(d, i, s);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Applica una scossa posizionale casuale sull'oggetto.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.ShakeFx(500, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.ShakeFx({ duration: 500, intensity: 5 });
     * 
     * // Shake infinito (da fermare con StopFx('shake')):
     * sprite.fx.ShakeFx({ intensity: 8, loop: true });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in ms, o oggetto con i parametri.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi (ignorata se loop è true).
     * @param {number} [durationOrConfig.intensity=5] - Distanza massima di spostamento casuale in pixel.
     * @param {boolean} [durationOrConfig.loop=false] - Se true, lo shake continua all'infinito finché non viene fermato.
     * @param {number} [intensity=5] - Distanza massima di spostamento casuale in pixel (se usato con parametri posizionali).
     * @param {boolean} [loop=false] - Se true, shake infinito (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ShakeFx(durationOrConfig, intensity, loop = false) {
        let d = durationOrConfig;
        let i = intensity;
        let l = loop;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            i = durationOrConfig.intensity;
            l = durationOrConfig.loop ?? false;
        }

        this._shake.shake(d, i, l);
        // In modalità loop la ChainFx ha delay 0 (l'effetto non termina da solo)
        return new ChainFx(this, 0, l ? 0 : (d || 500));
    }

    /**
     * Fa pulsare continuamente l'oggetto ingrandendolo e rimpicciolendolo in modo ciclico.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.PulseFx(1300, 1, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.PulseFx({ duration: 1300, intensity: 1, speed: 5 });
     * 
     * @param {Object|number} [durationOrConfig=1300] - Durata totale dell'effetto in ms, o oggetto con i parametri.
     * @param {number} [durationOrConfig.duration=1300] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.intensity=1] - Intensità della pulsazione (es. 1 corrisponde a un incremento di +0.1 della scala).
     * @param {number} [durationOrConfig.speed=5] - Velocità di pulsazione (variazione di scala per frame, es: 5 = 0.05).
     * @param {number} [intensity=1] - Intensità della pulsazione (se usato con parametri posizionali).
     * @param {number} [speed=5] - Velocità di pulsazione (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    PulseFx(durationOrConfig, intensity, speed) {
        let d = durationOrConfig;
        let i = intensity;
        let s = speed;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            i = durationOrConfig.intensity;
            s = durationOrConfig.speed;
        }

        this._pulse.PulseFx(d, i, s);
        return new ChainFx(this, 0, d || 1300);
    }

    /**
     * Crea un effetto numero di danno fluttuante con rimbalzo ed evanescenza.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.DamageNumberFx(100, 32, "ff0000");
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.DamageNumberFx({ number: 100, size: 32, color: "ff0000" });
     * 
     * @param {Object|number} numberOrConfig - Il numero di danno da mostrare o l'oggetto di configurazione.
     * @param {number} [numberOrConfig.number] - Il numero di danno da mostrare a schermo.
     * @param {number} [numberOrConfig.size=32] - Dimensione in pixel del carattere del testo.
     * @param {string} [numberOrConfig.color="00ff00"] - Colore esadecimale del testo sotto forma di stringa (es: "ff0000").
     * @param {number} [size=32] - Dimensione in pixel del carattere del testo (se usato con parametri posizionali).
     * @param {string} [color="00ff00"] - Colore esadecimale del testo (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    DamageNumberFx(numberOrConfig, size, color) {
        let n = numberOrConfig;
        let s = size;
        let c = color;

        if (numberOrConfig && typeof numberOrConfig === 'object') {
            n = numberOrConfig.number;
            s = numberOrConfig.size;
            c = numberOrConfig.color;
        }

        this._damageNumber.DamageNumberFx(n, s, c);
        return new ChainFx(this, 0, 1000);
    }

    /**
     * Crea un alone luminoso oscillante dietro all'oggetto per simularne il bagliore neon.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.GlowFx(1000, 2, false);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.GlowFx({ duration: 1000, size: 2, loop: false });
     * 
     * @param {Object|number} [durationOrConfig=1000] - Durata dell'effetto in ms (se loop è false) o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=1000] - Durata dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.size=2] - Spessore e raggio del bagliore generato.
     * @param {boolean} [durationOrConfig.loop=false] - Se impostato a true, l'effetto pulsa all'infinito.
     * @param {number} [size=2] - Spessore e raggio del bagliore generato (se usato con parametri posizionali).
     * @param {boolean} [loop=false] - Se impostato a true, l'effetto pulsa all'infinito (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GlowFx(durationOrConfig, size, loop) {
        let d = durationOrConfig;
        let s = size;
        let l = loop;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            s = durationOrConfig.size;
            l = durationOrConfig.loop;
        }

        this._glow.GlowFx(d, s, l);
        return new ChainFx(this, 0, d || 1000);
    }

    /**
     * Effetto flash: ingrandisce rapidamente l'oggetto a intervalli regolari alternando opzionalmente la texture.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.GetBiggerFx(1.2, "nuovaTexture", 500, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.GetBiggerFx({ size: 1.2, texture: "nuovaTexture", duration: 500, speed: 5 });
     * 
     * @param {Object|number} [sizeOrConfig=1.2] - Fattore di ingrandimento (es: 1.2 = +20%) o oggetto di configurazione.
     * @param {number} [sizeOrConfig.size=1.2] - Fattore moltiplicativo di ingrandimento.
     * @param {string} [sizeOrConfig.texture] - Texture alternativa opzionale da scambiare durante l'ingrandimento.
     * @param {number} [sizeOrConfig.duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [sizeOrConfig.speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @param {string} [texture] - Texture alternativa opzionale (se usato con parametri posizionali).
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi (se usato con parametri posizionali).
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GetBiggerFx(sizeOrConfig, texture, duration, speed) {
        let s = sizeOrConfig;
        let t = texture;
        let d = duration;
        let sp = speed;

        if (sizeOrConfig && typeof sizeOrConfig === 'object') {
            s = sizeOrConfig.size;
            t = sizeOrConfig.texture;
            d = sizeOrConfig.duration;
            sp = sizeOrConfig.speed;
        }

        this._getBigger.GetBiggerFx(s, t, d, sp);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Effetto flash: rimpicciolisce rapidamente l'oggetto a intervalli regolari alternando opzionalmente la texture.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.GetSmallerFx(0.8, "nuovaTexture", 500, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.GetSmallerFx({ size: 0.8, texture: "nuovaTexture", duration: 500, speed: 5 });
     * 
     * @param {Object|number} [sizeOrConfig=0.8] - Fattore di riduzione (es: 0.8 = -20%) o oggetto di configurazione.
     * @param {number} [sizeOrConfig.size=0.8] - Fattore moltiplicativo di riduzione.
     * @param {string} [sizeOrConfig.texture] - Texture alternativa opzionale da scambiare durante il rimpicciolimento.
     * @param {number} [sizeOrConfig.duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [sizeOrConfig.speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @param {string} [texture] - Texture alternativa opzionale (se usato con parametri posizionali).
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi (se usato con parametri posizionali).
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    GetSmallerFx(sizeOrConfig, texture, duration, speed) {
        let s = sizeOrConfig;
        let t = texture;
        let d = duration;
        let sp = speed;

        if (sizeOrConfig && typeof sizeOrConfig === 'object') {
            s = sizeOrConfig.size;
            t = sizeOrConfig.texture;
            d = sizeOrConfig.duration;
            sp = sizeOrConfig.speed;
        }

        this._getSmaller.GetSmallerFx(s, t, d, sp);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Alterna rapidamente la texture corrente dell'oggetto con una nuova ad intervalli regolari.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.ChangeTextureFx("nuovaTexture", 500, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.ChangeTextureFx({ texture: "nuovaTexture", duration: 500, speed: 5 });
     * 
     * @param {Object|string} textureOrConfig - La chiave della texture da alternare o l'oggetto di configurazione.
     * @param {string} [textureOrConfig.texture] - La chiave della texture da alternare.
     * @param {number} [textureOrConfig.duration=500] - Durata complessiva dell'effetto in millisecondi.
     * @param {number} [textureOrConfig.speed=5] - Frequenza di alternanza espressa in numero di frame.
     * @param {number} [duration=500] - Durata complessiva dell'effetto in millisecondi (se usato con parametri posizionali).
     * @param {number} [speed=5] - Frequenza di alternanza espressa in numero di frame (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ChangeTextureFx(textureOrConfig, duration, speed) {
        let t = textureOrConfig;
        let d = duration;
        let s = speed;

        if (textureOrConfig && typeof textureOrConfig === 'object') {
            t = textureOrConfig.texture;
            d = textureOrConfig.duration;
            s = textureOrConfig.speed;
        }

        this._changeTexture.ChangeTextureFx(t, d, s);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Fa oscillare orizzontalmente l'oggetto seguendo un moto armonico semplice (onda sinusoidale).
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.FloatXFx(50, 1000, true, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.FloatXFx({ distance: 50, duration: 1000, loop: true, speed: 5 });
     * 
     * @param {Object|number} [distanceOrConfig=50] - Raggio massimo dell'oscillazione orizzontale in px o oggetto di configurazione.
     * @param {number} [distanceOrConfig.distance=50] - Raggio massimo dell'oscillazione orizzontale in pixel.
     * @param {number} [distanceOrConfig.duration=1000] - Durata completa di una singola oscillazione in millisecondi.
     * @param {boolean} [distanceOrConfig.loop=false] - Se ripetere l'oscillazione all'infinito.
     * @param {number} [distanceOrConfig.speed=5] - Parametro mantenuto per compatibilità.
     * @param {number} [duration=1000] - Durata in millisecondi (se usato con parametri posizionali).
     * @param {boolean} [loop=false] - Ripetizione all'infinito (se usato con parametri posizionali).
     * @param {number} [speed=5] - Parametro velocità mantenuto per compatibilità (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FloatXFx(distanceOrConfig, duration, loop, speed) {
        let dist = distanceOrConfig;
        let dur = duration;
        let lp = loop;
        let sp = speed;

        if (distanceOrConfig && typeof distanceOrConfig === 'object') {
            dist = distanceOrConfig.distance;
            dur = distanceOrConfig.duration;
            lp = distanceOrConfig.loop;
            sp = distanceOrConfig.speed;
        }

        this._floatX.FloatXFx(dist, dur, lp, sp);
        return new ChainFx(this, 0, dur || 1000);
    }

    /**
     * Fa oscillare verticalmente l'oggetto seguendo un moto armonico semplice (onda sinusoidale).
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.FloatYFx(50, 1000, true, 5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.FloatYFx({ distance: 50, duration: 1000, loop: true, speed: 5 });
     * 
     * @param {Object|number} [distanceOrConfig=50] - Raggio massimo dell'oscillazione verticale in px o oggetto di configurazione.
     * @param {number} [distanceOrConfig.distance=50] - Raggio massimo dell'oscillazione verticale in pixel.
     * @param {number} [distanceOrConfig.duration=1000] - Durata completa di una singola oscillazione in millisecondi.
     * @param {boolean} [distanceOrConfig.loop=false] - Se ripetere l'oscillazione all'infinito.
     * @param {number} [distanceOrConfig.speed=5] - Parametro mantenuto per compatibilità.
     * @param {number} [duration=1000] - Durata in millisecondi (se usato con parametri posizionali).
     * @param {boolean} [loop=false] - Ripetizione all'infinito (se usato con parametri posizionali).
     * @param {number} [speed=5] - Parametro velocità mantenuto per compatibilità (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FloatYFx(distanceOrConfig, duration, loop, speed) {
        let dist = distanceOrConfig;
        let dur = duration;
        let lp = loop;
        let sp = speed;

        if (distanceOrConfig && typeof distanceOrConfig === 'object') {
            dist = distanceOrConfig.distance;
            dur = distanceOrConfig.duration;
            lp = distanceOrConfig.loop;
            sp = distanceOrConfig.speed;
        }

        this._floatY.FloatYFx(dist, dur, lp, sp);
        return new ChainFx(this, 0, dur || 1000);
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

    /**
     * Applica un effetto elastico tipo slime/squash-and-stretch all'oggetto.
     * Deforma l'oggetto comprimendolo e allungandolo in modo armonico smorzato nel tempo, preservando l'area (volume).
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.SlimeFx(1000, 1.0);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.SlimeFx({ duration: 1000, speed: 1.0 });
     * 
     * @param {Object|number} [durationOrConfig=1000] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=1000] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.speed=1.0] - Moltiplicatore dell'intensità della deformazione/oscillazione.
     * @param {number} [speed=1.0] - Moltiplicatore dell'intensità della deformazione/oscillazione (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    SlimeFx(durationOrConfig, speed) {
        let d = durationOrConfig;
        let s = speed;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            s = durationOrConfig.speed;
        }

        this._slime.SlimeFx(d, s);
        return new ChainFx(this, 0, d || 1000);
    }

    /**
     * Applica un effetto visivo di immunità (lampeggio tramite oscillazione dell'opacità/alpha).
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.ImmuneFx(1000);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.ImmuneFx({ duration: 1000 });
     * 
     * @param {Object|number} [durationOrConfig=1000] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=1000] - Durata totale dell'effetto in millisecondi.
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    ImmuneFx(durationOrConfig) {
        let d = durationOrConfig;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
        }

        this._immune.ImmuneFx(d);
        return new ChainFx(this, 0, d || 1000);
    }

    /**
     * Applica un effetto visivo di comparsa (pop-in) con rimbalzo elastico sull'oggetto.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.PopInFx(500, 1.5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.PopInFx({ duration: 500, finalScale: 1.5 });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.finalScale] - Scala finale desiderata per l'oggetto.
     * @param {number} [finalScale] - Scala finale desiderata per l'oggetto (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    PopInFx(durationOrConfig, finalScale) {
        let d = durationOrConfig;
        let fs = finalScale;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            fs = durationOrConfig.finalScale;
        }

        this._popIn.PopInFx(d, fs);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Applica un effetto visivo di scomparsa (pop-out) riducendo la scala a zero con una leggera elasticità.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.PopOutFx(500, 1.5);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.PopOutFx({ duration: 500, startScale: 1.5 });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.startScale] - Scala iniziale da cui partire.
     * @param {number} [startScale] - Scala iniziale da cui partire (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    PopOutFx(durationOrConfig, startScale) {
        let d = durationOrConfig;
        let ss = startScale;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            ss = durationOrConfig.startScale;
        }

        this._popOut.PopOutFx(d, ss);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Applica un effetto visivo di dissolvenza in entrata (fade-in) portando l'opacità (alpha) dell'oggetto a un valore finale.
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.FadeInFx(500, 1);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.FadeInFx({ duration: 500, finalAlpha: 1 });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.finalAlpha=1] - Opacità finale desiderata.
     * @param {number} [finalAlpha=1] - Opacità finale desiderata (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FadeInFx(durationOrConfig, finalAlpha) {
        let d = durationOrConfig;
        let fa = finalAlpha;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            fa = durationOrConfig.finalAlpha;
        }

        this._fadeIn.FadeInFx(d, fa);
        return new ChainFx(this, 0, d || 500);
    }

    /**
     * Applica un effetto visivo di dissolvenza in uscita (fade-out) riducendo l'opacità (alpha) dell'oggetto a un valore finale (di base 0).
     * Supporta sia parametri posizionali che un oggetto di configurazione.
     * 
     * @example
     * // Esempio con parametri posizionali:
     * sprite.fx.FadeOutFx(500, 0);
     * 
     * // Esempio con oggetto di configurazione:
     * sprite.fx.FadeOutFx({ duration: 500, finalAlpha: 0 });
     * 
     * @param {Object|number} [durationOrConfig=500] - Durata totale dell'effetto in millisecondi o oggetto di configurazione.
     * @param {number} [durationOrConfig.duration=500] - Durata totale dell'effetto in millisecondi.
     * @param {number} [durationOrConfig.finalAlpha=0] - Opacità finale desiderata.
     * @param {number} [finalAlpha=0] - Opacità finale desiderata (se usato con parametri posizionali).
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    FadeOutFx(durationOrConfig, finalAlpha) {
        let d = durationOrConfig;
        let fa = finalAlpha;

        if (durationOrConfig && typeof durationOrConfig === 'object') {
            d = durationOrConfig.duration;
            fa = durationOrConfig.finalAlpha;
        }

        this._fadeOut.FadeOutFx(d, fa);
        return new ChainFx(this, 0, d || 500);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // METODI COMPLESSI (Barrel Post-FX + gestione stato persistente)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Applica l'effetto palloncino che gonfia progressivamente il target.
     * Utilizza la distorsione Barrel Post-FX (WebGL) per simulare un rigonfiamento sferico
     * tridimensionale sulla texture, accumulando l'effetto ad ogni chiamata successiva.
     * Lo shader rimane attivo al termine dell'animazione; per resettarlo usare StopBaloonFx().
     *
     * ⚠️ Richiede Phaser 3.60+ in modalità WebGL per la distorsione Barrel;
     *    in modalità Canvas lo scaling è comunque applicato ma senza shader.
     *
     * @example
     * sprite.fx.BaloonFx();
     *
     * // Concatenamento con altro effetto
     * sprite.fx.BaloonFx().chain.ShakeFx();
     *
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    BaloonFx() {
        return this._complex.BaloonFx();
    }

    /**
     * Interrompe l'effetto palloncino e riporta il target alla scala originaria.
     * Rimuove lo shader Barrel Post-FX dalla pipeline del GameObject liberando memoria GPU.
     *
     * @example
     * sprite.fx.StopBaloonFx();
     *
     * @returns {ChainFx} Oggetto per il concatenamento sequenziale tramite .chain
     */
    StopBaloonFx() {
        return this._complex.StopBaloonFx();
    }

    /**
     * Applica l'effetto fuochi d'artificio che frantuma il target in detriti che esplodono.
     * L'oggetto target rimane permanentemente invisibile (distrutto) al termine.
     * 
     * @param {number} [duration=1000] - Durata complessiva dell'esplosione in millisecondi.
     * @returns {ChainFx}
     */
    FireWorksFx(duration) {
        return this._complex.FireWorksFx(duration);
    }

    /**
     * Applica un effetto visivo di detriti (frammentazione) senza animazione automatica.
     *
     * @returns {Array<Phaser.GameObjects.GameObject>} Array dei frammenti generati.
     */
    DebrisFx() {
        return this._debris.DebrisFx();
    }

    /**
     * Applica l'effetto ExplodeFx che combina il gonfiamento a palloncino (500ms),
     * lo shake contemporaneo (500ms) e infine la scomposizione in fuochi d'artificio (500ms).
     * L'oggetto target rimane permanentemente invisibile (distrutto) al termine.
     *
     * @returns {ChainFx}
     */
    ExplodeFx() {
        this._explode.ExplodeFx();
        return new ChainFx(this, 0, 1000);
    }

}

export { fxSystem };
export { fxComplex };
