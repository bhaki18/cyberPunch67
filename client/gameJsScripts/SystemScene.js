/**
 * @class SystemScene
 * @extends Phaser.Scene
 * @description Scena di sistema globale e persistente.
 * Gestisce l'inizializzazione dello stato utente locale, le shortcut globali (F5, ESC),
 * il pannello Impostazioni per regolazione Volume e Mappatura Tasti, e la navigazione globale.
 */
export default class SystemScene extends Phaser.Scene {
    constructor() {
        super("SystemScene");
    }

    create() {
        // Inizializza lo stato di login sul browser in base alla presenza del token
        if (!localStorage.getItem("token")) {
            localStorage.setItem("playerLogged", "false");
        }

        // Inizializza l'oggetto globale player associato all'istanza di window per l'accesso trasversale tra le scene
        window.player = { username: null };

        // Ripristina preferenze audio globali salvate in localStorage
        this.ripristinaPreferenzeAudio();

        // Inizializza keybindings predefiniti o salvati
        this.keybindings = this.caricaKeybindings();
        this.inAttesaDiTasto = null;
        this.modalSettingsAperto = false;
        this.arenaEraInPausa = false;
        this.elementiSettingsModal = [];

        // Registrazione dello shortcut F5 per il toggle Schermo Intero
        const f5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);
        f5.on("down", () => {
            if (this.game.scale.isFullscreen) {
                this.game.scale.stopFullscreen();
            } else {
                this.game.scale.startFullscreen();
            }
        });

        // Registrazione del tasto ESC per aprire/chiudere il menu Impostazioni
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on("down", () => {
            // Se stiamo registrando un tasto nella mappatura, ESC annulla l'assegnazione
            if (this.inAttesaDiTasto) {
                this.inAttesaDiTasto = null;
                this.aggiornaEtichetteTasti();
                return;
            }
            this.toggleSettingsModal();
        });

        // Bottone per tornare al menu da InventoryScene
        this.btnTornaAlMenuInventoryScene = this.add.rectangle(
            20,
            20,
            50,
            50,
            0xff0000
        )
            .setOrigin(0.5)
            .setDepth(12)
            .setVisible(false)
            .setInteractive();

        // Freccia bianca sul pulsante di ritorno da InventoryScene
        this.frecciaTornaAlMenuInventoryScene = this.add.graphics()
            .setDepth(13)
            .setVisible(false);

        this.frecciaTornaAlMenuInventoryScene.lineStyle(5, 0xffffff);
        this.frecciaTornaAlMenuInventoryScene.lineBetween(30, 20, 10, 20);
        this.frecciaTornaAlMenuInventoryScene.lineBetween(10, 20, 18, 12);
        this.frecciaTornaAlMenuInventoryScene.lineBetween(10, 20, 18, 28);

