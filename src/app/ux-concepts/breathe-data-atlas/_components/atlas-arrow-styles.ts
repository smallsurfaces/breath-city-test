/**
 * atlas-arrow-styles.ts — the one arrow style of the Breathe Atlas cover (round 2, items 2 and 7).
 *
 * Purpose
 *   The class strings for the concept's round arrow controls, so the city carousel (CityBrowser), the
 *   globe's previous/next city arrows (GlobeCover) and the city card's arrow (CityCard) are the same
 *   control rather than three look-alikes. Moved here unchanged from CityBrowser.
 *
 *   - NAV_ARROW_CLASS: the 56px outlined circle of the carousel's prev/next buttons, with the
 *     aria-disabled look at either end of the row.
 *   - CARD_ARROW_CLASS / CARD_ARROW_DISABLED_CLASS: the 44px circle on a city card (56px hit area,
 *     see CARD_ARROW_HIT_AREA), active or greyed out for a city with no chapter.
 *
 *   Bridged semantic colours only (foreground/background/muted). No hex.
 *
 * Key exports: FOCUS_RING, CARD_ARROW_HIT_AREA, navArrowClass, CARD_ARROW_CLASS,
 *   CARD_ARROW_DISABLED_CLASS
 * External dependencies: none.
 */

/** Shared focus ring for the controls. */
export const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/**
 * Extends a 44px card arrow's hit area to 56 x 56 (frontend-standards R8) without changing the
 * layout by a pixel: a centred, transparent, absolutely positioned pseudo-element inside the
 * control, which passes its pointer events to the control itself. The visible circle stays 44px
 * (design-director's ruling, 2026-09-18, see CityBrowser "Touch targets").
 */
export const CARD_ARROW_HIT_AREA =
  "relative before:absolute before:left-1/2 before:top-1/2 before:h-14 before:w-14 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"

/** The 56px outlined prev/next arrow button. `disabled` gives the aria-disabled look. */
export function navArrowClass(disabled: boolean): string {
  return `flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${FOCUS_RING} ${
    disabled
      ? 'cursor-default border-foreground/15 text-foreground/35'
      : 'border-foreground/60 text-foreground hover:bg-foreground hover:text-background'
  }`
}

/** A city card's active arrow (links to the city's chapter). */
export const CARD_ARROW_CLASS = `flex h-11 w-11 items-center justify-center rounded-full border border-foreground bg-background text-foreground transition-colors hover:bg-foreground hover:text-background ${CARD_ARROW_HIT_AREA} ${FOCUS_RING}`

/** A city card's greyed-out arrow (the city has no chapter in the concept). */
export const CARD_ARROW_DISABLED_CLASS = `flex h-11 w-11 cursor-default items-center justify-center rounded-full border border-foreground/15 bg-muted text-foreground/35 ${CARD_ARROW_HIT_AREA} ${FOCUS_RING}`
