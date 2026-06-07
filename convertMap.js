/**
 * Converte map.json (formato custom) in formato Tiled JSON compatibile con Phaser.
 * 
 * Formato custom:
 *   { tileSize, mapWidth, mapHeight, layers: [{ name, tiles: [{id, x, y}] }] }
 * 
 * Il "id" in ogni tile è l'indice del tile nello spritesheet (0-based).
 * x, y sono coordinate in pixel (non in tile). Le dividiamo per tileSize per ottenere
 * le coordinate in tile, poi costruiamo il flat array richiesto da Tiled.
 * 
 * Formato Tiled output (tilelayer):
 *   data: array di lunghezza width*height, con valore = tileId+1 (Tiled è 1-based, 0=vuoto)
 */

const fs = require("fs");
const path = require("path");

const INPUT  = path.join(__dirname, "client/assets/arenaFluttuante/map.json");
const OUTPUT = path.join(__dirname, "client/assets/arenaFluttuante/map.json");

const raw = fs.readFileSync(INPUT, "utf8");
const custom = JSON.parse(raw);

const { tileSize, mapWidth, mapHeight, layers } = custom;

// Le coordinate x,y nel custom sono in pixel → dividiamo per tileSize
// per ottenere posizione in tile. mapWidth e mapHeight sono anche in pixel.
const cols = Math.ceil(mapWidth / tileSize);
const rows = Math.ceil(mapHeight / tileSize);

console.log(`Mappa: ${cols} x ${rows} tile (tileSize=${tileSize}px)`);
console.log(`Layer trovati: ${layers.map(l => l.name).join(", ")}`);

// Costruiamo i layer Tiled
const tiledLayers = layers.map(layer => {
    // flat array inizializzato a 0 (vuoto)
    const data = new Array(cols * rows).fill(0);

    for (const tile of layer.tiles) {
        const tx = Math.round(tile.x / tileSize);
        const ty = Math.round(tile.y / tileSize);

        if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) {
            // tile fuori bounds, ignora
            continue;
        }

        const idx = ty * cols + tx;
        // Tiled usa 1-based (0 = vuoto), l'id nel custom è già l'indice dello spritesheet
        data[idx] = parseInt(tile.id) + 1;
    }

    return {
        id: layers.indexOf(layer) + 1,
        name: layer.name,
        type: "tilelayer",
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: cols,
        height: rows,
        data: data
    };
});

// Costruiamo il tileset Tiled
// Il nome "cyberpunk_tileset" deve corrispondere a quello usato in MainMenuScene.js
// con addTilesetImage("cyberpunk_tileset", ...)
const tilesetName = "cyberpunk_tileset";

// Dimensioni reali dello spritesheet (16x1942 px)
const SPRITESHEET_W = 16;
const SPRITESHEET_H = 1942;
const tileColumns = Math.floor(SPRITESHEET_W / tileSize);  // 8
const tileRows    = Math.floor(SPRITESHEET_H / tileSize);  // 971
const tileTotalCount = tileColumns * tileRows;              // 7768

const tiledMap = {
    version: "1.6",
    tiledversion: "1.6.0",
    orientation: "orthogonal",
    renderorder: "right-down",
    width: cols,
    height: rows,
    tilewidth: tileSize,
    tileheight: tileSize,
    infinite: false,
    nextlayerid: tiledLayers.length + 1,
    nextobjectid: 1,
    tilesets: [
        {
            firstgid: 1,
            name: tilesetName,
            tilewidth: tileSize,
            tileheight: tileSize,
            spacing: 0,
            margin: 0,
            image: "spritesheet.png",
            imagewidth: SPRITESHEET_W,
            imageheight: SPRITESHEET_H,
            tilecount: tileTotalCount,
            columns: tileColumns
        }
    ],
    layers: tiledLayers
};

fs.writeFileSync(OUTPUT, JSON.stringify(tiledMap, null, 2), "utf8");
console.log(`\nConversione completata! → ${OUTPUT}`);
console.log(`Layer convertiti:`);
tiledLayers.forEach(l => {
    const nonVuoti = l.data.filter(v => v !== 0).length;
    console.log(`  - "${l.name}": ${nonVuoti} tile posizionati`);
});
