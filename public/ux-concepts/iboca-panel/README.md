# IBOCA 2.0 station panel: clickable prototype

A static, clickable front-end prototype of the redesigned IBOCA (Bogotá air
quality) station panel. It sits on a screenshot of IBOCA's live desktop map
and is built on IBOCA's own front-end stack. It does two things:

1. **Demo the design.** It follows Figma file `QcuGhgzgg5gOzSB9Dyjju3`, component set
   `44:6058` "Sensor detail - Usaquen - no navigatable pollutant", with real
   station data from 6 November 2026.
2. **Show it can drop into IBOCA's current build.** The panel is one custom
   element, `<iboca-panel>`. The host page loads IBOCA's real libraries and CSS,
   and talks to the panel only through two document events. See
   [INTEGRATION.md](INTEGRATION.md) for the three lines `mapEsri.js` would add.

## Run it

It is plain static files. Any static server works:

```sh
python3 -m http.server 8790 --directory public/ux-concepts/iboca-panel
# open http://localhost:8790/
```

In the dev hub it is also served by Next at `/ux-concepts/iboca-panel/index.html`.
It must be served over HTTP, not opened as a file, because the panel fetches its JSON.

Deep links for demos: `?station=56&pollutant=pm10&tab=datos`. `?scroll=600`
scrolls the panel; it is a screenshot helper only, not part of the contract.

## What you can click

- **Station markers on the map.** These are invisible hotspots with a focus/hover ring, keyboard-reachable, labelled with the station name. The selected station keeps a green ring.
- **The IBOCA tab and the PM2.5 / PM10 / O3 pills, top right.** These switch the hero pollutant. The pills are repainted over the screenshot so their selected state is truthful.
- **Escape on the map.** Sends `iboca:clear`, which closes the panel to "Seleccione una estación".
- **Inside the panel:**
  - the station name opens a station list
  - the three pollutant cells switch the hero pollutant
  - the Acciones / Datos tabs (arrow keys work)
  - the five band cells show any band's recommendations
  - the five day chips switch the Historial day

## States worth showing

| State | Where |
|---|---|
| Default: Tunal, PM2.5, Moderado, Acciones | `/` |
| Datos tab (forecast, history, legend) | `?tab=datos` |
| O3 as the hero pollutant | `?station=4&pollutant=o3` |
| Sin datos: no index in the data | `?station=56&pollutant=pm25` (Ciudad Bolívar), `?station=50` (Fontibon) |
| Station that does not measure O3 | `?station=12&pollutant=o3` (Usaquen) |
| Regular band | `?station=56&pollutant=pm10` |
| Alto / Peligroso recommendations | any station, Acciones, press the 151-200 or 201-500 cell |

## Stack

The host page mirrors IBOCA's `mapa.html` versions. Each file is vendored from
cdnjs at the exact version; the jQuery and Bootstrap files were checked
byte-identical to IBOCA's own copies.

- Bootstrap 3.3.7 (CSS and JS)
- jQuery 3.1.0
- Font Awesome 4.6.3 (woff2 and woff only)
- `vendor/iboca/`: IBOCA's own CSS, loaded in `mapa.html`'s order:
  - `mapEsri.css`
  - `media/css/user.min.css`
  - `mod/IBOCA/css/user.css`
  - `web/portal/css/user.min.css`
  - `bloqueMegamenu.css`

These are not included:
- ArcGIS JS and `esri4.10.css`, because the map is a picture
- Google Charts, because the charts are plain SVG
- jQuery UI, blockUI and vozme

Two `@import`s in `portal-user.min.css` that point at files not vendored
(`global.min.css`, `animate.css`) are commented out. The `../img/` background
images in `media-user.min.css` are not vendored and 404, which is harmless.

**The panel itself:**
- vanilla ES2017 in a Shadow DOM, with no build step
- no Bootstrap dependency; jQuery is used only by `host.js`, as `mapEsri.js` would use it
- tokens are CSS custom properties on `:host`: the six Figma variables plus named versions of the hard-coded greens and greys

This page is pure static HTML/JS. The dev hub's concept-prototyping skill
(Next.js engine, `@/components/concept`, Tailwind, `--bc-` tokens) does **not**
apply here, by design: the point is to match IBOCA's stack, not ours.

## What is real and what is mock

| File | Content | Real? |
|---|---|---|
| `data/stations.json` | 19 stations, sub-indices, bands, concentrations, last dates | **Real**, from `allstations` saved 2026-11-06 (06:00 Bogotá readings) |
| `assets/stations/*.jpg` | Station photos, extracted from the base64 `imagen` | **Real**. 12 station photos plus one generic skyline that IBOCA uses for 7 stations (deduped to `generic-skyline.jpg`) |
| `data/recommendations.json` | Health (`R`) and environment (`A`) advice per band | **Real**, from `recomendationsRange`. Icons from the local IBOCA asset kit |
| `data/mock-history.json` | 5 days × 24 hours per station × pollutant | **Tunal is real** (`stationHistoricalHours/11`, all three pollutants). All other stations are mock |
| `data/mock-forecast.json` | 48 hourly points per station × pollutant | **Mock.** For Tunal PM2.5 only, the hours 07:00–23:00 today are the real `forecastInformation` values, marked `"mixed"` |
| `data/hotspots.json` | Marker positions on the screenshot | Derived (see below) |

