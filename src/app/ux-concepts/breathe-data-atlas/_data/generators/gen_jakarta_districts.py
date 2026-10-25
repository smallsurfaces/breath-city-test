#!/usr/bin/env python3
"""Generate Jakarta's district (kecamatan) layer for the Breathe Data Atlas Jakarta page
(SPEC ADDENDUM, Jakarta: "districts shaded lightly in their ISPU band colour").

NOT SHOWN since 2026-10-25: Jakarta uses the station method (Udara Jakarta publishes ISPU per
station). The file is kept, unused by the page, for a possible forecast view; the sensor generator
still reads it for the mock locality labels.

Output: _data/areas/jakarta-districts.json

What is real and what is not
  BOUNDARIES are OpenStreetMap's kecamatan relations (admin_level 6), same source, simplification
  method and ODbL credit as the city outline (./gen_boundaries.py). The city's own layer (provincial
  GIS server, 'Batas Administrasi', listed in jakarta-place-layers.csv) is for the real build.
  BANDS ARE MOCK: one ISPU band per district, "as if the city fed it". Never computed from readings.
  At least one district has NO band (null): no shading, and its card says "No ISPU level reported".
  The two Kepulauan Seribu (Thousand Islands) districts are left out: offshore, no stations on file.

FETCH (one-off, 2026-10-25, approved public data fetch)
  Overpass was at capacity, so each of the 42 mainland kecamatan was fetched from Nominatim, one
  request every 1.2 s with a descriptive User-Agent:
    https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=10&q=<name>, <kota>, Indonesia
  saved as <snapshot-dir>/kec-<name>.json. PICK RULE: the boundary=administrative relation whose
  Nominatim addresstype is 'suburb' (Nominatim's label for admin_level 6 in Indonesia); where none is
  returned, the largest administrative relation polygon (recorded in the file as `pickedBy`).

Usage: python3 _data/generators/gen_jakarta_districts.py <snapshot-dir>
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)
SNAP = sys.argv[1]

TOLERANCE = 0.0006   # degrees, about 65 m: districts are small, so finer than the city outline
PRECISION = 4

# MOCK ISPU band per district (1 Baik/Good ... 5 Berbahaya/Hazardous). Mostly Moderate and
# Unhealthy, a few Good, one Very unhealthy; None = the city reported no band for that district.
BANDS = {
    'Gambir': 2, 'Sawah Besar': 2, 'Kemayoran': 3, 'Senen': 2, 'Cempaka Putih': 3, 'Menteng': 2,
    'Tanah Abang': 3, 'Johar Baru': 3,
    'Penjaringan': 3, 'Pademangan': 3, 'Tanjung Priok': 4, 'Koja': 3, 'Kelapa Gading': 2, 'Cilincing': 3,
    'Cengkareng': 3, 'Grogol Petamburan': 2, 'Taman Sari': 3, 'Tambora': 3, 'Kebon Jeruk': 2,
    'Kalideres': 3, 'Palmerah': 2, 'Kembangan': 2,
    'Tebet': 2, 'Setiabudi': 2, 'Mampang Prapatan': 2, 'Pasar Minggu': 2, 'Kebayoran Lama': 2,
    'Cilandak': 1, 'Kebayoran Baru': 3, 'Pancoran': 2, 'Jagakarsa': 1, 'Pesanggrahan': None,
    'Matraman': 2, 'Pulo Gadung': 3, 'Jatinegara': 2, 'Kramat Jati': 2, 'Pasar Rebo': 1, 'Cakung': 3,
    'Duren Sawit': 2, 'Makasar': 2, 'Ciracas': 1, 'Cipayung': 1,
}


def perp(p, a, b):
    (px, py), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return ((px - x1) ** 2 + (py - y1) ** 2) ** 0.5
    t = max(0.0, min(1.0, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
    return ((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2) ** 0.5


def simplify(points, tol):
    """Douglas-Peucker, iterative (same as gen_boundaries.py)."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        worst, wi = 0.0, None
        for i in range(a + 1, b):
            d = perp(points[i], points[a], points[b])
            if d > worst:
                worst, wi = d, i
        if wi is not None and worst > tol:
            keep[wi] = True
            stack += [(a, wi), (wi, b)]
    return [p for p, k in zip(points, keep) if k]


def area(ring):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]))) / 2


def outer_rings(geometry):
    if geometry['type'] == 'Polygon':
        return [geometry['coordinates'][0]]
    if geometry['type'] == 'MultiPolygon':
        return [poly[0] for poly in geometry['coordinates']]
    return []


districts = []
for fn in sorted(os.listdir(SNAP)):
    if not fn.startswith('kec-'):
        continue
    snap = json.load(open(os.path.join(SNAP, fn)))
    admin = [r for r in snap['results'] if r['osm_type'] == 'relation' and r['category'] == 'boundary'
             and r['geojson']['type'] in ('Polygon', 'MultiPolygon')]
    suburb = [r for r in admin if r.get('addresstype') == 'suburb']
    if suburb:
        pick, picked_by = suburb[0], 'addresstype suburb (admin_level 6)'
    elif admin:
        pick = max(admin, key=lambda r: sum(area(ring) for ring in outer_rings(r['geojson'])))
        picked_by = 'largest administrative relation (no suburb result)'
    else:
        print('NO POLYGON', snap['name'])
        continue
    rings = []
    for ring in outer_rings(pick['geojson']):
        if area(ring) < 2e-6:
            continue
        pts = [(round(x, PRECISION), round(y, PRECISION)) for x, y in simplify([tuple(c) for c in ring], TOLERANCE)]
        out = [pts[0]]
        for p in pts[1:]:
            if p != out[-1]:
                out.append(p)
        if out[0] != out[-1]:
            out.append(out[0])
        if len(out) >= 4:
            rings.append([list(p) for p in out])
    districts.append({
        'id': snap['name'].lower().replace(' ', '-'),
        'name': snap['name'],
        'kota': snap['kota'],
        'osmId': pick['osm_id'],
        'pickedBy': picked_by,
        'band': BANDS[snap['name']],
        'rings': rings,
    })
    print('%-18s %-10s %s rings=%d area=%.5f' % (snap['name'], pick.get('addresstype'), BANDS[snap['name']], len(rings), sum(area(r) for r in rings)))

payload = {
    '_note': ('Jakarta kecamatan (districts) for the Breathe Data Atlas Jakarta page. BOUNDARIES: OpenStreetMap '
              'relations via Nominatim, fetched 2026-10-25, simplified (Douglas-Peucker 0.0006 degrees). '
              'BANDS: MOCK ISPU levels, as if fed by the city; never computed. Generated by '
              '_data/generators/gen_jakarta_districts.py. Regenerate, do not hand-edit.'),
    'city': 'jakarta',
    'indexName': 'ISPU',
    'licence': 'Open Database License (ODbL)',
    'attribution': '© OpenStreetMap contributors',
    'districts': districts,
}
out = os.path.join(DATA, 'areas', 'jakarta-districts.json')
with open(out, 'w') as fh:
    json.dump(payload, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write('\n')
print('wrote', len(districts), 'districts,', os.path.getsize(out), 'bytes')
