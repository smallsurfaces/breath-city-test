#!/usr/bin/env python3
"""Generate the Breathe Data Atlas poster maps (spec 3.1): one greyscale poster per prototype city,
plus one abstract placeholder for every other city.

What it writes
  public/ux-concepts/breathe-data-atlas/posters/[city].svg
      The city's administrative outline (a faint land fill and a line) and its major streets,
      clipped to the outline. Pure black at varying opacity: the card uses the file as a CSS MASK
      over a BC token colour, so the colour on screen is always a token, never a literal here.
  public/ux-concepts/breathe-data-atlas/posters/placeholder.svg
      An abstract grey street texture. No outline, no stations, and generated from a seeded random
      grid, so it cannot be mistaken for any real place or network (spec 3.1).
  _data/posters.json
      Per city: the poster's viewBox size and the station positions in the same viewBox units, so the
      card can lay its pulse layer exactly over the mask. Positions are never shown as numbers.

Inputs
  _data/boundaries/[city].json        outlines (OpenStreetMap, ODbL; see gen_boundaries.py)
  _data/sensors/[city].json           real station positions: ONLY entries with placed: false
  _data/poster-stations/[city].json   approximate positions read from the city's own map (Jakarta,
                                      Brussels, Milan), recorded with their positionSource
  <snapshot-dir>/roads/[city].json    Overpass API responses (not committed; re-fetchable):
      [out:json][timeout:180];way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](bbox);out geom;
      fetched 2026-10-25 from overpass-api.de with these bboxes (south,west,north,east):
        bogota   4.48,-74.23,4.84,-74.01      jakarta  -6.38,106.68,-6.08,106.98
        brussels 50.76,4.24,50.92,4.49        sofia    42.55,23.16,42.87,23.63
        milan    45.38,9.04,45.54,9.28
  Streets are OpenStreetMap data, (c) OpenStreetMap contributors, ODbL: the card's "i" credit says so.

Usage
  python3 _data/generators/gen_posters.py <snapshot-dir>
Paths resolve from this file's location (pool portability); nothing is machine-specific.
"""
import json
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(DATA, '..', '..', '..', '..', '..'))
OUT_SVG = os.path.join(REPO, 'public', 'ux-concepts', 'breathe-data-atlas', 'posters')
OUT_JSON = os.path.join(DATA, 'posters.json')
SNAPSHOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'snapshot')

CITIES = ['bogota', 'jakarta', 'brussels', 'sofia', 'milan']
# Where each city's stations come from: the Atlas sensor file (real positions only) or the
# approximate file read from the city's own map.
STATION_SOURCE = {
    'bogota': 'sensors', 'sofia': 'sensors',
    'jakarta': 'poster-stations', 'brussels': 'poster-stations', 'milan': 'poster-stations',
}
# Jakarta's province ring wraps the sea out to the Thousand Islands. The poster keeps the mainland:
# ring vertices 7 to 185 (the land boundary), closed with a straight line along the north. Recorded
# here so the cut is never mistaken for a coastline.
RING_SLICE = {'jakarta': (7, 186)}

LONG_SIDE = 1000.0           # viewBox units on the poster's longer side
SIMPLIFY = 0.9               # Douglas-Peucker tolerance, viewBox units
# Street classes: (stroke width, opacity) in viewBox units. Thin and faint: texture, not a road map.
CLASSES = {
    'motorway': (5.0, 0.55), 'trunk': (5.0, 0.55),
    'primary': (3.6, 0.45), 'secondary': (2.6, 0.36), 'tertiary': (1.8, 0.26),
}
LAND_OPACITY = 0.07
OUTLINE_WIDTH = 4.0
OUTLINE_OPACITY = 0.75
# How many pulses the small globe card shows (spec 3.1: "a handful of pulses taken from the real
# positions" when every station would turn to texture). Chosen spread out, deterministically.
GLOBE_PULSES = 7


