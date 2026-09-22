/**
 * m49-regions.ts — which Breathe Cities region every country belongs to, for the globe's region tints
 * (round 2, item 6).
 *
 * SOURCE: UN M49 ("Standard country or area codes for statistical use", UN Statistics Division),
 * https://unstats.un.org/unsd/methodology/m49/
 *
 * Purpose
 *   Breathe Cities groups its cities in four regions on breathecities.org/cities: Africa, Asia,
 *   Europe and LAC (Jack's call, 2026-09-22). The globe tints the WHOLE region, not only the member
 *   countries, so it needs every country's region. The country extent of each region follows the M49
 *   regions exactly:
 *     africa  = M49 Africa (002)
 *     asia    = M49 Asia (142), including Western Asia (Turkey, the Caucasus, Cyprus, the Gulf)
 *     europe  = M49 Europe (150), including the whole of Russia
 *     lac     = M49 Latin America and the Caribbean (419), including Mexico and the Caribbean
 *   Northern America (021), Oceania (009) and Antarctica (010) are not Breathe Cities regions and stay
 *   untinted: they are listed here with `null`, so the table is explicit about every country.
 *
 *   This is the concept's own taxonomy. It deliberately does NOT reuse the `region` field in
 *   global-toolkit-network or the `continent` field in /jtbd-framework, which use other labels.
 *
 * Keys
 *   ISO 3166-1 numeric codes as zero-padded strings, which is how `world-atlas` ids its countries
 *   (M49 uses the same numbers for countries). The table covers every country in world-atlas's
 *   110m and 50m datasets. A handful of world-atlas features carry no id (disputed or partially
 *   recognised areas); those are keyed by their world-atlas name in M49_REGION_BY_NAME.
 *
 * Judgement calls (M49 does not list these separately)
 *   - Taiwan (158): Eastern Asia, so asia.
 *   - Kosovo: listed by M49 under Serbia, so europe.
 *   - N. Cyprus: with Cyprus (Western Asia), so asia.
 *   - Somaliland: with Somalia (Eastern Africa), so africa.
 *   - Siachen Glacier: Southern Asia, so asia.
 *
 * Overseas parts drawn inside another country's outline
 *   world-atlas draws French Guiana (and, at 50m, Guadeloupe, Martinique, Réunion and Mayotte) as
 *   parts of France. M49 puts them in LAC or Africa, so franceOverseasRegion reassigns those parts
 *   by where they lie. No other overseas part changes region at globe scale.
 *
 * Key exports: AtlasRegion (type), ATLAS_REGIONS, M49_REGION_BY_ISO_NUMERIC, M49_REGION_BY_NAME,
 *   m49RegionOf, FRANCE_ISO_NUMERIC, franceOverseasRegion
 * External dependencies: none.
 */

/** One of Breathe Cities' four regions (breathecities.org/cities). */
export type AtlasRegion = 'africa' | 'asia' | 'europe' | 'lac'

/** The four regions, in a stable order. */
export const ATLAS_REGIONS: AtlasRegion[] = ['africa', 'asia', 'europe', 'lac']

/**
 * Region for each country, by ISO 3166-1 numeric code. `null` means the country is in M49 Northern
 * America, Oceania or Antarctica and stays untinted.
 */
