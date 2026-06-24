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

        // SFONDO DELL'HUB
        const xSfondo = 0;
        const ySfondo = 0;
        const { width, height } = this.scale;
        this.sfondoHub = this.add.tileSprite(
            -32,
            408,
            width,
            height,
            "space"
        )
            .setScale(9)
            .setDepth(-2);


        this.creaHubOffline();
        this.creaHubOnline();



        setTimeout(() => {
            this.hubPuoApparire = true;
            this.faiApparireHub(this.oggettiInHub);
        }, 200)

    }

    /**
     * Ciclo di aggiornamento dell'Hub (eseguito a ogni frame).
     */
    update() {
        // TODO: Inserire controlli dinamici o aggiornamenti delle notifiche del server.

        this.muoviSfondo();

    }

    muoviSfondo() {
        this.sfondoHub.x--;
    }

    faiApparireHub(conteinerOggettiInHub) {
        if (this.hubPuoApparire) {

            this.tweens.add({
                targets: conteinerOggettiInHub,
                alpha: 1,
                duration: 200,
                ease: "power 1",
                onStart: () => {

                }
            });

            this.hubPuoApparire = false;
        }
    }

    creaHubOffline() {
        if (this.modalita === "offline") {
            this.oggettiInHub = this.add.container();

            const chooseYourCharacter = this.add.text(400, 50, "Choose your character", {
                fontFamily: 'Orbitron',
                fontSize: '42px',
                fontStyle: 'bold',
                color: '#8efcff',
                stroke: '#000000',
                strokeThickness: 6
            })
                .setOrigin(0.5);

            this.oggettiInHub.add(chooseYourCharacter);

        }
    }

    creaHubOnline() {
        if (this.modalita === "online") {
            this.oggettiInHub = this.add.container();

        }
    }


}