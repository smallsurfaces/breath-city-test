#!/usr/bin/env python3
"""Reduce the five city posters to their MAJOR roads (round 3 decision K, 2026-10-25).

Decision K: the city cards show the city's outline and major roads only, greyscale, no sensor dots
or pulses (the dense dots read as bad air). Road classes kept: OpenStreetMap highway=motorway,
trunk and primary. Secondary and tertiary streets are removed.

Why a post-pass rather than a re-run of gen_posters.py: its Overpass road snapshots are not
committed (large, re-fetchable) and Overpass was at capacity on 2026-10-25. gen_posters.py writes
ONE path per road class with a class-specific stroke width (CLASSES there: motorway and trunk 5.0,
primary 3.6, secondary 2.6, tertiary 1.8; the outline is 4.0), so the classes can be removed from
the existing SVGs exactly, by those widths. gen_posters.py's CLASSES now lists the major classes
only, so a future re-run produces the same result directly.

Also raises the kept roads' opacity slightly (motorway/trunk 0.55 -> 0.7, primary 0.45 -> 0.55),
because the cards now crop the poster to cover the whole image area.

Source and licence: OpenStreetMap, (c) OpenStreetMap contributors, ODbL (credited on the cards).

Usage: python3 _data/generators/gen_posters_major_roads.py   (idempotent)
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..', '..'))
POSTERS = os.path.join(REPO, 'public', 'ux-concepts', 'breathe-data-atlas', 'posters')

for city in ['bogota', 'jakarta', 'brussels', 'sofia', 'milan']:
    path = os.path.join(POSTERS, f'{city}.svg')
    svg = open(path).read()
    before = len(svg)
    # Drop secondary (2.6) and tertiary (1.8) street paths.
    svg = re.sub(r'<path d="[^"]*" stroke-width="(?:2\.6|1\.8)" stroke-opacity="[0-9.]+"/>', '', svg)
    svg = svg.replace('stroke-width="5.0" stroke-opacity="0.55"', 'stroke-width="5.0" stroke-opacity="0.7"')
    svg = svg.replace('stroke-width="3.6" stroke-opacity="0.45"', 'stroke-width="3.6" stroke-opacity="0.55"')
    with open(path, 'w') as fh:
        fh.write(svg)
    print('%-9s %7d -> %7d bytes' % (city, before, len(svg)))
