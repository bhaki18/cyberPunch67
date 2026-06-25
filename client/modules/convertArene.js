/**
 * @module convertArene
 * @description Utility per adattare qualsiasi tilemap alle dimensioni dello schermo.
 *
 * Riceve le dimensioni grezze della mappa (in pixel) e dello schermo,
 * e restituisce i valori di scala e posizione da applicare ai layer Phaser
 * in modo che la mappa occupi esattamente lo schermo.
 *
 * @example
 * // In ArenaScene.js, dopo aver creato i layer:
 * import convertArene from "../modules/convertArene.js";
 *
 * const { scaleX, scaleY, x, y } = convertArene({
 *     mapWidthPx:   map.widthInPixels,
 *     mapHeightPx:  map.heightInPixels,
 *     screenWidth:  this.scale.width,
 *     screenHeight: this.scale.height,
 *     mode: "stretch"   // oppure "fit" o "fill"
 * });
 *
 * this.layerArena.setScale(scaleX, scaleY).setPosition(x, y);
 * this.layerArenaMuri.setScale(scaleX, scaleY).setPosition(x, y);
 */

/**
 * @typedef  {object} ArenaTransform
 * @property {number} scaleX  - Fattore di scala orizzontale da applicare al layer
 * @property {number} scaleY  - Fattore di scala verticale  da applicare al layer
 * @property {number} x       - Posizione X (top-left) del layer dopo la scalatura
 * @property {number} y       - Posizione Y (top-left) del layer dopo la scalatura
 * @property {number} scaledW - Larghezza finale della mappa a schermo (px)
 * @property {number} scaledH - Altezza  finale della mappa a schermo (px)
 */

/**
 * Calcola scala e posizione per adattare la mappa allo schermo.
 *
 * @param {object}                     params
 * @param {number}                     params.mapWidthPx   - Larghezza mappa in pixel (map.widthInPixels)
 * @param {number}                     params.mapHeightPx  - Altezza  mappa in pixel (map.heightInPixels)
 * @param {number}                     params.screenWidth  - Larghezza schermo in pixel
 * @param {number}                     params.screenHeight - Altezza  schermo in pixel
 * @param {"stretch"|"fit"|"fill"}     [params.mode="stretch"]
 *   - "stretch" -> mappa esattamente screenWidth x screenHeight (puo distorcere le proporzioni)
 *   - "fit"     -> scala uniforme, mappa interamente visibile (letterbox, bande vuote possibili)
 *   - "fill"    -> scala uniforme, mappa copre tutto lo schermo (possibile crop ai bordi)
 *
 * @returns {ArenaTransform}
 */
export default function convertArene({
    mapWidthPx,
    mapHeightPx,
    screenWidth,
    screenHeight,
    mode = "stretch"
}) {
    if (!mapWidthPx || !mapHeightPx || !screenWidth || !screenHeight) {
        console.warn("[convertArene] Parametri mancanti o zero -- controlla map.widthInPixels / scale.width");
        return { scaleX: 1, scaleY: 1, x: 0, y: 0, scaledW: mapWidthPx, scaledH: mapHeightPx };
    }

    let scaleX, scaleY;

    switch (mode) {

        // STRETCH: La mappa occupa esattamente lo schermo.
        // Le proporzioni originali possono essere modificate.
        case "stretch":
            scaleX = screenWidth / mapWidthPx;
            scaleY = screenHeight / mapHeightPx;
            break;

        // FIT (letterbox): La mappa e sempre completamente visibile.
        // Usa la scala piu piccola tra X e Y -> possibili bande vuote.
        case "fit": {
            const uniformFit = Math.min(
                screenWidth / mapWidthPx,
                screenHeight / mapHeightPx
            );
            scaleX = uniformFit;
            scaleY = uniformFit;
            break;
        }

        // FILL (cover): La mappa copre l'intero schermo senza bande.
        // Usa la scala piu grande tra X e Y -> possibile crop ai bordi.
        case "fill": {
            const uniformFill = Math.max(
                screenWidth / mapWidthPx,
                screenHeight / mapHeightPx
            );
            scaleX = uniformFill;
            scaleY = uniformFill;
            break;
        }

        default:
            console.warn(`[convertArene] Modalita sconosciuta: "${mode}". Uso "stretch".`);
            scaleX = screenWidth / mapWidthPx;
            scaleY = screenHeight / mapHeightPx;
    }

    // Dimensioni finali della mappa dopo la scalatura
    const scaledW = mapWidthPx * scaleX;
    const scaledH = mapHeightPx * scaleY;

    // Posizione top-left centrata a schermo
    const x = (screenWidth - scaledW) / 2;
    const y = (screenHeight - scaledH) / 2;

    return { scaleX, scaleY, x, y, scaledW, scaledH };
}
