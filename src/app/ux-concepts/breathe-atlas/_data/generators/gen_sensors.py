#!/usr/bin/env python3
"""Build the Breathe Atlas mock sensor files (brief section 7).

Locations
  Official networks only, from a one-off OpenAQ v3 /locations snapshot taken on 2026-09-17
  (scratchpad/openaq/*.json). Per city, ONE named official provider is allowed through and every
  community, embassy, university and other third-party feed is excluded by name. Jakarta takes
  NOTHING from OpenAQ (brief section 7, Jack 2026-09-17): its locations are all placed.
  Every location must also fall inside the city's simplified OSM boundary, which drops
  metro-area stations that sit outside the city itself.

Readings
  Invented (brief section 7). Deterministic: generated once here with a fixed seed and written out
  as literals, so the page renders the same numbers on the server and in the browser.

Output: _data/sensors/[city].json

FETCH (one-off, 2026-09-17)
  For the five cities that take real locations, with the repo's own OpenAQ key (server-side only,
  from .env.local; never committed):
    https://api.openaq.org/v3/locations?bbox=<minLon,minLat,maxLon,maxLat>&limit=1000
    with header X-API-Key: $OPENAQ_API_KEY
  bboxes are the ones in src/lib/openaq/cities.ts. Saved as <snapshot-dir>/openaq/[city].json.
  Jakarta is NOT fetched (see below).
"""
import json
import os
import random
import sys

# Paths are resolved from this file's location and from the command line, never hardcoded to one
# machine (pool portability). Usage:
#   python3 _data/generators/gen_sensors.py <content-pack.json> <snapshot-dir>
# <snapshot-dir> holds the one-off upstream responses (see the FETCH note above); they are not
# committed, because they are large and re-fetchable with the queries recorded here.
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)

SCRATCH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'snapshot')
PACK = sys.argv[1]

PM_UNIT = 'µg/m³'
CO_UNIT = 'mg/m³'

# Per city: the tier, which OpenAQ providers count as the city's own or the official national
# network, how many official stations to keep, and how many low-cost sensors to place.
CITY_PLAN = {
    'bogota': {
        'tier': 4,
        'providers': ['Bogota'],
        'providerNote': (
            "OpenAQ provider 'Bogota' is the city's own network, RMCAB, run by the Secretaría "
            "Distrital de Ambiente. Excluded: 'StateAir Bogota' and the US Diplomatic Post "
            "(United States embassy monitors) and AirGradient (private and community sensors)."
        ),
        'maxReference': 16,
        'placedLowCost': 8,
        'lowCostNote': (
            "Bogotá runs a Collaborative Microsensor Network (in the chapter's programme list), but "
            "no public location list was used, so the low-cost sensors are PLACED inside the city "
            "boundary and marked placed: true."
        ),
    },
    'jakarta': {
        'tier': 2,
        'providers': [],
        'providerNote': (
            "NOTHING is taken from OpenAQ or any third party (brief section 7, Jack 2026-09-17): "
            "Jakarta is sensitive about its data being shown outside its own control. Jakarta "
            "publishes its SPKU station list on udara.jakarta.go.id, which was not scraped, so "
            "every Jakarta location here is PLACED inside the city boundary and marked placed: true."
        ),
        'placedReference': 8,
        'placedLowCost': 8,
        'lowCostNote': 'All Jakarta locations are placed (see above).',
    },
    'johannesburg': {
        'tier': 4,
        'providers': ['South Africa'],
        'providerNote': (
            "OpenAQ provider 'South Africa' is the national SAAQIS network (the -NAQI stations), "
            "which is the official source for Johannesburg: the city publishes no network of its "
            "own. Excluded: AirGradient (private and community sensors)."
        ),
        'maxReference': 12,
        'placedLowCost': 6,
        'lowCostNote': 'No public city low-cost network was used; these are PLACED (placed: true).',
    },
    'mexico-city': {
        'tier': 3,
        'providers': ['Sinaica Mexico'],
        'providerNote': (
            "OpenAQ provider 'Sinaica Mexico' is SINAICA, the Mexican government's national air "
            "quality information system, which carries Mexico City's own SIMAT stations. Excluded: "
            "'AirNow' (a United States feed), 'SPARTAN Network' (a university research network) and "
            "AirGradient (private and community sensors)."
        ),
        'maxReference': 16,
        'placedLowCost': 6,
        'lowCostNote': 'No public city low-cost network was used; these are PLACED (placed: true).',
    },
    'sofia': {
        'tier': 4,
        'providers': ['EEA'],
        'providerNote': (
            "OpenAQ provider 'EEA' carries Bulgaria's official automatic measuring stations (the "
            "AMS stations) as reported to the European Environment Agency. Excluded: 'senstate' "
            "(a community network) and AirGradient (private and community sensors)."
        ),
        'maxReference': 10,
        'placedLowCost': 8,
        'lowCostNote': 'No public city low-cost network was used; these are PLACED (placed: true).',
    },
    'warsaw': {
        'tier': 4,
        'providers': ['EEA', 'Poland', 'GIOS'],
        'providerNote': (
            "OpenAQ providers 'GIOS', 'Poland' and 'EEA' are all the same official source: the "
            "Chief Inspectorate of Environmental Protection's network, reaching OpenAQ by three "
            "routes. Duplicates of one physical station are removed by position. Excluded: "
            "AirGradient (private and community sensors)."
        ),
        'maxReference': 10,
        'placedLowCost': 6,
        'lowCostNote': 'No public city low-cost network was used; these are PLACED (placed: true).',
    },
}