def simplify(points, tol):
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = points[a], points[b]
        dx, dy = x2 - x1, y2 - y1
        worst, wi = 0.0, None
        for i in range(a + 1, b):
            px, py = points[i]
            if dx == 0 and dy == 0:
                d = math.hypot(px - x1, py - y1)
            else:
                t = max(0.0, min(1.0, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
                d = math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
            if d > worst:
                worst, wi = d, i
        if wi is not None and worst > tol:
            keep[wi] = True
            stack.append((a, wi))
            stack.append((wi, b))
    return [p for p, k in zip(points, keep) if k]


def inside(pt, ring):
    x, y = pt
    hit = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            hit = not hit
        j = i
    return hit


def fmt(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def path_d(lines):
    parts = []
    for line in lines:
        parts.append('M' + ' '.join(fmt(x) + ',' + fmt(y) for x, y in line))
    return ''.join(parts)


def rings_for(city):
    data = json.load(open(os.path.join(DATA, 'boundaries', f'{city}.json')))
    rings = [[tuple(p) for p in ring] for ring in data['rings']]
    if city in RING_SLICE:
        a, b = RING_SLICE[city]
        main = rings[0][a:b]
        rings = [main + [main[0]]]
    return rings


def stations_for(city):
    if STATION_SOURCE[city] == 'sensors':
        data = json.load(open(os.path.join(DATA, 'sensors', f'{city}.json')))
        return [tuple(s['lngLat']) for s in data['sensors'] if s['placed'] is False]
    data = json.load(open(os.path.join(DATA, 'poster-stations', f'{city}.json')))
    return [tuple(s['lngLat']) for s in data['stations']]


def spread_pick(points, count):
    """Pick `count` points spread across the set: farthest-point sampling from the centroid."""
    if len(points) <= count:
        return list(range(len(points)))
    cx = sum(p[0] for p in points) / len(points)
    cy = sum(p[1] for p in points) / len(points)
    first = min(range(len(points)), key=lambda i: math.hypot(points[i][0] - cx, points[i][1] - cy))
    chosen = [first]
    while len(chosen) < count:
        best = max(
            (i for i in range(len(points)) if i not in chosen),
            key=lambda i: min(math.hypot(points[i][0] - points[c][0], points[i][1] - points[c][1]) for c in chosen),
        )
        chosen.append(best)
    return sorted(chosen)


def build_city(city):
    rings = rings_for(city)
    lngs = [p[0] for r in rings for p in r]
    lats = [p[1] for r in rings for p in r]
    west, east, south, north = min(lngs), max(lngs), min(lats), max(lats)
    k = math.cos(math.radians((south + north) / 2))
    span_x = (east - west) * k
    span_y = north - south
    scale = LONG_SIDE / max(span_x, span_y)
    width, height = span_x * scale, span_y * scale

    def proj(lng, lat):
        return ((lng - west) * k * scale, (north - lat) * scale)

    prings = [[proj(*p) for p in ring] for ring in rings]

    def in_city(lnglat):
        return any(inside(lnglat, ring) for ring in rings)

    # Streets: ways with any sampled vertex inside the outline, simplified per class.
    roads = json.load(open(os.path.join(SNAPSHOT, 'roads', f'{city}.json')))
    by_class = {name: [] for name in CLASSES}
    for el in roads.get('elements', []):
        hw = el.get('tags', {}).get('highway')
        if hw not in CLASSES or 'geometry' not in el:
            continue
        pts = [(g['lon'], g['lat']) for g in el['geometry']]
        if not any(in_city(p) for p in pts[::4] + [pts[-1]]):
            continue
        line = simplify([proj(*p) for p in pts], SIMPLIFY)
        if len(line) >= 2:
            by_class[hw].append(line)

    clip = 'M' + 'Z M'.join(' '.join(fmt(x) + ',' + fmt(y) for x, y in r) for r in prings) + 'Z'
    groups = []
    for name, (w, o) in CLASSES.items():
        if by_class[name]:
            groups.append(
                f'<path d="{path_d(by_class[name])}" stroke-width="{w}" stroke-opacity="{o}"/>'
            )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(width)} {fmt(height)}">'
        f'<defs><clipPath id="c"><path d="{clip}"/></clipPath></defs>'
        f'<path d="{clip}" fill="#000" fill-opacity="{LAND_OPACITY}"/>'
        f'<g clip-path="url(#c)" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">'
        + ''.join(groups) +
        '</g>'
        f'<path d="{clip}" fill="none" stroke="#000" stroke-width="{OUTLINE_WIDTH}" stroke-opacity="{OUTLINE_OPACITY}" stroke-linejoin="round"/>'
        '</svg>\n'
    )
    with open(os.path.join(OUT_SVG, f'{city}.svg'), 'w') as fh:
        fh.write(svg)

    # Stations clipped to the outline (spec 3.1).
    raw = stations_for(city)
    kept = [p for p in raw if in_city(p)]
    projected = [[round(x, 1), round(y, 1)] for x, y in (proj(*p) for p in kept)]
    globe = spread_pick(projected, GLOBE_PULSES)
    print('%-9s viewBox %4d x %4d  streets %5d  stations %3d of %3d  svg %6d bytes' % (
        city, width, height, sum(len(v) for v in by_class.values()), len(kept), len(raw), len(svg)))
    return {
        'viewBox': [round(width, 1), round(height, 1)],
        'stations': projected,
        'globeStations': globe,
    }


def build_placeholder():
    """Abstract street texture: a jittered grid of short local streets plus a few long curves.
    Seeded, so the file is stable; no outline and no dots (spec 3.1)."""
    rng = random.Random(20261025)
    width = height = LONG_SIDE
    lines = []
    step = 46
    for gx in range(0, int(width) + step, step):
        for gy in range(0, int(height) + step, step):
            if rng.random() < 0.55:
                x = gx + rng.uniform(-8, 8)
                lines.append([(x, gy + rng.uniform(-6, 6)), (x + rng.uniform(-6, 6), gy + step + rng.uniform(-6, 6))])
            if rng.random() < 0.55:
                y = gy + rng.uniform(-8, 8)
                lines.append([(gx + rng.uniform(-6, 6), y), (gx + step + rng.uniform(-6, 6), y + rng.uniform(-6, 6))])
    curves = []
    for _ in range(5):
        x0, y0 = rng.uniform(0, width), 0
        pts = []
        for i in range(12):
            pts.append((x0 + 120 * math.sin(i / 2.0 + rng.uniform(0, 1)), y0 + i * height / 11))
        curves.append(pts)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(width)} {int(height)}">'
        '<g fill="none" stroke="#000" stroke-linecap="round">'
        f'<path d="{path_d(lines)}" stroke-width="2.4" stroke-opacity="0.22"/>'
        f'<path d="{path_d(curves)}" stroke-width="4.5" stroke-opacity="0.32"/>'
        '</g></svg>\n'
    )
    with open(os.path.join(OUT_SVG, 'placeholder.svg'), 'w') as fh:
        fh.write(svg)
    print('placeholder svg %d bytes' % len(svg))


os.makedirs(OUT_SVG, exist_ok=True)
posters = {city: build_city(city) for city in CITIES}
build_placeholder()
with open(OUT_JSON, 'w') as fh:
    json.dump({
        '_note': 'Generated by _data/generators/gen_posters.py on 2026-10-25. Poster viewBox sizes and '
                 'station positions in viewBox units (never shown as numbers). Do not hand-edit.',
        'posters': posters,
    }, fh, separators=(',', ':'))
    fh.write('\n')