        this.btnTornaAlMenuInventoryScene.on("pointerup", () => {
            this.sound.play("btn_click", { volume: 0.45 });
            if (this.scene.isActive("InventoryScene")) {
                this.scene.stop("InventoryScene");
                this.scene.wake("MainMenuScene");
            }
        });
    }

    update() {
        this.creaBtnTornAlMenu();
    }

    creaBtnTornAlMenu() {
        const active = this.scene.isActive("InventoryScene");

        if (active) {
            if (!this.btnTornaAlMenuInventoryScene.visible) {
                this.scene.bringToTop();
                this.btnTornaAlMenuInventoryScene.setVisible(true);
                this.frecciaTornaAlMenuInventoryScene.setVisible(true);
            }
        } else {
            if (this.btnTornaAlMenuInventoryScene.visible) {
                this.btnTornaAlMenuInventoryScene.setVisible(false);
                this.frecciaTornaAlMenuInventoryScene.setVisible(false);
            }
        }
    }

    // =========================================================================
    // GESTIONE AUDIO E PERSISTENZA
    // =========================================================================

    ripristinaPreferenzeAudio() {
        const savedVol = localStorage.getItem("cyberPunch_volume");
        if (savedVol !== null) {
            const vol = parseFloat(savedVol);
            if (!isNaN(vol)) {
                this.sound.volume = Math.max(0, Math.min(1, vol));
            }
        } else {
            this.sound.volume = 0.8;
            localStorage.setItem("cyberPunch_volume", "0.8");
        }

        const savedMute = localStorage.getItem("cyberPunch_muted");
        if (savedMute !== null) {
            this.sound.mute = savedMute === "true";
        }
    }

    impostaVolume(nuovoVolume) {
        nuovoVolume = Math.max(0, Math.min(1, Math.round(nuovoVolume * 10) / 10));
        this.sound.volume = nuovoVolume;
        localStorage.setItem("cyberPunch_volume", nuovoVolume.toString());
        this.aggiornaUISezioneVolume();
    }

    toggleMute() {
        this.sound.mute = !this.sound.mute;
        localStorage.setItem("cyberPunch_muted", this.sound.mute.toString());
        this.aggiornaUISezioneVolume();
    }

    // =========================================================================
    // GESTIONE KEYBINDINGS (MAPPATURA TASTI)
    // =========================================================================

    caricaKeybindings() {
        const defaultKeys = {
            left: "A",
            right: "D",
            up: "SPACE",
            attack1: "C",
            attack2: "V",
            superAttack: "B"
        };
        const salvati = localStorage.getItem("cyberPunch_keybindings");
        if (salvati) {
            try {
                return Object.assign(defaultKeys, JSON.parse(salvati));
            } catch (e) {
                return defaultKeys;
            }
        }
        return defaultKeys;
    }

    resetKeybindingsDefault() {
        this.keybindings = {
            left: "A",
            right: "D",
            up: "SPACE",
            attack1: "C",
            attack2: "V",
            superAttack: "B"
        };
        localStorage.setItem("cyberPunch_keybindings", JSON.stringify(this.keybindings));
        this.game.events.emit("keybindingsUpdated", this.keybindings);
        this.sound.play("btn_click", { volume: 0.45 });
        this.aggiornaEtichetteTasti();
    }



    // =========================================================================
    // MODALE IMPOSTAZIONI (VOLUME + MAPPATURA TASTI)
    // =========================================================================

    toggleSettingsModal() {
        if (this.modalSettingsAperto) {
            this.chiudiSettingsModal();
        } else {
            this.apriSettingsModal();
        }
    }

    apriSettingsModal() {
        if (this.modalSettingsAperto) return;
        this.modalSettingsAperto = true;
        this.scene.bringToTop();
        this.sound.play("modal_open", { volume: 0.5 });

        // Gestione pausa in ArenaScene offline
        const arenaScene = this.scene.get("ArenaScene");
        if (arenaScene && this.scene.isActive("ArenaScene")) {
            if (arenaScene.modalita === "offline" && !arenaScene.matchEnded) {
                this.scene.pause("ArenaScene");
                this.arenaEraInPausa = true;
            }
        }

        this.costruisciInterfacciaSettingsModal();
    }

    chiudiSettingsModal() {
        if (!this.modalSettingsAperto) return;
        this.modalSettingsAperto = false;
        this.inAttesaDiTasto = null;
        this.sound.play("modal_close", { volume: 0.5 });

        // Distruggi tutti gli elementi del modal
        this.elementiSettingsModal.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.elementiSettingsModal = [];

        // Riprendi l'Arena se era in pausa
        if (this.arenaEraInPausa) {
            this.scene.resume("ArenaScene");
            this.arenaEraInPausa = false;
        }
    }

    costruisciInterfacciaSettingsModal() {
        const depthBase = 200;

        // 1. Sfondo oscurato a tutto schermo (blocca i click sotto)
        const overlayDimmer = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8)
            .setDepth(depthBase)
            .setInteractive();
        this.elementiSettingsModal.push(overlayDimmer);

        // 2. Pannello centrale principale (620 x 490)
        const panelW = 620;
        const panelH = 490;
        const panel = this.add.rectangle(400, 300, panelW, panelH, 0x090e1d, 0.96)
            .setDepth(depthBase + 1);
        this.elementiSettingsModal.push(panel);

        // 3. Bordi neon e decorazioni cyberpunk
        const gfx = this.add.graphics().setDepth(depthBase + 2);
        gfx.lineStyle(2, 0x00f3ff, 0.9);
        gfx.strokeRect(400 - panelW / 2, 300 - panelH / 2, panelW, panelH);

        // Angoli evidenziati in fucsia
        gfx.lineStyle(3, 0xff0055, 1);
        // Alto-sx
        gfx.lineBetween(400 - panelW / 2, 300 - panelH / 2 + 20, 400 - panelW / 2, 300 - panelH / 2);
        gfx.lineBetween(400 - panelW / 2, 300 - panelH / 2, 400 - panelW / 2 + 20, 300 - panelH / 2);
        // Alto-dx
        gfx.lineBetween(400 + panelW / 2 - 20, 300 - panelH / 2, 400 + panelW / 2, 300 - panelH / 2);
        gfx.lineBetween(400 + panelW / 2, 300 - panelH / 2, 400 + panelW / 2, 300 - panelH / 2 + 20);
        // Basso-sx
        gfx.lineBetween(400 - panelW / 2, 300 + panelH / 2 - 20, 400 - panelW / 2, 300 + panelH / 2);
        gfx.lineBetween(400 - panelW / 2, 300 + panelH / 2, 400 - panelW / 2 + 20, 300 + panelH / 2);
        // Basso-dx
        gfx.lineBetween(400 + panelW / 2 - 20, 300 + panelH / 2, 400 + panelW / 2, 300 + panelH / 2);
        gfx.lineBetween(400 + panelW / 2, 300 + panelH / 2, 400 + panelW / 2, 300 + panelH / 2 - 20);
        this.elementiSettingsModal.push(gfx);

        // 4. Intestazione Titolo Modal
        const titolo = this.add.text(400, 85, "/// IMPOSTAZIONI DI SISTEMA ///", {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00f3ff',
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(depthBase + 3);
        this.elementiSettingsModal.push(titolo);

        // Pulsante X di chiusura
        const btnChiudiX = this.add.text(675, 85, "✖", {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: '#ff0055'
        }).setOrigin(0.5).setDepth(depthBase + 3).setInteractive({ useHandCursor: true });
        btnChiudiX.on("pointerover", () => btnChiudiX.setColor("#ffffff"));
        btnChiudiX.on("pointerout", () => btnChiudiX.setColor("#ff0055"));
        btnChiudiX.on("pointerup", () => this.chiudiSettingsModal());
        this.elementiSettingsModal.push(btnChiudiX);

        // =====================================================================
        // SEZIONE 1: REGOLAZIONE AUDIO (Y: 125 -> 200)
        // =====================================================================
        const headerAudio = this.add.text(400, 125, "[ 1. CONTROLLO AUDIO GLOBALE ]", {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ff007f'
        }).setOrigin(0.5).setDepth(depthBase + 3);
        this.elementiSettingsModal.push(headerAudio);

        // Etichetta Volume Corrente
        this.txtVolumeValore = this.add.text(400, 150, `VOLUME MASTER: ${Math.round(this.sound.volume * 100)}%`, {
            fontFamily: 'Rajdhani',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(depthBase + 3);
        this.elementiSettingsModal.push(this.txtVolumeValore);

        // Tasto Diminuisci Volume [ - ]
        const btnVolMinus = this.add.rectangle(260, 175, 36, 26, 0x111c38)
            .setStrokeStyle(1.5, 0x00f3ff)
            .setDepth(depthBase + 3)
            .setInteractive({ useHandCursor: true });
        const txtVolMinus = this.add.text(260, 175, "−", {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00f3ff'
        }).setOrigin(0.5).setDepth(depthBase + 4);
        btnVolMinus.on("pointerover", () => btnVolMinus.setStrokeStyle(1.5, 0xff0055));
        btnVolMinus.on("pointerout", () => btnVolMinus.setStrokeStyle(1.5, 0x00f3ff));
        btnVolMinus.on("pointerup", () => {
            this.sound.play("btn_click", { volume: 0.35 });
            this.impostaVolume(this.sound.volume - 0.1);
        });
        this.elementiSettingsModal.push(btnVolMinus, txtVolMinus);

        // Barra grafica del volume
        this.volBarBg = this.add.rectangle(400, 175, 200, 14, 0x111c38)
            .setStrokeStyle(1, 0x00f3ff, 0.6)
            .setDepth(depthBase + 3);
        this.volBarFill = this.add.rectangle(300, 175, 200 * this.sound.volume, 12, 0x00f3ff)
            .setOrigin(0, 0.5)
            .setDepth(depthBase + 4);
        this.elementiSettingsModal.push(this.volBarBg, this.volBarFill);

        // Tasto Aumenta Volume [ + ]
        const btnVolPlus = this.add.rectangle(540, 175, 36, 26, 0x111c38)
            .setStrokeStyle(1.5, 0x00f3ff)
            .setDepth(depthBase + 3)
            .setInteractive({ useHandCursor: true });
        const txtVolPlus = this.add.text(540, 175, "+", {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00f3ff'
        }).setOrigin(0.5).setDepth(depthBase + 4);
        btnVolPlus.on("pointerover", () => btnVolPlus.setStrokeStyle(1.5, 0xff0055));
        btnVolPlus.on("pointerout", () => btnVolPlus.setStrokeStyle(1.5, 0x00f3ff));
        btnVolPlus.on("pointerup", () => {
            this.sound.play("btn_click", { volume: 0.35 });
            this.impostaVolume(this.sound.volume + 0.1);
        });
        this.elementiSettingsModal.push(btnVolPlus, txtVolPlus);

        // Tasto Toggle Mute
        this.btnMute = this.add.rectangle(400, 208, 180, 26, 0x111c38)
            .setStrokeStyle(1.5, this.sound.mute ? 0xff0055 : 0x00f3ff)
            .setDepth(depthBase + 3)
            .setInteractive({ useHandCursor: true });
        this.txtMute = this.add.text(400, 208, this.sound.mute ? "🔇 AUDIO DISATTIVATO" : "🔊 AUDIO ATTIVO", {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            fontStyle: 'bold',
            color: this.sound.mute ? "#ff0055" : "#00f3ff"
        }).setOrigin(0.5).setDepth(depthBase + 4);

        this.btnMute.on("pointerover", () => this.btnMute.setStrokeStyle(1.5, 0xffffff));
        this.btnMute.on("pointerout", () => this.btnMute.setStrokeStyle(1.5, this.sound.mute ? 0xff0055 : 0x00f3ff));
        this.btnMute.on("pointerup", () => {
            this.sound.play("btn_click", { volume: 0.35 });
            this.toggleMute();
        });
        this.elementiSettingsModal.push(this.btnMute, this.txtMute);

        // =====================================================================
        // SEZIONE 2: MAPPATURA TASTI (COMANDI) (Y: 245 -> 420)
        // =====================================================================
        const headerTasti = this.add.text(400, 245, "[ 2. MAPPATURA TASTI (COMANDI) ]", {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ff007f'
        }).setOrigin(0.5).setDepth(depthBase + 3);
        this.elementiSettingsModal.push(headerTasti);

        const subTasti = this.add.text(400, 263, "(Clicca sul tasto desiderato per riassegnarlo, premi ESC per annullare)", {
            fontFamily: 'Rajdhani',
            fontSize: '13px',
            color: '#8b9bb4'
        }).setOrigin(0.5).setDepth(depthBase + 3);
        this.elementiSettingsModal.push(subTasti);

        // Lista delle azioni configurabili
        this.azioniComandi = [
            { id: "left", label: "SINISTRA", col: 0, row: 0 },
            { id: "right", label: "DESTRA", col: 0, row: 1 },
            { id: "up", label: "SALTO", col: 0, row: 2 },
            { id: "attack1", label: "PUGNO 1 (LEGGERO)", col: 1, row: 0 },
            { id: "attack2", label: "PUGNO 2 (PESANTE)", col: 1, row: 1 },
            { id: "superAttack", label: "SUPER ATTACK", col: 1, row: 2 }
        ];

        this.badgeTastiMap = {};

        this.azioniComandi.forEach(azione => {
            const startX = azione.col === 0 ? 250 : 540;
            const startY = 295 + azione.row * 36;

            // Etichetta Azione
            const lbl = this.add.text(startX - 90, startY, azione.label + ":", {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(depthBase + 3);
            this.elementiSettingsModal.push(lbl);

            // Pulsante / Badge tasto corrente
            const badgeBg = this.add.rectangle(startX + 65, startY, 95, 26, 0x111c38)
                .setStrokeStyle(1.5, 0x00f3ff)
                .setDepth(depthBase + 3)
                .setInteractive({ useHandCursor: true });

            const badgeTxt = this.add.text(startX + 65, startY, `[ ${this.keybindings[azione.id] || "..."} ]`, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                fontStyle: 'bold',
                color: '#00f3ff'
            }).setOrigin(0.5).setDepth(depthBase + 4);

            badgeBg.on("pointerover", () => {
                if (this.inAttesaDiTasto !== azione.id) {
                    badgeBg.setStrokeStyle(1.5, 0xff0055);
                    this.sound.play("btn_hover", { volume: 0.2 });
                }
            });

            badgeBg.on("pointerout", () => {
                if (this.inAttesaDiTasto !== azione.id) {
                    badgeBg.setStrokeStyle(1.5, 0x00f3ff);
                }
            });

            badgeBg.on("pointerup", () => {
                this.sound.play("btn_click", { volume: 0.35 });
                this.avviaRiassegnazioneTasto(azione.id);
            });

            this.badgeTastiMap[azione.id] = { bg: badgeBg, txt: badgeTxt };
            this.elementiSettingsModal.push(badgeBg, badgeTxt);
        });

        // Pulsante Reset Default Keybindings
        const btnResetDef = this.add.rectangle(400, 412, 230, 24, 0x141a2e)
            .setStrokeStyle(1.2, 0xfcee0a)
            .setDepth(depthBase + 3)
            .setInteractive({ useHandCursor: true });
        const txtResetDef = this.add.text(400, 412, "↺ RIPRISTINA TASTI PREDEFINITI", {
            fontFamily: 'Orbitron',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#fcee0a'
        }).setOrigin(0.5).setDepth(depthBase + 4);

        btnResetDef.on("pointerover", () => btnResetDef.setStrokeStyle(1.5, 0xffffff));
        btnResetDef.on("pointerout", () => btnResetDef.setStrokeStyle(1.2, 0xfcee0a));
        btnResetDef.on("pointerup", () => this.resetKeybindingsDefault());
        this.elementiSettingsModal.push(btnResetDef, txtResetDef);

        // =====================================================================
        // SEZIONE 3: PULSANTI FONDO (ABBANDONA ARENA & APPLICA/CHIUDI)
        // =====================================================================
        const isInArena = this.scene.isActive("ArenaScene");

        if (isInArena) {
            // Pulsante Abbandona Incontro
            const btnAbbandona = this.add.rectangle(290, 462, 190, 32, 0x2a0815)
                .setStrokeStyle(1.5, 0xff0055)
                .setDepth(depthBase + 3)
                .setInteractive({ useHandCursor: true });
            const txtAbbandona = this.add.text(290, 462, "⏏ ABBANDONA MATCH", {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                fontStyle: 'bold',
                color: '#ff0055'
            }).setOrigin(0.5).setDepth(depthBase + 4);

            btnAbbandona.on("pointerover", () => btnAbbandona.setStrokeStyle(2, 0xffffff));
            btnAbbandona.on("pointerout", () => btnAbbandona.setStrokeStyle(1.5, 0xff0055));
            btnAbbandona.on("pointerup", () => {
                this.sound.play("btn_click", { volume: 0.5 });
                this.chiudiSettingsModal();
                this.sound.stopByKey("bgm_battle");
                this.scene.stop("ArenaScene");
                this.scene.wake("MainMenuScene");
            });
            this.elementiSettingsModal.push(btnAbbandona, txtAbbandona);

            // Pulsante Applica e Chiudi
            const btnChiudi = this.add.rectangle(510, 462, 190, 32, 0x111c38)
                .setStrokeStyle(1.5, 0x00f3ff)
                .setDepth(depthBase + 3)
                .setInteractive({ useHandCursor: true });
            const txtChiudi = this.add.text(510, 462, "✔ TORNA AL GIOCO", {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                fontStyle: 'bold',
                color: '#00f3ff'
            }).setOrigin(0.5).setDepth(depthBase + 4);

            btnChiudi.on("pointerover", () => btnChiudi.setStrokeStyle(2, 0x00ffaa));
            btnChiudi.on("pointerout", () => btnChiudi.setStrokeStyle(1.5, 0x00f3ff));
            btnChiudi.on("pointerup", () => this.chiudiSettingsModal());
            this.elementiSettingsModal.push(btnChiudi, txtChiudi);
        } else {
            // Solo pulsante Applica e Chiudi al centro
            const btnChiudi = this.add.rectangle(400, 462, 230, 32, 0x111c38)
                .setStrokeStyle(1.5, 0x00f3ff)
                .setDepth(depthBase + 3)
                .setInteractive({ useHandCursor: true });
            const txtChiudi = this.add.text(400, 462, "✔ SALVA E CHIUDI (ESC)", {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                fontStyle: 'bold',
                color: '#00f3ff'
            }).setOrigin(0.5).setDepth(depthBase + 4);

            btnChiudi.on("pointerover", () => btnChiudi.setStrokeStyle(2, 0x00ffaa));
            btnChiudi.on("pointerout", () => btnChiudi.setStrokeStyle(1.5, 0x00f3ff));
            btnChiudi.on("pointerup", () => this.chiudiSettingsModal());
            this.elementiSettingsModal.push(btnChiudi, txtChiudi);
        }
    }

    aggiornaUISezioneVolume() {
        if (!this.modalSettingsAperto) return;
        if (this.txtVolumeValore) {
            this.txtVolumeValore.setText(`VOLUME MASTER: ${Math.round(this.sound.volume * 100)}%`);
        }
        if (this.volBarFill) {
            this.volBarFill.setSize(200 * this.sound.volume, 12);
        }
        if (this.txtMute && this.btnMute) {
            this.txtMute.setText(this.sound.mute ? "🔇 AUDIO DISATTIVATO" : "🔊 AUDIO ATTIVO");
            this.txtMute.setColor(this.sound.mute ? "#ff0055" : "#00f3ff");
            this.btnMute.setStrokeStyle(1.5, this.sound.mute ? 0xff0055 : 0x00f3ff);
        }
    }

    avviaRiassegnazioneTasto(actionId) {
        this.inAttesaDiTasto = actionId;

        // Aggiorna l'aspetto visivo del badge per indicare lo stato d'ascolto
        Object.keys(this.badgeTastiMap).forEach(id => {
            const item = this.badgeTastiMap[id];
            if (id === actionId) {
                item.bg.setStrokeStyle(2, 0xfcee0a);
                item.txt.setText("PREMI TASTO");
                item.txt.setColor("#fcee0a");
            } else {
                item.bg.setStrokeStyle(1.5, 0x00f3ff);
                item.txt.setText(`[ ${this.keybindings[id]} ]`);
                item.txt.setColor("#00f3ff");
            }
        });

        // Ascolta il prossimo tasto premuto sul browser
        const onKeyDownHandler = (event) => {
            window.removeEventListener("keydown", onKeyDownHandler);

            if (!this.modalSettingsAperto || this.inAttesaDiTasto !== actionId) return;

            // Se l'utente preme ESC, annulla la riassegnazione
            if (event.key === "Escape") {
                this.inAttesaDiTasto = null;
                this.aggiornaEtichetteTasti();
                return;
            }

            // Normalizza il nome del tasto per renderlo compatibile con Phaser
            let mapped = event.key.toUpperCase();
            if (event.code === "Space") mapped = "SPACE";
            else if (event.code.startsWith("Key")) mapped = event.code.replace("Key", "");
            else if (event.code.startsWith("Digit")) mapped = event.code.replace("Digit", "");
            else if (event.code.startsWith("Arrow")) mapped = event.code.toUpperCase();
            else if (mapped === " ") mapped = "SPACE";

            this.keybindings[actionId] = mapped;
            localStorage.setItem("cyberPunch_keybindings", JSON.stringify(this.keybindings));

            // Emetti evento per aggiornare istantaneamente ArenaScene o altre scene attive
            this.game.events.emit("keybindingsUpdated", this.keybindings);

            this.sound.play("btn_click", { volume: 0.45 });
            this.inAttesaDiTasto = null;
            this.aggiornaEtichetteTasti();
        };

        window.addEventListener("keydown", onKeyDownHandler);
    }

    aggiornaEtichetteTasti() {
        if (!this.badgeTastiMap) return;
        Object.keys(this.badgeTastiMap).forEach(id => {
            const item = this.badgeTastiMap[id];
            if (item && item.txt && item.bg) {
                item.bg.setStrokeStyle(1.5, 0x00f3ff);
                item.txt.setText(`[ ${this.keybindings[id] || "..."} ]`);
                item.txt.setColor("#00f3ff");
            }
        });
    }
}