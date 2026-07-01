# phaserFx — Documentazione Interna 🛠️

Questa cartella contiene il nucleo della libreria **PhaserPluginFx**. La documentazione seguente è rivolta agli **sviluppatori** che intendono estendere, modificare o comprendere l'architettura interna del plugin.

---

## 📁 Struttura delle Cartelle

```
phaserFx/
├── phaserFx.js              # Classe principale fx + export fxSystem, fxComplex
├── methods/                 # Effetti standard (un file per effetto)
│   ├── shake.js
│   ├── rotate.js
│   ├── pulse.js
│   ├── damageNumber.js
│   ├── glow.js
│   ├── getBigger.js
│   ├── getSmaller.js
│   ├── changeTexture.js
│   ├── floatX.js
│   ├── floatY.js
│   ├── click.js
│   ├── slime.js
│   ├── immune.js
│   ├── popIn.js
│   ├── popOut.js
│   ├── fadeIn.js
│   └── fadeOut.js
├── complex/                 # Effetti complessi con Post-FX shader / stato persistente
│   ├── fxComplex.js         # Aggregatore dei metodi complessi
│   ├── complexMethods/
│   │   ├── baloon.js        # Logica core dell'effetto BaloonFx + Barrel Post-FX
│   │   ├── fireWorks.js     # Logica core dell'effetto FireWorksFx
│   │   └── explode.js       # Logica core dell'effetto ExplodeFx
│   └── complexUtils/
│       └── stopBaloon.js    # Logica di arresto e reset per BaloonFx
├── utils/
│   ├── chain.js             # ChainFx — concatenamento sequenziale temporizzato
│   └── stop.js              # StopFx — arresto effetti standard per nome o tutti
├── system/
│   └── normalTime.js        # NormalTimeFx — ripristino timeScale di scena
└── AddOn/
    ├── fxSystem.js          # Classe fxSystem — effetti temporali globali della scena
    ├── fxDevTools.js        # DevTools per test e debug in sviluppo
    └── devMethods/
        └── debris.js        # Logica core dell'effetto DebrisFx (frammentazione)
```

---

## 🏗️ Architettura

### Classe Principale: `fx` (`phaserFx.js`)

È il punto di ingresso pubblico del plugin. Istanziata dall'utente su un GameObject, espone tutti i metodi pubblici. Internamente instanzia:

- Un oggetto per **ogni effetto standard** (es. `this._shake`, `this._rotate`, ecc.)
- Un'istanza di **`fxComplex`** (`this._complex`) per gli effetti complessi con shader
- Un'istanza di **`StopFx`** (`this._stop`) per la gestione dell'arresto effetti

```javascript
// Uso pubblico
sprite.fx = new fx(sprite);
sprite.fx.ShakeFx(500, 10);
sprite.fx.BaloonFx().chain.ShakeFx();
```

**Export aggiuntivi** da `phaserFx.js`:
- `fxSystem` — effetti temporali globali della scena
- `fxComplex` — aggregatore degli effetti complessi (raramente serve importarlo direttamente)

---

### Effetti Standard (`methods/`)

Ogni file esporta una **classe autonoma** con lo stesso pattern:

```javascript
export default class NomeFx {
    constructor(target) { /* ... */ }
    NomeFx(params...) { /* logica tween */ }
}
```

Il tween attivo viene memorizzato su `target._nomeEffetto` per permettere l'arresto preciso senza conflitti.

---

### Effetti Complessi (`complex/`)

Gli effetti complessi gestiscono **stato persistente** e/o **pipeline shader WebGL** che sopravvivono al termine dell'animazione.

#### `fxComplex.js`
Aggregatore che istanzia e orchestra i moduli complessi. Riceve `target` e l'istanza `fxInstance` della classe `fx` principale per poter costruire correttamente i `ChainFx`.

#### `complex/complexMethods/baloon.js` — BaloonFx
- **Fase 1 "both"**: gonfia uniformemente X e Y con moltiplicatore `speed = 1.02` fino a `limitBoth = startScale * 1.2`.
- **Fase 2 "moreX"**: gonfia più velocemente l'asse X rispetto ad Y creando l'asimmetria tipica del palloncino.
- **Shader Barrel**: aggiunto tramite `target.postFX.addBarrel(1.0)` con padding `40px` anti-clipping. L'`amount` cresce linearmente da `startBarrelAmount` a `+0.5` in sincronia con la progressione della scala. Lo shader **non viene rimosso** a fine animazione ma rimane persistente.
- **Riutilizzo shader**: se `target._baloonBarrelFX` esiste già, viene riutilizzato incrementandone l'`amount` di partenza (nessuno stacking).
- **Stato memorizzato su target**: `_baloon` (tween), `_baloonBarrelFX` (shader), `_baloonOriginalScaleX/Y` (scale iniziali).

#### `complex/complexUtils/stopBaloon.js` — StopBaloonFx
Arresta il tween attivo, ripristina le scale originarie e rimuove lo shader Barrel dalla pipeline GPU.

