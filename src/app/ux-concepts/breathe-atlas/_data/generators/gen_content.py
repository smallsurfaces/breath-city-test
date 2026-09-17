#!/usr/bin/env python3
"""Map the Breathe Atlas content pack onto the concept's typed data modules.

Run once (2026-09-17) to produce:
  _data/chapter-content.ts   per-city chapter content (types + CHAPTER_CONTENT)
  _data/indexes.ts           the four tier-4 cities' own air quality indexes
  mission-lines.txt          the 16 mission lines, for cities.ts

Honesty rules applied here (brief section 2, dispatch):
  - Nothing is invented. Every string comes from the pack (JSON or its notes file).
  - People's names are never rendered, EXCEPT photographer credits, which the
    Unsplash licence attribution asks for and which are not claims about a city.
  - `status` travels with every item so placeholders stay visibly placeholder.
  - Populations are each city's OWN administrative figure (Jack, 2026-09-17; brief
    5.3). See CITY_POPULATIONS below for the figures and their provenance.

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

# Cities whose feature story uses the lead-photo layout, and WHICH of the pack's photos is the lead.
# The lead photo is lifted out of the photo section, so no image appears twice in one chapter.
#
# Bogotá is index 3, not 0 (Jack, 2026-09-17): the pack's first Bogotá photo carries a visible
# "Mafe Drums / Pexels" watermark while BC credits no photographer. Each of the four was opened and
# looked at; three of them are watermarked in the pixels:
#   [0] Riccardo-Parretti-Pexels-52  "Mafe Drums / Pexels"
#   [1] Riccardo-Parretti-Pexels-54  "Mindful Media / iStock"
#   [2] Bogota-1                     "Gabriel Leonardo Guerrero Bermudez / iStock", plus a large
#                                    diagonal "NARCO FEST" watermark across the frame
#   [3] iStock-Bogota-cycling-street CLEAN, no visible watermark
# Index 3 is therefore the only unwatermarked Bogotá photo in the pack, so it becomes the lead. The
# other three stay in the photo section, still watermarked: that is a CONTENT problem for the pack,
# not something this generator can fix, and dropping them would leave Bogotá one photo. Flagged in
# the build report. A filename is not evidence either way here — [3] is named "iStock-…" and is the
# clean one, while [0] and [1] are named "…-Pexels-…" and carry two different libraries' marks.
LEAD_PHOTO_INDEX = {'bogota': 3, 'mexico-city': 0}

# Unsplash CDN images need sizing parameters to serve a sensible file (pack: hotlinkHint).
UNSPLASH_PARAMS = '?w=1600&q=80'

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


def link(item):
    """A pack link block -> ChapterLink."""
    return {'label': item['label'], 'url': item['url'], 'status': item['status']}


def image_url(item):
    """Hotlink URL. Unsplash CDN URLs get the pack's suggested sizing parameters."""
    url = item['imageUrl']
    if 'images.unsplash.com' in url and '?' not in url:
        return url + UNSPLASH_PARAMS
    return url


def photo(item):
    """A pack photo/landmark block -> ChapterPhoto."""
    return {
        'src': image_url(item),
        'alt': item['alt'],
        'credit': item['credit'],
        'sourceUrl': item['sourcePage'],
        'status': item['status'],
    }


