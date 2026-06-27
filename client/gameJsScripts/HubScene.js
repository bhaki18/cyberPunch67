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
        this.personaggiTot = data.personaggiTot;
        this.puoiAggiornareIlPersonaggioSelezionato = false;
        this.nomePlayer = data.nomePlayer;



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
        this.aggiornaIlPersonaggioSelezionato();

    }

    muoviSfondo() {
        this.sfondoHub.tilePositionX += 0.25;
    }

    faiApparireHub(conteinerOggettiInHub) {
        if (this.hubPuoApparire) {

            this.tweens.add({
                targets: conteinerOggettiInHub,
                alpha: 1,
                duration: 1000,
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

            // Tiene traccia del personaggio selezionato come {frame, sprite, dati}
            // Inizialmente null, viene impostato al primo personaggio sbloccato
            this.personaggioSelezionato = null;

            // SCRITTA CHOOSE YOUR CHARACTER
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

            // GRIGLIA DEI PERSONAGGI
            for (let i = 0; i < this.personaggiTot.length; i++) {
                let col = i % 3;
                let row = Math.floor(i / 3);

                let frame = this.add.sprite(
                    120 + col * 100,
                    150 + row * 140,
                    "framePgInventory"
                ).setScale(2);

                let personaggioOverFrame = this.add.sprite(
                    frame.x,
                    frame.y - 10,
                    this.personaggiTot[i].nome
                ).setScale(1);

                const bloccato = this.personaggiTot[i].livelloDiUnlock > this.livelloPlayer;

                if (bloccato) {
                    frame.setTint(0x111111);
                    personaggioOverFrame.setTint(0x111111);
                } else {
                    frame.setInteractive({ pixelPerfect: true });

                    // Pre-seleziona il primo personaggio sbloccato
                    if (!this.personaggioSelezionato) {
                        this.personaggioSelezionato = { frame, sprite: personaggioOverFrame, dati: this.personaggiTot[i] };
                        frame.setTint(0xbbaa00);
                        personaggioOverFrame.setTint(0xbbaa00);
                    }

                    frame.on("pointerover", () => {
                        this.tweens.add({ targets: frame, scale: 2.2, duration: 200, ease: "power 2" });
                        this.tweens.add({ targets: personaggioOverFrame, scale: 1.2, duration: 200, ease: "power 2" });
                    });

                    frame.on("pointerout", () => {
                        this.tweens.add({ targets: frame, scale: 2, duration: 200, ease: "power 2" });
                        this.tweens.add({ targets: personaggioOverFrame, scale: 1, duration: 200, ease: "power 2" });
                    });

                    frame.on("pointerup", () => {
                        // Rimuovi tint dalla selezione precedente
                        if (this.personaggioSelezionato) {
                            this.personaggioSelezionato.frame.clearTint();
                            this.personaggioSelezionato.sprite.clearTint();
                            this.puoiAggiornareIlPersonaggioSelezionato = true;
                        }

                        // Applica tint dorato alla nuova selezione
                        frame.setTint(0xbbaa00);
                        personaggioOverFrame.setTint(0xbbaa00);

                        // Aggiorna il riferimento
                        this.personaggioSelezionato = { frame, sprite: personaggioOverFrame, dati: this.personaggiTot[i] };
                        console.table(this.personaggioSelezionato);
                    });
                }

                this.oggettiInHub.add(frame);
                this.oggettiInHub.add(personaggioOverFrame);
            }

            // personaggio Grosso sulla destra perchè fa figo

            this.personaggioInGrande = this.add.sprite(
                600,
                300,
                this.personaggioSelezionato.dati.nome
            )
                .setScale(5)
                .setOrigin(0.5);

            this.oggettiInHub.add(this.personaggioInGrande);

            // nome personaggio selezionato

            this.nomePersonaggioSelezionato = this.add.text(
                this.personaggioInGrande.x,
                this.personaggioInGrande.y + 200,
                this.personaggioSelezionato.dati.nome,
                {
                    fontFamily: 'Orbitron',
                    fontSize: '42px',
                    fontStyle: 'bold',
                    color: '#8efcff',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            ).setOrigin(0.5);


            // tasto pronto offline
            this.tastoProntoOffline = this.add.sprite(
                400,
                540,
                "tastoPronto"
            )
                .setScale(1)
                .setDepth(2);

            this.oggettiInHub.add(this.tastoProntoOffline);

            this.tastoProntoOffline.setInteractive({ pixelPerfect: true });

            this.tastoProntoOffline.on("pointerover", () => {
                this.tweens.add({
                    targets: this.tastoProntoOffline,
                    scale: 1.2,
                    duration: 300,
                    ease: "power 3"
                });
            })

            this.tastoProntoOffline.on("pointerout", () => {
                this.tweens.add({
                    targets: this.tastoProntoOffline,
                    scale: 1,
                    duration: 300,
                    ease: "power 3"
                });
            })

            this.tastoProntoOffline.on("pointerup", () => {
                this.tweens.add({
                    targets: this.tastoProntoOffline,
                    y: this.tastoProntoOffline.y + 10,
                    tint: 0x000000,
                    duration: 100,
                    ease: "power 4",
                    onComplete: () => {
                        this.tastoProntoOffline.y -= 10;
                        this.tastoProntoOffline.clearTint();
                        this.scene.start("ArenaScene", { modalita: "offline", personaggioSelezionato: this.personaggioSelezionato, nomePlayer: this.nomePlayer });
                    }
                });
            })

            this.oggettiInHub.add(this.nomePersonaggioSelezionato);

            this.oggettiInHub.setAlpha(0);
        }
    }

    creaHubOnline() {
        if (this.modalita === "online") {
            this.oggettiInHub = this.add.container();

        }
    }

    aggiornaIlPersonaggioSelezionato() {
        if (this.puoiAggiornareIlPersonaggioSelezionato) {
            this.personaggioInGrande.setTexture(this.personaggioSelezionato.dati.nome);
            this.nomePersonaggioSelezionato.setText(this.personaggioSelezionato.dati.nome);
            this.puoiAggiornareIlPersonaggioSelezionato = false;
        }
    }


}