# Names that are never an official city or national station, whatever the provider says.
NAME_EXCLUSIONS = ['US Diplomatic Post', 'StateAir']

# PM2.5 ranges per index band. Band 1 is the index's best level, band 2 one step above it, band 3
# two steps above (where these indexes' own advice starts to single out sensitive groups).
PM25_BANDS = {1: (4.0, 11.0), 2: (15.0, 22.0), 3: (27.0, 34.0)}
# Mexico City is tier 3 and reads low throughout (brief section 7).
PM25_LOW = (4.0, 9.0)


def point_in_ring(point, ring):
    x, y = point
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > y) != (y2 > y):
            t = (y - y1) / (y2 - y1)
            if x < x1 + t * (x2 - x1):
                inside = not inside
    return inside


def inside_boundary(point, rings):
    return any(point_in_ring(point, ring) for ring in rings)


def far_enough(point, taken, minimum):
    return all(((point[0] - x) ** 2 + (point[1] - y) ** 2) ** 0.5 >= minimum for x, y in taken)


def official_locations(city, plan, rings):
    """The official stations from the snapshot: provider allow-list, real monitors only, inside the
    city boundary, de-duplicated by position, capped."""
    if not plan['providers']:
        return []
    raw = json.load(open(f'{SCRATCH}/openaq/{city}.json'))['results']
    kept, seen = [], set()
    for record in sorted(raw, key=lambda r: r['id']):
        if record['provider']['name'] not in plan['providers']:
            continue
        if not record['isMonitor']:
            continue
        if any(bad.lower() in record['name'].lower() for bad in NAME_EXCLUSIONS):
            continue
        point = (round(record['coordinates']['longitude'], 5), round(record['coordinates']['latitude'], 5))
        if not inside_boundary(point, rings):
            continue
        # One physical station can arrive through several providers: drop anything within ~110 m
        # of a station already kept.
        key = (round(point[0], 3), round(point[1], 3))
        if key in seen:
            continue
        seen.add(key)
        kept.append(
            {
                'lngLat': [point[0], point[1]],
                'type': 'reference-grade',
                'placed': False,
                'openaqLocationId': record['id'],
                'openaqName': record['name'],
                'openaqProvider': record['provider']['name'],
            }
        )
    return kept[: plan['maxReference']]


def placed_locations(rng, count, sensor_type, rings, bbox, taken):
    """Plausible locations inside the city boundary, at least ~1.3 km from any other sensor."""
    out = []
    minimum = 0.012
    attempts = 0
    while len(out) < count and attempts < 20000:
        attempts += 1
        point = (
            round(rng.uniform(bbox[0], bbox[2]), 4),
            round(rng.uniform(bbox[1], bbox[3]), 4),
        )
        if not inside_boundary(point, rings):
            continue
        if not far_enough(point, taken, minimum):
            continue
        taken.append(point)
        out.append(
            {
                'lngLat': [point[0], point[1]],
                'type': sensor_type,
                'placed': True,
                'openaqLocationId': None,
                'openaqName': None,
                'openaqProvider': None,
            }
        )
    if len(out) < count:
        raise RuntimeError(f'could only place {len(out)} of {count} sensors')
    return out


def readings_for(rng, sensor, band, tier):
    """Invented readings (brief section 7). Low-cost sensors measure PM2.5 and PM10; reference-grade
    stations add NO2 and ozone, and some add SO2 and CO. PM10 is always at or above PM2.5."""
    if tier == 2:
        # Tier 2 shares locations only: no readings exist to show.
        return []
    low, high = PM25_LOW if tier == 3 else PM25_BANDS[band]
    pm25 = round(rng.uniform(low, high), 1)
    pm10 = round(pm25 * rng.uniform(1.6, 2.2), 1)
    out = [
        {'pollutant': 'PM2.5', 'value': pm25, 'unit': PM_UNIT},
        {'pollutant': 'PM10', 'value': pm10, 'unit': PM_UNIT},
    ]
    if sensor['type'] == 'reference-grade':
        out.append({'pollutant': 'NO₂', 'value': round(rng.uniform(6, 28), 1), 'unit': PM_UNIT})
        out.append({'pollutant': 'O₃', 'value': round(rng.uniform(18, 55), 1), 'unit': PM_UNIT})
        if rng.random() < 0.4:
            out.append({'pollutant': 'SO₂', 'value': round(rng.uniform(2, 7), 1), 'unit': PM_UNIT})
            out.append({'pollutant': 'CO', 'value': round(rng.uniform(0.3, 0.9), 1), 'unit': CO_UNIT})
    return out