# ---------------------------------------------------------------------------------------------
# City populations (Jack's ruling, 2026-09-17; brief 5.3)
# ---------------------------------------------------------------------------------------------
# Each city's OWN published figure for the area it administers, labelled "City population ·
# city's own figure" and credited to the city's source. The UN estimate is a FALLBACK only, for a
# city that publishes nothing we can confirm, and it is then labelled as a UN urban-area estimate.
# The UN figure is always carried in `unEstimate` and is NOT rendered (dispatch).
#
# Why the ruling: the 2025 UN revision counts the whole continuous built-up area, so Jakarta comes
# out at 41.9 million (Jabodetabek) against the roughly 11 million of DKI Jakarta, which is the
# city the government runs and its sensor network covers. A built-up-area figure on a page about a
# city's own work misstates that city, and mixing metro and city figures between chapters would
# make the numbers falsely comparable, which cuts against the no-ranking rule.
#
# PROVENANCE, AND WHY THIS TABLE IS HERE RATHER THAN READ FROM THE JSON
#   The content pack's NOTES file records this revision in full — its "City populations" section
#   carries Jack's ruling and, for each of the seven chapter cities, the figure, the administrative
#   unit, the year and the publishing source:
#     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack-notes.md
#   The pack JSON has NOT yet been revised to match. As of 2026-09-17 its `keyFacts.population`
#   still holds only the UN figure under the old "Urban area population · UN estimate" label, and
#   carries no city figure at all. Every value below is transcribed verbatim from the notes table.
#   Nothing here is computed, rounded, re-derived or inferred, and no figure appears that the notes
#   do not state.
#   WHEN THE JSON CARRIES THE REVISION: delete this table and read the city figure, unit, year,
#   source and precision from the pack, exactly as every other field in this generator is read.
#
# `sourceUrl` is None for all seven: the notes name each publication in prose but carry no URL for
# it, and the JSON's population `sources` are the UN booklets. A credit with no link renders as
# plain text; a URL is never invented to fill the gap.
#
# `precision` drives the honesty note on the tile (brief 5.3 / dispatch: "Where a city's figure is
# a rounded or estimated number, the pack says so, and the tile should reflect it"):
#   'exact'     — the figure as counted or registered. No note.
#   'rounded'   — the city itself publishes it rounded.
#   'estimated' — an estimate, not a count. The notes require the word "estimated" wherever
#                 Johannesburg's figure appears, and that it must not imply precision.
CITY_POPULATIONS = {
    'bogota': {
        # The one placeholder. Bogotá does publish its own figure, but every host that carries it
        # (sdp.gov.co, saludata, datosabiertos, observatorio) timed out and dane.gov.co returned
        # 401 to curl, WebFetch and a browser. "About 7.9 million" for 2025 came back only through
        # aggregator sites, never a primary page, so the notes hold it as a CANDIDATE and not as a
        # fact. It renders bracketed and marked "Sample figure" until someone on a connection that
        # can reach .gov.co reads the 2025 value off the SDP's Visor de Población.
        'display': '[about 7.9 million]',
        'unit': 'Bogotá D.C., the Capital District',
        'year': '2025',
        'precision': 'estimated',
        'source': 'Secretaría Distrital de Planeación, Visor de Población (DANE projection with SDP)',
        'sourceUrl': None,
        'status': 'placeholder',
    },
    'jakarta': {
        # Jakarta now has a verified own figure, so its "Sample figure" label and the
        # pending-decision comment are gone (dispatch). Two city-published numbers exist; the notes
        # use the civil registration figure and reject jakarta.go.id's 10,684,946, which states no
        # year and is marked for update. Both describe DKI Jakarta province.
        'display': '10,881,514',
        'unit': 'DKI Jakarta province',
        'year': '2025, at 31 December',
        'precision': 'exact',
        'source': 'Dinas Kependudukan dan Pencatatan Sipil Provinsi DKI Jakarta, clean population data, semester II 2025',
        'sourceUrl': None,
        'status': 'verified',
    },
    'johannesburg': {
        # Rounded AND contested: the city's own plan says 5.8 million, footnoted to Statistics
        # South Africa's 2024 mid-year estimates. Census 2022 put the municipality at 4,803,262,
        # which the city does not use, and the city's own page still shows Census 2011. The notes
        # require "estimated" wherever the number appears.
        'display': '5.8 million',
        'unit': 'City of Johannesburg Metropolitan Municipality',
        'year': '2024, mid-year',
        'precision': 'estimated',
        'source': 'City of Johannesburg, Integrated Development Plan 2025/26, citing Statistics South Africa',
        'sourceUrl': None,
        'status': 'verified',
    },
    'mexico-city': {
        # The year is older than the rest: 9,209,944 is the 2020 census, which is still the most
        # recent count, and the city government publishes it as its own figure.
        'display': '9,209,944',
        'unit': 'Ciudad de México and its 16 alcaldías',
        'year': '2020 census',
        'precision': 'exact',
        'source': 'Gobierno de la Ciudad de México, Instituto de Planeación Democrática y Prospectiva, 2025, citing INEGI',
        'sourceUrl': None,
        'status': 'verified',
    },
    'milan': {
        'display': '1,399,079',
        'unit': 'Comune di Milano',
        'year': '2025, at 31 December',
        'precision': 'exact',
        'source': 'Comune di Milano, Portale del Dato, population register',
        'sourceUrl': None,
        'status': 'verified',
    },
    'sofia': {
        # Falls back one step, to the national statistics office: Sofia Municipality's own pages are
        # a decade old (sofia.bg quotes 1,316,557 for December 2014). Bulgaria's NSI gives 1,303,813
        # for exactly the territory the municipality administers, so it is recorded as the national
        # statistics office, NOT as a Sofia publication.
        'display': '1,303,813',
        'unit': 'Stolichna obshtina (Sofia Municipality), 24 districts',
        'year': '2025, at 31 December',
        'precision': 'exact',
        'source': 'National Statistical Institute of Bulgaria, final data for 2025',
        'sourceUrl': None,
        'status': 'verified',
    },
    'warsaw': {
        'display': '1,862,000',
        'unit': 'Miasto Warszawa (m.st. Warszawa)',
        'year': '2024, at 30 June',
        'precision': 'rounded',
        'source': 'Miasto Warszawa, Statystyka Warszawy',
        'sourceUrl': None,
        'status': 'verified',
    },
}

