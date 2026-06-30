/**
 * @class InventoryScene
 * @extends Phaser.Scene
 * @description Scena dell'Inventario.
 * Gestisce la visualizzazione dell'equipaggiamento sbloccato dal giocatore,
 * la selezione delle skin del personaggio o gli oggetti acquistati.
 */
export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super("InventoryScene");


        this.inventoryBackground;
        this.arrayDiPersonaggi = [];
    }
    /**
     * Inizializzazione della griglia degli oggetti dell'inventario.
     */

    init(data) {

        this.personaggiTot = data.personaggiTot ? [...data.personaggiTot] : [];
        this.livelloPlayer = data.livello;

        const isAdmin = window.player && window.player.permessi === "admin";

        this.personaggiSbloccati = this.personaggiTot.filter(pg => {
            const isLocked = pg.nome === "Admin ADP" ? !isAdmin : (pg.livelloDiUnlock > data.livello);
            return !isLocked;
        });


        this.personaggiNonSbloccati = this.personaggiTot.filter(pg => {
            const isLocked = pg.nome === "Admin ADP" ? !isAdmin : (pg.livelloDiUnlock > data.livello);
            return isLocked;
        });

        // console.log("personaggi totali:");
        // console.table(this.personaggiTot);
        // console.log("personaggi sbloccati:");
        // console.table(this.personaggiSbloccati);
        // console.log("personaggi Non sbloccati:");
        // console.table(this.personaggiNonSbloccati); /*stranamente funziona tutto alla prima botta*/
    }
    create() {
        this.minY = -850;
        this.maxY = 0;

        const W = 800;

        this.inventoryBackground = this.add.sprite(
            W / 2,
            -this.minY / 2 - 50,
            "inventoryBackground"
        ).setOrigin(0.5);

        // CONTAINER DI COSE DA SCROLLARE
        this.inventoryContainer = this.add.container(0, 0);

        this.framesInventory = [];
        this.personaggiInventory = [];
        this.selectedFrameObj = null;

        for (let i = 0; i < this.personaggiTot.length; i++) {
            let col = i % 2;
            let row = Math.floor(i / 2);

            let frame = this.add.sprite(
                100 + col * 180 + 75,
                200 + row * 270,
                "framePgInventory"
            ).setScale(4.5);

            let textureKey = this.personaggiTot[i].nome;
            if (!this.textures.exists(textureKey)) {
                console.warn(`[Inventory] Grid texture non trovata per "${textureKey}", uso fallback`);
                textureKey = "framePgInventory";
            }

            let personaggioOverFrame = this.add.sprite(
                frame.x,
                frame.y - 20,
                textureKey
            ).setScale(2.5);

            const isAdmin = window.player && window.player.permessi === "admin";
            const bloccato = this.personaggiTot[i].nome === "Admin ADP" ? !isAdmin : (this.personaggiTot[i].livelloDiUnlock > this.livelloPlayer);
            if (bloccato) {
                frame.setTint(0x111111);
                personaggioOverFrame.setTint(0x111111);
            }

            // Pre-seleziona il primo personaggio
            if (i === 0) {
                frame.setTint(0xbbaa00);
                personaggioOverFrame.setTint(0xbbaa00);
                this.selectedFrameObj = { frame, sprite: personaggioOverFrame, pg: this.personaggiTot[0] };
            }

            this.personaggiInventory.push(personaggioOverFrame);
            this.framesInventory.push(frame);
            this.inventoryContainer.add(frame);
            this.inventoryContainer.add(personaggioOverFrame);

            frame.setInteractive({ pixelPerfect: true });

            frame.on("pointerover", () => {
                this.tweens.add({
                    targets: frame,
                    scale: 4.7,
                    duration: 200
                });

                this.tweens.add({
                    targets: personaggioOverFrame,
                    scale: 2.6,
                    duration: 200
                });
            });

            frame.on("pointerout", () => {
                this.tweens.add({
                    targets: frame,
                    scale: 4.5,
                    duration: 200
                });

                this.tweens.add({
                    targets: personaggioOverFrame,
                    scale: 2.5,
                    duration: 200
                });
            });

            frame.on("pointerup", () => {
                // Rimuovi evidenziazione dal frame precedente
                if (this.selectedFrameObj) {
                    const pgPrecedente = this.selectedFrameObj.pg;
                    const isAdmin = window.player && window.player.permessi === "admin";
                    const precedentementeBloccato = pgPrecedente.nome === "Admin ADP" ? !isAdmin : (pgPrecedente.livelloDiUnlock > this.livelloPlayer);
                    this.selectedFrameObj.frame.setTint(precedentementeBloccato ? 0x111111 : 0xffffff);
                    this.selectedFrameObj.sprite.setTint(precedentementeBloccato ? 0x111111 : 0xffffff);
                }

                // Evidenzia il nuovo frame selezionato
                frame.setTint(0xbbaa00);
                personaggioOverFrame.setTint(0xbbaa00);
                this.selectedFrameObj = { frame, sprite: personaggioOverFrame, pg: this.personaggiTot[i] };

                // Aggiorna pannello statistiche
                this.mostraStatistichePersonaggio(this.personaggiTot[i]);
            });
        }

        // --- PANNELLO STATISTICHE SUL LATO (FISSO) ---
        const panelX = 450;
        const panelY = 40;
        const panelW = 330;
        const panelH = 520;

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x050515, 0.85);
        panelBg.lineStyle(3, 0x00f0ff, 1);
        panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 15);
        panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 15);

        this.add.text(panelX + panelW / 2, panelY + 20, "SYSTEM DATA // UNIT", {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00f0ff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const sep = this.add.graphics();
        sep.lineStyle(1, 0x00f0ff, 0.4);
        sep.lineBetween(panelX + 20, panelY + 45, panelX + panelW - 20, panelY + 45);

        // Sprite grande del personaggio selezionato
        let initialStatsKey = "Dominant Red";
        if (!this.textures.exists(initialStatsKey)) {
            console.warn(`[Inventory] Stats texture non trovata per "${initialStatsKey}", uso fallback`);
            initialStatsKey = "framePgInventory";
        }
        this.statsSprite = this.add.sprite(panelX + panelW / 2, panelY + 120, initialStatsKey).setScale(3.5);

        // Testo Nome
        this.statsNameText = this.add.text(panelX + panelW / 2, panelY + 205, "DOMINANT RED", {
            fontFamily: 'Orbitron',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ff007f',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Stato di sblocco
        this.statsUnlockText = this.add.text(panelX + panelW / 2, panelY + 235, "UNLOCKED", {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00ff66',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Separatore 2
        sep.lineBetween(panelX + 30, panelY + 255, panelX + panelW - 30, panelY + 255);

        // Dettagli statistiche (HP, Mosse, Danni)
        const statsStyle = {
            fontFamily: 'Share Tech Mono',
            fontSize: '14px',
            color: '#8efcff'
        };

        this.statsHpText = this.add.text(panelX + 25, panelY + 270, "HP: 1000", statsStyle);
        this.statsAttack1Text = this.add.text(panelX + 25, panelY + 295, "", statsStyle);
        this.statsAttack2Text = this.add.text(panelX + 25, panelY + 320, "", statsStyle);
        this.statsSuperText = this.add.text(panelX + 25, panelY + 345, "", statsStyle);

        // Descrizione
        this.add.text(panelX + 25, panelY + 380, "SYSTEM ANALYSIS:", {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#fcee0a',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.statsDescText = this.add.text(panelX + 25, panelY + 400, "", {
            fontFamily: 'Share Tech Mono',
            fontSize: '13px',
            color: '#ffffff',
            wordWrap: { width: panelW - 50, useAdvancedWrap: true }
        });

        // Mostra il primo personaggio di default
        if (this.personaggiTot.length > 0) {
            this.mostraStatistichePersonaggio(this.personaggiTot[0]);
        }

        this.scrollY = 0;

        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY -= deltaY * 0.5;
            this.scrollY = Phaser.Math.Clamp(
                this.scrollY,
                this.minY,
                this.maxY
            );
        });




    }
    /**
     * Ciclo di aggiornamento.
     */
    update() {
        // TODO: Gestione di animazioni di hover/selezione degli oggetti dell'inventario.
        this.inventoryContainer.y = Phaser.Math.Linear(
            this.inventoryContainer.y,
            this.scrollY,
            0.15
        );
    }

    mostraStatistichePersonaggio(pg) {
        if (!pg) return;

        // Aggiorna texture sprite grande con fallback
        if (this.textures.exists(pg.nome)) {
            this.statsSprite.setTexture(pg.nome);
        } else {
            console.warn(`[Inventory] Stats texture non trovata per "${pg.nome}", uso fallback`);
            this.statsSprite.setTexture("framePgInventory");
        }
        
        // Animazione di rimbalzo premium dello sprite
        this.statsSprite.setScale(0);
        this.tweens.add({
            targets: this.statsSprite,
            scale: 3.5,
            duration: 250,
            ease: "Back.easeOut"
        });

        // Funzione helper per abbreviare nomi di mosse troppo lunghi ed evitare overflow nel pannello
        const formatMossa = (label, nome, danno) => {
            const maxLen = 15;
            const nomeMossa = nome || "mossa";
            const nomeAbbreviato = nomeMossa.length > maxLen ? nomeMossa.substring(0, maxLen - 3) + "..." : nomeMossa;
            return `${label}: ${nomeAbbreviato} (${danno !== undefined ? danno : 10} DMG)`;
        };

        // Aggiorna testi
        this.statsNameText.setText(pg.nome.toUpperCase());
        this.statsHpText.setText(`HP: ${pg.hp !== undefined ? pg.hp : 1000}`);
        this.statsAttack1Text.setText(formatMossa("M1", pg.nomeMossa1, pg.danniMossa1));
        this.statsAttack2Text.setText(formatMossa("M2", pg.nomeMossa2, pg.danniMossa2));
        this.statsSuperText.setText(formatMossa("SUPER", pg.nomeSuperAttack, pg.danniSuperAttakc));
        
        // Stato sblocco
        const isAdmin = window.player && window.player.permessi === "admin";
        const bloccato = pg.nome === "Admin ADP" ? !isAdmin : (pg.livelloDiUnlock > this.livelloPlayer);
        if (bloccato) {
            const reqText = pg.nome === "Admin ADP" ? "ADMIN ONLY" : `REQ. LV. ${pg.livelloDiUnlock}`;
            this.statsUnlockText.setText(`LOCKED (${reqText})`).setColor("#ff003c");
        } else {
            this.statsUnlockText.setText(`UNLOCKED`).setColor("#00ff66");
        }

        // Descrizione
        this.statsDescText.setText(pg.descrizione || "Descrizione di sistema non disponibile.");
    }
}
