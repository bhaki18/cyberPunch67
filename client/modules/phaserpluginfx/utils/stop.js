export default class StopFx {
    constructor(target) {
        this.target = target;
    }

    /**
     * Ferma gli effetti attivi su questo oggetto.
     * Se viene passato il nome di un metodo, ferma solo quell'effetto specifico.
     * Se non viene passato alcun parametro, ferma tutti gli effetti attivi.
     * @param {string} [effectName] - Il nome dell'effetto da fermare (es. 'FloatXFx', 'click').
     */
    StopFx(effectName) {
        const target = this.target;
        if (!target) return;

        // Mappa i nomi commerciali dei metodi alle chiavi interne dei tween salvate sull'oggetto
        const mapping = {
            'rotate': '_rotateTween',
            'rotatefx': '_rotateTween',
            'shake': '_shakeTween',
            'shakefx': '_shakeTween',
            'pulse': '_pulseTween',
            'pulsefx': '_pulseTween',
            'glow': '_glow',
            'glowfx': '_glow',
            'getbigger': '_getBigger',
            'getbiggerfx': '_getBigger',
            'getsmaller': '_getBigger',
            'getsmallerfx': '_getBigger',
            'floatx': '_floatX',
            'floatxfx': '_floatX',
            'floaty': '_floatY',
            'floatyfx': '_floatY',
            'click': '_click',
            'clickfx': '_click',
            'changetexture': '_changeTexture',
            'changetexturefx': '_changeTexture',
            'slime': '_slime',
            'slimefx': '_slime',
            'immune': '_immune',
            'immunefx': '_immune',
            'damagenumber': '_damageNumber',
            'damagenumberfx': '_damageNumber',
            'popin': '_popIn',
            'popinfx': '_popIn',
            'popout': '_popOut',
            'popoutfx': '_popOut',
            'fadein': '_fadeIn',
            'fadeinfx': '_fadeIn',
            'fadeout': '_fadeOut',
            'fadeoutfx': '_fadeOut'
        };

        if (effectName && typeof effectName === 'string') {
            const key = mapping[effectName.toLowerCase()] || effectName;
            if (target[key]) {
                target[key].stop();
                target[key] = null;
            }
        } else {
            // Se non viene specificato nulla, fermiamo tutti gli effetti
            const activeTweens = [
                '_rotateTween',
                '_shakeTween',
                '_pulseTween',
                '_glow',
                '_getBigger',
                '_floatX',
                '_floatY',
                '_click',
                '_changeTexture',
                '_slime',
                '_immune',
                '_damageNumber',
                '_popIn',
                '_popOut',
                '_fadeIn',
                '_fadeOut'
            ];

            activeTweens.forEach(key => {
                if (target[key]) {
                    target[key].stop();
                    target[key] = null;
                }
            });
        }
    }
}