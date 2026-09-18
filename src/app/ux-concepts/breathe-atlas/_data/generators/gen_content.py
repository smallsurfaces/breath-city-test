#!/usr/bin/env python3
"""Map the Breathe Atlas content pack onto the concept's typed data modules.

Run once (2026-09-17) to produce:
  _data/chapter-content.ts   per-city chapter content (types + CHAPTER_CONTENT)
  _data/indexes.ts           the four tier-4 cities' own air quality indexes
  mission-lines.txt          the 16 mission lines, for cities.ts

Honesty rules applied here (brief section 2, dispatch):
  - Nothing is invented. EVERY string comes from the pack JSON. Nothing is transcribed
    from the notes file, computed, rounded or re-derived.
  - People's names are never rendered, EXCEPT photographer credits, which the
    Unsplash licence attribution asks for and which are not claims about a city.
  - PLACEHOLDERS ARE ABSENT, NEVER DISPLAYED (brief section 2, added 2026-09-17; the
    pack's own meta.statusKey says the same). A pack item whose `status` is
    'placeholder', or whose `display` is null, is dropped HERE, at the generator, so
    it never reaches a typed data file and cannot reach a page. `candidateDisplay`
    is research, not display copy, and is never emitted. See omit() below.
  - Populations are each city's OWN administrative figure (Jack, 2026-09-17; brief
    5.3), read from `keyFacts.population` — see population() below.

Usage: python3 _data/generators/gen_content.py <content-pack.json>
"""
import json
import os
import re
import sys
from urllib.parse import urlparse

# Paths are resolved from this file's location and from the command line, never hardcoded to one
# machine (pool portability). Usage:
#   python3 _data/generators/gen_content.py <content-pack.json> <snapshot-dir>
# <snapshot-dir> holds the one-off upstream responses (see the FETCH note above); they are not
# committed, because they are large and re-fetchable with the queries recorded here.
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)

PACK = sys.argv[1]
OUT = DATA
SCRATCH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'snapshot')

# Cities whose FEATURE STORY uses the lead-photo layout. This set is a LAYOUT choice, hand-picked
# per city in _data/chapters.ts (brief 5.2), so it lives here and not in the pack. WHICH photo is
# the lead is a CONTENT question and is read from the pack — see lead_photo_index().
LEAD_PHOTO_CITIES = {'bogota', 'mexico-city'}

# Unsplash CDN images need sizing parameters to serve a sensible file (pack: hotlinkHint).
UNSPLASH_PARAMS = '?w=1600&q=80'

# ---------------------------------------------------------------------------------------------
# UNREACHABLE LINKS — omitted from the interface, kept in the pack (bug report 2026-09-17, BUG 7)
# ---------------------------------------------------------------------------------------------
# Two of Warsaw's own links answer nothing from here. The pack has them as `verified` on purpose:
# both are linked from the City of Warsaw's own pages (eko.um.warszawa.pl), so the RESEARCH is
# right and must not be deleted — the pack's `linkCheckNotes` and each link's `note` record the
# failure and say "confirm from Poland".
#
# RE-CHECKED 2026-09-18 from this machine, a desktop user agent, following redirects, 25s budget:
# both still time out with no response at all (curl exit 28, HTTP 000). Whether they are dead or
# GEO-BLOCKED cannot be told apart from here; the City links them, which points to geo-blocking,
# and they may well work from Poland. So the links are left OUT of the chapter rather than shown
# as working, and nothing is removed from the pack.
#
# To restore one: check it from a Polish connection, and delete its line below. Do not "fix" it by
# editing the pack — the pack is the research record, and this is a rendering decision about what
# our own checks can stand behind.
UNREACHABLE_URLS = {
    # Warsaw, Check today's air. Linked from https://eko.um.warszawa.pl/powietrze
    'https://iot.warszawa.pl/mapa?filter=air',
    # Warsaw, Get the data. Linked from https://eko.um.warszawa.pl/statystyki-i-dane-pomiarowe
    'https://api.um.warszawa.pl/',
}

pack = json.load(open(PACK))
cities = {c['id']: c for c in pack['cities']}
order = pack['chapterOrder']


