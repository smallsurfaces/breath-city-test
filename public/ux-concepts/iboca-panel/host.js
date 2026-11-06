/**
 * host.js — host-page glue for the IBOCA panel prototype (jQuery 3.1.0).
 *
 * Stands in for IBOCA's mapEsri.js: it owns the map (here a static screenshot
 * with invisible hotspots) and talks to <iboca-panel> ONLY through the
 * iboca:select / iboca:clear document events, exactly as mapEsri.js would.
 * It listens for iboca:panel-change to keep its own selection in sync when the
 * user changes station or pollutant inside the panel.
 *
 * Demo deep links: ?station=11&pollutant=o3&tab=datos (tab is an attribute);
 * ?scroll=600 scrolls the panel for headless screenshots (debug only).
 */
/* global jQuery */
(function ($) {
  'use strict';

  // Pollutant controls on the screenshot (image px, measured from the 2026-11-06 capture).
  var POLLUTANT_SPOTS = [
    { pollutant: 'iboca', cls: 'tab', label: 'IBOCA', x: 1294, y: 108, w: 93, h: 26 },
    { pollutant: 'pm25', cls: 'pill', label: 'PM2.5', x: 1319, y: 141, w: 58, h: 21 },
    { pollutant: 'pm10', cls: 'pill', label: 'PM10', x: 1381, y: 141, w: 59, h: 21 },
    { pollutant: 'o3', cls: 'pill', label: 'O3', x: 1444, y: 141, w: 58, h: 21 }
  ];

  var state = { stationId: 11, pollutant: 'pm25' };

  /** The whole integration: one event per selection, as mapEsri.js would send it. */
  function select(stationId, pollutant) {
    document.dispatchEvent(new CustomEvent('iboca:select', { detail: { stationId: stationId, pollutant: pollutant } }));
  }

  function syncUi() {
    $('.hotspot').each(function () {
      $(this).attr('aria-pressed', String(+$(this).data('station') === state.stationId));
    });
    $('.pol-hotspot').each(function () {
      $(this).attr('aria-pressed', String($(this).data('pollutant') === state.pollutant));
    });
  }

  function fitStage() {
    var s = Math.min(window.innerWidth / 1549, window.innerHeight / 977);
    var x = (window.innerWidth - 1549 * s) / 2, y = (window.innerHeight - 977 * s) / 2;
    $('#stage').css('transform', 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')');
  }

  $(function () {
    var q = new URLSearchParams(location.search);
    if (q.get('station')) state.stationId = +q.get('station');
    if (q.get('pollutant')) state.pollutant = q.get('pollutant');
    if (q.get('tab')) $('iboca-panel').attr('tab', q.get('tab'));

    fitStage();
    $(window).on('resize', fitStage);

    $.getJSON('data/hotspots.json').done(function (data) {
      var $wrap = $('#hotspots');
      $.each(data.hotspots, function (_, h) {
        $('<button type="button" class="hotspot">')
          .attr({ 'aria-label': h.nombre, title: h.nombre, 'data-station': h.stationId })
          .css({ left: h.x + 'px', top: h.y + 'px' })
          .appendTo($wrap);
      });
      syncUi();
    });

    var $pol = $('#pollutant-hotspots');
    $.each(POLLUTANT_SPOTS, function (_, p) {
      $('<button type="button">').addClass('pol-hotspot ' + p.cls)
        .attr({ 'aria-label': p.pollutant === 'iboca' ? 'IBOCA (índice general)' : 'Contaminante ' + p.label, 'data-pollutant': p.pollutant })
        .text(p.cls === 'pill' ? p.label : '')
        .css({ left: p.x + 'px', top: p.y + 'px', width: p.w + 'px', height: p.h + 'px' })
        .appendTo($pol);
    });

    $(document).on('click', '.hotspot', function () {
      state.stationId = +$(this).data('station');
      select(state.stationId, state.pollutant);
      syncUi();
    });
    $(document).on('click', '.pol-hotspot', function () {
      state.pollutant = $(this).data('pollutant');
      select(state.stationId, state.pollutant);
      syncUi();
    });
    // Escape on the map closes the panel (the panel stops its own Escape presses).
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') { state.stationId = null; document.dispatchEvent(new CustomEvent('iboca:clear')); syncUi(); }
    });
    // Keep the map selection in step with choices made inside the panel.
    document.addEventListener('iboca:panel-change', function (e) {
      state.stationId = e.detail.stationId;
      state.pollutant = e.detail.pollutant;
      syncUi();
    });

    customElements.whenDefined('iboca-panel').then(function () {
      select(state.stationId, state.pollutant);
      syncUi();
      // Screenshot helper only (?scroll=600): not part of the integration contract.
      if (q.get('scroll')) {
        setTimeout(function () {
          var sc = document.querySelector('iboca-panel').shadowRoot.querySelector('.panel');
          if (sc) sc.scrollTop = +q.get('scroll');
        }, 1500);
      }
    });
  });
})(jQuery);
