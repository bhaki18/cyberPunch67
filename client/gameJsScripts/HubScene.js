/**
 * @class HubScene
 * @extends Phaser.Scene
 * @description Scena dell'Hub Centrale del Giocatore.
 * L'Hub funge da lobby/stanza principale dopo il login. Da qui l'utente può accedere
 * alla ricerca delle partite online, all'inventario, ai potenziamenti e alle opzioni di gioco.
 */
export default class HubScene extends Phaser.Scene {
    constructor() {
        super("HubScene");
    }

    init(data) {
        this.livelloPlayer = data.livelloPlayer;
        this.modalita = data.modalita;
    }
    /**
     * Inizializzazione della grafica e delle interazioni dell'Hub.
     */
    create() {
        // TODO: Aggiungere menu interattivo dell'hub, chat room o pulsanti di matchmaking.
    }

    /**
     * Ciclo di aggiornamento dell'Hub (eseguito a ogni frame).
     */
    update() {
        // TODO: Inserire controlli dinamici o aggiornamenti delle notifiche del server.
    }


}