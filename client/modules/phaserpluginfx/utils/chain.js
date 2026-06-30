export default class ChainFx {
    constructor(fxInstance, delaySoFar = 0, durationOfThisEffect = 0) {
        this.fx = fxInstance;
        this.scene = fxInstance.scene;
        this.delaySoFar = delaySoFar;
        this.durationOfThisEffect = durationOfThisEffect;
    }

    // Il getter .chain restituisce il Proxy
    get chain() {
        // Calcola quando dovrà partire il prossimo effetto (aggiungiamo 1ms di tolleranza per permettere il reset delle variabili)
        const nextStartDelay = this.delaySoFar + this.durationOfThisEffect + 1;

        return new Proxy(this.fx, {
            get: (targetFx, propName) => {
                const originalMethod = targetFx[propName];

                // Se l'utente sta chiamando un metodo (GlowFx, ShakeFx, ecc.)
                if (typeof originalMethod === 'function') {
                    return (...args) => {

                        // 1. TROVA LA DURATA CORRETTA:
                        let duration = 500; // Valore di fallback generico

                        if (propName === 'DamageNumberFx') {
                            duration = 1000; // Durata fissa all'interno di damageNumber.js
                        } else if (propName === 'ChangeTextureFx') {
                            duration = (typeof args[1] === 'number') ? args[1] : 500;
                        } else if (propName === 'GetBiggerFx' || propName === 'GetSmallerFx') {
                            duration = (typeof args[2] === 'number') ? args[2] : 500;
                        } else {
                            // RotateFx, ShakeFx, PulseFx, GlowFx hanno tutti la durata come primo parametro
                            let defaultDur = 500;
                            if (propName === 'GlowFx') defaultDur = 1000;
                            if (propName === 'PulseFx') defaultDur = 1300;
                            duration = (typeof args[0] === 'number') ? args[0] : defaultDur;
                        }

                        // 2. PIANIFICA L'EFFETTO:
                        this.scene.time.delayedCall(nextStartDelay, () => {
                            originalMethod.apply(targetFx, args);
                        });

                        // 3. RITORNA IL PROSSIMO STEP DELLA CATENA:
                        return new ChainFx(this.fx, nextStartDelay, duration);
                    };
                }

                return targetFx[propName];
            }
        });
    }
}
