#!/usr/bin/env python3
"""Generate the MOCK sensor file for the Breathe Data Atlas Bogotá city page (spec 5.2 to 5.6).

Output: _data/sensors/bogota-page.json

What is real and what is not
  POSITIONS and SENSOR TYPES are taken unchanged from the Atlas file _data/sensors/bogota.json
  (16 real RMCAB positions from the 2026-09-17 OpenAQ snapshot, 8 placed low-cost positions).
  Iteration 2 (round 1 feedback, decision C2): the card shows the station's NAME, or its LOCATION
  where it has no name. Real stations (placed: false) carry RMCAB's own station name, from the
  Atlas file's openaqName (the snapshot of the city's own network), with RMCAB's Spanish accents
  restored. Placed low-cost sensors have no name; they carry the Bogotá locality (localidad) their
  PLACED position falls in, read by eye from the locality map: MOCK, like the position itself.
  EVERYTHING ELSE IS INVENTED: readings, bands, freshness, station types. The page's nav notice
  ("Prototype with sample data") covers it, and every derived figure is marked "Sample figure".

How the mock stays honest
  - Each reading carries the band "Bogotá's feed publishes" for it, and the page shows that band
    as data. The page computes no band. To keep the mock internally consistent for an expert who
    opens the sensor detail, each invented value is drawn from INSIDE the published IBOCA range of
    the band it is given (Resolución Conjunta 2840 de 2023, from the research file
    research/landscape/analysis/_data-catalogue/validation/bogota/v2/bogota-aqi-bands.csv). Those
    breakpoints live only in this generator and never reach the page (spec rule 5).
  - Each station's overall level is the worst of its pollutant bands, which is how IBOCA reports a
    station; it is written into the file as the feed's own field, not derived on the page.
  - Averaging times per pollutant are IBOCA's, from the same research file.
  - Freshness (iteration 4, decision B1): two states only, fresh and stale (older than the city's
    cycle, however old). The file keeps stale sensors from 5 hours to a month old.
  - Fresh reading, no band (iteration 4, decision B2): NO_BAND lists stations whose feed sent a
    fresh reading with no IBOCA level (Bogotá's "SIN DATOS"). Their values are still drawn as above
    (so the draw sequence is unchanged), but `overallBand` and every reading's `band` are written as
    null: the page shows the reading and no level.
  - One pollutant read earlier than its station's update (iteration 4, decision D3): OLDER_READING
    gives that reading its own minutes-ago, shown inside the row's "i".

Usage: python3 _data/generators/gen_bogota_page_sensors.py
"""
import json
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)

# IBOCA v3 ranges per pollutant and band (1 = Bajo ... 5 = Peligroso, 201-300 sub-range), unit as
# IBOCA publishes it. Generator-only: never written to the page file.
RANGES = {
    'PM2.5': [(0, 12), (12.1, 35.4), (35.5, 55.4), (55.5, 151.2), (151.3, 250.4)],
    'PM10': [(0, 27.2), (27.3, 63.8), (63.9, 95.5), (95.6, 246.7), (246.8, 405.2)],
    'O₃': [(0, 72), (73, 107), (108, 137), (138, 281), (282, 432)],
    'NO₂': [(0, 28.5), (28.6, 84.1), (84.2, 132.2), (132.3, 361.9), (362.0, 602.6)],
    'SO₂': [(0, 9.6), (9.7, 38.5), (38.6, 63.5), (63.6, 182.7), (182.8, 307.7)],
    'CO': [(0, 2549), (2550, 5022), (5023, 7165), (7166, 17384), (17385, 28099)],
}
AVERAGING = {
    'PM2.5': '12-hour weighted average (NowCast)',
    'PM10': '12-hour weighted average (NowCast)',
    'O₃': '8-hour average',
    'NO₂': '1-hour average',
    'SO₂': '1-hour average',
    'CO': '8-hour average',
}
UNIT = 'µg/m³'