export const M49_REGION_BY_ISO_NUMERIC: Record<string, AtlasRegion | null> = {
  // ---- Africa (M49 002) ----
  '012': 'africa', // Algeria
  '024': 'africa', // Angola
  '072': 'africa', // Botswana
  '086': 'africa', // British Indian Ocean Territory (M49 Eastern Africa)
  '108': 'africa', // Burundi
  '120': 'africa', // Cameroon
  '132': 'africa', // Cabo Verde
  '140': 'africa', // Central African Republic
  '148': 'africa', // Chad
  '174': 'africa', // Comoros
  '178': 'africa', // Congo
  '180': 'africa', // Democratic Republic of the Congo
  '204': 'africa', // Benin
  '226': 'africa', // Equatorial Guinea
  '231': 'africa', // Ethiopia
  '232': 'africa', // Eritrea
  '260': 'africa', // French Southern Territories (M49 Eastern Africa)
  '262': 'africa', // Djibouti
  '266': 'africa', // Gabon
  '270': 'africa', // Gambia
  '288': 'africa', // Ghana
  '324': 'africa', // Guinea
  '384': 'africa', // Côte d'Ivoire
  '404': 'africa', // Kenya
  '426': 'africa', // Lesotho
  '430': 'africa', // Liberia
  '434': 'africa', // Libya
  '450': 'africa', // Madagascar
  '454': 'africa', // Malawi
  '466': 'africa', // Mali
  '478': 'africa', // Mauritania
  '480': 'africa', // Mauritius
  '504': 'africa', // Morocco
  '508': 'africa', // Mozambique
  '516': 'africa', // Namibia
  '562': 'africa', // Niger
  '566': 'africa', // Nigeria
  '624': 'africa', // Guinea-Bissau
  '646': 'africa', // Rwanda
  '654': 'africa', // Saint Helena
  '678': 'africa', // São Tomé and Príncipe
  '686': 'africa', // Senegal
  '690': 'africa', // Seychelles
  '694': 'africa', // Sierra Leone
  '706': 'africa', // Somalia
  '710': 'africa', // South Africa
  '716': 'africa', // Zimbabwe
  '728': 'africa', // South Sudan
  '729': 'africa', // Sudan
  '732': 'africa', // Western Sahara
  '748': 'africa', // Eswatini
  '768': 'africa', // Togo
  '788': 'africa', // Tunisia
  '800': 'africa', // Uganda
  '818': 'africa', // Egypt
  '834': 'africa', // Tanzania
  '854': 'africa', // Burkina Faso
  '894': 'africa', // Zambia

  // ---- Asia (M49 142), including Western Asia ----
  '004': 'asia', // Afghanistan
  '031': 'asia', // Azerbaijan
  '048': 'asia', // Bahrain
  '050': 'asia', // Bangladesh
  '051': 'asia', // Armenia
  '064': 'asia', // Bhutan
  '096': 'asia', // Brunei Darussalam
  '104': 'asia', // Myanmar
  '116': 'asia', // Cambodia
  '144': 'asia', // Sri Lanka
  '156': 'asia', // China
  '158': 'asia', // Taiwan (not listed separately in M49; Eastern Asia)
  '196': 'asia', // Cyprus
  '268': 'asia', // Georgia
  '275': 'asia', // State of Palestine
  '344': 'asia', // Hong Kong
  '356': 'asia', // India
  '360': 'asia', // Indonesia
  '364': 'asia', // Iran
  '368': 'asia', // Iraq
  '376': 'asia', // Israel
  '392': 'asia', // Japan
  '398': 'asia', // Kazakhstan
  '400': 'asia', // Jordan
  '408': 'asia', // North Korea
  '410': 'asia', // South Korea
  '414': 'asia', // Kuwait
  '417': 'asia', // Kyrgyzstan
  '418': 'asia', // Laos
  '422': 'asia', // Lebanon
  '446': 'asia', // Macao
  '458': 'asia', // Malaysia
  '462': 'asia', // Maldives
  '496': 'asia', // Mongolia
  '512': 'asia', // Oman
  '524': 'asia', // Nepal
  '586': 'asia', // Pakistan
  '608': 'asia', // Philippines
  '626': 'asia', // Timor-Leste
  '634': 'asia', // Qatar
  '682': 'asia', // Saudi Arabia
  '702': 'asia', // Singapore
  '704': 'asia', // Viet Nam
  '760': 'asia', // Syria
  '762': 'asia', // Tajikistan
  '764': 'asia', // Thailand
  '784': 'asia', // United Arab Emirates
  '792': 'asia', // Türkiye
  '795': 'asia', // Turkmenistan
  '860': 'asia', // Uzbekistan
  '887': 'asia', // Yemen

  // ---- Europe (M49 150), including Russia ----
  '008': 'europe', // Albania
  '020': 'europe', // Andorra
  '040': 'europe', // Austria
  '056': 'europe', // Belgium
  '070': 'europe', // Bosnia and Herzegovina
  '100': 'europe', // Bulgaria
  '112': 'europe', // Belarus
  '191': 'europe', // Croatia
  '203': 'europe', // Czechia
  '208': 'europe', // Denmark
  '233': 'europe', // Estonia
  '234': 'europe', // Faroe Islands
  '246': 'europe', // Finland
  '248': 'europe', // Åland Islands
  '250': 'europe', // France (overseas parts: see franceOverseasRegion)
  '276': 'europe', // Germany
  '300': 'europe', // Greece
  '336': 'europe', // Holy See
  '348': 'europe', // Hungary
  '352': 'europe', // Iceland
  '372': 'europe', // Ireland
  '380': 'europe', // Italy
  '428': 'europe', // Latvia
  '438': 'europe', // Liechtenstein
  '440': 'europe', // Lithuania
  '442': 'europe', // Luxembourg
  '470': 'europe', // Malta
  '492': 'europe', // Monaco
  '498': 'europe', // Moldova
  '499': 'europe', // Montenegro
  '528': 'europe', // Netherlands
  '578': 'europe', // Norway
  '616': 'europe', // Poland
  '620': 'europe', // Portugal
  '642': 'europe', // Romania
  '643': 'europe', // Russian Federation
  '674': 'europe', // San Marino
  '688': 'europe', // Serbia
  '703': 'europe', // Slovakia
  '705': 'europe', // Slovenia
  '724': 'europe', // Spain
  '752': 'europe', // Sweden
  '756': 'europe', // Switzerland
  '804': 'europe', // Ukraine
  '807': 'europe', // North Macedonia
  '826': 'europe', // United Kingdom
  '831': 'europe', // Guernsey
  '832': 'europe', // Jersey
  '833': 'europe', // Isle of Man

  // ---- Latin America and the Caribbean (M49 419) ----
  '028': 'lac', // Antigua and Barbuda
  '032': 'lac', // Argentina
  '044': 'lac', // Bahamas
  '052': 'lac', // Barbados
  '068': 'lac', // Bolivia
  '076': 'lac', // Brazil
  '084': 'lac', // Belize
  '092': 'lac', // British Virgin Islands
  '136': 'lac', // Cayman Islands
  '152': 'lac', // Chile
  '170': 'lac', // Colombia
  '188': 'lac', // Costa Rica
  '192': 'lac', // Cuba
  '212': 'lac', // Dominica
  '214': 'lac', // Dominican Republic
  '218': 'lac', // Ecuador
  '222': 'lac', // El Salvador
  '238': 'lac', // Falkland Islands (Malvinas)
  '239': 'lac', // South Georgia and the South Sandwich Islands
  '308': 'lac', // Grenada
  '320': 'lac', // Guatemala
  '328': 'lac', // Guyana
  '332': 'lac', // Haiti
  '340': 'lac', // Honduras
  '388': 'lac', // Jamaica
  '484': 'lac', // Mexico
  '500': 'lac', // Montserrat
  '531': 'lac', // Curaçao
  '533': 'lac', // Aruba
  '534': 'lac', // Sint Maarten
  '558': 'lac', // Nicaragua
  '591': 'lac', // Panama
  '600': 'lac', // Paraguay
  '604': 'lac', // Peru
  '630': 'lac', // Puerto Rico
  '652': 'lac', // Saint Barthélemy
  '659': 'lac', // Saint Kitts and Nevis
  '660': 'lac', // Anguilla
  '662': 'lac', // Saint Lucia
  '663': 'lac', // Saint Martin (French part)
  '670': 'lac', // Saint Vincent and the Grenadines
  '740': 'lac', // Suriname
  '780': 'lac', // Trinidad and Tobago
  '796': 'lac', // Turks and Caicos Islands
  '850': 'lac', // United States Virgin Islands
  '858': 'lac', // Uruguay
  '862': 'lac', // Venezuela

  // ---- Not a Breathe Cities region: untinted ----
  // Northern America (M49 021)
  '060': null, // Bermuda
  '124': null, // Canada
  '304': null, // Greenland
  '666': null, // Saint Pierre and Miquelon
  '840': null, // United States of America
  // Oceania (M49 009)
  '016': null, // American Samoa
  '036': null, // Australia (world-atlas also uses this id for Ashmore and Cartier Islands)
  '090': null, // Solomon Islands
  '184': null, // Cook Islands
  '242': null, // Fiji
  '258': null, // French Polynesia
  '296': null, // Kiribati
  '316': null, // Guam
  '334': null, // Heard Island and McDonald Islands
  '520': null, // Nauru
  '540': null, // New Caledonia
  '548': null, // Vanuatu
  '554': null, // New Zealand
  '570': null, // Niue
  '574': null, // Norfolk Island
  '580': null, // Northern Mariana Islands
  '583': null, // Micronesia
  '584': null, // Marshall Islands
  '585': null, // Palau
  '598': null, // Papua New Guinea
  '612': null, // Pitcairn
  '776': null, // Tonga
  '876': null, // Wallis and Futuna
  '882': null, // Samoa
  // Antarctica (M49 010)
  '010': null, // Antarctica
}

