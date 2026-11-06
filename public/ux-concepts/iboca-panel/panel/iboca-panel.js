/**
 * iboca-panel.js — <iboca-panel> custom element (IBOCA 2.0 station panel, prototype)
 *
 * A self-contained, framework-free station panel for IBOCA's air-quality map.
 * Vanilla ES2017+, Shadow DOM, no build step, no dependency on Bootstrap or
 * jQuery. Styles live inside the shadow root and are driven by CSS custom
 * properties (--iboca-*), so the host page's cascade cannot reach in and the
 * host can still re-theme the tokens from outside.
 *
 * Integration contract (the host talks to the panel ONLY through these):
 *   document.dispatchEvent(new CustomEvent('iboca:select',
 *       { detail: { stationId: 11, pollutant: 'pm25' } }))   // pollutant optional
 *       pollutant: 'iboca' | 'pm25' | 'pm10' | 'o3'
 *   document.dispatchEvent(new CustomEvent('iboca:clear'))      // close / reset
 *   Attributes: station, pollutant, tab ('acciones' | 'datos'), data-base (URL
 *   of the folder holding data/ and assets/; defaults to this script's ../).
 *   Emits: 'iboca:panel-change' (bubbles, composed) with { stationId, pollutant }
 *   when the user changes station or pollutant inside the panel, so the host
 *   can keep its map selection in sync.
 *
 * Data: static JSON fixtures only (data/*.json). The panel never calls IBOCA
 * services. Freshness is read from the fixture, never from the viewer's clock.
 *
 * Design source: Figma QcuGhgzgg5gOzSB9Dyjju3, component set 44:6058.
 * Prototype — Breathe Cities design stream, 2026-11-06.
 */
