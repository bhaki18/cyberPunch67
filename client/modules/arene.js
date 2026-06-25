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

    const ArenaSpaziale = new arena({ refSfondoArena: "arena1Background", refArena: "arena1Map", refTiles: "arena1Tiles", numeroDiLayers: 1 });


    let arrayDiArene = [];

    arrayDiArene.push(ArenaSpaziale);


    return arrayDiArene;

}


