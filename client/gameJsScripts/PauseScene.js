/**
 * @class PauseScene
 * @extends Phaser.Scene
 * @description Scena di Pausa.
 * Sovrappone una schermata di pausa semi-trasparente sopra l'ArenaScene attiva.
 * Mette in pausa la fisica del gioco e mostra opzioni come Riprendi, Opzioni o Abbandona.
 */
export default class PauseScene extends Phaser.Scene {
    constructor() {
        super("PauseScene");
    }

    /**
     * Inizializzazione della schermata di pausa.
     */
    create() {
        // TODO: Aggiungere pulsanti riprendi/esci e impostare l'overlay trasparente.
    }

    /**
     * Ciclo di aggiornamento.
     */
    update() {
        // TODO: Gestione input veloci per disattivare la pausa (es. tasto ESC).
    }
}