#!/usr/bin/env python3
"""Generate the MOCK sensor files for the Breathe Data Atlas Jakarta, Brussels, Sofia and Milan
city pages (SPEC ADDENDUM, 2026-10-25). Bogotá has its own generator (gen_bogota_page_sensors.py).

Output: _data/sensors/<city>-page.json, same shape as bogota-page.json.

What is real and what is not
  POSITIONS: Sofia from the Atlas file _data/sensors/sofia.json (six real EEA/AMS positions plus
  the placed low-cost ones, unchanged). Jakarta, Brussels and Milan from _data/poster-stations/*.json:
  APPROXIMATE positions read by eye from each city's own official map (positionSource is carried
  into the file). Never shown as numbers.
  EVERYTHING ELSE IS INVENTED: sensor types where the source has none, readings, freshness, the
  locality labels of unnamed sensors, and (Brussels only) the per-pollutant BelAQI bands.

Bands (rule 1: the band only ever comes from the city's feed; never computed)
  - Jakarta: the band belongs to the DISTRICT (see gen_jakarta_districts.py). Sensors carry no
    overall band and no per-pollutant band.
  - Brussels: the band belongs to IRCELINE's surface (see gen_brussels_surface.py). Sensors carry no
    overall band; each reading carries a MOCK per-pollutant BelAQI level "as fed", shown only in the
    sensor detail.
  - Sofia and Milan: no index, so no band anywhere: every band is null.
  Values are drawn from plausible invented ranges; for Brussels each value is drawn from a range
  that matches its mock level so an expert sees no contradiction. These ranges live only here.

Freshness: fresh (within the 3-hour cycle) or stale (older, however old), a few stale per city.

Usage: python3 _data/generators/gen_city_page_sensors.py
"""
import json
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)
UNIT = 'µg/m³'
ORDER = ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO']


def inside(ring, x, y):
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


# Round 3 decision X: every pollutant the city publishes in its station data
# (<city>-pollutant-names.csv) appears at the stations that would report it. MOCK values, drawn from a
# separate seed so the readings above are unchanged; no band anywhere (no index rates them, and Sofia
# and Milan have none). Per city: pollutant, unit, averaging, and which stations report it.
FULL_ORDER = ['PM1', 'PM2.5', 'PM10', 'TSP', 'O₃', 'NO₂', 'NO', 'NOₓ', 'SO₂', 'CO', 'HC', 'Black carbon', 'Benzene',
              'H₂S', 'CH₄', 'NMHC', 'THC', 'NH₃', 'As', 'Cd', 'Ni', 'Pb', 'BaP']
UG, NG = 'µg/m³', 'ng/m³'
EXTRAS = {
    'jakarta': [
        ('HC', UG, '1-hour average', 'ref', (40, 160)),
        ('NO', UG, '1-hour average', 'ref', (5, 40)),
        ('TSP', UG, '24-hour average', 'ref-first-two', (60, 140)),
    ],
    'brussels': [
        ('NO', UG, '1-hour average', 'all', (3, 30)),
        ('SO₂', UG, '1-hour average', [0, 3], (1, 5)),
        ('CO', UG, '8-hour average', [1, 3], (200, 450)),
        ('Black carbon', UG, '1-hour average', [1, 3, 6], (0.5, 3)),
        ('Benzene', UG, '1-hour average', [0, 3], (0.4, 1.5)),
    ],
    'sofia': [
        ('NO', UG, '1-hour average', 'has-NO₂', (5, 40)),
        ('NOₓ', UG, '1-hour average', 'has-NO₂', None),
        ('Benzene', UG, '1-hour average', ['sofia-01', 'sofia-04'], (0.5, 3)),
        ('H₂S', UG, '1-hour average', ['sofia-01', 'sofia-05'], (1, 6)),
        ('CH₄', UG, '1-hour average', ['sofia-04'], (1200, 1500)),
        ('NMHC', UG, '1-hour average', ['sofia-04'], (20, 80)),
        ('THC', UG, '1-hour average', ['sofia-04'], (1250, 1600)),
    ],
    'milan': [
        ('NOₓ', UG, '1-hour average', 'has-NO₂', None),
        ('Benzene', UG, '24-hour average', [1, 2], (0.5, 2.5)),
        ('NH₃', UG, '24-hour average', [3], (5, 20)),
        ('Black carbon', UG, '24-hour average', [1, 2], (1, 4)),
        ('As', NG, '24-hour average', [2], (0.3, 1.2)),
        ('Cd', NG, '24-hour average', [2], (0.1, 0.4)),
        ('Ni', NG, '24-hour average', [2], (1, 5)),
        ('Pb', NG, '24-hour average', [2], (3, 12)),
        ('BaP', NG, '24-hour average', [2], (0.1, 1.5)),
    ],
}


