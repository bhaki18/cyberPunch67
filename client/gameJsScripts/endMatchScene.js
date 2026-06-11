/**
 * @class endMatchScene
 * @extends Phaser.Scene
 * @description Scena di fine partita (Risultati).
 * Mostra il verdetto finale dell'incontro (VITTORIA / SCONFITTA), le statistiche
 * di combattimento dettagliate e l'esperienza o ricompense accumulate dal giocatore.
 */
export default class endMatchScene extends Phaser.Scene {
    constructor() {
        super("endMatchScene");
    }

    /**
     * Creazione del tabellone dei punteggi finali.
     */
    create() {
        // TODO: Inserire scritte animate di vittoria/sconfitta e pulsante per tornare all'Hub.
    }

    /**
     * Ciclo di aggiornamento.
     */
    update() {
        // TODO: Gestione effetti grafici di fine incontro.
    }
}