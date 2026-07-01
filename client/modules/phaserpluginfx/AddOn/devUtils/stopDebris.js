/**
 * Classe per l'arresto e la rimozione controllata dei detriti (debris) in gioco.
 */
export default class StopDebrisFx {
    constructor() {

    }

    /**
     * Distrugge immediatamente tutti i frammenti grafici passati come parametro per interrompere l'effetto.
     * 
     * @param {Array<Phaser.GameObjects.GameObject>} array - L'array contenente i frammenti grafici da distruggere.
     * 
     * @example
     * stopDebrisFx.StopDebrisFx(fragsArray);
     */
    StopDebrisFx(array) {
        // Valida la presenza di un array valido
        const frags = array || null;
        if (!frags) {
            console.warn("StopDebrisFx: Errore, array vuoto o inesistente.");
            return;
        }

        // Itera e distrugge singolarmente ciascun frammento per liberare memoria ed eliminarlo dalla scena
        frags.forEach(frag => {
            if (frag && typeof frag.destroy === 'function') {
                frag.destroy();
            }
        });
    }
}