def ts(value):
    """Render a Python value as TypeScript source."""
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, str):
        return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"
    if isinstance(value, list):
        return '[' + ', '.join(ts(v) for v in value) + ']'
    if isinstance(value, dict):
        return '{ ' + ', '.join(f'{k}: {ts(v)}' for k, v in value.items()) + ' }'
    raise TypeError(type(value))


def block(value, indent):
    """Render a dict/list across lines, for readability in the emitted file."""
    pad = ' ' * indent
    if isinstance(value, dict):
        if not value:
            return '{}'
        lines = [f'{pad}  {k}: {block(v, indent + 2)},' for k, v in value.items()]
        return '{\n' + '\n'.join(lines) + f'\n{pad}}}'
    if isinstance(value, list):
        if not value:
            return '[]'
        lines = [f'{pad}  {block(v, indent + 2)},' for v in value]
        return '[\n' + '\n'.join(lines) + f'\n{pad}]'
    return ts(value)


def host(url):
    """The source's domain, used as a link label (never a reconstructed page title)."""
    return re.sub(r'^www\.', '', urlparse(url).netloc)


def source_links(urls):
    """Pack `sources` are bare URLs. Label each by its domain; where a domain repeats,
    add the URL's own last path segment verbatim so the two entries are distinguishable."""
    seen = {}
    for url in urls:
        seen[host(url)] = seen.get(host(url), 0) + 1
    out = []
    for url in urls:
        h = host(url)
        if seen[h] > 1:
            segment = [s for s in urlparse(url).path.split('/') if s]
            label = f'{h} · {segment[-1]}' if segment else h
        else:
            label = h
        out.append({'label': label, 'url': url, 'status': 'verified'})
    return out


def omit(item):
    """True when a pack item must not reach the interface at all (brief section 2).

    Three conditions, any one of which is enough:
      - `status` is 'placeholder' — the pack could not confirm it,
      - `url` is in UNREACHABLE_URLS — verified research, but nothing answers it from here,
      - `display` is present and null — the pack withheld the value and parked its candidate
        in `candidateDisplay`, which is research and is never display copy.

    Dropped here rather than branched on at render time: a render-time branch is what produced
    the "Placeholder: ..." link label and the bracketed "[about 7.9 million]" figure this rule
    was written against. Nothing downstream can render what the data file does not carry.
    """
    if item.get('status') == 'placeholder':
        return True
    if item.get('url') in UNREACHABLE_URLS:
        return True
    return 'display' in item and item['display'] is None


def link(item):
    """A pack link block -> ChapterLink, or None where the item is omitted (see omit())."""
    if omit(item):
        return None
    return {'label': item['label'], 'url': item['url'], 'status': item['status']}


def links(items):
    """A list of pack link blocks -> ChapterLink[], with omitted items left out (no gap)."""
    return [mapped for mapped in (link(item) for item in items) if mapped is not None]


def image_url(item):
    """Hotlink URL. Unsplash CDN URLs get the pack's suggested sizing parameters."""
    url = item['imageUrl']
    if 'images.unsplash.com' in url and '?' not in url:
        return url + UNSPLASH_PARAMS
    return url


def photo(item):
    """A pack photo/landmark block -> ChapterPhoto.

    Pack field names (revised 2026-09-17): the image is `imageUrl`, its page is `sourcePage`, and
    every photo now also carries `shape`, `watermark` and `watermarkCheck`. `credit` is the visible
    line; `creditNote` beside it is the pack's internal provenance ("Stock image used by Breathe
    Cities (iStock, per the file name). Photographer not named.") and is deliberately NOT emitted —
    the caption shows the credit the licence asks for, and nothing that reads as a hedge over it.
    `shape` and `watermark` are read by lead_photo_index() and are likewise not emitted, so every
    field in the generated file is one the interface renders.
    """
    return {
        'src': image_url(item),
        'alt': item['alt'],
        'credit': item['credit'],
        'sourceUrl': item['sourcePage'],
        'status': item['status'],
    }