#### `complex/complexMethods/fireWorks.js` — FireWorksFx
- **Scomposizione Target:** Invoca internamente `DebrisFx` per frantumare il target in 64 frammenti (griglia 8x8).
- **Spinta Radiale Geometrica:** Calcola la direzione d'uscita per ciascun frammento a partire dal reale baricentro geometrico dell'immagine (`width/2`, `height/2`), allineando la traiettoria con `target.rotation`.
- **Fisica ed Attrito (Drag):** Applica una spinta iniziale `Between(220, 420)` pixel/secondo. Nel loop `onUpdate`, riduce progressivamente la velocità del 25% al secondo tramite `Math.pow(0.25, dt)` simulando un drag realistico.
- **Dissolvenza e Rimpicciolimento:** Gestisce la transizione di `alpha` e riduce manualmente la scala dei frammenti fino a un massimo dell'80% per simulare faville di fuochi d'artificio.
- **Tween a Target Singolo:** Utilizza un dummy target `{ val: 0 }` nel tween per far eseguire `onUpdate` esattamente una sola volta a frame per tutta la scena, garantendo un rendering dei calcoli stabile, fluido ed evitando sbalzi di direzione causati da update multipli su array.
- **Permanenza Invisibilità:** Al termine, l'oggetto target originale non viene ripristinato e rimane con `alpha = 0` (distrutto).

#### `complex/complexMethods/explode.js` — ExplodeFx
- **Sequenza Orchestrata:** Unisce gli effetti di palloncino (`BaloonFx`), vibrazione (`ShakeFx`) e scomposizione esplosiva (`FireWorksFx`).
- **Timing Sincronizzato:**
  1. Richiama immediatamente `this._baloon.BaloonFx()` e `this._shake.shake(500)` in parallelo per far gonfiare ed oscillare l'oggetto per 500ms.
  2. Utilizza `scene.time.delayedCall(500, ...)` di Phaser per programmare l'avvio della scomposizione pirotecnica radiale `FireWorksFx(500)` non appena il gonfiamento e la vibrazione sono completati.
- **Ritorno ChainFx:** Ritorna un'istanza di `ChainFx` con durata predefinita di `1000` ms (500ms di carica + 500ms di scoppio).

#### `AddOn/devMethods/debris.js` — DebrisFx
- **Funzione di Frammentazione:** Suddivide un GameObject in una griglia 8x8 di frammenti. Rileva automaticamente se l'oggetto è provvisto di texture (`yesTexture`) o privo (`noTexture`, es: Shape/Rectangle).
- **Inherit di Shader ed Origin:** Ciascun frammento viene istanziato esattamente nella coordinata `(target.x, target.y)` ed eredita tutte le proprietà geometriche ed estetiche. Se `target._baloonBarrelFX` (shader sferico di BaloonFx) è attivo sul target, lo applica e lo configura automaticamente su ciascuno dei 64 frammenti con la stessa intensità e padding `40`, mantenendo la deformazione sferica 3D scompattata.
- **Crop Nativo:** Utilizza la funzione `setCrop` di Phaser per mostrare solo la porzione 8x8 corrispondente a ciascuna cella, evitando calcoli di offset errati e doppi distanziamenti.
- **Ritorno dei Dati:** Restituisce l'array dei GameObject frammentati generati.

---

### Concatenamento: `utils/chain.js` (ChainFx)

Ogni metodo pubblico restituisce `new ChainFx(fxInstance, startDelay, duration)`.
Il getter `.chain` restituisce un `Proxy` che pianifica il prossimo metodo con un `setTimeout` pari alla durata dell'effetto corrente.

```javascript
// La catena esegue gli effetti uno dopo l'altro:
sprite.fx.GlowFx(800).chain.ShakeFx(600).chain.ClickFx();
```

> **Nota per loop infiniti**: i metodi in modalità `loop: true` (es. `ShakeFx`) restituiscono `ChainFx` con durata `0`, poiché l'effetto non ha un termine definito. Questo significa che eventuali effetti concatenati dopo partono immediatamente.

---

### Arresto Effetti: `utils/stop.js` (StopFx)

Gestisce l'arresto degli effetti **standard** (non complessi). Risolve i nomi degli effetti in modo case-insensitive tramite una mappa interna e chiama `.stop()` sul tween corrispondente memorizzato sul target.

> **BaloonFx ed ExplodeFx non sono in stop.js**: essendo metodi complessi con stati persistenti o sequenze temporizzate complesse, il loro reset è demandato esclusivamente a `StopBaloonFx()` e `StopExplodeFx()`.

**Effetti gestiti da stop.js**:
`rotate`, `shake`, `pulse`, `damagenumber`, `glow`, `getbigger`, `getsmaller`, `changetexture`, `floatx`, `floaty`, `click`, `slime`, `immune`, `popin`, `popout`, `fadein`, `fadeout`

---

### Sistema Scena: `AddOn/fxSystem.js`

Classe separata istanziata sulla scena (non su un GameObject). Gestisce variazioni del `timeScale` su `scene.time`, `scene.tweens` e `scene.physics`.

---

## ➕ Come Aggiungere un Nuovo Effetto Standard

1. Crea `phaserFx/methods/nuovoEffetto.js` con la classe `NuovoEffettoFx`.
2. Importa la classe in `phaserFx.js`.
3. Istanziala nel costruttore di `fx`: `this._nuovoEffetto = new NuovoEffettoFx(target);`
4. Aggiungi il metodo wrapper pubblico con JSDoc.
5. Registra la chiave di arresto in `utils/stop.js` nella mappa e nell'array `activeTweens`.

## ➕ Come Aggiungere un Nuovo Effetto Complesso

1. Crea `phaserFx/complex/complexMethods/nuovoEffetto.js`.
2. (Opzionale) Crea `phaserFx/complex/complexUtils/stopNuovoEffetto.js` per la logica di reset.
3. Importa e instanzia le classi in `complex/fxComplex.js`.
4. Aggiungi il metodo wrapper pubblico in `fxComplex.js` con JSDoc.
5. Aggiungi il wrapper pubblico in `phaserFx.js` che delega a `this._complex.NuovoEffettoFx()`.

---

## 👥 Crediti

Tutto fatto da **Angelo del Piano** 🚀
