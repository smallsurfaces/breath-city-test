/**
 * WordmarkModeToggle.tsx — prototype control that switches the wordmark between Still and Swap.
 *
 * Purpose
 *   A two-option segmented control under the pause/play button, so the two wordmark modes of brief
 *   4.2 can be compared on a phone without typing the `?wordmark=swap` query param.
 *     Still -> mode A, 'overlay' (the city name fades in over a still wordmark)
 *     Swap  -> mode B, 'swap' (the big word swaps to the city name)
 *   It is prototype tooling, not part of the designed cover, so it stays grey and quiet.
 *
 * Accessibility
 *   A group named by its visible "Wordmark" label; two native buttons with aria-pressed exposing
 *   the selected mode. Keyboard operable (Tab, Enter, Space), visible focus outline, 56px tall.
 *
 * Key exports: WordmarkModeToggle (named)
 * External dependencies: react, ./Wordmark (WordmarkMode type).
 */

'use client'

import { useId } from 'react'
import type { WordmarkMode } from './Wordmark'

/** One option in the control: the mode it selects and its visible label. */
type WordmarkModeOption = { mode: WordmarkMode; label: string }

/** The two options, in display order. */
const OPTIONS: WordmarkModeOption[] = [
  { mode: 'overlay', label: 'Still' },
  { mode: 'swap', label: 'Swap' },
]

/** Props for WordmarkModeToggle. */
type WordmarkModeToggleProps = {
  /** The mode currently shown. */
  mode: WordmarkMode
  /** Called with the mode the visitor picked. */
  onChange: (mode: WordmarkMode) => void
}

/** The Still | Swap segmented control. */
export function WordmarkModeToggle({ mode, onChange }: WordmarkModeToggleProps) {
  const labelId = useId()

  return (
    <div className="flex flex-col items-center gap-2">
      <p id={labelId} className="text-xs font-medium uppercase tracking-wide text-foreground/70">
        Wordmark
      </p>
      <div role="group" aria-labelledby={labelId} className="flex gap-1 rounded-full border border-foreground/20 bg-background p-1">
        {OPTIONS.map((option) => {
          const selected = option.mode === mode
          return (
            <button
              key={option.mode}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.mode)}
              className={`flex h-14 min-w-24 items-center justify-center rounded-full border px-5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                selected
                  ? 'border-foreground bg-muted font-semibold text-foreground'
                  : 'border-transparent text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