Both mock files carry `"_mock": true` and a `_note`. Every card fed by a mock
series shows a small **"Datos de ejemplo"** tag, or "Datos de ejemplo · parcial"
for the mixed Tunal forecast. The Tunal history shows no tag because it is real.

**Rules taken from the data audit:**
- **Freshness.** All `*_last_date` values are treated as America/Bogota local time and shown as served. "Sin datos" appears only when the fixture index is `"--"` or null, never because of the viewer's clock.
- **Now.** "Ahora" is the fixture snapshot (2026-11-06 06:00), not the viewer's time. Day names are computed from the calendar date alone.
- **No O3 monitor.** IBOCA has no "measures this pollutant" flag. The prototype treats a station whose last O3 reading is more than 30 days before the snapshot as not measuring O3: Carvajal, Móvil 7ma, Usaquen, Fontibon and Móvil Fontibón. These stations report `O3_concentracion: 0` as a placeholder, which is not shown. This rule is an inference.
- **Peligroso.** IBOCA returns no recommendations for 301–500. The 201–300 set is reused, and a visible note says so.

`_build/build_data.py` rebuilds every data file from the saved responses.
`_build/fit_hotspots.py` rebuilds the hotspots. Both take paths as arguments.

## How the hotspots were mapped

1. The 19 marker centres were read by eye off the 1549×977 screenshot.
2. A least-squares similarity transform (`x = a + s·lng`, `y = b − s·lat`) was fitted from each station's lat/long, starting from the northernmost and southernmost pairs.
3. Each station was assigned to its nearest unused marker, then the transform was refitted. This was iterated.

All 19 markers matched one-to-one with residuals of 0–1.7 px. The grey "--"
marker landed on Fontibon, which has no index in the data, as a sanity check.
The hotspot sits on the eye-read marker centre; the fit only decides which
station a marker is. No marker was left unmatched.

The marker values printed in the screenshot are from the moment of capture and
differ from the 06:00 fixture. The panel shows the fixture.

## Design rules decided in the build

- **Hero pointer.** The AQI bar has five equal-width bands, 80 px each. The value is placed linearly inside its own band, `(v − lo) / (hi − lo)` with Bajo starting at 0, and the bubble is centred on that point and clamped to the bar. So 68 sits 36 % into Moderado.
- **Charts drawn to value.** The vertical colour scale and the line's y axis run 0–500 linearly, so Peligroso takes 60 % of the height. Grid lines sit on band thresholds. The line colour is a hard-stop gradient keyed to value. A faint dark under-stroke keeps the yellow Moderado line visible on white.
- **Text on band colours.**
  - `#1a1a1a` on Bajo, Moderado and Regular.
  - Pure `#000` on Alto, which gives 5.25:1. Figma's white gives 4.0:1 and `#1a1a1a` gives 4.35:1, both below AA.
  - White on Peligroso, which gives 9.4:1.
- **Faces.** Faces are vector SVG redrawn after IBOCA's `indice-*.png` set, using the ring geometry of Figma's Moderado face. The PNGs are 51 px and blur at 75 px. Each face's accessible name is the band name, and the band label is always printed beside it.
- **Selected states Figma does not show:**
  - the hero pollutant's strip cell gets a 3 px green underline
  - a browsed band cell gets a black bar under it, plus a "Volver a Ahora" link
  - the Ahora pill and the 2 px black border stay on the current band
- **New states:**
  - **Sin datos.** Grey face, faded bar, no bubble, "No hay un índice disponible para esta hora".
  - **Sin medición** (no O3 monitor). Strip cell "No mide", "Esta estación no reporta O₃ desde …", Datos cards empty.
  - **Station list open.**
  - **Cleared panel.**

## Provenance

Built by the Breathe Cities `developer` agent (Claude Opus 5.5) on 2026-11-06,
from the main-context brief "IBOCA station panel prototype". Inputs:
- the Figma MCP reads of nodes 44:6186 and 44:6224
- `design/iboca/audit/IBOCA 2.0 Figma read — 2026-11-06.md`
- `IBOCA data services audit — 2026-11-06.md`
- the IBOCA service responses and front-end files saved that morning
- the local IBOCA asset kit

This is a design-stream concept prototype with no review gate. The full
bug-tester, senior-developer and security gate runs before anything reaches the client.
