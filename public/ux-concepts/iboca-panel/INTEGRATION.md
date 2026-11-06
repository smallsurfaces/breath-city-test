# Integrating `<iboca-panel>` into IBOCA's map

The panel is one custom element. IBOCA's existing `mapEsri.js` keeps the map, the
markers and the pollutant toggle. It only has to tell the panel which station
and pollutant are selected. There are no other dependencies: no build step, and
no Bootstrap or jQuery requirement inside the panel.

Line numbers refer to the live `info/portalsda/mod/IBOCA/js/user/mapEsri.js`
saved on 2026-11-06.

## 1. Mount it in `.lateral-info` (mapa.html:435)

Replace the contents of the existing container with the element and load the
script once:

```html
<div class="lateral-info">
  <iboca-panel data-base="/info/portalsda/mod/IBOCA/iboca-panel/"></iboca-panel>
</div>
<script src="/info/portalsda/mod/IBOCA/iboca-panel/panel/iboca-panel.js"></script>
```

`.lateral-info` keeps its own position and size from `mapEsri.css:508`. The
panel fills it, so one rule change gives it the full viewport height:
`height: calc(100% - 2em)` instead of `92%`.

`data-base` is the folder that holds `data/` and `assets/`. In production the
panel would read IBOCA's own services instead of the JSON fixtures (see
"Data" below).

## 2. Tell it which station is selected: 3 lines in `setDetailDataStation` (mapEsri.js:640)

`setDetailDataStation(attributes, coords)` is already the single place both
selection paths go through: the map click (`:318`) and the station `<select>`
change handler (`:603`). Add at the top of the function:

```js
function setDetailDataStation(attributes, coords) {
    var pol = { 'PM2.5': 'pm25', 'PM10': 'pm10', 'O3': 'o3' }[contaminante];   // + line 1
    document.dispatchEvent(new CustomEvent('iboca:select',                      // + line 2
        { detail: { stationId: attributes.id, pollutant: tipo === 'iboca' && contaminante === 'PM2.5' ? 'iboca' : pol } })); // + line 3
    // ...existing code continues; the old panel DOM writes become dead and can be removed later
```

The `'iboca'` value means "the station's headline IBOCA". In today's data it is
always the PM2.5 sub-index (checked at all 19 stations), so `'pm25'` is just as
correct there. The prototype keeps both so the decision stays visible.

## 3. Tell it when the pollutant changes (mapEsri.js:224, :247, :270)

At the end of each pollutant button handler (`#button-contaminantes-pm25`,
`-pm10`, `-o3`), and in `#img_iboca_change` (:186), add:

```js
if (stationId !== null) document.dispatchEvent(new CustomEvent('iboca:select', { detail: { pollutant: 'pm10' } }));
```

`stationId` can be left out of `detail`; the panel keeps the current station.

## 4. Closing (mapEsri.js:322)

Where a map click on empty space clears the selection (`stationId = null`),
add:

```js
document.dispatchEvent(new CustomEvent('iboca:clear'));
```

## The contract

| Direction | Name | Detail |
|---|---|---|
| host → panel | `iboca:select` on `document` | `{ stationId?: number, pollutant?: 'iboca' \| 'pm25' \| 'pm10' \| 'o3' }` |
| host → panel | `iboca:clear` on `document` | none. Shows "Seleccione una estación" |
| host → panel | attributes `station`, `pollutant`, `tab` | same values; `tab` is `acciones` or `datos` |
| panel → host | `iboca:panel-change` (bubbles, composed) | `{ stationId, pollutant }` when the user changes either inside the panel |
| panel → host | `iboca:menu` (bubbles, composed) | the burger button was pressed |

Listening to `iboca:panel-change` is optional. It lets the map follow the
panel, for example to move the selected marker when the user picks a station
from the panel's own list:

```js
document.addEventListener('iboca:panel-change', function (e) { $('#station-selector').val(e.detail.stationId); });
```

## Cascade safety

The panel renders into a Shadow DOM root with `:host { all: initial }`, so
Bootstrap 3's `html { font-size: 10px }`, its `button`/`ul`/`h2` resets and
IBOCA's own CSS cannot reach it. It uses px, not rem, for the same reason.
Its colours are CSS custom properties (`--iboca-aqi-bajo` and so on, defined on
`:host`), so IBOCA can re-theme from outside:

```css
iboca-panel { --iboca-aqi-moderado: #ffe000; }
```

Roboto is loaded by a `<link>` the element adds to the document head once,
because `@font-face` inside a shadow root is not applied.

## Data the panel expects

The prototype reads four JSON files (see README). In production each maps to a
service IBOCA already has, except one:

| Panel part | Prototype file | IBOCA service |
|---|---|---|
| Station, strip, hero, timestamp | `data/stations.json` | `allstations` (drop the base64 `imagen` and serve photos as URLs) |
| Recommendations | `data/recommendations.json` | `recomendationsRange/{value}` (do not copy the `+0.4` offset at :645) |
| Historial 5 días | `data/mock-history.json` | `stationHistoricalHours/{id}` (already hourly, per pollutant) |
| Pronóstico 48 horas | `data/mock-forecast.json` | **none yet.** `forecastInformation` returns about 17 hours of overall IBOCA, with no pollutant and no next days |
