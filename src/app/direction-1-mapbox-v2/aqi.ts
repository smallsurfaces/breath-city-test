/**
 * aqi.ts — AQI category mapping for PM2.5 values
 *
 * Maps a PM2.5 concentration (µg/m³) to its US EPA AQI category,
 * colour code, and label. Used by the triangulation popup to colour-
 * code the averaged result shown at a clicked map point.
 *
 * Breakpoints are from the US EPA PM2.5 24-hour AQI standard.
 */

/** A single AQI category with its display colour and label. */
export type AQICategory = {
  label: string
  /** CSS colour string for use in inline styles */
  color: string
  /** Accessible text colour to use on top of `color` as a background */
  textColor: string
}

/**
 * Returns the AQI category for a given PM2.5 value.
 * Falls back to the highest tier if the value exceeds all thresholds.
 */
export function getAQICategory(pm25: number): AQICategory {
  if (pm25 <= 12.0) {
    return { label: 'Good', color: '#3db54a', textColor: '#ffffff' }
  }
  if (pm25 <= 35.4) {
    return { label: 'Moderate', color: '#f5c518', textColor: '#1a1a1a' }
  }
  if (pm25 <= 55.4) {
    return { label: 'Unhealthy for Sensitive Groups', color: '#f57c00', textColor: '#ffffff' }
  }
  if (pm25 <= 150.4) {
    return { label: 'Unhealthy', color: '#e53935', textColor: '#ffffff' }
  }
  return { label: 'Very Unhealthy / Hazardous', color: '#7b1fa2', textColor: '#ffffff' }
}
