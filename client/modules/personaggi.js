export default function caricaPersonaggiTot() {

    class Personaggio {
        constructor({
            nome = "personaggio",
            hp = 1000,
            nomeMossa1 = "mossa 1",
            danniMossa1 = 10,
            nomeMossa2 = "mossa 2",
            danniMossa2 = 20,
            nomeSuperAttack = "super attacco",
            danniSuperAttakc = 100,
            livelloDiUnlock = 10,
            descrizione = "questo è un personaggio",
            nomeImgRef = "personaggio"
        } = {}) {
            this.nome = nome;
            this.hp = hp;
            this.nomeMossa1 = nomeMossa1;
            this.danniMossa1 = danniMossa1;
            this.nomeMossa2 = nomeMossa2;
            this.danniMossa2 = danniMossa2;
            this.nomeSuperAttack = nomeSuperAttack;
            this.danniSuperAttakc = danniSuperAttakc;
            this.livelloDiUnlock = livelloDiUnlock;
            this.descrizione = descrizione;
            this.nomeImgRef = nomeImgRef;
        }
    }


    const DominantRed = new Personaggio(
        {
            nome: "Dominant Red",
            hp: 1000,
            nomeMossa1: "CyberPush",
            danniMossa1: 25,
            nomeMossa2: "CyberKick",
            danniMossa2: 35,
            nomeSuperAttack: "Raggio elettromagnetico",
            danniSuperAttakc: 300,
            livelloDiUnlock: 1,
            descrizione: "Dominant Red è un cyborg venuto da un pianeta futuristico dove la tecnologia si è evoluta 1000 anni oltre a quella della terra",
            nomeImgRef: "dominantRed"
        });



    const KyraMist = new Personaggio(
        {
            nome: "Kyra Mist",
            livelloDiUnlock: 1,
            nomeImgRef: "kyraMist"
        }
    )

    const ChromeBlack = new Personaggio({ nome: "Chrome Black", nomeImgRef: "chromeBlack", livelloDiUnlock: 10 });
    const ScarletNova = new Personaggio({ nome: "Scarlet Nova", nomeImgRef: "scarletNova", livelloDiUnlock: 15 });
    const SYNDelta = new Personaggio({ nome: "SYNDelta", nomeImgRef: "SYNDelta", livelloDiUnlock: 20 });
    const HellbyteUnit = new Personaggio({ nome: "Hellbyte Unit", nomeImgRef: "HellbyteUnit", livelloDiUnlock: 25 });
    const AdminAdp = new Personaggio({ nome: "Admin ADP", nomeImgRef: "AdminAdp", livelloDiUnlock: 10000000000000 });


    const pgs = [];


    pgs.push(DominantRed, KyraMist, ChromeBlack, ScarletNova, SYNDelta, HellbyteUnit, AdminAdp);



    return pgs;

}

// REGOLE PER CREARE UN NUOVO PERSONAGGIO
// # dichiara il pesonaggio tipo const nomePersonaggio
// # iniziallizzalo come nuova classe Personaggio con new Personaggio();
// # dentro i parametri della classe metti per forza:
//      nome del pesonaggio con nome:"nome",
//      ref dell'immagine del personaggio,che puoi fare uguale al nome ma senza spazi
// lowkey hai fatto,devi solo mettere gli assets



// REGOLE PER LA CREAZIONE DEGLI ASSETS DEI NUOVI PERSONAGGI
// #crea la cartella ${personaggio.nomeImgRef} e dentro mettici:
//      ${personaggio.nomeImgRef}.png in 64x64
//      ${personaggio.nomeImgRef}Attacking1.png in 64x64
//      ${personaggio.nomeImgRef}Attacking2.png in 64x64
//      ${personaggio.nomeImgRef}Falling.png in 64x64
//      ${personaggio.nomeImgRef}Jumping.png in 128x128
//      ${personaggio.nomeImgRef}Standing.png in 64x64
//      ${personaggio.nomeImgRef}SuperAttacking.png in 128x128
//      ${personaggio.nomeImgRef}Walking.png  questo è uno spritesheet da 5 frames in 64x103 a due righe e tre colonne