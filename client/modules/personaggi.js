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
            danniMossa2: 45,
            nomeSuperAttack: "Raggio elettromagnetico",
            danniSuperAttakc: 280,
            livelloDiUnlock: 1,
            descrizione: "Dominant Red è un cyborg venuto da un pianeta futuristico dove la tecnologia si è evoluta 1000 anni oltre a quella della terra",
            nomeImgRef: "dominantRed"
        });

    const KyraMist = new Personaggio(
        {
            nome: "Kyra Mist",
            hp: 950,
            nomeMossa1: "Fendente Rapido",
            danniMossa1: 30,
            nomeMossa2: "Nebbia Tagliente",
            danniMossa2: 42,
            nomeSuperAttack: "Tempesta di Spilli",
            danniSuperAttakc: 285,
            livelloDiUnlock: 1,
            descrizione: "Kyra Mist si sposta silenziosa come la nebbia, colpendo i nemici con attacchi fulminei prima che possano reagire.",
            nomeImgRef: "kyraMist"
        });

    const ChromeBlack = new Personaggio(
        {
            nome: "Chrome Black",
            hp: 1200,
            nomeMossa1: "Pugno di Ferro",
            danniMossa1: 30,
            nomeMossa2: "Schianto Gravitazionale",
            danniMossa2: 55,
            nomeSuperAttack: "Buco Nero Portatile",
            danniSuperAttakc: 320,
            livelloDiUnlock: 10,
            descrizione: "Chrome Black possiede una corazza in titanio rinforzato che gli permette di assorbire enormi quantità di danno.",
            nomeImgRef: "chromeBlack"
        });

    const ScarletNova = new Personaggio(
        {
            nome: "Scarlet Nova",
            hp: 800,
            nomeMossa1: "Scintilla Nova",
            danniMossa1: 28,
            nomeMossa2: "Lancia Fiamme Laser",
            danniMossa2: 52,
            nomeSuperAttack: "Supernova Termonucleare",
            danniSuperAttakc: 350,
            livelloDiUnlock: 15,
            descrizione: "Scarlet Nova convoglia l'energia termonucleare delle stelle per scatenare esplosioni devastanti, a scapito delle difese.",
            nomeImgRef: "scarletNova"
        });

    const SYNDelta = new Personaggio(
        {
            nome: "SYNDelta",
            hp: 950,
            nomeMossa1: "Pulsazione Shock",
            danniMossa1: 22,
            nomeMossa2: "Catena di Fulmini",
            danniMossa2: 40,
            nomeSuperAttack: "Sovraccarico Delta",
            danniSuperAttakc: 290,
            livelloDiUnlock: 20,
            descrizione: "SYNDelta manipola i flussi di corrente elettrica per sovraccaricare e distruggere i circuiti degli avversari.",
            nomeImgRef: "SYNDelta"
        });

    const HellbyteUnit = new Personaggio(
        {
            nome: "Hellbyte Unit",
            hp: 1100,
            nomeMossa1: "Infezione Malware",
            danniMossa1: 35,
            nomeMossa2: "Artigli del Demone",
            danniMossa2: 60,
            nomeSuperAttack: "Protocollo Apocalisse",
            danniSuperAttakc: 330,
            livelloDiUnlock: 25,
            descrizione: "Un'unità infettata da un virus distruttivo che ha sviluppato impulsi altamente distruttivi ed incontrollabili.",
            nomeImgRef: "HellbyteUnit"
        });

    const AdminAdp = new Personaggio(
        {
            nome: "Admin ADP",
            hp: 9999,
            nomeMossa1: "Ban Hammer",
            danniMossa1: 99,
            nomeMossa2: "Cancella File",
            danniMossa2: 199,
            nomeSuperAttack: "BSOD (Blue Screen)",
            danniSuperAttakc: 999,
            livelloDiUnlock: 10000000000000,
            descrizione: "L'amministratore supremo del sistema. Ha il controllo totale sul codice del gioco e può eliminare gli avversari all'istante.",
            nomeImgRef: "AdminAdp"
        });


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