def lead_photo_index(city_id, shown):
    """Which of the city's SHOWN photos is the feature story's lead, read from the PACK.

    The lead sits full width above the story, so it has to be one of the pack's `shape: 'rectangle'`
    photos: a portrait or a circle crop stretched across the story reads as a mistake. It also has
    to be clean, so `watermark` must be false — a burned-in credit under a caption that names
    someone else is exactly the contradiction the pack's watermark check was run to remove.

    The first photo in the pack's own order that satisfies both is the lead. NO FIXED INDEX: the
    photo sets were rebuilt on 2026-09-17 and the counts now differ per city (Bogotá 4, Jakarta 4,
    Johannesburg 4, Mexico City 4, Milan 5, Sofia 5, Warsaw 4), so a hardcoded position silently
    picks a different picture every time the pack changes. This reads the explicit `shape` and
    `watermark` fields instead (concept-prototyping §10d: derive from explicit fields, never from
    names or file paths).

    Raises rather than falling back to photos[0]: a city with the lead-photo layout and no clean
    rectangle is a content problem that must stop the build, not render a stretched portrait.
    """
    for index, item in enumerate(shown):
        if item['shape'] == 'rectangle' and item['watermark'] is False:
            return index
    raise ValueError(f'{city_id}: lead-photo layout, but no clean rectangular photo in the pack')


# ---------------------------------------------------------------------------------------------
# City populations (Jack's ruling, 2026-09-17; brief 5.3)
# ---------------------------------------------------------------------------------------------
# Each city's OWN published figure for the area it administers, labelled "City population · city's
# own figure" and credited to the city's source. The UN estimate is a FALLBACK only, for a city
# that publishes nothing we can confirm, and it is then labelled as a UN urban-area estimate.
#
# Why the ruling: the 2025 UN revision counts the whole continuous built-up area, so Jakarta comes
# out at 41.9 million (Jabodetabek) against the roughly 11 million of DKI Jakarta, which is the
# city the government runs and its sensor network covers. A built-up-area figure on a page about a
# city's own work misstates that city, and mixing metro and city figures between chapters would
# make the numbers falsely comparable, which cuts against the no-ranking rule.
#
# READ STRAIGHT FROM THE PACK. The pack JSON now carries the whole revision under
# `keyFacts.population`: `display`, `label`, `covers`, `asAt`, `basis`, `sourceName`, `sourceTier`,
# `url`, `status`, and the UN figure beside it in `unEstimate`. An earlier build transcribed these
# seven figures from the pack's NOTES file into a table here, because the JSON had not been revised
# yet; that table is gone, and nothing in this generator now restates a figure the JSON holds.
#
# The fallback needs no branch of its own: `label` comes from the pack, so a city the pack switches
# to the UN figure arrives already labelled as a UN urban-area estimate and renders as one.


def population(city):
    """The city's own administrative figure, mapped field for field from the pack (brief 5.3).

    Returns None where the pack could not confirm the figure — status 'placeholder', or a null
    `display` with the candidate parked in `candidateDisplay`. The whole Population tile is then
    absent from the chapter, exactly as for a fact a city does not publish, and the key-facts grid
    re-columns around it so there is no gap (brief section 2, ChapterKeyFacts.factColumnsClass).
    The earlier build rendered the candidate in square brackets instead; see omit().
    """
    entry = city['keyFacts']['population']
    if omit(entry):
        return None

    return {
        'display': entry['display'],
        'label': entry['label'],
        'covers': entry['covers'],
        # `asAt` is the figure's own date where the source states one ("31 December 2025", "Census
        # of 2020"); a city that states only a year falls back to it. Never re-derived.
        'asAt': entry['asAt'] if entry['asAt'] is not None else str(entry['year']),
        'basis': entry['basis'],
        # The credit links to the page the figure is published on. `url` stays nullable because a
        # pack may name a publication it has no public page for; a URL is never invented to make a
        # credit linkable. (The one case that used to arrive here unlinked — an unconfirmed figure
        # whose URL was the route IN to the source rather than a page carrying the number — is now
        # dropped whole by omit() above, so it never reaches this branch.)
        'source': {
            'label': entry['sourceName'],
            'url': entry['url'],
            'tier': entry['sourceTier'],
            'status': entry['status'],
        },
        'status': entry['status'],
        # Carried so the research is not lost and the difference between a city figure and a
        # built-up-area figure stays visible in the data. NOT rendered (Jack, 2026-09-17).
        'unEstimate': {
            'display': entry['unEstimate']['display'],
            'label': entry['unEstimate']['label'],
            'status': entry['unEstimate']['status'],
        },
    }