# Honesty note shown under a figure that is not an exact count. 'exact' shows nothing.
PRECISION_NOTES = {
    'exact': None,
    'rounded': 'The city publishes this figure rounded.',
    'estimated': 'An estimate, not a count.',
}


def population(city):
    """The city's own administrative figure, or the UN estimate as a labelled fallback (brief 5.3)."""
    un = city['keyFacts']['population']
    own = CITY_POPULATIONS.get(city['id'])

    if own is None:
        # Fallback: the city publishes nothing we can confirm, so the UN urban-area estimate is the
        # figure on the page, carrying its own label so it is never mistaken for the city's own.
        return {
            'display': un['display'],
            'label': un['label'],
            'unit': None,
            'year': str(un['year']),
            'precisionNote': PRECISION_NOTES['estimated'],
            'source': {'label': host(un['sources'][0]), 'url': un['sources'][0], 'status': un['status']},
            'status': un['status'],
            'unEstimate': None,
        }

    return {
        'display': own['display'],
        'label': "City population · city's own figure",
        'unit': own['unit'],
        'year': own['year'],
        'precisionNote': PRECISION_NOTES[own['precision']],
        'source': {'label': own['source'], 'url': own['sourceUrl'], 'status': own['status']},
        'status': own['status'],
        # Carried so the research is not lost and the difference stays visible. NOT rendered.
        'unEstimate': {'display': un['display'], 'label': un['label'], 'status': un['status']},
    }


def go_further(city):
    groups = city['goFurther']
    return {
        'checkTodaysAir': [link(i) for i in groups.get('checkTodaysAir', [])],
        'getTheData': [link(i) for i in groups.get('getTheData', [])],
        'departmentResponsible': link(groups['departmentResponsible']) if 'departmentResponsible' in groups else None,
    }