def add_extras(city, sensors):
    rng = random.Random(f'{city}-extras')
    for position, sensor in enumerate(sensors):
        has = {r['pollutant']: r['value'] for r in sensor['readings']}
        for pollutant, unit, averaging, who, span in EXTRAS[city]:
            if who == 'all':
                ok = True
            elif who == 'ref':
                ok = sensor['type'] == 'reference-grade'
            elif who == 'ref-first-two':
                ok = sensor['type'] == 'reference-grade' and sum(
                    1 for s in sensors[:position] if s['type'] == 'reference-grade') < 2
            elif who == 'has-NO₂':
                ok = 'NO₂' in has
            elif isinstance(who, list):
                ok = position in who or sensor['id'] in who
            else:
                ok = False
            if not ok:
                continue
            if pollutant == 'NOₓ':
                # NOx at least NO2 plus its NO share, so an expert sees no contradiction (mock).
                value = round(has['NO₂'] + has.get('NO', rng.uniform(5, 30)) * 1.53, 1)
            else:
                low, high = span
                value = round(rng.uniform(low, high), 2 if unit == NG or high < 5 else 1)
            sensor['readings'].append(reading(pollutant, value, averaging))
            sensor['readings'][-1]['unit'] = unit
            has[pollutant] = value
        sensor['readings'].sort(key=lambda r: FULL_ORDER.index(r['pollutant']))


def write(city, sensors, extra):
    add_extras(city, sensors)
    payload = {
        '_note': (f'MOCK sensors for the Breathe Data Atlas {city.title()} page. Generated by '
                  '_data/generators/gen_city_page_sensors.py on 2026-10-25. Readings, freshness and any bands are '
                  'INVENTED. Regenerate, do not hand-edit.'),
        'city': city,
        **extra,
        'sensors': sensors,
    }
    out = os.path.join(DATA, 'sensors', f'{city}-page.json')
    with open(out, 'w') as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print('wrote', len(sensors), 'sensors for', city)


def reading(p, value, averaging, band=None, older=None):
    return {'pollutant': p, 'value': value, 'unit': UNIT, 'averaging': averaging, 'band': band, 'updatedMinutesAgo': older}


# ── Jakarta ────────────────────────────────────────────────────────────────────────────────────
rng = random.Random(20261025)
stations = json.load(open(os.path.join(DATA, 'poster-stations', 'jakarta.json')))
districts = json.load(open(os.path.join(DATA, 'areas', 'jakarta-districts.json')))['districts']


def district_of(lng, lat):
    for d in districts:
        if any(inside(r, lng, lat) for r in d['rings']):
            return d['name']
    return None