def go_further(city):
    """Go further links, grouped. An omitted link is simply not in its group, and a group left with
    no links is dropped by the interface (brief 5.7), so an unconfirmed link leaves no gap and no
    message — the same treatment as a link the city does not have."""
    groups = city['goFurther']
    department = groups.get('departmentResponsible')
    return {
        'checkTodaysAir': links(groups.get('checkTodaysAir', [])),
        'getTheData': links(groups.get('getTheData', [])),
        'departmentResponsible': None if department is None else link(department),
    }


def content(city):
    # Placeholder photos are dropped BEFORE the lead is chosen, so the lead index is an index into
    # the set that is actually shown and can never point past it.
    shown = [p for p in city['photos'] if not omit(p)]
    photos = [photo(p) for p in shown]
    if city['id'] not in LEAD_PHOTO_CITIES:
        lead, rest = None, photos
    else:
        # The lead is LIFTED OUT of the photo section, never copied, so no image appears twice in
        # one chapter however the pack's photo set changes.
        lead_index = lead_photo_index(city['id'], shown)
        lead = photos[lead_index]
        rest = [p for i, p in enumerate(photos) if i != lead_index]
    story = city['featureStory']
    lead_agency = city['keyFacts']['leadAgency']
    joined = city['keyFacts']['joinedBC']
    # `landmark` and `dataSource` are STRUCTURAL: every chapter opens with a landmark image and
    # every sensor card ends with the data source link, so an omitted one is a content fault that
    # must stop the build rather than render a chapter with a hole in it. All 7 are 'verified' in
    # the pack of 2026-09-17; this is the guard for a future revision, not a live branch.
    landmark_item = city['landmarkImage']
    data_source_item = city['dataSourceLink']
    for name, item in (('landmarkImage', landmark_item), ('dataSourceLink', data_source_item)):
        if omit(item):
            raise ValueError(f"{city['id']}: {name} is a placeholder, and the chapter cannot be built without it")
    return {
        'landmark': photo(landmark_item),
        'population': population(city),
        # A key fact the pack could not confirm is absent, exactly as for a fact a city does not
        # publish; ChapterKeyFacts re-columns the grid around what is left (brief section 2).
        'leadAgency': None if omit(lead_agency) else {'name': lead_agency['name'], 'status': lead_agency['status']},
        'joinedBC': None if omit(joined) else {'year': joined['year'], 'status': joined['status']},
        'featureStory': {
            'title': story['title'],
            'paragraphs': story['paragraphs'],
            'sources': source_links(story['sources']),
            'leadPhoto': lead,
            'status': story['status'],
        },
        'programmes': [
            {'name': p['name'], 'description': p['description'], 'url': p['url'], 'status': p['status']}
            for p in city['programmes']
            if not omit(p)
        ],
        'photos': rest,
        'goFurther': go_further(city),
        'dataSource': link(data_source_item),
    }