def content(city):
    photos = [photo(p) for p in city['photos']]
    lead_index = LEAD_PHOTO_INDEX.get(city['id'])
    if lead_index is None:
        lead, rest = None, photos
    else:
        # Fail rather than silently fall back: a lead index past the end of the pack's photo list
        # means the pack and this table disagree, which must stop the build, not drop the layout.
        if lead_index >= len(photos):
            raise IndexError(f"{city['id']}: lead photo index {lead_index} but only {len(photos)} photos")
        lead = photos[lead_index]
        rest = [p for i, p in enumerate(photos) if i != lead_index]
    story = city['featureStory']
    return {
        'landmark': photo(city['landmarkImage']),
        'population': population(city),
        'leadAgency': {'name': city['keyFacts']['leadAgency']['name'], 'status': city['keyFacts']['leadAgency']['status']},
        'joinedBC': {'year': city['keyFacts']['joinedBC']['year'], 'status': city['keyFacts']['joinedBC']['status']},
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
        ],
        'photos': rest,
        'goFurther': go_further(city),
        'dataSource': link(city['dataSourceLink']),
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
 * Status, not silence (brief section 2)
 *   Every item carries `status`:
 *     'verified'    — confirmed on a public source.
 *     'drafted'     — our wording, drawn from cited public sources.
 *     'placeholder' — dummy or unconfirmed; the page marks it "Sample figure" or "Placeholder:".
 *   Only 'placeholder' shows a marker in the interface. Verified and drafted content renders as
 *   real content, with no "Sample" label. The nav's "Prototype with sample data" notice covers
 *   the rest.
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
 * Key exports: ContentStatus, ChapterCredit, ChapterLink, ChapterPhoto, ChapterPopulation, ChapterLeadAgency,
 *   ChapterJoinedBC, ChapterFeatureStory, ChapterProgramme, ChapterGoFurther, ChapterContent,
 *   CHAPTER_CONTENT
 * External dependencies: none.
 */

/** How far an item has been confirmed. Only 'placeholder' is marked in the interface. */
export type ContentStatus = 'verified' | 'drafted' | 'placeholder'

/**
 * A credit for a figure: who published it, and its page where the pack has one. Distinct from
 * ChapterLink because a credit may name a publication the pack carries no URL for, in which case
 * it renders as plain text rather than a link. No URL is ever invented to fill the gap.
 */
export type ChapterCredit = {
  /** Visible credit text: the publication, as the pack names it. */
  label: string
  /** Absolute URL, or null when the pack names the publication but no page. */
  url: string | null
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
  /** The figure as published, e.g. "10,881,514". Placeholders are bracketed in the pack. */
  display: string
  /** Caption under the figure: "City population · city's own figure", or the UN label on fallback. */
  label: string
  /** The administrative area the figure covers, e.g. "DKI Jakarta province". Null on UN fallback. */
  unit: string | null
  /** The figure's date, as the source states it, e.g. "2025, at 31 December". */
  year: string
  /**
   * Honesty note for a figure that is not an exact count ("An estimate, not a count."), or null
   * when it is exact. Never softens a figure the source publishes as exact.
   */
  precisionNote: string | null
  /** Who publishes the figure. `url` is null where the pack names the publication but no page. */
  source: ChapterCredit
  /** Confirmation status; 'placeholder' shows "Sample figure". */
  status: ContentStatus
  /**
   * The UN urban-area estimate for the same city, carried so the research is not lost and the
   * difference between a city figure and a built-up-area figure stays visible in the data.
   * NOT RENDERED: the page shows the city's own figure (Jack, 2026-09-17). Null when the UN figure
   * IS the rendered figure (the fallback case above).
   */
  unEstimate: { display: string; label: string; status: ContentStatus } | null
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
  /** The city's own population figure for the area it administers. */
  population: ChapterPopulation
  /** Lead agency. */
  leadAgency: ChapterLeadAgency
  /** Year joined. */
  joinedBC: ChapterJoinedBC
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
        "// The \"Bogotá Open Data\" link stays a PLACEHOLDER: the portal refused every connection when",
        "// the pack was checked, so its contents are unconfirmed. It renders with a \"Placeholder:\" prefix.",
        "// The population is the one figure of the seven that is still a PLACEHOLDER: Bogotá publishes",
        "// its own, but every district and national statistics host refused us (see CITY_POPULATIONS in",
        "// the generator). \"About 7.9 million\" is a candidate from aggregator sites, never a primary",
        "// page, so it renders bracketed and marked \"Sample figure\".",
        "// The lead photo is photos[3], not photos[0]: the first three Bogotá photos in the pack carry",
        "// a visible stock-library watermark (see LEAD_PHOTO_INDEX in the generator).",
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