# Per sensor: pollutant bands (only the pollutants it measures), minutes since its last reading,
# and (reference monitors only) a station type in RMCAB's own categories, translated.
PLAN = {
    'bogota-01': ({'PM2.5': 2, 'PM10': 1, 'O₃': 1, 'NO₂': 1, 'CO': 1}, 18, 'Background'),
    'bogota-02': ({'PM2.5': 2, 'PM10': 2, 'O₃': 1, 'NO₂': 1}, 22, 'Residential'),
    'bogota-03': ({'PM2.5': 2, 'PM10': 2, 'O₃': 1, 'NO₂': 1, 'CO': 1, 'SO₂': 1}, 12, 'Industrial'),
    'bogota-04': ({'PM2.5': 1, 'PM10': 1, 'O₃': 2}, 9, 'Background'),
    'bogota-05': ({'PM2.5': 1, 'PM10': 1, 'O₃': 1, 'NO₂': 1, 'CO': 1, 'SO₂': 1}, 14, 'Background'),
    'bogota-06': ({'PM2.5': 3, 'PM10': 2, 'NO₂': 2, 'CO': 1, 'SO₂': 1}, 11, 'Industrial'),
    'bogota-07': ({'PM2.5': 2, 'PM10': 1, 'O₃': 1, 'NO₂': 1}, 540, 'Residential'),   # stale, 9 hours
    'bogota-08': ({'PM2.5': 4, 'PM10': 3, 'O₃': 1, 'NO₂': 2, 'CO': 1, 'SO₂': 1}, 8, 'Traffic'),
    'bogota-09': ({'PM2.5': 1, 'PM10': 1, 'O₃': 1}, 26, 'Background'),
    'bogota-10': ({'PM2.5': 2, 'PM10': 1, 'O₃': 1, 'NO₂': 1, 'CO': 1, 'SO₂': 1}, 7, 'Traffic'),
    'bogota-11': ({'PM2.5': 2, 'PM10': 2, 'O₃': 1, 'NO₂': 1, 'CO': 1}, 16, 'Residential'),
    'bogota-12': ({'PM2.5': 1, 'PM10': 1, 'O₃': 1, 'NO₂': 1, 'SO₂': 1}, 2900, 'Traffic'),   # dead, 2 days
    'bogota-13': ({'PM2.5': 1, 'PM10': 1, 'O₃': 2, 'NO₂': 1}, 13, 'Background'),
    'bogota-14': ({'PM2.5': 3, 'PM10': 2, 'NO₂': 1, 'CO': 1}, 20, 'Residential'),
    'bogota-15': ({'PM2.5': 1, 'PM10': 1, 'O₃': 1}, 31, 'Background'),
    'bogota-16': ({'PM2.5': 2, 'PM10': 2, 'NO₂': 1, 'SO₂': 1}, 17, 'Traffic'),
    'bogota-17': ({'PM2.5': 2, 'PM10': 1}, 6, None),
    'bogota-18': ({'PM2.5': 1, 'PM10': 1}, 4, None),
    'bogota-19': ({'PM2.5': 1, 'PM10': 1}, 1250, None),   # stale, about 21 hours
    'bogota-20': ({'PM2.5': 3, 'PM10': 2}, 10, None),
    'bogota-21': ({'PM2.5': 2, 'PM10': 2}, 320, None),    # stale, about 5 hours
    'bogota-22': ({'PM2.5': 1, 'PM10': 1}, 8700, None),   # dead, 6 days
    'bogota-23': ({'PM2.5': 2, 'PM10': 1}, 44000, None),  # dead, about a month
    'bogota-24': ({'PM2.5': 1, 'PM10': 1}, 5, None),
}