HEADER = '''/**
 * chapter-content.ts — the Breathe Atlas chapter content, mapped from the content pack.
 *
 * Purpose
 *   The seven chapter cities' real content: key facts, feature story, programmes, photos, Go
 *   further links and the sensor cards' data source link. ./chapters.ts assembles these into the
 *   tier-checked `CityChapter` entries the chapter route renders.
 *
 * Provenance (READ BEFORE EDITING)
 *   Mapped field by field from the content pack written by ux-writer on 2026-09-17:
 *     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack.json
 *     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack-notes.md
 *   Every URL in the pack was checked on 2026-09-17. Nothing here was written by the developer:
 *   no figure, quote or claim exists in this file that is not in the pack. The pack's exclusions
 *   are kept (no leader names, no outcome figures from quotes, no unconfirmed policy claims).
 *   Update the pack first, then this file.
 *
 * PLACEHOLDERS ARE ABSENT, NEVER DISPLAYED (brief section 2, added 2026-09-17)
 *   Every pack item carries `status`:
 *     'verified'    — confirmed on a public source.
 *     'drafted'     — our wording, drawn from cited public sources.
 *     'placeholder' — dummy or unconfirmed.
 *   A 'placeholder' item, or one whose `display` is null, is DROPPED BY THE GENERATOR and is not
 *   in this file at all: no bracketed figure, no "Placeholder:" label, no empty tile and no gap —
 *   exactly the treatment a fact a city does not publish gets. The pack's `candidateDisplay` is
 *   never emitted. The only 'placeholder' left below is inside `unEstimate`, which nothing renders
 *   (see ChapterPopulation).
 *
 *   Not to be confused with the "Sample figure" marker, which belongs to the sensor-derived facts
 *   assembled in ./chapters.ts (sensor counts, current conditions). Those are the prototype's
 *   declared mock data, which brief 5.3 and 7 require the chapter to show; they carry their own
 *   `DerivedStatus` and are not pack content.
 *
 * People's names
 *   No mayor, governor or official is named anywhere in this content (pack rule). The only personal
 *   names are photographer credits, which the Unsplash licence asks for and which make no claim
 *   about a city.
 *
 * IMAGE RIGHTS
 *   Every image is HOTLINKED, never downloaded: Breathe Cities' own images from breathecities.org
 *   and free-licence photos from the Unsplash CDN (sized with the pack's suggested parameters).
 *   All are rendered in greyscale. The pack notes that several BC images are stock (iStock) and
 *   that hotlinking them outside breathecities.org may fall outside BC's licence — check before
 *   this prototype goes beyond the core team.
 *
 * WATERMARKS (pack revision 2, 2026-09-17)
 *   The pack's second revision opened all 38 chapter images as PIXELS, not file names, and found 12
 *   carrying a burned-in photographer credit. Breathe Cities burns a credit caption into its
 *   commissioned photography as house style, so a BC image cannot be assumed clean and a BC page is
 *   not a credit. All 12 were replaced (11) or dropped (1), which is why several cities now mix BC
 *   images with Unsplash ones and why the per-city counts differ. Every photo here carries
 *   `watermark: false` in the pack, with `watermarkCheck` recording what the check saw.
 *
 * Key exports: ContentStatus, ChapterCredit, ChapterLink, ChapterPhoto, ChapterPopulation, ChapterLeadAgency,
 *   ChapterJoinedBC, ChapterFeatureStory, ChapterProgramme, ChapterGoFurther, ChapterContent,
 *   CHAPTER_CONTENT
 * External dependencies: none.
 */

/**
 * How far a pack item has been confirmed. Every RENDERED item here is 'verified' or 'drafted': a
 * 'placeholder' is dropped by the generator (see the header). The union keeps the member because
 * it is the pack's own vocabulary, and because the unrendered `unEstimate` research still carries
 * it.
 */
export type ContentStatus = 'verified' | 'drafted' | 'placeholder'

/**
 * A credit for a figure: who published it, and its page. Distinct from ChapterLink because a
 * credit can be unlinked — a pack may name the publication behind a figure without a public page
 * that carries it, and no URL is ever invented to make a credit linkable. Then the publication is
 * named in plain text.
 */
export type ChapterCredit = {
  /** Visible credit text: the publication, as the pack names it (`sourceName`). */
  label: string
  /** The publication's page, or null where the credit is deliberately unlinked (see above). */
  url: string | null
  /** How close the source is to the city: "city government", "national statistics office". */
  tier: string
  /** Confirmation status of the credit. */
  status: ContentStatus
}

/** A labelled link to a public page. */
export type ChapterLink = {
  /** Visible link text. */
  label: string
  /** Absolute URL. */
  url: string
  /** Confirmation status of the link itself. */
  status: ContentStatus
}

/** One photo, hotlinked and shown in greyscale (brief 5.6). */
export type ChapterPhoto = {
  /** Image URL (hotlinked; null renders a neutral placeholder tile that keeps the alt text). */
  src: string | null
  /** Alt text. */
  alt: string
  /** Credit line, e.g. "Photo by X on Unsplash" or "Breathe Cities". */
  credit: string
  /** The page the photo came from. */
  sourceUrl: string
  /** Confirmation status. */
  status: ContentStatus
}

/**
 * The city's population (brief 5.3, Jack's ruling 2026-09-17): each city's OWN published figure
 * for the area it administers. `display` is the figure as the source publishes it, never
 * re-derived. The UN urban-area estimate is a labelled FALLBACK only, for a city that publishes
 * nothing we can confirm.
 */
export type ChapterPopulation = {
  /** The figure as the pack publishes it, e.g. "10.9 million". Never a re-derived number. */
  display: string
  /** Caption under the figure: "City population · city's own figure", or the UN label on fallback. */
  label: string
  /** The administrative area the figure covers, e.g. "DKI Jakarta province". */
  covers: string
  /** The figure's date as the source states it, e.g. "31 December 2025", "Census of 2020". */
  asAt: string
  /**
   * What the figure rests on, in the pack's words: "Census count, as published by the city
   * government.", "The city's own estimate, citing Statistics South Africa's mid-year population
   * estimates for 2024. Rounded to the nearest hundred thousand." This is the honesty line — it is
   * how the page says "estimated" or "rounded" without the build classifying anything itself.
   */
  basis: string
  /** Who publishes the figure. Unlinked where the pack has no public page for it (ChapterCredit). */
  source: ChapterCredit
  /** Confirmation status. Never 'placeholder': such a figure is omitted whole (see header). */
  status: ContentStatus
  /**
   * The UN urban-area estimate for the same city, carried so the research is not lost and the
   * difference between a city figure and a built-up-area figure stays visible in the data.
   * NOT RENDERED: the page shows the city's own figure (Jack, 2026-09-17).
   */
  unEstimate: { display: string | null; label: string; status: ContentStatus }
}

/** The lead agency for air quality in the city (name only; its link lives in Go further). */
export type ChapterLeadAgency = {
  /** Agency name, in English where the pack gives one, with the original in brackets. */
  name: string
  /** Confirmation status. */
  status: ContentStatus
}

/** The year the city joined Breathe Cities. */
export type ChapterJoinedBC = {
  /** Four-digit year. */
  year: number
  /** Confirmation status. */
  status: ContentStatus
}

/** The feature story (brief 5.5). */
export type ChapterFeatureStory = {
  /** Story headline (rendered as the section's h2). */
  title: string
  /** Body paragraphs, in order. */
  paragraphs: string[]
  /** The public pages the story draws on, labelled by domain. */
  sources: ChapterLink[]
  /** Wide photo above the story. Used by the `lead-photo` layout only. */
  leadPhoto: ChapterPhoto | null
  /** Confirmation status of the wording. */
  status: ContentStatus
}

/** A named programme with its own public page (brief 5.5). */
export type ChapterProgramme = {
  /** Programme name, in English where the pack gives one. */
  name: string
  /** One or two sentences on the programme (our wording, from the linked page). */
  description: string
  /** The programme's public page. */
  url: string
  /** Confirmation status of the programme and its link. */
  status: ContentStatus
}

/** Go further links, grouped (brief 5.7). An empty group is left out of the interface. */
export type ChapterGoFurther = {
  /** The city's resident air quality platforms. */
  checkTodaysAir: ChapterLink[]
  /** The city's open data portal, API or data request route. */
  getTheData: ChapterLink[]
  /** The department responsible. */
  departmentResponsible: ChapterLink | null
}

/** All of one chapter city's content. Layout choices and tier live in ./chapters.ts. */
export type ChapterContent = {
  /** The landmark image beside the city name in the opener, and on the next-chapter card. */
  landmark: ChapterPhoto
  /** The city's own population figure, or null where the pack could not confirm one (header). */
  population: ChapterPopulation | null
  /** Lead agency, or null where the pack could not confirm one. */
  leadAgency: ChapterLeadAgency | null
  /** Year joined, or null where the pack could not confirm one. */
  joinedBC: ChapterJoinedBC | null
  /** Feature story. */
  featureStory: ChapterFeatureStory
  /** Named programmes. */
  programmes: ChapterProgramme[]
  /** Photos for the photo section, in order. */
  photos: ChapterPhoto[]
  /** Go further links. */
  goFurther: ChapterGoFurther
  /** Where the city publishes its air quality data: every sensor card ends with this (brief 2). */
  dataSource: ChapterLink
}
'''

