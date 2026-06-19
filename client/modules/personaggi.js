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
            descrizione = "questo è un personaggio"
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
        }
    }


    const DominantRed = new Personaggio(
        {
            nome: "Dominant Red",
            hp: 100,
            nomeMossa1: "CyberPush",
            danniMossa1: 25,
            nomeMossa2: "CyberKick",
            danniMossa2: 35,
            nomeSuperAttack: "Raggio elettromagnetico",
            danniSuperAttakc: 300,
            livelloDiUnlock: 1,
            descrizione: "Dominant Red è un cyborg venuto da un pianeta futuristico dove la tecnologia si è evoluta 1000 anni oltre a quella della terra"
        });



    const KyraMist = new Personaggio(
        {
            nome: "Kyra Mist",
            livelloDiUnlock: 1,
        }
    )

    const ChromeBlack = new Personaggio({ nome: "Chrome Black" });
    const ScarletNova = new Personaggio({ nome: "Scarket Nova" });
    const SYNDelta = new Personaggio({ nome: "SYNDelta" });
    const HellbyteUnit = new Personaggio({ nome: "Hellbyte Unit" });
    const AdminAdp = new Personaggio({ nome: "Admin ADP" });


    const pgs = [];


    pgs.push(DominantRed, KyraMist, ChromeBlack, ScarletNova, SYNDelta, HellbyteUnit, AdminAdp);



    return pgs;

}