# RMCAB's station names, accents as RMCAB writes them (OpenAQ drops them). Keyed by Atlas id.
STATION_NAMES = {
    'bogota-01': 'Usme',
    'bogota-02': 'Ciudad Bolívar',
    'bogota-03': 'Fontibón',
    'bogota-04': 'Guaymaral',
    'bogota-05': 'Centro de Alto Rendimiento',
    'bogota-06': 'Puente Aranda',
    'bogota-07': 'Jazmín',
    'bogota-08': 'Carvajal - Sevillana',
    'bogota-09': 'San Cristóbal',
    'bogota-10': 'MinAmbiente',
    'bogota-11': 'Tunal',
    'bogota-12': 'Las Ferias',
    'bogota-13': 'Usaquén',
    'bogota-14': 'Bosa',
    'bogota-15': 'Bolivia',
    'bogota-16': 'Móvil Fontibón',
}
# Placed low-cost sensors: the locality their mock position falls in (mock, by eye).
LOCALITIES = {
    'bogota-17': 'Kennedy',
    'bogota-18': 'Usaquén',
    'bogota-19': 'Suba',
    'bogota-20': 'Bosa',
    'bogota-21': 'Kennedy',
    'bogota-22': 'Suba',
    'bogota-23': 'San Cristóbal',
    'bogota-24': 'Suba',
}

# Fresh stations whose feed sent no band ("SIN DATOS"), decision B2. One reference, one low-cost.
NO_BAND = {'bogota-02', 'bogota-17'}

# A reading older than its station's update time (decision D3): (sensor, pollutant) -> minutes.
OLDER_READING = {('bogota-06', 'SO₂'): 130}

ORDER = ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO']


def value_in(pollutant, band, rng):
    low, high = RANGES[pollutant][band - 1]
    # Keep clear of both edges so rounding never crosses a breakpoint.
    span = high - low
    v = low + span * rng.uniform(0.2, 0.8)
    return round(v) if pollutant == 'CO' else round(v, 1)


def band_of(pollutant, value):
    for index, (low, high) in enumerate(RANGES[pollutant]):
        if value <= high:
            return index + 1
    return len(RANGES[pollutant])


def coarse_at_least_fine(readings):
    """PM10 includes PM2.5, so an expert would expect PM10 >= PM2.5. Where the draw breaks that,
    PM10 is raised to 1.4 x PM2.5 and its band follows the IBOCA range that value falls in."""
    fine = next((r for r in readings if r['pollutant'] == 'PM2.5'), None)
    coarse = next((r for r in readings if r['pollutant'] == 'PM10'), None)
    if fine is None or coarse is None or coarse['value'] >= fine['value']:
        return
    coarse['value'] = round(fine['value'] * 1.4, 1)
    coarse['band'] = band_of('PM10', coarse['value'])


rng = random.Random(25102026)
atlas = json.load(open(os.path.join(DATA, 'sensors', 'bogota.json')))
sensors = []
for s in atlas['sensors']:
    bands, minutes, station_type = PLAN[s['id']]
    readings = [
        {
            'pollutant': p,
            'value': value_in(p, bands[p], rng),
            'unit': UNIT,
            'averaging': AVERAGING[p],
            'band': bands[p],
            'updatedMinutesAgo': OLDER_READING.get((s['id'], p)),
        }
        for p in ORDER if p in bands
    ]
    coarse_at_least_fine(readings)
    overall = max(r['band'] for r in readings)
    if s['id'] in NO_BAND:
        overall = None
        for r in readings:
            r['band'] = None
    sensors.append({
        'id': s['id'],
        'lngLat': s['lngLat'],
        'type': s['type'],
        'placed': s['placed'],
        'name': STATION_NAMES.get(s['id']) if not s['placed'] else None,
        'location': LOCALITIES.get(s['id']) if s['placed'] else None,
        'stationType': station_type,
        'overallBand': overall,
        'updatedMinutesAgo': minutes,
        'readings': readings,
    })

payload = {
    '_note': 'MOCK sensors for the Breathe Data Atlas Bogotá page. Positions and types from the Atlas file '
             '(_data/sensors/bogota.json); readings, bands, freshness and station types INVENTED. '
             'Generated by _data/generators/gen_bogota_page_sensors.py on 2026-10-25. Regenerate, do not hand-edit.',
    'city': 'bogota',
    'indexName': 'IBOCA',
    'sensors': sensors,
}
out = os.path.join(DATA, 'sensors', 'bogota-page.json')
with open(out, 'w') as fh:
    json.dump(payload, fh, ensure_ascii=False, indent=1)
    fh.write('\n')
print('wrote', len(sensors), 'sensors to', out)
