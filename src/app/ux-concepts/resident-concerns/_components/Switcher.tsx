/**
 * Switcher.tsx — segmented button switchers for the Resident Concerns deck
 *
 * Two switchers share this presentational primitive:
 *   - ConcernSwitcher: pick which resident concern's deck is shown (2 options)
 *   - CitySwitcher: pick the active city, which reorders/filters the deck (3 options)
 *
 * Deliberately built on plain buttons (not a Select primitive) — robust for a
 * prototype, and a segmented control reads more clearly as a "switcher" than a
 * dropdown. Light-mode styling via BC semantic Tailwind tokens.
 *
 * Key exports: Switcher
 */

"use client";

interface SwitcherOption {
  value: string;
  label: string;
  /** Optional leading text glyph. Unused by current callers; no emoji. */
  glyph?: string;
}

interface SwitcherProps {
  /** Small uppercase label shown above the control. */
  caption: string;
  options: SwitcherOption[];
  value: string;
  onChange: (value: string) => void;
}

/** A segmented control: one active option, the rest selectable. */
export function Switcher({ caption, options, value, onChange }: SwitcherProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {caption}
      </p>
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={[
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {opt.glyph && <span aria-hidden="true">{opt.glyph}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
