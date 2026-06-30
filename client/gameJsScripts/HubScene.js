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
        this.bgScrollX = data.bgScrollX || 0;
        this.socket = window.socket;
        this.localReady = false;
    }
    /**
     * Inizializzazione della grafica e delle interazioni dell'Hub.
     */
    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

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
            .setDepth(-2)
            .setScrollFactor(0);

        if (this.bgScrollX) {
            this.sfondoHub.tilePositionX = this.bgScrollX;
        }


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

            // Bottone Indietro per tornare al MainMenu (stile rettangolo rosso + freccia bianca)
            const btnTorna = this.add.rectangle(35, 35, 50, 50, 0xff0000)
                .setOrigin(0.5)
                .setDepth(10)
                .setInteractive({ useHandCursor: true });

            const freccia = this.add.graphics()
                .setPosition(35, 35)
                .setDepth(11);
            freccia.lineStyle(5, 0xffffff);
            freccia.lineBetween(10, 0, -10, 0); // corpo
            freccia.lineBetween(-10, 0, -2, -8); // punta sopra
            freccia.lineBetween(-10, 0, -2, 8);  // punta sotto

            this.oggettiInHub.add(btnTorna);
            this.oggettiInHub.add(freccia);

            btnTorna.on("pointerover", () => {
                this.tweens.add({ targets: [btnTorna, freccia], scale: 1.1, duration: 100 });
            });

            btnTorna.on("pointerout", () => {
                this.tweens.add({ targets: [btnTorna, freccia], scale: 1, duration: 100 });
            });

            btnTorna.on("pointerup", () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("MainMenuScene", {
                        bgScrollX: this.sfondoHub.tilePositionX
                    });
                });
            });

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

                const isAdmin = window.player && window.player.permessi === "admin";
                const bloccato = this.personaggiTot[i].nome === "Admin ADP" ? !isAdmin : (this.personaggiTot[i].livelloDiUnlock > this.livelloPlayer);


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
                        
                        this.cameras.main.fadeOut(500, 0, 0, 0);
                        this.cameras.main.once("camerafadeoutcomplete", () => {
                            this.scene.start("ArenaScene", {
                                modalita: "offline",
                                personaggioSelezionato: this.personaggioSelezionato,
                                nomePlayer: this.nomePlayer,
                                livelloPlayer: this.livelloPlayer,
                                personaggiTot: this.personaggiTot
                            });
                        });
                    }
                });
            })

            this.oggettiInHub.add(this.nomePersonaggioSelezionato);

            this.oggettiInHub.setAlpha(0);
        }
    }

    creaHubOnline() {
        if (this.modalita === "online") {
            this.socket.emit("joinStanza");
            this.oggettiInHub = this.add.container();

            // Sfondo nero semitrasparente per l'Hub Online per renderlo più leggibile
            const overlaySfocatura = this.add.graphics();
            overlaySfocatura.fillStyle(0x000000, 0.4);
            overlaySfocatura.fillRect(0, 0, 800, 600);
            this.oggettiInHub.add(overlaySfocatura);

            // Divisore Centrale Neon
            const divisore = this.add.graphics();
            divisore.lineStyle(4, 0x00f0ff, 0.3);
            divisore.lineBetween(400, 100, 400, 560);
            this.oggettiInHub.add(divisore);

            // --- LATO SINISTRO (PLAYER LOCALE) ---
            // Titolo
            this.titoloPlayerLocal = this.add.text(200, 95, `${this.nomePlayer.toUpperCase()} (YOU)`, {
                fontFamily: 'Orbitron',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ff007f',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.titoloPlayerLocal);

            // Griglia di selezione personaggi
            this.onlineFrames = [];
            this.personaggioSelezionato = null;

            for (let i = 0; i < this.personaggiTot.length; i++) {
                let col = i % 3;
                let row = Math.floor(i / 3);

                let frame = this.add.sprite(
                    75 + col * 75,
                    180 + row * 110,
                    "framePgInventory"
                ).setScale(1.5);

                let personaggioOverFrame = this.add.sprite(
                    frame.x,
                    frame.y - 8,
                    this.personaggiTot[i].nome
                ).setScale(0.85);

                const isAdmin = window.player && window.player.permessi === "admin";
                const bloccato = this.personaggiTot[i].nome === "Admin ADP" ? !isAdmin : (this.personaggiTot[i].livelloDiUnlock > this.livelloPlayer);


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
                        if (this.localReady) return;
                        this.tweens.add({ targets: frame, scale: 1.65, duration: 150, ease: "power 2" });
                        this.tweens.add({ targets: personaggioOverFrame, scale: 1.0, duration: 150, ease: "power 2" });
                    });

                    frame.on("pointerout", () => {
                        if (this.localReady) return;
                        this.tweens.add({ targets: frame, scale: 1.5, duration: 150, ease: "power 2" });
                        this.tweens.add({ targets: personaggioOverFrame, scale: 0.85, duration: 150, ease: "power 2" });
                    });

                    frame.on("pointerup", () => {
                        if (this.localReady) return;

                        if (this.personaggioSelezionato) {
                            this.personaggioSelezionato.frame.clearTint();
                            this.personaggioSelezionato.sprite.clearTint();
                        }

                        frame.setTint(0xbbaa00);
                        personaggioOverFrame.setTint(0xbbaa00);

                        this.personaggioSelezionato = { frame, sprite: personaggioOverFrame, dati: this.personaggiTot[i] };

                        // Aggiorna anteprima locale grande
                        this.personaggioInGrandeLocal.setTexture(this.personaggiTot[i].nome);
                        this.nomeLocalPgText.setText(this.personaggiTot[i].nome.toUpperCase());

                        // Comunica la selezione al server
                        this.socket.emit("onlineSelectCharacter", { characterName: this.personaggiTot[i].nome });
                    });
                }

                this.oggettiInHub.add(frame);
                this.oggettiInHub.add(personaggioOverFrame);
                this.onlineFrames.push({ frame, sprite: personaggioOverFrame, dati: this.personaggiTot[i] });
            }

            // Sprite grande locale
            const defaultPg = this.personaggioSelezionato ? this.personaggioSelezionato.dati.nome : "Dominant Red";
            this.personaggioInGrandeLocal = this.add.sprite(310, 250, defaultPg).setScale(4).setOrigin(0.5);
            this.oggettiInHub.add(this.personaggioInGrandeLocal);

            this.nomeLocalPgText = this.add.text(310, 390, defaultPg.toUpperCase(), {
                fontFamily: 'Orbitron',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#8efcff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.nomeLocalPgText);

            // Stato Pronto locale
            this.localReadyStatusText = this.add.text(200, 440, "NOT READY", {
                fontFamily: 'Orbitron',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.localReadyStatusText);

            this.tastoProntoOnline = this.add.sprite(200, 510, "tastoPronto").setScale(0.85);
            this.tastoProntoOnline.setInteractive({ useHandCursor: true });
            this.oggettiInHub.add(this.tastoProntoOnline);

            this.tastoProntoOnline.on("pointerover", () => {
                if (this.localReady) return;
                this.tweens.add({ targets: this.tastoProntoOnline, scale: 0.95, duration: 150 });
            });
            this.tastoProntoOnline.on("pointerout", () => {
                if (this.localReady) return;
                this.tweens.add({ targets: this.tastoProntoOnline, scale: 0.85, duration: 150 });
            });
            this.tastoProntoOnline.on("pointerup", () => {
                if (this.localReady) return;

                this.localReady = true;
                this.localReadyStatusText.setText("READY").setColor("#00ff00");
                this.tastoProntoOnline.setTint(0x555555);

                // Disabilita interattività della griglia locale
                this.onlineFrames.forEach(f => {
                    f.frame.disableInteractive();
                });

                // Comunica lo stato di pronto al server
                this.socket.emit("onlineSetReady", { ready: true });
            });


            // --- LATO DESTRO (AVVERSARIO) ---
            // Titolo
            this.titoloOpponent = this.add.text(600, 95, "WAITING FOR OPPONENT...", {
                fontFamily: 'Orbitron',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#00f0ff',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.titoloOpponent);

            // Sprite grande dell'avversario (invisibile finché non si unisce)
            this.personaggioInGrandeOpponent = this.add.sprite(600, 250, "Dominant Red").setScale(4).setOrigin(0.5).setVisible(false);
            this.oggettiInHub.add(this.personaggioInGrandeOpponent);

            this.nomeOpponentPgText = this.add.text(600, 390, "", {
                fontFamily: 'Orbitron',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ff007f',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.nomeOpponentPgText);

            // Stato Pronto dell'avversario
            this.opponentReadyStatusText = this.add.text(600, 440, "", {
                fontFamily: 'Orbitron',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.opponentReadyStatusText);


            // --- CENTRO / IN ALTO (INFO STANZA & TIMER) ---
            this.roomIdText = this.add.text(400, 20, "ROOM: CONNECTING...", {
                fontFamily: 'Share Tech Mono',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.4)'
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.roomIdText);

            this.countdownText = this.add.text(400, 50, "WAITING...", {
                fontFamily: 'Orbitron',
                fontSize: '26px',
                fontStyle: 'bold',
                color: '#fcee0a',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5);
            this.oggettiInHub.add(this.countdownText);


            // --- BOTTONE TORNA INDIETRO (STILE RETTANGOLO ROSSO + FRECCIA) ---
            const btnTorna = this.add.rectangle(35, 35, 50, 50, 0xff0000)
                .setOrigin(0.5)
                .setDepth(10)
                .setInteractive({ useHandCursor: true });

            const freccia = this.add.graphics()
                .setPosition(35, 35)
                .setDepth(11);
            freccia.lineStyle(5, 0xffffff);
            freccia.lineBetween(10, 0, -10, 0); // corpo
            freccia.lineBetween(-10, 0, -2, -8); // punta sopra
            freccia.lineBetween(-10, 0, -2, 8);  // punta sotto

            this.oggettiInHub.add(btnTorna);
            this.oggettiInHub.add(freccia);

            btnTorna.on("pointerover", () => {
                this.tweens.add({ targets: [btnTorna, freccia], scale: 1.1, duration: 100 });
            });

            btnTorna.on("pointerout", () => {
                this.tweens.add({ targets: [btnTorna, freccia], scale: 1, duration: 100 });
            });

            btnTorna.on("pointerup", () => {
                this.rimuoviSocketListeners();
                this.socket.emit("leaveStanza"); // Notifica il server per uscire dalla stanza
                
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("MainMenuScene", {
                        bgScrollX: this.sfondoHub.tilePositionX
                    });
                });
            });


            // --- PROTOCOLLO SOCKET.IO LISTENERS ---
            this.socket.on("joinedStanza", (data) => {
                this.roomIdText.setText(`ROOM: ${data.id}`);
            });

            this.socket.on("roomReady", (data) => {
                const avversario = data.players.find(p => p !== this.nomePlayer) || "Guest";
                this.titoloOpponent.setText(avversario.toUpperCase());

                this.personaggioInGrandeOpponent.setVisible(true).setTexture("Dominant Red");
                this.nomeOpponentPgText.setText("DOMINANT RED");
                this.opponentReadyStatusText.setText("NOT READY").setColor("#ff0000");

                // Invia la pre-selezione iniziale
                if (this.personaggioSelezionato) {
                    this.socket.emit("onlineSelectCharacter", { characterName: this.personaggioSelezionato.dati.nome });
                }
            });

            this.socket.on("opponentSelectedCharacter", (data) => {
                this.personaggioInGrandeOpponent.setVisible(true);
                this.personaggioInGrandeOpponent.setTexture(data.personaggio);
                this.nomeOpponentPgText.setText(data.personaggio.toUpperCase());

                // Animazione di rimbalzo premium per indicare visivamente il cambio
                this.personaggioInGrandeOpponent.setScale(0);
                this.tweens.add({
                    targets: this.personaggioInGrandeOpponent,
                    scale: 4,
                    duration: 250,
                    ease: "Back.easeOut"
                });
            });

            this.socket.on("opponentReady", (data) => {
                if (data.ready) {
                    this.opponentReadyStatusText.setText("READY").setColor("#00ff00");
                } else {
                    this.opponentReadyStatusText.setText("NOT READY").setColor("#ff0000");
                }
            });

            this.socket.on("timerTick", (tempoRimasto) => {
                this.countdownText.setText(`TIME: ${tempoRimasto}S`);
            });

            this.socket.on("startMatch", (data) => {
                this.rimuoviSocketListeners();

                const mioPersonaggioNome = this.personaggioSelezionato ? this.personaggioSelezionato.dati.nome : "Dominant Red";
                const avversarioNome = data.players.find(p => p !== this.nomePlayer) || "Guest";
                const avversarioPersonaggioNome = data.selezioni[avversarioNome] || "Dominant Red";

                const mioPgDati = this.personaggiTot.find(p => p.nome === mioPersonaggioNome);
                const avversarioPgDati = this.personaggiTot.find(p => p.nome === avversarioPersonaggioNome);

                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("ArenaScene", {
                        modalita: "online",
                        roomId: data.roomId,
                        arenaIndex: data.arenaIndex,
                        isPlayer1: data.players[0] === this.nomePlayer,
                        mioPersonaggio: { nome: mioPersonaggioNome, dati: mioPgDati },
                        avversarioPersonaggio: { nome: avversarioPersonaggioNome, dati: avversarioPgDati },
                        nomePlayer: this.nomePlayer,
                        nomeOpponent: avversarioNome,
                        livelloPlayer: this.livelloPlayer,
                        personaggiTot: this.personaggiTot
                    });
                });
            });

            this.socket.on("playerDisconnected", (data) => {
                // Resetta lo stato dell'avversario se se ne va
                this.titoloOpponent.setText("WAITING FOR OPPONENT...");
                this.personaggioInGrandeOpponent.setVisible(false);
                this.nomeOpponentPgText.setText("");
                this.opponentReadyStatusText.setText("");
                this.countdownText.setText("WAITING...");

                // Ripristina l'interattività se eravamo pronti
                this.localReady = false;
                this.localReadyStatusText.setText("NOT READY").setColor("#ff0000");
                this.tastoProntoOnline.clearTint();

                const isAdmin = window.player && window.player.permessi === "admin";
                this.onlineFrames.forEach(f => {
                    const bloccato = f.dati.nome === "Admin ADP" ? !isAdmin : (f.dati.livelloDiUnlock > this.livelloPlayer);
                    if (!bloccato) f.frame.setInteractive({ pixelPerfect: true });
                });
            });

            // Gestore di chiusura scheda/finestra
            this.onBeforeUnload = () => {
                this.socket.emit("leaveStanza");
            };
            window.addEventListener("beforeunload", this.onBeforeUnload);

            // Gestore di spegnimento della scena per evitare leak di listener
            this.events.once("shutdown", () => {
                this.rimuoviSocketListeners();
            });

            this.oggettiInHub.setAlpha(0);
        }
    }

    rimuoviSocketListeners() {
        if (this.socket) {
            this.socket.off("joinedStanza");
            this.socket.off("roomReady");
            this.socket.off("opponentSelectedCharacter");
            this.socket.off("opponentReady");
            this.socket.off("timerTick");
            this.socket.off("startMatch");
            this.socket.off("playerDisconnected");
        }
        if (this.onBeforeUnload) {
            window.removeEventListener("beforeunload", this.onBeforeUnload);
            this.onBeforeUnload = null;
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