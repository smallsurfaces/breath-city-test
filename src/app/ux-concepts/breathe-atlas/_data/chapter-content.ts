/**
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
 * Key exports: ContentStatus, ChapterLink, ChapterPhoto, ChapterPopulation, ChapterLeadAgency,
 *   ChapterJoinedBC, ChapterFeatureStory, ChapterProgramme, ChapterGoFurther, ChapterContent,
 *   CHAPTER_CONTENT
 * External dependencies: none.
 */

/** How far an item has been confirmed. Only 'placeholder' is marked in the interface. */
export type ContentStatus = 'verified' | 'drafted' | 'placeholder'

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

/** Urban area population (brief 5.3). `display` is the figure as the pack records it. */
export type ChapterPopulation = {
  /** The figure as published, e.g. "10.6 million". Placeholders are bracketed in the pack. */
  display: string
  /** Caption under the figure, e.g. "Urban area population · UN estimate". */
  label: string
  /** Where the figure comes from. */
  source: ChapterLink
  /** Confirmation status; 'placeholder' shows "Sample figure". */
  status: ContentStatus
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
  /** Urban area population. */
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


/** Every chapter city's content, keyed by route slug. Mapped from the content pack (see header). */
export const CHAPTER_CONTENT: Record<string, ChapterContent> = {
  // The "Bogotá Open Data" link stays a PLACEHOLDER: the portal refused every connection when
  // the pack was checked, so its contents are unconfirmed. It renders with a "Placeholder:" prefix.
  bogota: {
    landmark: {
      src: 'https://breathecities.org/wp-content/uploads/2025/07/Country-cards-96.png',
      alt: 'A white church bell tower topped with a cross, against a blue sky.',
      credit: 'Breathe Cities',
      sourceUrl: 'https://breathecities.org/cities/bogota/',
      status: 'verified',
    },
    population: {
      display: '10.6 million',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'un.org',
        url: 'https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_data-booklet_world_cities_in_2025.pdf',
        status: 'verified',
      },
      status: 'verified',
    },
    leadAgency: {
      name: 'Secretaría Distrital de Ambiente (District Environment Secretariat)',
      status: 'verified',
    },
    joinedBC: {
      year: 2024,
      status: 'verified',
    },
    featureStory: {
      title: 'Clean air zones where the need is greatest',
      paragraphs: [
        'Ciudad Bolívar, in Bogotá\'s southwest, records the city\'s highest concentrations of fine particles (PM2.5). Across Bogotá, dust from unpaved roads and emissions from freight vehicles cause most PM2.5 emissions.',
        'The city\'s response is the Zona Urbana por un Mejor Aire (ZUMA), an urban zone for better air. A ZUMA concentrates action in one place: road repairs to reduce dust, new trees and gardens, sustainable transport, recovered public space and air quality monitoring. The first ZUMA operates in Bosa-Apogeo, and the approach is part of the work that won Bogotá the 2025 Earthshot Prize for clean air.',
        'In August 2026, the city launched a second ZUMA in Ciudad Bolívar, covering 15 neighbourhoods and about 97,600 residents. Breathe Cities supports Bogotá to measure what its clean air zones change, from air quality to mobility and public space, so the benefits reach the people who need them most.',
      ],
      sources: [
        {
          label: 'ambientebogota.gov.co',
          url: 'https://www.ambientebogota.gov.co/sala-de-prensa/todas-las-noticias/bogota-pone-en-marcha-su-segunda-zona-urbana-por-un-mejor-aire-esta-vez-en-ciudad-bolivar-para-que-cerca-de-100-000-personas-respiren-mejor',
          status: 'verified',
        },
        {
          label: 'breathecities.org · bogota',
          url: 'https://breathecities.org/cities/bogota/',
          status: 'verified',
        },
        {
          label: 'breathecities.org · bogota-earthshot-prize-winner',
          url: 'https://breathecities.org/bogota-earthshot-prize-winner/',
          status: 'verified',
        },
        {
          label: 'earthshotprize.org',
          url: 'https://earthshotprize.org/winners-finalists/city-of-bogota/',
          status: 'verified',
        },
      ],
      leadPhoto: {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-52.png',
        alt: 'A steep stepped street lined with colourful colonial buildings, with street vendors and people walking.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/bogota/',
        status: 'verified',
      },
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Urban Zones for Better Air (ZUMA)',
        description: 'Clean air zones that concentrate road repairs, greening, sustainable transport and monitoring in the most affected neighbourhoods.',
        url: 'https://www.ambientebogota.gov.co/sala-de-prensa/todas-las-noticias/bogota-pone-en-marcha-su-segunda-zona-urbana-por-un-mejor-aire-esta-vez-en-ciudad-bolivar-para-que-cerca-de-100-000-personas-respiren-mejor',
        status: 'verified',
      },
      {
        name: 'Plan Aire 2030',
        description: 'The city\'s strategic plan to 2030, with verifiable targets for reducing PM2.5 and PM10.',
        url: 'https://bogota.gov.co/mi-ciudad/ambiente/plan-estrategico-para-la-gestion-integral-de-la-calidad-del-aire',
        status: 'verified',
      },
      {
        name: 'Bogotá Air Quality Monitoring Network (RMCAB)',
        description: 'A network of 19 monitoring stations that publishes hourly data on air pollutants and weather.',
        url: 'https://www.ambientebogota.gov.co/nosotros/gestion-ambiental/datos-y-conocimiento-producido-en-la-sda/red-de-monitoreo-de-calidad-del-aire-de-bogota',
        status: 'verified',
      },
      {
        name: 'Early warning system and IBOCA index',
        description: 'Bogotá\'s air quality early warning system and the health-risk index residents can check at any time.',
        url: 'https://www.ambientebogota.gov.co/nosotros/gestion-ambiental/datos-y-conocimiento-producido-en-la-sda/satab-iboca',
        status: 'verified',
      },
      {
        name: 'Collaborative Microsensor Network',
        description: 'Low-cost microsensors that measure air quality close to daily life and support citizen participation.',
        url: 'https://www.ambientebogota.gov.co/nosotros/gestion-ambiental/datos-y-conocimiento-producido-en-la-sda/red-colaborativa-microsensores',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-54.png',
        alt: 'A smiling young man on a brick path lined with flowers, with houses and a white church on the hillside behind.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/bogota/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/11/Bogota-1.png',
        alt: 'Cyclists and pedestrians on a car-free avenue, with high-rise buildings and green mountains behind.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/bogota-earthshot-prize-winner/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/01/iStock-Bogota-cycling-street-2048x1365.jpg',
        alt: 'People cycling along a street lined with colourful colonial buildings.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/the-city-of-bogota-joins-breathe-cities-initiative-to-tackle-global-air-pollution/',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'IBOCA air quality map',
          url: 'https://iboca.ambientebogota.gov.co/mapa/',
          status: 'verified',
        },
        {
          label: 'RMCAB live monitoring map',
          url: 'http://rmcab.ambientebogota.gov.co/home/map',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'RMCAB data reports',
          url: 'http://rmcab.ambientebogota.gov.co/',
          status: 'verified',
        },
        {
          label: 'Bogotá Open Data: air quality datasets',
          url: 'https://datosabiertos.bogota.gov.co/dataset?organization=sda&tags=Calidad+del+aire',
          status: 'placeholder',
        },
      ],
      departmentResponsible: {
        label: 'Secretaría Distrital de Ambiente',
        url: 'https://www.ambientebogota.gov.co/',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'IBOCA air quality map',
      url: 'https://iboca.ambientebogota.gov.co/mapa/',
      status: 'verified',
    },
  },
  // Population is deliberately a PLACEHOLDER. The pack verifies 41.9 million from UN World
  // Urbanization Prospects 2025, whose new method counts the whole continuous built-up area;
  // the older national definition gives about 12 million, and Jakarta's own figure may differ
  // again. Jack has not chosen between the UN figure and Jakarta's own, and the brief records
  // that Jakarta is sensitive about how its data appears, so the chapter shows the figure
  // bracketed and marked "Sample figure" until he decides.
  jakarta: {
    landmark: {
      src: 'https://breathecities.org/wp-content/uploads/2025/07/Country-cards-2025-10-06T142822.918.png',
      alt: 'A wide avenue with a green central strip, lined with high-rise office towers.',
      credit: 'Breathe Cities',
      sourceUrl: 'https://breathecities.org/cities/jakarta/',
      status: 'verified',
    },
    population: {
      display: '41.9 million',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'un.org',
        url: 'https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_data-booklet_world_cities_in_2025.pdf',
        status: 'placeholder',
      },
      status: 'placeholder',
    },
    leadAgency: {
      name: 'Jakarta Environment Agency',
      status: 'verified',
    },
    joinedBC: {
      year: 2023,
      status: 'verified',
    },
    featureStory: {
      title: 'A low emission zone shaped by daily life',
      paragraphs: [
        'Jakarta has piloted low emission zones in Kota Tua and Tebet Eco Park, where access is limited to people walking and cycling, public transport and vehicles with a low emission sticker. The city is now preparing its next zone, which links cleaner air with transport, buildings, energy, waste and land-use planning.',
        'Before drawing any lines on a map, the city asked residents, drivers and vendors in Blok M and Dukuh Atas what a zone would mean for their daily lives. Their views were weighed alongside a feasibility study and a cost-benefit analysis, and Blok M emerged as the stronger setting for a potential first pilot.',
        'The same evidence now shapes how Jakarta will judge success: cleaner air, protected livelihoods and costs that do not fall hardest on low-income commuters or small businesses. Breathe Cities supports the Jakarta Provincial Government to turn this research into a practical delivery roadmap.',
      ],
      sources: [
        {
          label: 'breathecities.org',
          url: 'https://breathecities.org/jakarta-low-emission-zone-roadmap/',
          status: 'verified',
        },
        {
          label: 'jakarta.go.id',
          url: 'https://www.jakarta.go.id/kawasan-rendah-emisi',
          status: 'verified',
        },
      ],
      leadPhoto: null,
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Udara Jakarta',
        description: 'The Environment Agency\'s official air quality platform, with ISPU readings, forecasts and health advice.',
        url: 'https://udara.jakarta.go.id/',
        status: 'verified',
      },
      {
        name: 'Low Emission Zones',
        description: 'Pilot zones in Kota Tua and Tebet Eco Park that give priority to walking, cycling and public transport.',
        url: 'https://www.jakarta.go.id/kawasan-rendah-emisi',
        status: 'verified',
      },
      {
        name: 'Air Pollution Control Strategy',
        description: 'The Governor\'s 2023 decree that sets the city\'s strategy for controlling air pollution.',
        url: 'https://jdih.jakarta.go.id/dokumen/detail/13660',
        status: 'verified',
      },
      {
        name: 'Vehicle emission testing',
        description: 'Emission testing for cars and motorcycles, with testing locations and results available online.',
        url: 'https://ujiemisi.jakarta.go.id/',
        status: 'verified',
      },
      {
        name: 'Schools Reinventing Cities',
        description: 'A city-wide challenge in which students used Minecraft Education to design low-emission neighbourhoods.',
        url: 'https://breathecities.org/jakarta-students-reimagine-a-cleaner-city-with-minecraft/',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-57.png',
        alt: 'A man smiles as he stands on a bus, holding an overhead strap.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/jakarta/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-56.png',
        alt: 'A woman carries a young child on a pedestrian bridge, with high-rise towers behind.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/jakarta/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Country-cards-2025-10-02T084631.759-2048x2048.png',
        alt: 'Motorcyclists riding close together in city traffic.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/jakarta/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2026/09/IMG_4346-2048x1536.jpg',
        alt: 'Residents and municipal workers study a map together at a community discussion about the Low Emission Zone in Blok M.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/jakarta-low-emission-zone-roadmap/',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'Udara Jakarta',
          url: 'https://udara.jakarta.go.id/',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'Request air monitoring data (PPID)',
          url: 'https://lingkunganhidup.jakarta.go.id/layanan/ppid',
          status: 'verified',
        },
      ],
      departmentResponsible: {
        label: 'Jakarta Environment Agency (Dinas Lingkungan Hidup Provinsi DKI Jakarta)',
        url: 'https://lingkunganhidup.jakarta.go.id/',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'Udara Jakarta',
      url: 'https://udara.jakarta.go.id/',
      status: 'verified',
    },
  },
  // No "Get the data" group: the pack found no city open data portal or city OpenAQ listing
  // (goFurtherGaps). The empty group is simply left out, with no gap and no message (brief 2).
  // Its data source link points at SAAQIS, the NATIONAL system, because the city publishes no
  // index or live data of its own. That answers brief section 10; flag it to Jack at review.
  johannesburg: {
    landmark: {
      src: 'https://breathecities.org/wp-content/uploads/2025/07/Country-cards-88.png',
      alt: 'The Johannesburg skyline, with the Hillbrow Tower rising above the city.',
      credit: 'Breathe Cities',
      sourceUrl: 'https://breathecities.org/cities/johannesburg/',
      status: 'verified',
    },
    population: {
      display: '7.1 million',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'un.org',
        url: 'https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_data-booklet_world_cities_in_2025.pdf',
        status: 'verified',
      },
      status: 'verified',
    },
    leadAgency: {
      name: 'City of Johannesburg Environment and Infrastructure Services Department (EISD)',
      status: 'verified',
    },
    joinedBC: {
      year: 2023,
      status: 'verified',
    },
    featureStory: {
      title: 'Young people leading Joburg\'s clean air conversation',
      paragraphs: [
        'Air pollution in Johannesburg comes mainly from household fuel burning, vehicles and dust, and it rises in winter when cold, still air traps it close to the ground. A survey of 3,000 residents found that 92% are worried about air pollution, yet only 5% know what is being done about it.',
        'Breathe Joburg partnered with the Youth@SAIIA programme to close that gap. Fifty young people aged 13 to 25 were trained on air quality and prepared to lead sessions in their schools and neighbourhoods. Through the youth-led Air Aware campaign, they took conversations about clean air into classrooms, homes and community halls.',
        'The campaign has opened new channels between city officials and young residents. Alongside it, the City of Johannesburg is building its evidence base, including a study of vehicle emissions on its roads, so that action can target the sources that matter most.',
      ],
      sources: [
        {
          label: 'breathecities.org · johannesburg',
          url: 'https://breathecities.org/cities/johannesburg/',
          status: 'verified',
        },
        {
          label: 'breathecities.org · youth-action-breathing-new-life-into-johannesburg',
          url: 'https://breathecities.org/youth-action-breathing-new-life-into-johannesburg/',
          status: 'verified',
        },
        {
          label: 'joburg.org.za',
          url: 'https://joburg.org.za/about_/government/Documents/CLEAN-AIR-FUND-FINAL-REPORT-2025.pdf',
          status: 'verified',
        },
        {
          label: 'trueinitiative.org',
          url: 'https://trueinitiative.org/insights/first-ever-roadside-remote-sensing-study-launches-in-johannesburg-south-africa/',
          status: 'verified',
        },
      ],
      leadPhoto: null,
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Air Quality Management Plan',
        description: 'The City\'s plan for managing air quality, which names household fuel burning, vehicles and dust as the main local sources.',
        url: 'https://joburg.org.za/documents_/Documents/AQMP%202019.pdf',
        status: 'verified',
      },
      {
        name: 'Air Pollution Control By-laws',
        description: 'Local rules, made under national air quality law, that set out how air pollution is controlled in the city.',
        url: 'https://joburg.org.za/documents_/Documents/By-Laws/2022/City%20of%20Johannesburg%20Air%20Pollution%20Control%20By-laws%2013%20October%202021.pdf',
        status: 'verified',
      },
      {
        name: 'Defining a Clean Air Zone for Johannesburg',
        description: 'Work with residents and partners to define a Clean Air Zone, starting with how people experience air quality.',
        url: 'https://joburg.org.za/about_/government/Documents/CLEAN-AIR-FUND-FINAL-REPORT-2025.pdf',
        status: 'verified',
      },
      {
        name: 'Air Aware youth campaign',
        description: 'A youth-led campaign that trains young people to raise awareness of air pollution in schools and communities.',
        url: 'https://saiia.org.za/news/youthsaiia-host-air-aware-youth-led-conference/',
        status: 'verified',
      },
      {
        name: 'Roadside vehicle emissions study',
        description: 'South Africa\'s first roadside study measuring real-world exhaust emissions, carried out in Johannesburg.',
        url: 'https://trueinitiative.org/insights/first-ever-roadside-remote-sensing-study-launches-in-johannesburg-south-africa/',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-48.png',
        alt: 'A technician works on an air quality monitoring station mounted on a pole.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/johannesburg/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-49.png',
        alt: 'A young woman in an orange bib sits on the grass holding a \'Clean air for all\' sign.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/johannesburg/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/11/Riccardo-Parretti-Pexels-62.png',
        alt: 'A youth leader speaks to a seated audience at an outdoor event.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/youth-action-breathing-new-life-into-johannesburg/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/01/Untitled-design-2025-01-23T111447.790-2048x2048.png',
        alt: 'People walk past a colourful \'Portal to Africa\' mural.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/johannesburg-launches-breathe-cities-initiative/',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'South African Air Quality Information System (SAAQIS)',
          url: 'https://saaqis.environment.gov.za/',
          status: 'verified',
        },
      ],
      getTheData: [],
      departmentResponsible: {
        label: 'Environment and Infrastructure Services Department (EISD)',
        url: 'https://joburg.org.za/departments_/Pages/Environment-and-Infrastructure-Department.aspx',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'South African Air Quality Information System (SAAQIS)',
      url: 'https://saaqis.environment.gov.za/',
      status: 'verified',
    },
  },
  'mexico-city': {
    landmark: {
      src: 'https://breathecities.org/wp-content/uploads/2025/07/Country-cards-2026-05-06T140212.407.png',
      alt: 'An aerial view of the Angel of Independence monument on its roundabout, surrounded by skyscrapers.',
      credit: 'Breathe Cities',
      sourceUrl: 'https://breathecities.org/cities/mexico-city/',
      status: 'verified',
    },
    population: {
      display: '17.7 million',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'un.org',
        url: 'https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_data-booklet_world_cities_in_2025.pdf',
        status: 'verified',
      },
      status: 'verified',
    },
    leadAgency: {
      name: 'Mexico City Secretariat of the Environment (SEDEMA)',
      status: 'verified',
    },
    joinedBC: {
      year: 2024,
      status: 'verified',
    },
    featureStory: {
      title: 'Air quality data where communities gather',
      paragraphs: [
        'Mexico City\'s official monitoring network provides air quality data for the whole city, but it cannot show how pollution varies from one neighbourhood to the next, where people live and spend their time.',
        'In May 2026, the city\'s Secretariat of the Environment announced the first phase of its first low-cost air quality sensor network. Up to 15 sensors will be installed at community hubs that bring residents together for cultural, recreational and health activities. Many of these sites are in areas with the highest pollution burden.',
        'The real-time data will help city authorities and community leaders find local hotspots, assess risks during outdoor events and act where and when residents are most exposed. Breathe Cities is funding the sensors and has advised the city on the design of the network.',
      ],
      sources: [
        {
          label: 'breathecities.org',
          url: 'https://breathecities.org/mexico-city-launches-citys-first-low-cost-air-sensor-network/',
          status: 'verified',
        },
      ],
      leadPhoto: {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Riccardo-Parretti-Pexels-69.png',
        alt: 'A taxi driver stands beside his pink and white taxi.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/mexico-city/',
        status: 'verified',
      },
      status: 'drafted',
    },
    programmes: [
      {
        name: 'ProAire 2021-2030',
        description: 'The air quality management programme for the Mexico City metropolitan area to 2030.',
        url: 'http://www.aire.cdmx.gob.mx/descargas/publicaciones/flippingbook/proaire2021-2030/',
        status: 'verified',
      },
      {
        name: 'First low-cost air quality sensor network',
        description: 'Up to 15 sensors at community hubs, giving neighbourhood-level, real-time air quality data.',
        url: 'https://breathecities.org/mexico-city-launches-citys-first-low-cost-air-sensor-network/',
        status: 'verified',
      },
      {
        name: 'Vehicle emissions testing',
        description: 'The city\'s vehicle inspection programme that checks exhaust emissions against set limits.',
        url: 'https://sedema.cdmx.gob.mx/programas/programa/verificacion-vehicular',
        status: 'verified',
      },
      {
        name: 'Taxi replacement programme',
        description: 'Financial support for taxi owners to replace older vehicles with efficient, hybrid or electric models.',
        url: 'https://app.semovi.cdmx.gob.mx/sustitucion-2025',
        status: 'verified',
      },
      {
        name: 'Air quality forecast',
        description: 'A daily forecast of air quality and weather from the city\'s atmospheric monitoring team.',
        url: 'http://www.aire.cdmx.gob.mx/pronostico-aire/pronostico-calidad-aire.php',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://breathecities.org/wp-content/uploads/2025/07/Mexico-City-Bus-1-2048x2048.png',
        alt: 'A man fixes a \'Soy taxi eléctrico\' (I am an electric taxi) sticker to the door of a pink and white taxi.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/cities/mexico-city/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2026/05/Riccardo-Parretti-Pexels-73.png',
        alt: 'A green city bus on a street, with office towers behind.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/mexico-city-launches-citys-first-low-cost-air-sensor-network/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2024/10/iStock-Mexico-City-1-2048x1365.jpg',
        alt: 'A busy pedestrian street in the historic centre, with the Torre Latinoamericana in the distance.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/mexico-city-joins-breathe-cities-initiative-to-cut-air-pollution/',
        status: 'verified',
      },
      {
        src: 'https://breathecities.org/wp-content/uploads/2023/11/people-cycling-at-the-street.jpg_s1024x1024wisk20cFfE7SKCa8imMKBvbnPfHB-vFfofZm1JZhhUgaWIivvw-1.jpg',
        alt: 'An aerial view of people cycling along Paseo de la Reforma, lined with trees.',
        credit: 'Breathe Cities',
        sourceUrl: 'https://breathecities.org/',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'Air quality in Mexico City',
          url: 'http://www.aire.cdmx.gob.mx/',
          status: 'verified',
        },
        {
          label: 'Aire CDMX app (App Store)',
          url: 'https://apps.apple.com/us/app/aire-cdmx/id6740999071',
          status: 'verified',
        },
        {
          label: 'Aire CDMX app (Google Play)',
          url: 'https://play.google.com/store/apps/details?id=com.aire.cdmx',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'Open air quality data downloads',
          url: 'http://www.aire.cdmx.gob.mx/default.php?opc=\'aKBhnmM=\'',
          status: 'verified',
        },
      ],
      departmentResponsible: {
        label: 'Secretaría del Medio Ambiente (SEDEMA)',
        url: 'https://www.sedema.cdmx.gob.mx/',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'Air quality in Mexico City',
      url: 'http://www.aire.cdmx.gob.mx/',
      status: 'verified',
    },
  },
  // Milan is tier 1 (shares nothing), so it has no sensor cards; `dataSource` is carried for
  // completeness and is not rendered. BC has no photographs of Milan, so every photo is a
  // free-licence Unsplash photo, credited (pack photosNote).
  milan: {
    landmark: {
      src: 'https://images.unsplash.com/photo-1567760855784-589f09ed5dc6?w=1600&q=80',
      alt: 'Milan Cathedral reflected in rainwater on the square in front of it.',
      credit: 'Photo by Fernando Meloni on Unsplash',
      sourceUrl: 'https://unsplash.com/photos/milan-cathedral-italy-x9Qixy7lbzo',
      status: 'verified',
    },
    population: {
      display: '[about 2.6 million]',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'population.un.org',
        url: 'https://population.un.org/wup/downloads/?tab=Cities',
        status: 'placeholder',
      },
      status: 'placeholder',
    },
    leadAgency: {
      name: 'City of Milan',
      status: 'verified',
    },
    joinedBC: {
      year: 2023,
      status: 'verified',
    },
    featureStory: {
      title: 'A city redesigned around people',
      paragraphs: [
        'Milan sits in the Po Valley, where mountains on three sides slow the movement of air and let pollutants build up. The city names particulate matter and nitrogen dioxide as its critical pollutants, and road traffic as a major source.',
        'The city\'s Piano Aria e Clima, its air and climate plan, sets out the response. Area B limits access for the oldest and most polluting vehicles, and the Piazze Aperte programme turns road space into squares and pedestrian areas, including in front of schools.',
        'Milan is also building 750 kilometres of cycling routes by 2035, and air quality workshops are reaching students and teachers across the city. City leaders share this work with other mayors through Breathe Cities, including at the COP30 Local Leaders Forum.',
      ],
      sources: [
        {
          label: 'www2.comune.milano.it',
          url: 'https://www2.comune.milano.it/web/milano-cambia-aria/che-aria-tira',
          status: 'verified',
        },
        {
          label: 'comune.milano.it · piano-aria-e-clima',
          url: 'https://www.comune.milano.it/argomenti/ambiente-e-animali/piano-aria-e-clima',
          status: 'verified',
        },
        {
          label: 'comune.milano.it · area-b',
          url: 'https://www.comune.milano.it/argomenti/mobilita/area-b',
          status: 'verified',
        },
        {
          label: 'comune.milano.it · piazze-aperte',
          url: 'https://www.comune.milano.it/argomenti/spazio-pubblico/piazze-aperte',
          status: 'verified',
        },
        {
          label: 'breathecities.org · breathe-cities-celebrates-two-years-of-global-clean-air-action',
          url: 'https://breathecities.org/breathe-cities-celebrates-two-years-of-global-clean-air-action/',
          status: 'verified',
        },
        {
          label: 'breathecities.org · global-breathe-cities-mayors-unite-on-air-quality-action-at-cop30-local-leaders-forum',
          url: 'https://breathecities.org/global-breathe-cities-mayors-unite-on-air-quality-action-at-cop30-local-leaders-forum/',
          status: 'verified',
        },
      ],
      leadPhoto: null,
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Air and Climate Plan',
        description: 'Milan\'s plan to improve air quality and tackle climate change, with goals for 2030 and 2050.',
        url: 'https://www.comune.milano.it/argomenti/ambiente-e-animali/piano-aria-e-clima',
        status: 'verified',
      },
      {
        name: 'Area B',
        description: 'A low emission zone that limits access for the oldest and most polluting vehicles on weekdays.',
        url: 'https://www.comune.milano.it/argomenti/mobilita/area-b',
        status: 'verified',
      },
      {
        name: 'Area C',
        description: 'A charged limited-traffic zone in the city centre, with camera-controlled access on weekdays.',
        url: 'https://www.comune.milano.it/argomenti/mobilita/area-c',
        status: 'verified',
      },
      {
        name: 'Open Squares',
        description: 'A programme that turns road space into public squares and pedestrian areas at the heart of neighbourhoods.',
        url: 'https://www.comune.milano.it/argomenti/spazio-pubblico/piazze-aperte',
        status: 'verified',
      },
      {
        name: 'Milano Cambia Aria',
        description: 'The city\'s information and participation hub for its air quality and climate measures.',
        url: 'https://www2.comune.milano.it/web/milano-cambia-aria',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1530284610319-31ee7c55378e?w=1600&q=80',
        alt: 'The two Bosco Verticale towers, their balconies covered in trees and plants.',
        credit: 'Photo by Daniel Seßler on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-very-tall-building-with-a-lot-of-plants-growing-on-it-xOwotZP8yZk',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1587685780550-2cc6257fb829?w=1600&q=80',
        alt: 'A yellow tram on a street lined with stone buildings.',
        credit: 'Photo by Pedro Sanz on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/yellow-and-white-tram-on-street-during-daytime-LyHUUTNBBAE',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1668603751485-4270c3581f3a?w=1600&q=80',
        alt: 'A tree-lined avenue with tram tracks leading to a stone triumphal arch.',
        credit: 'Photo by Al Elmes on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-stone-archway-with-trees-and-bicycles-Ob6foQ3zFuk',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1644764478839-b1d22760a966?w=1600&q=80',
        alt: 'A view from the roof of Milan Cathedral over a busy street at sunset.',
        credit: 'Photo by Despina Galani on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-view-of-a-city-with-a-lot-of-tall-buildings-7ovd4eNzAOE',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1715608088294-52e71cfac0c1?w=1600&q=80',
        alt: 'A yellow tram on a city street under overhead tram wires.',
        credit: 'Photo by Faezeh Taheri on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-street-with-a-yellow-tram-on-it-7MzedenNF3M',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'Daily air quality report (AMAT)',
          url: 'https://www.amat-mi.it/it/agenzia/rapporto-qualita-aria/',
          status: 'verified',
        },
        {
          label: 'Air quality at fixed stations (ARPA Lombardia)',
          url: 'https://www.arpalombardia.it/temi-ambientali/aria/stazioni-fisse/',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'City of Milan Open Data: air quality 2025',
          url: 'https://dati.comune.milano.it/dataset/ds406-rilevazione-qualita-aria-2025',
          status: 'verified',
        },
        {
          label: 'Lombardy Open Data: air quality stations',
          url: 'https://www.dati.lombardia.it/Ambiente/Stazioni-qualit-dell-aria/ib47-atvt',
          status: 'verified',
        },
      ],
      departmentResponsible: {
        label: 'Direzione Transizione Ambientale, Comune di Milano',
        url: 'https://partecipazione.comune.milano.it/processes/piano-aria-clima/f/23/',
        status: 'drafted',
      },
    },
    dataSource: {
      label: 'Air quality at fixed stations (ARPA Lombardia)',
      url: 'https://www.arpalombardia.it/temi-ambientali/aria/stazioni-fisse/',
      status: 'verified',
    },
  },
  sofia: {
    landmark: {
      src: 'https://images.unsplash.com/photo-1594803294810-c860e5d29e07?w=1600&q=80',
      alt: 'The domes of the Alexander Nevsky Cathedral against a blue sky.',
      credit: 'Photo by Ivan Nedelchev on Unsplash',
      sourceUrl: 'https://unsplash.com/photos/green-and-blue-dome-building-under-blue-sky-during-daytime-OENyTAi9dg0',
      status: 'verified',
    },
    population: {
      display: '[about 1.1 million]',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'population.un.org',
        url: 'https://population.un.org/wup/downloads/?tab=Cities',
        status: 'placeholder',
      },
      status: 'placeholder',
    },
    leadAgency: {
      name: 'Sofia Municipality, Climate, Energy and Air Directorate',
      status: 'verified',
    },
    joinedBC: {
      year: 2023,
      status: 'verified',
    },
    featureStory: {
      title: 'Cleaner heating for thousands of homes',
      paragraphs: [
        'In winter, homes heated with wood and coal are a major source of the harmful particles in Sofia\'s air. Sofia Municipality is tackling this pollution where it starts: in people\'s homes.',
        'Through its current project, the municipality replaces solid-fuel stoves free of charge with heat pumps, air conditioners or pellet appliances. The project aims to reach 10,815 homes by the end of 2029 and to cut PM10 emissions by 222.8 tonnes a year.',
        'The city pairs this work with low emission zones and brings residents into the conversation. In 2026, the outdoor exhibition “The Air” on Sofia\'s Lovers\' Bridge, created by the Air for Health association, Sofia Municipality and New Bulgarian University with support from Breathe Cities, set photographs from a national contest beside data on the city\'s clean air measures.',
      ],
      sources: [
        {
          label: 'sofia.bg · replacement-heating-devices',
          url: 'https://www.sofia.bg/en/replacement-heating-devices',
          status: 'verified',
        },
        {
          label: 'sofia.bg · low-emission-zones',
          url: 'https://www.sofia.bg/en/low-emission-zones',
          status: 'verified',
        },
        {
          label: 'breathecities.org · the-air-of-sofia',
          url: 'https://breathecities.org/the-air-of-sofia/',
          status: 'verified',
        },
        {
          label: 'breathecities.org · what-are-effective-solutions-to-reduce-air-pollution-in-cities',
          url: 'https://breathecities.org/what-are-effective-solutions-to-reduce-air-pollution-in-cities/',
          status: 'verified',
        },
      ],
      leadPhoto: null,
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Replacing household heating for cleaner air',
        description: 'Free replacement of wood and coal stoves with heat pumps, air conditioners or pellet appliances in 10,815 homes by 2029.',
        url: 'https://www.sofia.bg/en/replacement-heating-devices',
        status: 'verified',
      },
      {
        name: 'Low emission zones',
        description: 'Winter restrictions on older, more polluting cars in the city centre, alongside zones for household heating.',
        url: 'https://www.sofia.bg/en/low-emission-zones',
        status: 'verified',
      },
      {
        name: 'Air Quality Improvement Programme 2021-2026',
        description: 'The EU co-funded project that prepared Sofia\'s air quality improvement programme for 2021 to 2026.',
        url: 'https://www.sofia.bg/en/programa-kav',
        status: 'verified',
      },
      {
        name: 'AIRTHINGS',
        description: 'A cross-border project, led by Sofia since 2017, that builds local sensor networks to monitor air quality.',
        url: 'https://www.sofia.bg/en/airthings',
        status: 'verified',
      },
      {
        name: '“The Air” photo exhibition',
        description: 'An outdoor exhibition that set photographs from a national contest beside data on Sofia\'s clean air measures.',
        url: 'https://breathecities.org/the-air-of-sofia/',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1658609510512-a3f1130edcd2?w=1600&q=80',
        alt: 'A stone bridge with lamp posts crossing a river in central Sofia.',
        credit: 'Photo by Kate Krasautsava on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-bridge-over-a-river-with-buildings-on-either-side-of-it-WAwnlT5MeDA',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1722500686315-dbd3ef1757eb?w=1600&q=80',
        alt: 'A fountain in front of a large historic building in the city centre.',
        credit: 'Photo by Olga Pro on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-large-building-with-a-fountain-in-front-of-it-_MbRl8jBNAA',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1591169660625-afa97a38b06b?w=1600&q=80',
        alt: 'A tree-lined street with tram tracks and traffic in the distance.',
        credit: 'Photo by Stoyan Kolev on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/white-bus-on-road-near-green-trees-during-daytime-AOdVjoGzU40',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1585645740103-36761f582c22?w=1600&q=80',
        alt: 'The Sofia skyline with mountains behind, seen above the treetops.',
        credit: 'Photo by Roaming Pictures on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/green-trees-near-city-buildings-during-daytime-U_7473luWPg',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1562655966-663054e42737?w=1600&q=80',
        alt: 'Red tulips in front of a yellow historic building.',
        credit: 'Photo by Hristo Sahatchiev on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/red-tulip-flowers-near-yellow-house-1eMQC6m2WQM',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'Sofia air quality information system',
          url: 'https://air.sofia.bg/',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'Data from automatic monitoring stations',
          url: 'https://air.sofia.bg/airpublic/air/data/forecasts/measures/list/',
          status: 'verified',
        },
      ],
      departmentResponsible: {
        label: 'Climate, Energy and Air Directorate, Sofia Municipality',
        url: 'https://www.sofia.bg/en/web/mayor-of-sofia/climate-energy-air',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'European Air Quality Index for Sofia',
      url: 'https://air.sofia.bg/airpublic/air/data/european/index/list/',
      status: 'verified',
    },
  },
  // joinedBC is 2022 because BC describes Warsaw's pilot as launched in 2022, before Breathe
  // Cities itself launched in 2023 (pack notes). Switch to 2023 if "joined" should mean the
  // initiative rather than the pilot.
  warsaw: {
    landmark: {
      src: 'https://images.unsplash.com/photo-1577133192629-5140c5371590?w=1600&q=80',
      alt: 'An aerial view of the Old Town and Castle Square.',
      credit: 'Photo by Lāsma Artmane on Unsplash',
      sourceUrl: 'https://unsplash.com/photos/city-during-day-p6gxHYb43v0',
      status: 'verified',
    },
    population: {
      display: '[about 1.9 million]',
      label: 'Urban area population · UN estimate',
      source: {
        label: 'population.un.org',
        url: 'https://population.un.org/wup/downloads/?tab=Cities',
        status: 'placeholder',
      },
      status: 'placeholder',
    },
    leadAgency: {
      name: 'City of Warsaw, Air Protection and Climate Policy Office',
      status: 'verified',
    },
    joinedBC: {
      year: 2022,
      status: 'verified',
    },
    featureStory: {
      title: 'Warsaw\'s move away from coal heating',
      paragraphs: [
        'For years, old coal and solid-fuel stoves, known in Polish as kopciuchy, were a major cause of Warsaw\'s polluted air. In 2017, around 15,000 were still in use across the city.',
        'The city funded replacements for residents, removed old stoves from municipal housing and checked that the regional anti-smog rules were followed. By the end of 2024, about 1,510 remained. Since 2017, concentrations of PM10 and PM2.5 have fallen by more than 30%, and 2023 was the first year on record in which no Warsaw station exceeded the standards for these particles.',
        'Traffic pollution remains a challenge, with nitrogen dioxide from cars still a concern. In July 2024, Warsaw opened Poland\'s first Clean Transport Zone, covering 37 square kilometres of the city centre, and a campaign supported by Breathe Cities helped raise awareness of it.',
      ],
      sources: [
        {
          label: 'eko.um.warszawa.pl · powietrze',
          url: 'https://eko.um.warszawa.pl/powietrze',
          status: 'verified',
        },
        {
          label: 'eko.um.warszawa.pl · statystyki-i-dane-pomiarowe',
          url: 'https://eko.um.warszawa.pl/statystyki-i-dane-pomiarowe',
          status: 'verified',
        },
        {
          label: 'um.warszawa.pl',
          url: 'https://um.warszawa.pl/-/program-wymiany-kopciuchow',
          status: 'verified',
        },
        {
          label: 'transport.um.warszawa.pl',
          url: 'https://transport.um.warszawa.pl/sct',
          status: 'verified',
        },
        {
          label: 'breathecities.org',
          url: 'https://breathecities.org/breathe-cities-celebrates-two-years-of-global-clean-air-action/',
          status: 'verified',
        },
      ],
      leadPhoto: null,
      status: 'drafted',
    },
    programmes: [
      {
        name: 'Clean Transport Zone',
        description: 'Poland\'s first clean transport zone, limiting the most polluting vehicles across 37 square kilometres of the centre.',
        url: 'https://transport.um.warszawa.pl/sct',
        status: 'verified',
      },
      {
        name: 'Stove replacement programme',
        description: 'The city programme that funded the replacement of old coal and solid-fuel stoves.',
        url: 'https://um.warszawa.pl/-/program-wymiany-kopciuchow',
        status: 'verified',
      },
      {
        name: 'Warsaw air quality measurement system',
        description: 'City monitoring stations and a sensor network across Warsaw and neighbouring municipalities.',
        url: 'https://eko.um.warszawa.pl/-/pomiary-powietrza',
        status: 'verified',
      },
      {
        name: 'Boiler room modernisation grants',
        description: 'City grants to modernise heating systems in buildings.',
        url: 'https://eko.um.warszawa.pl/modernizacja-kotlowni',
        status: 'verified',
      },
      {
        name: 'Running for Clean Air',
        description: 'A completed project with World Athletics and the Warsaw Marathon that linked running with air quality.',
        url: 'https://eko.um.warszawa.pl/rfca',
        status: 'verified',
      },
    ],
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1553422734-fd8dd260a116?w=1600&q=80',
        alt: 'Colourful historic houses in the Old Town.',
        credit: 'Photo by Maksym Harbar on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/people-walking-near-multicolored-building-okn8ZIjPMxI',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1719344392256-a49508f4db8d?w=1600&q=80',
        alt: 'The Warsaw skyline at sunset, seen across the Vistula river.',
        credit: 'Photo by Jacek Kadaj on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/a-boat-traveling-down-a-river-with-a-city-skyline-in-the-background-uBuyj3bkphA',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1573157268772-519f309dc212?w=1600&q=80',
        alt: 'A wide street lined with historic buildings and street lamps.',
        credit: 'Photo by Victor Malyushev on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/people-crossing-on-street-between-concrete-structures-XEAoXLVsCRE',
        status: 'verified',
      },
      {
        src: 'https://images.unsplash.com/photo-1686293601641-46d7defc668e?w=1600&q=80',
        alt: 'Modern high-rise towers in the city centre at dusk.',
        credit: 'Photo by Simona Hantáková on Unsplash',
        sourceUrl: 'https://unsplash.com/photos/an-aerial-view-of-a-city-with-tall-buildings-JSK-GO4EwAY',
        status: 'verified',
      },
    ],
    goFurther: {
      checkTodaysAir: [
        {
          label: 'Warsaw air quality map (IoT platform)',
          url: 'https://iot.warszawa.pl/mapa?filter=air',
          status: 'verified',
        },
        {
          label: 'Warsaw Air Index (Warszawa 19115)',
          url: 'https://warszawa19115.pl/en/-/warszawski-indeks-powietrza',
          status: 'verified',
        },
      ],
      getTheData: [
        {
          label: 'Warsaw open data',
          url: 'https://api.um.warszawa.pl/',
          status: 'verified',
        },
        {
          label: 'Air Quality Portal (GIOŚ, national)',
          url: 'https://powietrze.gios.gov.pl/pjp/home',
          status: 'verified',
        },
      ],
      departmentResponsible: {
        label: 'Air Protection and Climate Policy Office',
        url: 'https://warszawa19115.pl/en/-/biuro-ochrony-powietrza-i-polityki-klimatycznej',
        status: 'verified',
      },
    },
    dataSource: {
      label: 'Warsaw Air Index (Warszawa 19115)',
      url: 'https://warszawa19115.pl/en/-/warszawski-indeks-powietrza',
      status: 'verified',
    },
  },
}