STALE_JAKARTA = {7: 300, 23: 600, 41: 2880, 66: 8640}
sensors = []
for i, st in enumerate(stations['stations']):
    lng, lat = st['lngLat']
    ref = i % 9 == 0
    where = district_of(lng, lat)
    minutes = STALE_JAKARTA.get(i, rng.randint(3, 55))
    pm25 = round(rng.uniform(18, 75), 1)
    rs = [reading('PM2.5', pm25, '1-hour average')]
    if ref:
        rs += [
            reading('PM10', round(pm25 * rng.uniform(1.3, 1.8), 1), '1-hour average'),
            reading('O₃', round(rng.uniform(20, 90), 1), '1-hour average'),
            reading('NO₂', round(rng.uniform(15, 70), 1), '1-hour average'),
            reading('SO₂', round(rng.uniform(5, 40), 1), '1-hour average'),
            reading('CO', rng.randint(400, 1800), '1-hour average'),
        ]
    sensors.append({
        'id': f'jakarta-{i + 1:03d}',
        'lngLat': [lng, lat],
        'type': 'reference-grade' if ref else 'low-cost',
        'placed': False,
        'name': None,
        'location': where if where is not None else 'Greater Jakarta',
        'stationType': None,
        'overallBand': None,
        'updatedMinutesAgo': minutes,
        'readings': rs,
    })
write('jakarta', sensors, {'indexName': 'ISPU', 'positionSource': stations['positionSource']})

# ── Brussels ───────────────────────────────────────────────────────────────────────────────────
rng = random.Random(25102026)
stations = json.load(open(os.path.join(DATA, 'poster-stations', 'brussels.json')))
# Mock locality labels by eye (commune), in station order; mock station types.
BXL = [
    ('Haren', 'Industrial'), ('Schaerbeek', 'Traffic'), ('Molenbeek-Saint-Jean', 'Background'),
    ('Brussels centre', 'Traffic'), ('Berchem-Sainte-Agathe', 'Background'), ('Uccle', 'Background'),
    ('Ixelles', 'Traffic'), ('Woluwe-Saint-Lambert', 'Background'),
]
# Invented value ranges per BelAQI level (generator only, never on the page), hourly, µg/m³.
BXL_RANGE = {
    'PM2.5': {2: (3, 6), 3: (6, 9), 4: (9, 13), 5: (13, 16)},
    'PM10': {2: (6, 12), 3: (12, 18), 4: (18, 25), 5: (25, 30)},
    'NO₂': {2: (10, 20), 3: (20, 30), 4: (30, 40), 5: (40, 50)},
    'O₃': {2: (25, 50), 3: (50, 70), 4: (70, 80), 5: (80, 100)},
}
BXL_PLAN = [
    {'PM2.5': 3, 'PM10': 3, 'NO₂': 4, 'O₃': 3},
    {'PM2.5': 4, 'PM10': 4, 'NO₂': 5, 'O₃': 2},
    {'PM2.5': 4, 'PM10': 3, 'NO₂': 4, 'O₃': 3},
    {'PM2.5': 4, 'PM10': 4, 'NO₂': 5, 'O₃': 2},
    {'PM2.5': 3, 'PM10': 3, 'NO₂': 3, 'O₃': 3},
    {'PM2.5': 3, 'PM10': 2, 'NO₂': 3, 'O₃': 4},
    {'PM2.5': 3, 'PM10': 3, 'NO₂': 4, 'O₃': 3},
    {'PM2.5': 3, 'PM10': 3, 'NO₂': 3, 'O₃': 3},
]
BXL_MINUTES = [12, 9, 15, 7, 420, 11, 14, 2900]
sensors = []
for i, st in enumerate(stations['stations']):
    plan = BXL_PLAN[i]
    rs = []
    for p in ORDER:
        if p not in plan:
            continue
        low, high = BXL_RANGE[p][plan[p]]
        rs.append(reading(p, round(rng.uniform(low + 0.2 * (high - low), high - 0.2 * (high - low)), 1), '1-hour average', plan[p]))
    sensors.append({
        'id': f'brussels-{i + 1:02d}',
        'lngLat': st['lngLat'],
        'type': 'reference-grade',
        'placed': False,
        'name': None,
        'location': BXL[i][0],
        'stationType': BXL[i][1],
        'overallBand': None,
        'updatedMinutesAgo': BXL_MINUTES[i],
        'readings': rs,
    })
