/**
 * jakarta/page.tsx — the Jakarta city page. Every city page renders the shared CityPageView (the Bogotá
 * template, iteration 4) with its own data file; see ../_components/city/CityPageView.tsx for the
 * order and ../_data/jakarta.ts for the data and its sources. All mock figures sit under the hub's
 * "Prototype with sample data" notice (round 3 decision H).
 *
 * Key exports: default page, metadata
 * External dependencies: next (Metadata), ../_components/city/CityPageView, ../_data/jakarta.
 */

import type { Metadata } from 'next'
import { CityPageView } from '../_components/city/CityPageView'
import { JAKARTA } from '../_data/jakarta'

/** Browser tab title. */
export const metadata: Metadata = { title: 'Jakarta · Breathe Data Atlas' }

export default function Page() {
  return <CityPageView city={JAKARTA} />
}
