/**
 * bogota/page.tsx — the Bogotá city page. Every city page renders the shared CityPageView (the Bogotá
 * template, iteration 4) with its own data file; see ../_components/city/CityPageView.tsx for the
 * order and ../_data/bogota.ts for the data and its sources. All mock figures sit under the hub's
 * "Prototype with sample data" notice (round 3 decision H).
 *
 * Key exports: default page, metadata
 * External dependencies: next (Metadata), ../_components/city/CityPageView, ../_data/bogota.
 */

import type { Metadata } from 'next'
import { CityPageView } from '../_components/city/CityPageView'
import { BOGOTA } from '../_data/bogota'

/** Browser tab title. */
export const metadata: Metadata = { title: 'Bogotá · Breathe Data Atlas' }

export default function Page() {
  return <CityPageView city={BOGOTA} />
}