NOTES = {
    'warsaw': [
        "// joinedBC is 2022 because BC describes Warsaw's pilot as launched in 2022, before Breathe",
        "// Cities itself launched in 2023 (pack notes). Switch to 2023 if \"joined\" should mean the",
        "// initiative rather than the pilot.",
    ],
    'johannesburg': [
        "// No \"Get the data\" group: the pack found no city open data portal or city OpenAQ listing",
        "// (goFurtherGaps). The empty group is simply left out, with no gap and no message (brief 2).",
        "// Its data source link points at SAAQIS, the NATIONAL system, because the city publishes no",
        "// index or live data of its own. That answers brief section 10; flag it to Jack at review.",
    ],
    'bogota': [
        "// TWO ITEMS ARE ABSENT HERE, and their absence is the correct rendering (brief section 2).",
        "// `population` is null: Bogotá publishes its own figure, but every district and national",
        "// statistics host refused the pack's checks, so the pack holds only a candidate read off",
        "// aggregator sites and keeps it in `candidateDisplay`. The Population tile is left out and",
        "// the key-facts grid re-columns around it, exactly as for a fact a city does not publish.",
        "// The \"Bogotá Open Data\" link is likewise gone from `goFurther.getTheData`: the portal",
        "// refused every connection when the pack was checked, so its contents are unconfirmed.",
        "// Neither is labelled, bracketed or greyed — a placeholder is absent, never displayed.",
    ],
    'warsaw': [
        "// TWO LINKS ARE ABSENT from `goFurther` and their absence is deliberate: the City's own",
        "// IoT air map (iot.warszawa.pl) and its open data API (api.um.warszawa.pl). Both are linked",
        "// from the City of Warsaw's own pages, so the research is right; both were UNREACHABLE from",
        "// here on 2026-09-18 (and on 2026-09-17), timing out with no response at all. They may be",
        "// geo-blocked and may work from Poland. DO NOT DELETE THE RESEARCH: the pack still carries",
        "// both, with the pages they were found on. See UNREACHABLE_URLS in the generator to restore",
        "// one after a check from a Polish connection.",
    ],
    'milan': [
        "// Milan is tier 1 (shares nothing), so it has no sensor cards; `dataSource` is carried for",
        "// completeness and is not rendered. BC has no photographs of Milan, so every photo is a",
        "// free-licence Unsplash photo, credited (pack photosNote).",
    ],
}

