export default function caricaArene() {


    class arena {
        constructor({
            refSfondoArena = "space",
            refArena = "refArena",
            refTiles = "refTiles",
            numeroDiLayers = 2

        } = {}) {
            this.refSfondoArena = refSfondoArena;
            this.refArena = refArena;
            this.refTiles = refTiles;
            this.numeroDiLayers = numeroDiLayers;

        }

        getRefSfondo() {
            return this.refSfondoArena;
        }

        getRefArena() {
            return this.refArena;
        }

        getNumeroDiLayers() {
            return this.numeroDiLayers;
        }

        getRefTiles() {
            return this.refTiles;
        }
    }

    const ArenaPirata = new arena({ refSfondoArena: "arena1Background", refArena: "arena1Map", refTiles: "arena1Tiles", numeroDiLayers: 2 });


    let arrayDiArene = [];

    arrayDiArene.push(ArenaPirata);


    return arrayDiArene;

}


// REGOLE PER AGGIUNGERE UN ARENA NEL MODULO DELLE ARENE
// #1 crea la variabile con in nome dell'arena tipo const ArenaNome
// #2 assegnale una nuova classe arena con = new arena();
// #3 inserisci i paramentri della classe arena:
//    refSfondoArena:sarebbe il nome che hai dato allo sfondo dell'arena nella preloadScene
//    refArena:non ti ci impegnare troppo,metti lo stesso dell'arena precedente + 1 per esempio:
//             se hai come ultima arena refArena: "arena1Map" allora nella successiva metti refArena: "arena2Map"
//    numeroDiLayers:è constante sempre 2
// #4 assicurati che la tua tileMap abbia solo due layers:
//    nemmeno il nome può essere casuale,il primo layer si deve chiamare Layer_0 e deve contenere le cose che non hanno collisioni
//    il secondo si deve chiamare Layer_1 e deve contenere le cose che HANNO le collisioni tipo il pavimento ecc...