pack = json.load(open(PACK))
pack_cities = {c['id']: c for c in pack['cities']}

for city, plan in CITY_PLAN.items():
    boundary = json.load(open(f'{DATA}/boundaries/{city}.json'))
    rings = boundary['rings']
    bbox = boundary['bbox']
    rng = random.Random(f'breathe-atlas-{city}')

    reference = official_locations(city, plan, rings)
    taken = [tuple(s['lngLat']) for s in reference]
    if 'placedReference' in plan:
        reference += placed_locations(rng, plan['placedReference'], 'reference-grade', rings, bbox, taken)
    low_cost = placed_locations(rng, plan['placedLowCost'], 'low-cost', rings, bbox, taken)

    sensors = reference + low_cost
    tier = plan['tier']

    # Exactly one moderate and one sensitive-groups sensor per tier-4 city (brief section 7).
    # Which two is deterministic: a third and two thirds of the way through the list, so one is a
    # reference-grade station and one a low-cost sensor.
    bands = [1] * len(sensors)
    moderate_index = sensitive_index = None
    if tier == 4:
        moderate_index = len(sensors) // 3
        sensitive_index = (len(sensors) * 2) // 3
        bands[moderate_index] = 2
        bands[sensitive_index] = 3

    for position, sensor in enumerate(sensors):
        sensor['id'] = f'{city}-{position + 1:02d}'
        sensor['band'] = bands[position] if tier == 4 else None
        sensor['updatedMinutesAgo'] = rng.randint(2, 10)
        sensor['readings'] = readings_for(rng, sensor, bands[position], tier)

    # Keep the file in a stable order: reference-grade first, then low-cost, both already sorted.
    index = pack_cities[city].get('airQualityIndex')
    payload = {
        '_note': (
            'Mock sensors for the Breathe Atlas data map (brief section 7). LOCATIONS: see '
            'locationSource. READINGS: invented, see readingsNote. Generated once on 2026-09-17; '
            'regenerate rather than hand-edit.'
        ),
        'city': city,
        'tier': tier,
        'locationSource': plan['providerNote'] + ' ' + plan['lowCostNote'],
        'locationSnapshot': (
            'OpenAQ v3 GET /locations?bbox=... , taken 2026-09-17, then filtered as described above '
            "and to points inside the city's OSM boundary."
            if plan['providers']
            else 'No third-party source was used.'
        ),
        'readingsNote': (
            'Readings are INVENTED for the prototype and are not a measurement of anything. The air '
            'reads relatively clean: every sensor sits at the best level of the city\'s own index '
            'except one moderate sensor and one sensitive-groups sensor (brief section 7). PM10 is '
            'always at or above PM2.5. Nothing is stale or offline: every sensor updated 2 to 10 '
            'minutes ago.'
            if tier == 4
            else (
                'Readings are INVENTED for the prototype and are not a measurement of anything. '
                'Mexico City reads low throughout (brief section 7). PM10 is always at or above '
                'PM2.5. Nothing is stale or offline.'
                if tier == 3
                else 'No readings: this city shares sensor locations only (illustrative tier 2).'
            )
        ),
        'indexName': index['name'] if index is not None else None,
        'sensors': sensors,
    }
    with open(f'{DATA}/sensors/{city}.json', 'w') as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)
        fh.write('\n')

    counts = {
        'reference-grade': sum(1 for s in sensors if s['type'] == 'reference-grade'),
        'low-cost': sum(1 for s in sensors if s['type'] == 'low-cost'),
        'placed': sum(1 for s in sensors if s['placed']),
        'snapshot': sum(1 for s in sensors if not s['placed']),
    }
    moderate = sensors[moderate_index]['id'] if moderate_index is not None else '-'
    sensitive = sensors[sensitive_index]['id'] if sensitive_index is not None else '-'
    print(
        '%-13s tier %d  total %2d  ref %2d  low %2d  snapshot %2d  placed %2d  moderate %s  sensitive %s'
        % (city, tier, len(sensors), counts['reference-grade'], counts['low-cost'], counts['snapshot'], counts['placed'], moderate, sensitive)
    )