lines = [HEADER]
lines.append('')
lines.append('/** Every chapter city\'s content, keyed by route slug. Mapped from the content pack (see header). */')
lines.append('export const CHAPTER_CONTENT: Record<string, ChapterContent> = {')
for slug in order:
    city = cities[slug]
    if slug in NOTES:
        for note in NOTES[slug]:
            lines.append('  ' + note)
    key = slug if re.fullmatch(r'[a-z][a-zA-Z0-9]*', slug) else f"'{slug}'"
    lines.append(f'  {key}: {block(content(city), 2)},')
lines.append('}')
lines.append('')

with open(f'{OUT}/chapter-content.ts', 'w') as fh:
    fh.write('\n'.join(lines))

# ---------------------------------------------------------------------------------------------
# indexes.ts — the four tier-4 cities' own indexes
# ---------------------------------------------------------------------------------------------

INDEX_HEADER = '''/**
 * indexes.ts — the tier-4 cities' own air quality indexes (brief section 2, 6.1, 6.2).
 *
 * Purpose
 *   Bogotá, Johannesburg, Sofia and Warsaw share their own index (illustrative tier 4), so their
 *   data map colours its markers, and its sensor cards head themselves, with THAT index's level
 *   names and THAT index's colours. Nothing else in a chapter carries colour.
 *
 * We never interpret air quality (brief section 2)
 *   Level names, level order and colours are the city's own, as published. Nothing here is a
 *   Breathe Cities judgement, and no BC or AQI palette is used. The four indexes disagree with
 *   each other by design (five levels in Bogotá, six in Warsaw), and that is left alone.
 *
 * Provenance
 *   Mapped from the content pack's `airQualityIndex` blocks (ux-writer, 2026-09-17), which record
 *   the publisher, the legal basis where there is one, and the pages each colour was read from:
 *     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack.json
 *   Known conflicts the pack flags, kept as the pack resolved them:
 *     - Bogotá: the live IBOCA map and Resolución Conjunta 2840 de 2023 disagree on purple; the
 *       live map's value is used.
 *     - Johannesburg: SAAQIS is NATIONAL. The city publishes no index of its own.
 *     - Sofia: the older five-level European index, as air.sofia.bg shows it. The current European
 *       index has a sixth level that Sofia's page does not show.
 *     - Warsaw: GIOŚ map-legend colours. Warsaw's own IoT map was unreachable, so the city's own
 *       colours are unconfirmed.
 *
 * TOKEN EXCEPTION (named)
 *   Hex values are hardcoded here, which the concept standard otherwise forbids. They are DATA,
 *   not design: each is a city's own published index colour and cannot be a BC token. This is the
 *   same carve-out the standard makes for Mapbox marker constants, for the same reason (WebGL and
 *   detached marker DOM cannot read CSS custom properties).
 *
 * Key exports: IndexLevel, CityAirQualityIndex, CITY_INDEXES, indexLevel, cityIndex,
 *   levelDisplayName
 * External dependencies: none.
 */

/** One level of a city's own index, in the city's own words and colour. */
export type IndexLevel = {
  /** 1 = the index's best level. The order the city publishes. */
  order: number
  /** The level name as published, in the index's own language. */
  nameOriginal: string
  /** English name (the publisher's own where it has one, otherwise the pack's translation). */
  nameEnglish: string
  /** The city's own colour for this level, as published. */
  hex: string
}

/** A city's own air quality index. */
export type CityAirQualityIndex = {
  /** Index name as it should appear in the interface, e.g. "IBOCA". */
  name: string
  /** Who publishes it, for the legend's small print. */
  publisher: string
  /** The levels, best first. */
  levels: IndexLevel[]
  /**
   * The level a "moderate" sensor reads in this index: one band above the best.
   * Mock data uses this (brief section 7: one moderate sensor per tier-4 city).
   */
  moderateOrder: number
  /**
   * The level a "sensitive groups" sensor reads in this index: two bands above the best, which in
   * all four indexes is where the publisher's own advice starts to single out sensitive groups.
   * Mock data uses this (brief section 7: one sensitive-groups sensor per tier-4 city).
   */
  sensitiveOrder: number
}
'''

