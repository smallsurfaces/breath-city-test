#!/usr/bin/env python3
"""Simplify the OpenStreetMap administrative boundaries into the concept's static boundary files.

Input:  the Nominatim `polygon_geojson` responses in <snapshot-dir>/osm/.
Output: _data/boundaries/[city].json — one simplified outline per data city, with its OSM relation
        id and the ODbL attribution the map must show.

FETCH (one-off, 2026-09-17, approved public data fetch)
  For each city, with a descriptive User-Agent and at most one request a second:
    https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=3&q=<city>
  Saved as <snapshot-dir>/osm/[city].json. Queries used:
    bogota       q=Bogotá, Colombia
    jakarta      q=Daerah Khusus Ibukota Jakarta, Indonesia
    johannesburg q=City of Johannesburg Metropolitan Municipality, South Africa
    mexico-city  q=Ciudad de México, Mexico
    sofia        q=Sofia, Bulgaria
    warsaw       q=Warszawa, Poland
  PICK below records which returned relation was used, and why.

  Attribution: OpenStreetMap data is © OpenStreetMap contributors, ODbL. The map must show it.
"""
import json
import os
import sys

# Paths are resolved from this file's location and from the command line, never hardcoded to one
# machine (pool portability). Usage:
#   python3 _data/generators/gen_boundaries.py <content-pack.json> <snapshot-dir>
# <snapshot-dir> holds the one-off upstream responses (see the FETCH note above); they are not
# committed, because they are large and re-fetchable with the queries recorded here.
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)

SCRATCH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'snapshot')
OUT = os.path.join(DATA, 'boundaries')

# Which Nominatim result to use per city, and what it is. Chosen by inspecting the candidates.
PICK = {
    'bogota': (7426387, 'Bogotá ciudad (the urban district, not the rural Sumapaz area)'),
    'jakarta': (6362934, 'Daerah Khusus Ibukota Jakarta (the province; includes the Thousand Islands to the north)'),
    'johannesburg': (594508, 'City of Johannesburg Metropolitan Municipality'),
    'mexico-city': (1376330, 'Ciudad de México (the federal entity)'),
    'sofia': (4283101, 'София / Sofia city'),
    'warsaw': (336075, 'Warszawa (the city gmina)'),
}

# Simplification tolerance in degrees, per city, tuned to keep the outline honest at city zoom
# while keeping the file small. 0.001 degrees is roughly 100 m.
TOLERANCE = 0.0012
# Rings smaller than this (square degrees) are dropped: islands and slivers that read as noise.
MIN_RING_AREA = 2e-5
# Coordinate precision: 4 decimals is about 11 m, finer than the simplification tolerance.
PRECISION = 4


def perpendicular_distance(point, start, end):
    (px, py), (x1, y1), (x2, y2) = point, start, end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return ((px - x1) ** 2 + (py - y1) ** 2) ** 0.5
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return ((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2) ** 0.5


def simplify(points, tolerance):
    """Douglas-Peucker, iterative so a long ring cannot blow the recursion limit."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        worst, worst_index = 0.0, None
        for i in range(first + 1, last):
            d = perpendicular_distance(points[i], points[first], points[last])
            if d > worst:
                worst, worst_index = d, i
        if worst_index is not None and worst > tolerance:
            keep[worst_index] = True
            stack.append((first, worst_index))
            stack.append((worst_index, last))
    return [p for p, k in zip(points, keep) if k]


def ring_area(ring):
    """Absolute shoelace area in square degrees (only used to compare rings)."""
    total = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        total += x1 * y2 - x2 * y1
    return abs(total) / 2


def rings_of(geometry):
    """Every polygon's OUTER ring. Interior rings (lakes, enclaves) are dropped: the mask only
    needs the outline, and a hole inside a hole reads as a rendering fault at this fidelity."""
    if geometry['type'] == 'Polygon':
        return [geometry['coordinates'][0]]
    return [polygon[0] for polygon in geometry['coordinates']]


summary = []
for city, (osm_id, what) in PICK.items():
    results = json.load(open(f'{SCRATCH}/osm/{city}.json'))
    match = next(r for r in results if r['osm_id'] == osm_id)
    raw_rings = rings_of(match['geojson'])
    raw_points = sum(len(r) for r in raw_rings)

    kept = []
    for ring in raw_rings:
        if ring_area(ring) < MIN_RING_AREA:
            continue
        points = [(round(x, PRECISION), round(y, PRECISION)) for x, y in simplify([tuple(c) for c in ring], TOLERANCE)]
        # De-duplicate points that rounding collapsed, and close the ring.
        deduped = [points[0]]
        for p in points[1:]:
            if p != deduped[-1]:
                deduped.append(p)
        if deduped[0] != deduped[-1]:
            deduped.append(deduped[0])
        if len(deduped) >= 4:
            kept.append(deduped)
    kept.sort(key=ring_area, reverse=True)

    xs = [x for ring in kept for x, _ in ring]
    ys = [y for ring in kept for _, y in ring]
    payload = {
        '_note': (
            'City administrative boundary, simplified for the Breathe Atlas data map (brief 6.1). '
            'Fetched once from the OpenStreetMap Nominatim search API on 2026-09-17 with '
            'polygon_geojson=1, then simplified with Douglas-Peucker at '
            f'{TOLERANCE} degrees (about 130 m) and rounded to {PRECISION} decimals. Outer rings only: '
            'interior rings and rings under 2e-5 square degrees were dropped. Do not hand-edit; '
            're-fetch and re-simplify instead.'
        ),
        'city': city,
        'osmType': 'relation',
        'osmId': osm_id,
        'osmName': match['display_name'],
        'what': what,
        'fetchedOn': '2026-09-17',
        'licence': 'Open Database License (ODbL)',
        'attribution': '© OpenStreetMap contributors',
        'bbox': [min(xs), min(ys), max(xs), max(ys)],
        'rings': [[list(p) for p in ring] for ring in kept],
    }
    with open(f'{OUT}/{city}.json', 'w') as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(',', ':'), indent=None)
        fh.write('\n')
    summary.append((city, len(raw_rings), raw_points, len(kept), sum(len(r) for r in kept)))

for row in summary:
    print('%-14s rings %2d -> %2d   points %6d -> %4d' % (row[0], row[1], row[3], row[2], row[4]))