/** Region for the world-atlas features that carry no id, keyed by their world-atlas name. */
export const M49_REGION_BY_NAME: Record<string, AtlasRegion | null> = {
  Kosovo: 'europe',
  'N. Cyprus': 'asia',
  Somaliland: 'africa',
  'Siachen Glacier': 'asia',
  'Indian Ocean Ter.': null, // Christmas Island and the Cocos (Keeling) Islands, M49 Oceania
}

/** world-atlas id for France, whose outline includes overseas parts in other regions. */
export const FRANCE_ISO_NUMERIC = '250'

/**
 * The region of one part (polygon) of France, from where it lies: west of 20 W is French Guiana or
 * the French Caribbean (M49 LAC); south of the equator and east of 40 E is Réunion or Mayotte
 * (M49 Africa). Everything else, including Corsica, is Europe.
 */
export function franceOverseasRegion(lng: number, lat: number): AtlasRegion {
  if (lng < -20) return 'lac'
  if (lng > 40 && lat < 0) return 'africa'
  return 'europe'
}

/**
 * The region for a world-atlas country feature: by id, then by name for the id-less features.
 * Returns null for untinted countries and for any country missing from the table.
 */
export function m49RegionOf(id: string | undefined, name: string): AtlasRegion | null {
  if (id !== undefined && id in M49_REGION_BY_ISO_NUMERIC) return M49_REGION_BY_ISO_NUMERIC[id]
  if (name in M49_REGION_BY_NAME) return M49_REGION_BY_NAME[name]
  return null
}