(function () {
  'use strict';

  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || location.href;

  /* ---------- constants ---------- */

  var BANDS = [
    { key: 'bajo', name: 'Bajo', lo: 0, hi: 50, range: '0 - 50', cell: '0-50' },
    { key: 'moderado', name: 'Moderado', lo: 51, hi: 100, range: '51 - 100', cell: '51-100' },
    { key: 'regular', name: 'Regular', lo: 101, hi: 150, range: '101 - 150', cell: '101-150' },
    { key: 'alto', name: 'Alto', lo: 151, hi: 200, range: '151 - 200', cell: '151-200' },
    { key: 'peligroso', name: 'Peligroso', lo: 201, hi: 500, range: '201 - 500', cell: '201-500' }
  ];
  var POLLUTANTS = {
    iboca: { pill: 'IBOCA', strip: 'IBOCA', spoken: 'IBOCA', series: 'pm25' },
    pm25: { pill: 'PM2.5', strip: 'PM 2.5', spoken: 'PM 2.5', series: 'pm25' },
    pm10: { pill: 'PM10', strip: 'PM 10', spoken: 'PM 10', series: 'pm10' },
    o3: { pill: 'O<sub>3</sub>', strip: 'O<sub>3</sub>', spoken: 'ozono', series: 'o3' }
  };
  var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  var MONTHS_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DEFAULT_STATION = 11; // Tunal — IBOCA's own default (mapEsri.js:605-606)

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bandFor(v) {
    if (v == null) return null;
    for (var i = 0; i < BANDS.length; i++) if (v <= BANDS[i].hi) return BANDS[i];
    return BANDS[BANDS.length - 1];
  }
  function bandByName(name) {
    if (!name) return null;
    var n = String(name).toLowerCase();
    for (var i = 0; i < BANDS.length; i++) if (BANDS[i].key === n) return BANDS[i];
    return null;
  }
  /** Parse a zoneless "YYYY-MM-DD HH:MM" Bogotá-local string into parts (no Date timezone maths). */
  function parts(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/.exec(s || '');
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    // weekday from the calendar date alone (UTC arithmetic, so the viewer's zone never matters)
    var wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    return { y: y, mo: mo, d: d, h: m[4] ? +m[4] : 0, min: m[5] ? +m[5] : 0, wd: wd };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hourLabel(p) { return pad(p.h) + ':' + pad(p.min); }

  /* ---------- faces (vector, after IBOCA's indice-*.png set; ring geometry from Figma 3:14) ---------- */

  function face(bandKey, size, label) {
    var k = bandKey || 'sindatos';
    var c = 'var(--iboca-face-' + k + ')';
    var ring = '<circle cx="40" cy="40" r="33" fill="none" stroke="' + c + '" stroke-width="8"/>';
    var f;
    switch (k) {
      case 'bajo':
        f = '<path d="M23 33 q5 -7 10 0 M47 33 q5 -7 10 0" fill="none" stroke="' + c + '" stroke-width="4.5" stroke-linecap="round"/>' +
            '<path d="M22 43 H58 A18 17 0 0 1 22 43 Z" fill="' + c + '"/>';
        break;
      case 'moderado':
        f = '<circle cx="28" cy="32" r="5" fill="' + c + '"/><circle cx="52" cy="32" r="5" fill="' + c + '"/>' +
            '<rect x="24" y="48" width="32" height="8" rx="4" fill="' + c + '"/>';
        break;
      case 'regular':
        f = '<circle cx="28" cy="33" r="5" fill="' + c + '"/><circle cx="52" cy="33" r="5" fill="' + c + '"/>' +
            '<path d="M27 57 Q40 45 54 54" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>';
        break;
      case 'alto':
        f = '<path d="M22 26 L34 32 M58 26 L46 32" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>' +
            '<circle cx="29" cy="37" r="4.5" fill="' + c + '"/><circle cx="51" cy="37" r="4.5" fill="' + c + '"/>' +
            '<path d="M26 60 Q40 44 54 60 Z" fill="' + c + '"/>';
        break;
      case 'peligroso':
        f = '<path d="M23 27 L33 33 L23 39 M57 27 L47 33 L57 39" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M24 61 Q40 41 56 61 Q40 54 24 61 Z" fill="' + c + '"/>';
        break;
      default:
        f = '<rect x="24" y="37" width="12" height="6" rx="3" fill="' + c + '"/><rect x="44" y="37" width="12" height="6" rx="3" fill="' + c + '"/>';
    }
    return '<svg class="face" width="' + size + '" height="' + size + '" viewBox="0 0 80 80" role="img" aria-label="' + esc(label) + '">' + ring + f + '</svg>';
  }

  var ICON_CHEVRON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.55L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg>';
  var ICON_MENU = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5H21V7H3ZM3 19V17H21V19H3ZM3 13V11H21V13H3Z" fill="currentColor"/></svg>';
  var ICON_DROP = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15L7 10H17L12 15Z" fill="currentColor"/></svg>';

  /* ---------- styles (scoped to the shadow root) ---------- */

  var CSS = [
    ':host{all:initial;display:block;position:relative;box-sizing:border-box;width:100%;height:100%;',
    /* tokens — Figma variables (IBOCA / Colour) */
    '--iboca-aqi-bajo:#00e400;--iboca-aqi-moderado:#ffff00;--iboca-aqi-regular:#ff7e00;--iboca-aqi-alto:#ff0000;--iboca-aqi-peligroso:#7e0087;',
    '--iboca-text-primary:#1a1a1a;',
    /* tokens — hard-coded in the Figma frames, named here */
    '--iboca-green:#568c2a;--iboca-green-dark:#416920;--iboca-black:#000000;--iboca-white:#ffffff;',
    '--iboca-grey-divider:#ede8e8;--iboca-grey-tab:#e9e9e9;--iboca-grey-chip:#ebebeb;--iboca-grey-card-border:#ededed;--iboca-grey-content:#f7f7f7;',
    '--iboca-grey-nodata:#c3c3c3;--iboca-grey-muted:#5c5c5c;--iboca-grey-grid:#e4e4e4;--iboca-grey-divider-dash:#9a9a9a;',
    /* tokens — text on band colours (contrast-checked: #000 on #ff0000 = 5.25:1; #fff on #7e0087 = 9.4:1) */
    '--iboca-on-bajo:#1a1a1a;--iboca-on-moderado:#1a1a1a;--iboca-on-regular:#1a1a1a;--iboca-on-alto:#000000;--iboca-on-peligroso:#ffffff;--iboca-on-sindatos:#1a1a1a;',
    /* face colours: band colour, except Moderado uses Figma\'s #ffe600 face fill */
    '--iboca-face-bajo:var(--iboca-aqi-bajo);--iboca-face-moderado:#ffe600;--iboca-face-regular:var(--iboca-aqi-regular);--iboca-face-alto:var(--iboca-aqi-alto);--iboca-face-peligroso:var(--iboca-aqi-peligroso);--iboca-face-sindatos:var(--iboca-grey-nodata);',
    '--iboca-focus:#1a1a1a;',
    'font-family:Roboto,"Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:normal;color:var(--iboca-text-primary);text-align:left;-webkit-font-smoothing:antialiased}',
    '*,*::before,*::after{box-sizing:border-box}',
    'button{font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer;text-align:inherit}',
    'p,h2,h3,ul,li{margin:0;padding:0}ul{list-style:none}',
    'sub{font-size:0.65em;vertical-align:baseline;position:relative;top:0.3em;line-height:0}',
    ':focus{outline:none}',
    ':focus-visible{outline:3px solid var(--iboca-focus);outline-offset:2px;box-shadow:0 0 0 5px #fff}',
    '.panel{position:relative;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;background:#fff;box-shadow:0 0 8px rgba(0,0,0,.5);overscroll-behavior:contain;scrollbar-width:thin}',
    /* nav */
    '.nav{display:flex;align-items:center;gap:12px;height:48px;padding:0 4px;background:var(--iboca-green);color:#fff}',
    '.nav .icon-btn{display:flex;padding:10px;border-radius:4px}',
    '.nav p{font-size:16px;font-weight:600;white-space:nowrap}',
    '.nav a{color:#fff;text-decoration:underline}',
    /* station header (sticky) */
    '.station{position:sticky;top:0;z-index:6;background:#fff;border-bottom:1px solid var(--iboca-grey-divider)}',
    '.station-toggle{display:flex;width:100%;height:48px;align-items:center;justify-content:space-between;padding:0 10px 0 20px;font-size:20px;font-weight:600;color:var(--iboca-black)}',
    '.station-toggle .chev{display:flex;padding:10px;transition:transform .15s}',
    '.station-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}',
    '.station-list{position:absolute;left:0;right:0;top:48px;max-height:440px;overflow-y:auto;background:#fff;border-bottom:1px solid var(--iboca-grey-divider);box-shadow:0 10px 16px rgba(0,0,0,.18)}',
    '.station-list button{display:flex;width:100%;align-items:center;gap:12px;padding:8px 20px;font-size:16px;border-bottom:1px solid var(--iboca-grey-divider)}',
    '.station-list button:hover{background:var(--iboca-grey-content)}',
    '.station-list button[aria-current="true"]{font-weight:600;box-shadow:inset 4px 0 0 var(--iboca-green)}',
    '.station-list .name{flex:1}',
    '.station-list .val{font-size:14px;font-weight:500;color:var(--iboca-grey-muted)}',
    /* pollutant strip */
    '.strip{display:flex;border-bottom:1px solid var(--iboca-grey-divider)}',
    '.strip button{flex:1 0 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;background:#fff;border-left:1px solid var(--iboca-grey-divider);position:relative}',
    '.strip button:first-child{border-left:0}',
    '.strip button:hover{background:var(--iboca-grey-content)}',
    '.strip button[aria-pressed="true"]::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--iboca-green)}',
    '.strip .txt{display:flex;flex-direction:column;align-items:center;font-size:14px;white-space:nowrap}',
    '.strip .txt b{font-weight:700}',
    '.strip .txt span{font-weight:500}',
    '.strip .nodata .txt span{color:var(--iboca-grey-muted)}',
    /* photo */
    '.photo{width:100%;aspect-ratio:505/252;background:var(--iboca-grey-content);overflow:hidden}',
    '.photo img{display:block;width:100%;height:100%;object-fit:cover}',
    /* band header */
    '.hero{background:#fff;padding-bottom:16px}',
    '.band-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 0}',
    '.pill{display:inline-flex;align-items:center;justify-content:center;min-width:70px;padding:4px 10px;border-radius:100px;background:var(--iboca-green);color:#fff;font-size:15px;font-weight:800}',
    '.band-name{font-size:32px;font-weight:600;color:var(--iboca-text-primary)}',
    '.band-name.nodata{color:var(--iboca-grey-muted)}',
    /* AQI bar */
    '.aqi{position:relative;padding:28px 0 10px}',
    '.bar{display:flex;height:20px}',
    '.bar span{flex:1 0 0}',
    '.bar.nodata{opacity:.35}',
    '.bubble{position:absolute;top:-1px;width:34px;padding:3px;border-radius:20px;text-align:center;font-size:12px;font-weight:500}',
    '.bubble .tip{position:absolute;left:5px;top:12px;display:flex}',
    '.stamp{padding:0 20px;text-align:center;font-size:14px;font-weight:600;color:var(--iboca-black)}',
    '.explain{padding:0 20px 6px;text-align:center;font-size:14px;color:var(--iboca-grey-muted)}',
    /* tabs */
    '.tabs{display:flex;border-bottom:4px solid var(--iboca-green)}',
    '.tabs button{flex:1 0 0;padding:16px 20px 10px;text-align:center;font-size:20px;font-weight:600;background:var(--iboca-grey-tab);color:var(--iboca-text-primary)}',
    '.tabs button[aria-selected="true"]{background:var(--iboca-green);color:#fff}',
    '.tabs button:focus-visible{outline-offset:-4px;box-shadow:none}',
    /* content */
    '.content{background:var(--iboca-grey-content);padding:20px 24px 50px;display:flex;flex-direction:column;gap:14px}',
    '.h{font-size:16px;font-weight:600;color:var(--iboca-text-primary)}',
    '.hrow{display:flex;justify-content:space-between;font-size:16px;font-weight:600}',
    /* acciones: band selector */
    '.selector{position:relative;padding-top:48px}',
    '.cells{display:flex}',
    '.cells button{flex:1 0 0;min-width:0;display:flex;align-items:center;justify-content:center;padding:10px 0;font-size:14px;position:relative;border:2px solid transparent}',
    '.cells button.current{border-color:var(--iboca-black);font-weight:600}',
    '.cells button.browsed::after{content:"";position:absolute;left:-2px;right:-2px;bottom:-9px;height:4px;background:var(--iboca-black);border-radius:2px}',
    '.cells button:focus-visible{z-index:2}',
    '.now{position:absolute;top:0;width:70px;padding:10px;border-radius:20px;background:var(--iboca-black);color:#fff;font-size:16px;font-weight:700;text-align:center}',
    '.now .tip{position:absolute;left:50%;bottom:-16px;transform:translateX(-50%);display:flex;color:var(--iboca-black)}',
    '.browse-note{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;color:var(--iboca-grey-muted);padding-top:6px}',
    '.browse-note button{color:var(--iboca-green-dark);font-weight:600;text-decoration:underline}',
    '.rec-band{display:flex;align-items:center;gap:16px}',
    '.rec-band p{font-size:24px;font-weight:600}',
    '.rec{display:flex;gap:16px;align-items:flex-start}',
    '.rec img{width:64px;height:64px;border-radius:100px;flex:none;object-fit:cover}',
    '.rec p{flex:1;min-width:0;padding:10px 0;font-size:16px;text-wrap:balance}',
    '.note{font-size:13px;color:var(--iboca-grey-muted);background:#fff;border:1px solid var(--iboca-grey-card-border);border-radius:12px;padding:10px 12px}',
    '.prompt{font-size:16px;color:var(--iboca-grey-muted);padding:8px 0}',
    /* datos */
    '.card{position:relative;background:#fff;border:1px solid var(--iboca-grey-card-border);border-radius:20px;padding:20px}',
    '.card svg.chart{display:block;overflow:visible}',
    '.mock{position:absolute;top:8px;right:12px;font-size:11px;font-weight:500;color:var(--iboca-grey-muted);background:var(--iboca-grey-content);border-radius:100px;padding:2px 8px}',
    '.card .empty{font-size:14px;color:var(--iboca-grey-muted);padding:20px 0;text-align:center}',
    '.days{display:flex;justify-content:space-between}',
    '.days button{height:32px;display:flex;align-items:center;padding:10px;border-radius:100px;background:var(--iboca-grey-chip);font-size:14px;font-weight:600;white-space:nowrap}',
    '.days button[aria-pressed="true"]{background:var(--iboca-green-dark);color:#fff}',
    '.legend{padding:10px;overflow:hidden}',
    '.legend li{display:flex;align-items:center;gap:16px;padding:10px;font-size:16px}',
    '.legend .sw{width:40px;height:20px;border-radius:10px;flex:none}',
    '.legend .lab{flex:1;display:flex;justify-content:space-between}',
    /* empty state */
    '.empty-state{padding:40px 24px;font-size:16px;color:var(--iboca-grey-muted);text-align:center}',
    '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  ].join('');

  /* ---------- charts (plain SVG, no chart library) ---------- */

  // Plot geometry follows the Figma chart frame (316 x 287 inside a 20px-padded card).
  var PLOT = { x0: 24, x1: 316, y0: 21, y1: 261 };
  function yOf(v) { return PLOT.y1 - (Math.min(500, Math.max(0, v)) / 500) * (PLOT.y1 - PLOT.y0); }

  /**
   * Band-coloured line chart. The vertical colour scale and the y axis are drawn
   * TO VALUE (0-500 linear, so Peligroso 201-500 takes 60% of the height).
   * xs: x position per value (0..1); values may contain nulls (gaps).
   */
  function chart(opts) {
    var id = 'g' + Math.random().toString(36).slice(2, 8);
    var W = PLOT.x1 - PLOT.x0;
    var s = '<svg class="chart" width="100%" viewBox="-6 0 322 290" role="img" aria-label="' + esc(opts.label) + '">';
    // gradient with hard stops at band thresholds, in user space (so colour = value)
    s += '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + PLOT.y1 + '" x2="0" y2="' + PLOT.y0 + '">';
    BANDS.forEach(function (b, i) {
      var lo = i === 0 ? 0 : BANDS[i - 1].hi / 500, hi = b.hi / 500;
      s += '<stop offset="' + lo + '" stop-color="var(--iboca-aqi-' + b.key + ')"/><stop offset="' + hi + '" stop-color="var(--iboca-aqi-' + b.key + ')"/>';
    });
    s += '</linearGradient></defs>';
    // grid at band thresholds
    [0, 50, 100, 150, 200, 500].forEach(function (v) {
      s += '<line x1="' + PLOT.x0 + '" x2="' + PLOT.x1 + '" y1="' + yOf(v) + '" y2="' + yOf(v) + '" stroke="var(--iboca-grey-grid)" stroke-width="1"/>';
    });
    // colour scale drawn to value + faces top / bottom
    BANDS.forEach(function (b, i) {
      var lo = i === 0 ? 0 : BANDS[i - 1].hi;
      s += '<rect x="-2" width="14" y="' + yOf(b.hi) + '" height="' + (yOf(lo) - yOf(b.hi)) + '" fill="var(--iboca-aqi-' + b.key + ')"/>';
    });
    s += '<svg x="-5" y="0" width="20" height="20" viewBox="0 0 80 80" aria-hidden="true">' + face('peligroso', 80, '').replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>';
    s += '<svg x="-5" y="' + (PLOT.y1 + 1) + '" width="20" height="20" viewBox="0 0 80 80" aria-hidden="true">' + face('bajo', 80, '').replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg>';
    // day dividers
    (opts.dividers || []).forEach(function (fx) {
      var x = PLOT.x0 + fx * W;
      s += '<line x1="' + x + '" x2="' + x + '" y1="' + PLOT.y0 + '" y2="' + PLOT.y1 + '" stroke="var(--iboca-grey-divider-dash)" stroke-width="1" stroke-dasharray="3 3"/>';
    });
    // line (break on nulls)
    var d = '', pen = false;
    opts.values.forEach(function (v, i) {
      if (v == null) { pen = false; return; }
      var x = (PLOT.x0 + opts.xs[i] * W).toFixed(1), y = yOf(v).toFixed(1);
      d += (pen ? 'L' : 'M') + x + ' ' + y;
      pen = true;
    });
    s += '<path d="' + d + '" fill="none" stroke="rgba(26,26,26,.22)" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="url(#' + id + ')" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
    // x labels
    opts.xLabels.forEach(function (l) {
      var x = PLOT.x0 + l.fx * W;
      s += '<text x="' + x + '" y="282" font-size="14" text-anchor="' + (l.anchor || 'middle') + '" font-weight="' + (l.bold ? 600 : 400) + '" fill="var(--iboca-text-primary)">' + esc(l.text) + '</text>';
    });
    return s + '</svg>';
  }

  function seriesSummary(prefix, pts) {
    var valid = pts.filter(function (p) { return p.v != null; });
    if (!valid.length) return prefix + ': sin datos.';
    var max = valid.reduce(function (a, b) { return b.v > a.v ? b : a; });
    var min = valid.reduce(function (a, b) { return b.v < a.v ? b : a; });
    return prefix + ': máximo ' + max.v + ' (' + bandFor(max.v).name + ') ' + max.when + '; mínimo ' + min.v + ' (' + bandFor(min.v).name + ') ' + min.when + '.';
  }

  /* ---------- the element ---------- */

  class IbocaPanel extends HTMLElement {
    static get observedAttributes() { return ['station', 'pollutant', 'tab']; }

    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._state = { stationId: null, pollutant: 'pm25', tab: 'acciones', browse: null, day: 4, listOpen: false, cleared: false };
      this._data = null;
      this._onSelect = this._onSelect.bind(this);
      this._onClear = this._onClear.bind(this);
      this._onDocClick = this._onDocClick.bind(this);
    }

    connectedCallback() {
      ensureFont();
      document.addEventListener('iboca:select', this._onSelect);
      document.addEventListener('iboca:clear', this._onClear);
      document.addEventListener('click', this._onDocClick);
      this._root.addEventListener('click', this._onClick.bind(this));
      this._root.addEventListener('keydown', this._onKey.bind(this));
      if (this._state.stationId == null) this._state.stationId = +(this.getAttribute('station') || DEFAULT_STATION);
      this._render();
      this._load();
    }

    disconnectedCallback() {
      document.removeEventListener('iboca:select', this._onSelect);
      document.removeEventListener('iboca:clear', this._onClear);
      document.removeEventListener('click', this._onDocClick);
    }

    attributeChangedCallback(name, _old, val) {
      if (val == null) return;
      if (name === 'station') this._set({ stationId: +val, cleared: false, browse: null });
      if (name === 'pollutant' && POLLUTANTS[val]) this._set({ pollutant: val, browse: null });
      if (name === 'tab' && (val === 'acciones' || val === 'datos')) this._set({ tab: val });
    }

    /** Public API, equivalent to the iboca:select event. */
    select(detail) { this._onSelect({ detail: detail || {} }); }
    clear() { this._onClear(); }

    _base() { return new URL(this.getAttribute('data-base') || '../', SCRIPT_URL); }
    _url(rel) { return new URL(rel, this._base()).href; }

    _load() {
      var self = this;
      var files = ['data/stations.json', 'data/recommendations.json', 'data/mock-forecast.json', 'data/mock-history.json'];
      Promise.all(files.map(function (f) {
        return fetch(self._url(f)).then(function (r) { if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); });
      })).then(function (res) {
        var byId = {};
        res[0].stations.forEach(function (s) { byId[s.id] = s; });
        self._data = { snapshot: res[0].snapshot, stations: res[0].stations, byId: byId, recs: res[1].bands, forecast: res[2].series, history: res[3].series };
        self._render();
      }).catch(function (err) {
        self._error = String(err && err.message || err);
        self._render();
      });
    }

    _onSelect(e) {
      var d = e.detail || {};
      var patch = { listOpen: false };
      if (d.stationId != null && (!this._data || this._data.byId[+d.stationId])) {
        patch.cleared = false; // a pollutant-only select does not reopen a cleared panel
        if (+d.stationId !== this._state.stationId) { patch.browse = null; patch.resetScroll = true; }
        patch.stationId = +d.stationId;
      }
      if (d.pollutant && POLLUTANTS[d.pollutant]) { patch.pollutant = d.pollutant; patch.browse = null; }
      this._set(patch);
    }
    _onClear() { this._set({ cleared: true, listOpen: false, browse: null, tab: 'acciones', resetScroll: true }); }
    _onDocClick(e) {
      if (this._state.listOpen && e.composedPath().indexOf(this) === -1) this._set({ listOpen: false });
    }

    _set(patch) {
      var reset = patch.resetScroll; delete patch.resetScroll;
      Object.assign(this._state, patch);
      this._render(reset);
    }

    _emit() {
      this.dispatchEvent(new CustomEvent('iboca:panel-change', { bubbles: true, composed: true, detail: { stationId: this._state.stationId, pollutant: this._state.pollutant } }));
    }

    _onClick(e) {
      var t = e.target.closest('[data-act]');
      if (!t) return;
      var a = t.getAttribute('data-act'), v = t.getAttribute('data-v');
      switch (a) {
        case 'toggle-list': this._set({ listOpen: !this._state.listOpen }); if (this._state.listOpen) this._focus('[data-act="station"][aria-current="true"]'); break;
        case 'station': this._set({ stationId: +v, listOpen: false, browse: null, cleared: false, resetScroll: true }); this._emit(); this._focus('[data-act="toggle-list"]'); break;
        case 'pollutant': this._set({ pollutant: v, browse: null }); this._emit(); break;
        case 'tab': this._set({ tab: v }); break;
        case 'browse': this._set({ browse: v === this._currentBandKey() ? null : v }); break;
        case 'browse-reset': this._set({ browse: null }); this._focus('.cells button.current'); break;
        case 'day': this._set({ day: +v }); break;
        case 'menu': this.dispatchEvent(new CustomEvent('iboca:menu', { bubbles: true, composed: true })); break;
      }
    }

    _onKey(e) {
      if (e.key === 'Escape' && this._state.listOpen) { this._set({ listOpen: false }); this._focus('[data-act="toggle-list"]'); e.stopPropagation(); return; }
      var t = e.target;
      if (t.getAttribute && t.getAttribute('role') === 'tab' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        var next = this._state.tab === 'acciones' ? 'datos' : 'acciones';
        this._set({ tab: next });
        this._focus('[role="tab"][data-v="' + next + '"]');
        e.preventDefault();
      }
      if (e.key === 'Escape') e.stopPropagation(); // keep panel Escape from reaching the host's clear shortcut
    }

    _focus(sel) {
      var el = this._root.querySelector(sel);
      if (el) el.focus();
    }

    /* ---- derived state ---- */

    _station() { return this._data && this._data.byId[this._state.stationId]; }
    _hero() {
      var s = this._station();
      var p = this._state.pollutant;
      if (!s) return null;
      if (p === 'iboca') {
        var pm = s.pollutants.pm25;
        return { index: s.iboca.index, band: bandByName(s.iboca.band) || bandFor(s.iboca.index), status: s.iboca.index == null ? 'sin-datos' : 'ok', lastDate: pm.lastDate };
      }
      var d = s.pollutants[p];
      return { index: d.index, band: bandByName(d.band) || bandFor(d.index), status: d.status, lastDate: d.lastDate, concentration: d.concentration };
    }
    _currentBandKey() { var h = this._hero(); return h && h.band ? h.band.key : null; }

    /* ---- render ---- */

    _render(resetScroll) {
      var root = this._root;
      var scroller = root.querySelector('.panel');
      var top = scroller && !resetScroll ? scroller.scrollTop : 0;
      var activeKey = root.activeElement && root.activeElement.getAttribute('data-k');

      root.innerHTML = '<style>' + CSS + '</style><div class="panel" part="panel">' + this._html() + '</div>';

      var sc = root.querySelector('.panel');
      if (sc) sc.scrollTop = top;
      if (activeKey) {
        var el = root.querySelector('[data-k="' + activeKey + '"]');
        if (el) el.focus({ preventScroll: true });
      }
    }

    _html() {
      var nav = '<div class="nav"><button class="icon-btn" data-act="menu" data-k="menu" aria-label="Menú">' + ICON_MENU + '</button>' +
        '<p><a href="https://iboca.ambientebogota.gov.co/" target="_blank" rel="noopener">IBOCA</a> (Índice Bogotano de Calidad del Aire)</p></div>';
      if (this._error) return nav + '<p class="empty-state">No se pudieron cargar los datos del prototipo (' + esc(this._error) + ').</p>';
      if (!this._data) return nav + '<p class="empty-state" aria-live="polite">Cargando…</p>';
      if (this._state.cleared) {
        return nav + this._stationHeader(null) + '<p class="empty-state">Seleccione una estación en el mapa o en la lista para ver la calidad del aire.</p>';
      }
      var s = this._station();
      if (!s) return nav + this._stationHeader(null) + '<p class="empty-state">Estación no encontrada.</p>';
      return nav + this._stationHeader(s) + this._strip(s) + this._photo(s) + this._heroHtml(s) + this._tabs() +
        '<div class="content" role="tabpanel" id="tp-' + this._state.tab + '" aria-labelledby="tab-' + this._state.tab + '">' +
        (this._state.tab === 'acciones' ? this._acciones() : this._datos(s)) + '</div>';
    }

    _stationHeader(s) {
      var open = this._state.listOpen;
      var title = s ? 'Estación ' + esc(s.nombre) : 'Seleccione una estación';
      var h = '<div class="station"><button class="station-toggle" data-act="toggle-list" data-k="toggle" aria-expanded="' + open + '" aria-controls="station-list" aria-label="' + title + '. Cambiar estación">' +
        '<span>' + title + '</span><span class="chev">' + ICON_CHEVRON + '</span></button>';
      if (open) {
        var self = this;
        h += '<ul class="station-list" id="station-list" aria-label="Estaciones">' + this._data.stations.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }).map(function (st) {
          var hp = self._state.pollutant === 'iboca' ? st.iboca : st.pollutants[self._state.pollutant];
          var b = bandByName(hp.band) || bandFor(hp.index);
          var label = b ? b.name : 'Sin datos';
          return '<li><button data-act="station" data-v="' + st.id + '" data-k="st-' + st.id + '" aria-current="' + (st.id === self._state.stationId) + '" aria-label="' + esc(st.nombre) + ', ' + label + (hp.index != null ? ' ' + hp.index : '') + '">' +
            face(b && b.key, 24, label) + '<span class="name">' + esc(st.nombre) + '</span><span class="val">' + (hp.index != null ? hp.index : '--') + '</span></button></li>';
        }).join('') + '</ul>';
      }
      return h + '</div>';
    }

    _strip(s) {
      var self = this;
      return '<div class="strip" role="group" aria-label="Contaminantes">' + ['pm25', 'pm10', 'o3'].map(function (p) {
        var d = s.pollutants[p], meta = POLLUTANTS[p];
        var b = d.status === 'ok' ? (bandByName(d.band) || bandFor(d.index)) : null;
        var bandLabel = b ? b.name : (d.status === 'sin-monitor' ? 'No mide' : 'Sin datos');
        var conc = d.status === 'sin-monitor' ? 'No mide' : (d.concentration != null ? Math.round(d.concentration) + ' µg/m³' : 'Sin datos');
        var spoken = meta.spoken + ': ' + (d.status === 'sin-monitor' ? 'esta estación no mide ' + meta.spoken : conc.replace('µg/m³', 'microgramos por metro cúbico') + ', ' + bandLabel);
        return '<button class="' + (b ? '' : 'nodata') + '" data-act="pollutant" data-v="' + p + '" data-k="pol-' + p + '" aria-pressed="' + (self._state.pollutant === p) + '" aria-label="' + esc(spoken) + '">' +
          face(b && b.key, 30, bandLabel) + '<span class="txt" aria-hidden="true"><b>' + meta.strip + '</b><span>' + conc + '</span></span></button>';
      }).join('') + '</div>';
    }

    _photo(s) {
      if (!s.photo) return '';
      return '<div class="photo"><img src="' + esc(this._url(s.photo)) + '" alt="Estación de monitoreo ' + esc(s.nombre) + '"></div>';
    }

    _heroHtml(s) {
      var h = this._hero(), meta = POLLUTANTS[this._state.pollutant];
      var b = h.status === 'ok' ? h.band : null;
      var name = b ? b.name : (h.status === 'sin-monitor' ? 'Sin medición' : 'Sin datos');
      var out = '<div class="hero"><div class="band-head"><div><span class="pill">' + meta.pill + '</span>' +
        '<h2 class="band-name' + (b ? '' : ' nodata') + '">' + name + '</h2></div>' + face(b && b.key, 75, name) + '</div>';
      out += '<div class="aqi"><div class="bar' + (b ? '' : ' nodata') + '" aria-hidden="true">' + BANDS.map(function (x) { return '<span style="background:var(--iboca-aqi-' + x.key + ')"></span>'; }).join('') + '</div>';
      if (b) {
        // Pointer rule: five equal-width bands (80px each in a 400px bar); the value is placed
        // linearly inside its own band. The bubble centre sits on that point, clamped to the bar.
        var i = BANDS.indexOf(b), lo = i === 0 ? 0 : BANDS[i - 1].hi;
        var frac = Math.min(1, Math.max(0, (h.index - lo) / (b.hi - lo)));
        var pct = (i + frac) / BANDS.length * 100;
        out += '<div class="bubble" style="left:clamp(0px, calc(' + pct.toFixed(2) + '% - 17px), calc(100% - 34px));background:var(--iboca-aqi-' + b.key + ');color:var(--iboca-on-' + b.key + ')">' +
          '<span aria-hidden="true">' + h.index + '</span><span class="sr">Índice ' + h.index + ' de 500, nivel ' + b.name + '</span>' +
          '<span class="tip" style="color:var(--iboca-aqi-' + b.key + ')">' + ICON_DROP + '</span></div>';
      }
      out += '</div>';
      if (h.status === 'sin-monitor') {
        out += '<p class="explain">Esta estación no reporta O<sub>3</sub> desde ' + esc(s.pollutants.o3.lastDate ? s.pollutants.o3.lastDate.slice(0, 10) : '—') + '.</p>';
      } else if (h.status === 'sin-datos') {
        out += '<p class="explain">No hay un índice disponible para esta hora.</p>';
      }
      if (h.lastDate && h.status !== 'sin-monitor') out += '<p class="stamp">Última actualización: ' + esc(h.lastDate) + '</p>';
      return out + '</div>';
    }

    _tabs() {
      var t = this._state.tab;
      return '<div class="tabs" role="tablist" aria-label="Secciones">' + [['acciones', 'Acciones'], ['datos', 'Datos']].map(function (x) {
        var sel = x[0] === t;
        return '<button role="tab" id="tab-' + x[0] + '" data-act="tab" data-v="' + x[0] + '" data-k="tab-' + x[0] + '" aria-selected="' + sel + '" aria-controls="tp-' + x[0] + '" tabindex="' + (sel ? 0 : -1) + '">' + x[1] + '</button>';
      }).join('') + '</div>';
    }

    _acciones() {
      var cur = this._currentBandKey();
      var shown = this._state.browse || cur;
      var self = this;
      var curIdx = BANDS.findIndex(function (b) { return b.key === cur; });
      var out = '<div class="selector">';
      if (curIdx >= 0) out += '<div class="now" style="left:calc(' + ((curIdx + 0.5) * 20) + '% - 35px)" aria-hidden="true">Ahora<span class="tip">' + ICON_DROP + '</span></div>';
      out += '<div class="cells" role="group" aria-label="Niveles del índice">' + BANDS.map(function (b) {
        var isCur = b.key === cur;
        var cls = (isCur ? 'current' : '') + (b.key === self._state.browse && !isCur ? ' browsed' : '');
        return '<button class="' + cls + '" data-act="browse" data-v="' + b.key + '" data-k="band-' + b.key + '" aria-pressed="' + (b.key === shown) + '" ' +
          'aria-label="' + b.name + ', ' + b.range.replace(' - ', ' a ') + (isCur ? ', nivel actual' : '') + '" style="background:var(--iboca-aqi-' + b.key + ');color:var(--iboca-on-' + b.key + ')">' + b.cell + '</button>';
      }).join('') + '</div></div>';
      if (this._state.browse && this._state.browse !== cur) {
        out += '<div class="browse-note"><span>Viendo recomendaciones para otro nivel.</span>' + (cur ? '<button data-act="browse-reset" data-k="browse-reset">Volver a Ahora</button>' : '') + '</div>';
      }
      if (!shown) {
        return out + '<p class="prompt">Sin datos del índice en este momento. Seleccione un nivel para ver sus recomendaciones.</p>';
      }
      var band = BANDS.find(function (b) { return b.key === shown; });
      var rec = this._data.recs[band.name];
      out += '<div class="rec-band">' + face(band.key, 56, band.name) + '<p>' + band.name + '</p></div>';
      var rows = function (list) {
        return list.map(function (r) {
          return '<li class="rec">' + (r.icon ? '<img src="' + esc(self._url(r.icon)) + '" alt="">' : '') + '<p>' + esc(r.titulo) + '</p></li>';
        }).join('');
      };
      out += '<h3 class="h">Recomendaciones en salud</h3><ul style="display:flex;flex-direction:column;gap:14px">' + rows(rec.salud) + '</ul>';
      out += '<h3 class="h">Recomendaciones en ambiente</h3><ul style="display:flex;flex-direction:column;gap:14px">' + rows(rec.ambiente) + '</ul>';
      if (rec.note) out += '<p class="note">Nota del prototipo: IBOCA solo publica recomendaciones para 201–300. Para valores de 301 a 500 se muestran estas mismas.</p>';
      return out;
    }

    _datos(s) {
      var p = this._state.pollutant, key = POLLUTANTS[p].series, meta = POLLUTANTS[p];
      var fc = this._data.forecast[s.id] && this._data.forecast[s.id][key];
      var hi = this._data.history[s.id] && this._data.history[s.id][key];
      var out = '<div class="hrow"><span>Pronóstico</span><span>48 horas</span></div>';
      out += '<div class="card">' + (fc ? this._mockTag(fc.src) + this._forecastChart(fc, meta) : '<p class="empty">Sin pronóstico para este contaminante en esta estación.</p>') + '</div>';
      out += '<div class="hrow"><span>Historial</span><span>5 días</span></div>';
      if (hi) {
        var day = Math.min(this._state.day, hi.days.length - 1);
        out += '<div class="days" role="group" aria-label="Día del historial">' + hi.days.map(function (d, i) {
          var pp = parts(d.date);
          return '<button data-act="day" data-v="' + i + '" data-k="day-' + i + '" aria-pressed="' + (i === day) + '" aria-label="' + DAY_NAMES[pp.wd] + ' ' + pp.d + ' de ' + MONTHS_LONG[pp.mo - 1] + '">' + pp.d + ' ' + MONTHS[pp.mo - 1] + '</button>';
        }).join('') + '</div>';
        out += '<div class="card">' + this._mockTag(hi.src) + this._historyChart(hi.days[day], meta) + '</div>';
      } else {
        out += '<div class="card"><p class="empty">Esta estación no tiene historial de este contaminante.</p></div>';
      }
      out += '<h3 class="h">Leyenda</h3><ul class="card legend" aria-label="Niveles del índice">' + BANDS.map(function (b) {
        return '<li><span class="sw" style="background:var(--iboca-aqi-' + b.key + ')"></span><span class="lab"><span>' + b.name + '</span><span>' + b.range + '</span></span></li>';
      }).join('') + '</ul>';
      return out;
    }

    _mockTag(src) {
      if (src === 'real') return '';
      return '<span class="mock" title="Serie generada para el prototipo">' + (src === 'mixed' ? 'Datos de ejemplo · parcial' : 'Datos de ejemplo') + '</span>';
    }

    _forecastChart(fc, meta) {
      var pts = fc.points, n = pts.length;
      var xs = pts.map(function (_, i) { return i / (n - 1); });
      var labels = [{ fx: 0, text: 'Ahora', bold: true, anchor: 'start' }], dividers = [];
      pts.forEach(function (p, i) {
        var pp = parts(p.t);
        if (i > 0 && pp.h === 0) { dividers.push(xs[i]); labels.push({ fx: xs[i], text: DAY_NAMES[pp.wd] }); }
      });
      var summary = seriesSummary('Pronóstico de 48 horas, ' + meta.spoken, pts.map(function (p) {
        var pp = parts(p.t); return { v: p.v, when: DAY_NAMES[pp.wd].toLowerCase() + ' a las ' + hourLabel(pp) };
      }));
      return chart({ values: pts.map(function (p) { return p.v; }), xs: xs, dividers: dividers, xLabels: labels, label: summary });
    }

    _historyChart(day, meta) {
      var xs = day.values.map(function (_, h) { return h / 24; });
      var pp = parts(day.date);
      var summary = seriesSummary('Historial del ' + DAY_NAMES[pp.wd].toLowerCase() + ' ' + pp.d + ' de ' + MONTHS_LONG[pp.mo - 1] + ', ' + meta.spoken,
        day.values.map(function (v, h) { return { v: v, when: 'a las ' + pad(h) + ':00' }; }));
      return chart({ values: day.values, xs: xs, dividers: [], label: summary, xLabels: [
        { fx: 0, text: '00:00', bold: true, anchor: 'start' }, { fx: 0.5, text: '12:00' }, { fx: 1, text: '24:00', anchor: 'end' }] });
    }
  }

  /** Roboto must be declared in the document (an @font-face inside a shadow root is not applied). */
  function ensureFont() {
    if (document.querySelector('link[data-iboca-font]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&display=swap';
    l.setAttribute('data-iboca-font', '');
    document.head.appendChild(l);
  }

  if (!customElements.get('iboca-panel')) customElements.define('iboca-panel', IbocaPanel);
})();