index_lines = [INDEX_HEADER, '']
index_lines.append("/** The four tier-4 cities' indexes, keyed by route slug. */")
index_lines.append('export const CITY_INDEXES: Record<string, CityAirQualityIndex> = {')
for slug in order:
    city = cities[slug]
    if 'airQualityIndex' not in city:
        continue
    aqi = city['airQualityIndex']
    entry = {
        'name': aqi['name'],
        'publisher': aqi['publisher'],
        'levels': [
            {
                'order': lvl['order'],
                'nameOriginal': lvl['nameOriginal'],
                'nameEnglish': lvl['nameEnglish'],
                'hex': lvl['hex'],
            }
            for lvl in aqi['levels']
        ],
        'moderateOrder': 2,
        'sensitiveOrder': 3,
    }
    key = slug if re.fullmatch(r'[a-z][a-zA-Z0-9]*', slug) else f"'{slug}'"
    index_lines.append(f'  {key}: {block(entry, 2)},')
index_lines.append('}')
index_lines.append('')
index_lines.append('''/** A city's index, or null when the city does not share one (tiers 1 to 3). */
export function cityIndex(slug: string): CityAirQualityIndex | null {
  return CITY_INDEXES[slug] ?? null
}

/**
 * One level of a city's index by its published order. Throws rather than guessing: a missing level
 * means the mock data and the index disagree, which must fail the build, not render a wrong colour.
 */
export function indexLevel(index: CityAirQualityIndex, order: number): IndexLevel {
  const level = index.levels.find((entry) => entry.order === order)
  if (level === undefined) {
    throw new Error(`Breathe Atlas: ${index.name} has no level ${order}`)
  }
  return level
}

/**
 * A level as the interface shows it: the name the city publishes, with the English name after it
 * when the two differ (the prototype is English only, brief section 2). Never a BC-invented name.
 */
export function levelDisplayName(level: IndexLevel): string {
  return level.nameOriginal === level.nameEnglish
    ? level.nameEnglish
    : `${level.nameOriginal} (${level.nameEnglish})`
}''')

with open(f'{OUT}/indexes.ts', 'w') as fh:
    fh.write('\n'.join(index_lines) + '\n')

# ---------------------------------------------------------------------------------------------
# mission lines for cities.ts
# ---------------------------------------------------------------------------------------------
with open(f'{SCRATCH}/mission-lines.txt', 'w') as fh:
    for city in pack['cities']:
        fh.write(f"{city['id']}\t{city['missionLine']['status']}\t{city['missionLine']['text']}\n")
    fh.write(f"BC\t{pack['breatheCities']['missionLine']['status']}\t{pack['breatheCities']['missionLine']['text']}\n")

print('wrote chapter-content.ts, indexes.ts, mission-lines.txt')