write('brussels', sensors, {'indexName': 'BelAQI', 'positionSource': stations['positionSource']})

# ── Sofia ──────────────────────────────────────────────────────────────────────────────────────
rng = random.Random(42697)
atlas = json.load(open(os.path.join(DATA, 'sensors', 'sofia.json')))
SOFIA_NAMES = {'sofia-01': 'Pavlovo', 'sofia-02': 'Kopitoto', 'sofia-03': 'Druzhba', 'sofia-04': 'Hipodruma',
               'sofia-05': 'Nadezhda', 'sofia-06': 'Mladost'}
SOFIA_PLACES = {'sofia-07': 'Nadezhda', 'sofia-08': 'Kremikovtsi', 'sofia-09': 'Vitosha', 'sofia-10': 'Ovcha Kupel',
                'sofia-11': 'Iskar', 'sofia-12': 'Ovcha Kupel', 'sofia-13': 'Kremikovtsi', 'sofia-14': 'Vrabnitsa'}
SOFIA_MINUTES = {'sofia-03': 360, 'sofia-09': 1500, 'sofia-12': 10080}
sensors = []
for s in atlas['sensors']:
    ref = s['type'] == 'reference-grade'
    pm10 = round(rng.uniform(15, 55), 1)
    rs = [reading('PM2.5', round(pm10 * rng.uniform(0.5, 0.75), 1), '1-hour average'), reading('PM10', pm10, '1-hour average')]
    if ref:
        rs += [reading('O₃', round(rng.uniform(20, 70), 1), '1-hour average'),
               reading('NO₂', round(rng.uniform(15, 60), 1), '1-hour average')]
        if s['id'] in ('sofia-01', 'sofia-04'):
            rs += [reading('SO₂', round(rng.uniform(4, 15), 1), '1-hour average'),
                   reading('CO', rng.randint(300, 900), '8-hour average')]
    sensors.append({
        'id': s['id'],
        'lngLat': s['lngLat'],
        'type': s['type'],
        'placed': s['placed'],
        'name': SOFIA_NAMES.get(s['id']),
        'location': SOFIA_PLACES.get(s['id']),
        'stationType': None,
        'overallBand': None,
        'updatedMinutesAgo': SOFIA_MINUTES.get(s['id'], rng.randint(4, 50)),
        'readings': rs,
    })
write('sofia', sensors, {'indexName': None})

# ── Milan ──────────────────────────────────────────────────────────────────────────────────────
rng = random.Random(45464)
stations = json.load(open(os.path.join(DATA, 'poster-stations', 'milan.json')))
MILAN_PLACES = ['Isola', 'Porta Venezia', 'Centro Storico', 'Città Studi', 'Navigli']
MILAN_MINUTES = [35, 50, 290, 42, 28]
sensors = []
for i, st in enumerate(stations['stations']):
    pm10 = round(rng.uniform(20, 45), 1)
    rs = [reading('PM2.5', round(pm10 * rng.uniform(0.6, 0.75), 1), '24-hour average'),
          reading('PM10', pm10, '24-hour average'),
          reading('NO₂', round(rng.uniform(25, 70), 1), '1-hour average')]
    if i in (1, 3):
        rs += [reading('O₃', round(rng.uniform(20, 60), 1), '1-hour average'), reading('CO', rng.randint(400, 1100), '8-hour average')]
    if i == 2:
        rs.append(reading('SO₂', round(rng.uniform(2, 8), 1), '1-hour average'))
    rs.sort(key=lambda r: ORDER.index(r['pollutant']))
    sensors.append({
        'id': f'milan-{i + 1:02d}',
        'lngLat': st['lngLat'],
        'type': 'reference-grade',
        'placed': False,
        'name': None,
        'location': MILAN_PLACES[i],
        'stationType': None,
        'overallBand': None,
        'updatedMinutesAgo': MILAN_MINUTES[i],
        'readings': rs,
    })
write('milan', sensors, {'indexName': None, 'positionSource': stations['positionSource']})
