/**
 * /jtbd-framework — JTBD Matrix View (Phase 1)
 *
 * Purpose: Internal team tool displaying a job × city coverage matrix for the
 *          Breathe Cities JTBD framework. Shows supply status and demand evidence
 *          per job, per city, filterable by hirer type and city tier.
 *
 * Key exports: default export JtbdFrameworkPage (Next.js App Router page)
 *
 * External dependencies:
 *   - /src/data/jtbd/*.json — static data files (no API calls)
 *   - /src/types/jtbd.ts   — TypeScript interfaces for all data shapes
 */

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { City, Job, Hirer, ChainStep, MatrixCell, SupplyStatus, DemandStatus } from "@/types/jtbd";
import { JtbdNav } from "./_components/JtbdNav";

// JSON data imports — resolveJsonModule is enabled in tsconfig
// cities.json: all three BC portfolio cities (Paris T1, CDMX T2, Accra T3)
import citiesData from "@/data/jtbd/cities.json";
// jobs.json: all 13 JTBD functional jobs in chain order
import jobsData from "@/data/jtbd/jobs.json";
// hirers.json: five hirer archetypes across expert, resident, city clusters
import hirersData from "@/data/jtbd/hirers.json";
// chain-steps.json: city × hirer × job supply+demand records
import chainStepsData from "@/data/jtbd/chain-steps.json";

// Cast JSON imports to typed arrays — safe because we control the schema
const cities = citiesData as City[];
const jobs = jobsData as Job[];
const hirers = hirersData as Hirer[];
const chainSteps = chainStepsData as ChainStep[];

// ---------------------------------------------------------------------------
// Supply status priority ordering — used to compute worst-case in "all hirers" view.
// Higher index = worse. gap > partial > served > unknown.
// ---------------------------------------------------------------------------
const SUPPLY_PRIORITY: SupplyStatus[] = ["unknown", "served", "partial", "gap"];

/**
 * Returns the worst-case supply status across an array of steps.
 * Used when hirer filter = "all" to show the aggregate coverage signal.
 */
function worstSupply(steps: ChainStep[]): SupplyStatus {
  if (steps.length === 0) return "unknown";
  return steps.reduce<SupplyStatus>((worst, step) => {
    const currentRank = SUPPLY_PRIORITY.indexOf(step.supplyStatus);
    const worstRank = SUPPLY_PRIORITY.indexOf(worst);
    return currentRank > worstRank ? step.supplyStatus : worst;
  }, "unknown");
}

// Demand status priority — higher index = stronger evidence.
const DEMAND_PRIORITY: DemandStatus[] = ["hypothetical", "inferred", "direct", "confirmed"];

/**
 * Returns the highest-evidence demand status across an array of steps.
 * Used when hirer filter = "all" to surface the strongest evidence for a job.
 */
function bestDemand(steps: ChainStep[]): DemandStatus | null {
  if (steps.length === 0) return null;
  const withDemand = steps.filter((s) => s.demandStatus != null);
  if (withDemand.length === 0) return null;
  return withDemand.reduce<DemandStatus>((best, step) => {
    const currentRank = DEMAND_PRIORITY.indexOf(step.demandStatus);
    const bestRank = DEMAND_PRIORITY.indexOf(best);
    return currentRank > bestRank ? step.demandStatus : best;
  }, "hypothetical");
}

/**
 * Builds the MatrixCell array for the current filter state.
 * When hirerId = "all": aggregates across all hirers.
 * When specific hirer: returns only that hirer's steps.
 */
function buildMatrix(selectedHirerId: string, selectedTiers: Array<1 | 2 | 3>): MatrixCell[] {
  const cells: MatrixCell[] = [];

  for (const city of cities) {
    if (!selectedTiers.includes(city.tier as 1 | 2 | 3)) continue;

    for (const job of jobs) {
      let steps: ChainStep[];

      if (selectedHirerId === "all") {
        // Aggregate: all hirers for this city × job
        steps = chainSteps.filter((s) => s.cityId === city.id && s.jobId === job.id);
      } else {
        // Single hirer: only that hirer's steps for this city × job
        steps = chainSteps.filter(
          (s) => s.cityId === city.id && s.jobId === job.id && s.hirerId === selectedHirerId
        );
      }

      const supplyStatus: SupplyStatus = worstSupply(steps);
      const demand = bestDemand(steps);

      cells.push({
        jobId: job.id,
        cityId: city.id,
        supplyStatus,
        demandStatus: demand ?? "hypothetical",
        steps,
      });
    }
  }

  return cells;
}

/**
 * Returns true if a job qualifies as a "universal gap" across the visible cities.
 * Threshold (per PM decision, bug-tester report 2026-04-27):
 *   - No visible city is "served" AND
 *   - At least 2 visible cities are "gap"
 * This correctly flags "Act collectively" (2 gap + 1 partial, 0 served) while
 * preserving accurate data. Receives the already-filtered visible cells so the
 * threshold still works correctly when the tier filter is active.
 */
function isUniversalGap(jobId: string, visibleCells: MatrixCell[]): boolean {
  const jobCells = visibleCells.filter((c) => c.jobId === jobId);
  if (jobCells.length === 0) return false;
  const hasServed = jobCells.some((c) => c.supplyStatus === "served");
  if (hasServed) return false;
  const gapCount = jobCells.filter((c) => c.supplyStatus === "gap").length;
  return gapCount >= 2;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Supply status label, symbol, and colour class — uses BC semantic tokens. */
const SUPPLY_DISPLAY: Record<SupplyStatus, { symbol: string; colourClass: string; label: string }> = {
  served:  { symbol: "✓", colourClass: "text-[var(--bc-semantic-success)]",                  label: "Served"  },
  partial: { symbol: "△", colourClass: "text-[var(--bc-semantic-aqi-moderate-indicator)]",   label: "Partial" },
  gap:     { symbol: "✗", colourClass: "text-[var(--bc-color-red)]",                         label: "Gap"     },
  unknown: { symbol: "—", colourClass: "text-muted-foreground",                              label: "Unknown" },
};

/** Demand status symbol and colour class — uses BC semantic tokens. */
const DEMAND_DISPLAY: Record<DemandStatus, { symbol: string; colourClass: string; label: string }> = {
  confirmed:   { symbol: "●", colourClass: "text-[var(--bc-semantic-success)]",                label: "Confirmed"   },
  direct:      { symbol: "○", colourClass: "text-[var(--bc-semantic-success)]",                label: "Direct"      },
  inferred:    { symbol: "○", colourClass: "text-[var(--bc-semantic-aqi-moderate-indicator)]", label: "Inferred"    },
  hypothetical:{ symbol: "○", colourClass: "text-muted-foreground",                            label: "Hypothetical"},
};

/** Tier badge colours. */
const TIER_BADGE_CLASS: Record<number, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-purple-100 text-purple-700",
  3: "bg-orange-100 text-orange-700",
};

// ---------------------------------------------------------------------------
// Tooltip component
// ---------------------------------------------------------------------------

interface TooltipProps {
  cell: MatrixCell;
  selectedHirerId: string;
  x: number;
  y: number;
}

/**
 * Floating tooltip shown on matrix cell hover.
 * Displays supply product, notes, demand evidence source, and confidence level.
 * Positioned fixed relative to the viewport; nudges left/up near viewport edges.
 *
 * M4/L8 fix: position is calculated once on mount via requestAnimationFrame rather
 * than re-running on every mouse-move pixel. The tooltip appears at entry position
 * and stays there until the user leaves the cell — no per-pixel recalculation and
 * no single-frame position jump at viewport edges.
 */
function CellTooltip({ cell, selectedHirerId, x, y }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start with a deliberately off-screen position so the tooltip is invisible
  // until the rAF boundary-check runs, preventing the uncorrected-position flash.
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  // Side effect: calculate final position once after mount using rAF.
  // Dependency array is intentionally empty — we only want this to run once per
  // tooltip mount (i.e. once per cell entry), not on every mouse-move update.
  useEffect(() => {
    requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      let left = x + 12;
      let top = y + 12;
      if (left + rect.width > vpW - 8) left = x - rect.width - 12;
      if (top + rect.height > vpH - 8) top = y - rect.height - 12;
      setPos({ left, top });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supplyDisplay = SUPPLY_DISPLAY[cell.supplyStatus];
  const demandStatus = cell.demandStatus;
  const demandDisplay = DEMAND_DISPLAY[demandStatus];

  // When a specific hirer is selected, show their step detail; otherwise show aggregated notes
  const relevantSteps = selectedHirerId === "all"
    ? cell.steps
    : cell.steps.filter((s) => s.hirerId === selectedHirerId);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-72 rounded-lg border border-border bg-background p-3 text-xs shadow-lg"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* Supply section */}
      <div className="mb-2 border-b border-border pb-2">
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-sm font-bold ${supplyDisplay.colourClass}`}>
            {supplyDisplay.symbol}
          </span>
          <span className="font-semibold text-foreground">
            Supply: {supplyDisplay.label}
          </span>
        </div>
        {relevantSteps.length === 0 ? (
          <p className="text-muted-foreground">No data for this hirer / city combination.</p>
        ) : (
          relevantSteps.map((step) => (
            <div key={`${step.cityId}-${step.hirerId}-${step.jobId}`} className="mb-1">
              {step.supplyProduct && (
                <p className="text-foreground">
                  <span className="text-muted-foreground">Product: </span>
                  {step.supplyProduct}
                </p>
              )}
              {step.supplyNotes && (
                <p className="text-foreground/80 leading-relaxed">{step.supplyNotes}</p>
              )}
              <p className="mt-0.5 text-muted-foreground">
                Confidence: {step.supplyConfidence.replace(/-/g, " ")}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Demand section */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-sm ${demandDisplay.colourClass}`}>
            {demandDisplay.symbol}
          </span>
          <span className="font-semibold text-foreground">
            Demand: {demandDisplay.label}
          </span>
        </div>
        {(() => {
          // H1 fix: find the step whose demandStatus produced the best demand level,
          // rather than always taking index 0. If multiple steps tie, take the first match.
          const bestLevel = bestDemand(relevantSteps);
          const bestStep = bestLevel
            ? relevantSteps.find((s) => s.demandStatus === bestLevel) ?? null
            : null;
          return bestStep ? (
            <>
              {bestStep.demandSource && (
                <p className="text-muted-foreground">Source: {bestStep.demandSource}</p>
              )}
              {bestStep.demandNotes && (
                <p className="mt-0.5 text-foreground/80 leading-relaxed">
                  {bestStep.demandNotes}
                </p>
              )}
            </>
          ) : null;
        })()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Matrix cell component
// ---------------------------------------------------------------------------

interface MatrixCellProps {
  cell: MatrixCell | undefined;
  selectedHirerId: string;
  onHover: (cell: MatrixCell | null, x: number, y: number) => void;
}

/**
 * Renders one cell in the matrix grid.
 * Shows supply symbol (large) and demand dot (small, below).
 * Fires onHover with pointer coordinates for tooltip positioning.
 */
function MatrixCellView({ cell, selectedHirerId, onHover }: MatrixCellProps) {
  if (!cell) {
    return (
      <div className="flex h-14 items-center justify-center border-b border-r border-border">
        <span className="text-muted-foreground text-xs">N/A</span>
      </div>
    );
  }

  const supply = SUPPLY_DISPLAY[cell.supplyStatus];
  const hasSteps = selectedHirerId === "all"
    ? cell.steps.length > 0
    : cell.steps.some((s) => s.hirerId === selectedHirerId);

  // If specific hirer selected and no steps exist, show N/A
  if (!hasSteps) {
    return (
      <div className="flex h-14 items-center justify-center border-b border-r border-border">
        <span className="text-muted-foreground text-xs">N/A</span>
      </div>
    );
  }

  const demand = DEMAND_DISPLAY[cell.demandStatus];

  return (
    <div
      className="flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 border-b border-r border-border transition-colors hover:bg-muted"
      onMouseEnter={(e) => onHover(cell, e.clientX, e.clientY)}
      onMouseLeave={() => onHover(null, 0, 0)}
    >
      <span
        className={`text-base font-bold leading-none ${supply.colourClass}`}
        aria-label={`Supply: ${supply.label}`}
      >
        {supply.symbol}
      </span>
      <span
        className={`text-[10px] leading-none ${demand.colourClass}`}
        aria-label={`Demand: ${demand.label}`}
      >
        {demand.symbol}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter pill component
// ---------------------------------------------------------------------------

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

/** Toggle pill button used in filter bar. Active = blue, inactive = dark grey. */
function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

/** All valid tier values for the filter. */
const ALL_TIERS: Array<1 | 2 | 3> = [1, 2, 3];

export default function JtbdFrameworkPage() {
  // Hirer filter — "all" or a specific hirerId
  const [selectedHirerId, setSelectedHirerId] = useState<string>("all");

  // Tier filter — set of active tiers. Starts with all tiers active.
  const [selectedTiers, setSelectedTiers] = useState<Array<1 | 2 | 3>>([1, 2, 3]);

  // isAllMode tracks whether the user explicitly activated "All" (or we restored
  // to full set from empty). Drives "All" pill highlight independently of the
  // selectedTiers array contents — prevents simultaneous All + individual highlighting.
  // L7 fix: must be declared before handleTierToggle which reads and sets it.
  const [isAllMode, setIsAllMode] = useState<boolean>(true);

  // Tooltip state — active cell and pointer position
  const [tooltip, setTooltip] = useState<{
    cell: MatrixCell;
    x: number;
    y: number;
  } | null>(null);

  // Derive visible cities from selected tiers
  const visibleCities = cities.filter((c) => selectedTiers.includes(c.tier as 1 | 2 | 3));

  // Build the display matrix for the current filter state
  const matrix = buildMatrix(selectedHirerId, selectedTiers);

  // O(1) cell lookup map — keyed by "jobId-cityId".
  // Replaces the previous matrix.find() O(n) scan called in the nested render loop.
  const cellMap = useMemo(() => {
    const map = new Map<string, MatrixCell>();
    for (const cell of matrix) {
      map.set(`${cell.jobId}-${cell.cityId}`, cell);
    }
    return map;
  }, [matrix]);

  /**
   * Look up a cell in the matrix for a specific job × city combination.
   * Uses the pre-built Map for O(1) access instead of a linear scan.
   */
  function getCell(jobId: string, cityId: string): MatrixCell | undefined {
    return cellMap.get(`${jobId}-${cityId}`);
  }

  /**
   * Toggle tier filter.
   *
   * L7 fix: "All" and individual tier pills are mutually exclusive.
   * - Pressing "All": always resets to all-active state ([1, 2, 3]).
   * - Pressing an individual tier while ALL tiers are active: deactivates the
   *   others and activates only the pressed tier (not additive from "all").
   * - Pressing an individual tier while in partial-select mode: toggles it
   *   in/out; if the result would be empty, restore all tiers.
   * This means "All" pill is active only when selectedTiers has all 3 tiers AND
   * we got there via "All" or via restoring from empty — never simultaneously
   * with individually-active pills showing as selected.
   */
  function handleTierToggle(tier: 1 | 2 | 3 | "all") {
    if (tier === "all") {
      setSelectedTiers([1, 2, 3]);
      setIsAllMode(true);
      return;
    }
    setIsAllMode(false);
    setSelectedTiers((prev) => {
      // If currently in "all" mode, pressing an individual tier switches to
      // single-tier mode — deselect everything else, activate only this one.
      if (isAllMode) {
        return [tier];
      }
      const has = prev.includes(tier);
      if (has) {
        const next = prev.filter((t) => t !== tier);
        if (next.length === 0) {
          // Restore all rather than leaving nothing selected
          setIsAllMode(true);
          return [1, 2, 3];
        }
        return next;
      }
      return [...prev, tier].sort() as Array<1 | 2 | 3>;
    });
  }

  const isAllTiersActive = isAllMode;

  /** Tooltip callback from matrix cell hover. */
  function handleCellHover(cell: MatrixCell | null, x: number, y: number) {
    if (!cell) {
      setTooltip(null);
      return;
    }
    setTooltip({ cell, x, y });
  }

  return (
    <div className="min-h-screen bg-background p-6 font-mono text-foreground">
      {/* Header */}
      <div className="mb-6">
        {/* Shared tab navigation — active on "matrix" */}
        <JtbdNav activeTab="matrix" />
        <div className="flex items-start gap-3 mt-4">
          <h1 className="text-3xl font-bold text-foreground">JTBD Framework</h1>
          <span className="mt-1.5 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
            Internal — team only
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Job × City coverage matrix — Phase 1: Paris (T1) · Mexico City (T2) · Accra (T3)
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-border bg-card p-4">
        {/* Hirer filter */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Hirer
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Pill
              label="All hirers"
              active={selectedHirerId === "all"}
              onClick={() => setSelectedHirerId("all")}
            />
            {hirers.map((hirer) => (
              <Pill
                key={hirer.id}
                label={hirer.name}
                active={selectedHirerId === hirer.id}
                onClick={() => setSelectedHirerId(hirer.id)}
              />
            ))}
          </div>
        </div>

        {/* Tier filter */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tier
          </p>
          <div className="flex gap-1.5">
            <Pill
              label="All"
              active={isAllTiersActive}
              onClick={() => handleTierToggle("all")}
            />
            {ALL_TIERS.map((tier) => (
              <Pill
                key={tier}
                label={`T${tier}`}
                active={!isAllMode && selectedTiers.includes(tier)}
                onClick={() => handleTierToggle(tier)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend — swatches derived from SUPPLY_DISPLAY / DEMAND_DISPLAY constants so they
           always match the matrix symbols exactly. */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Supply:</span>
        <span><span className={SUPPLY_DISPLAY.served.colourClass}>{SUPPLY_DISPLAY.served.symbol}</span> Served</span>
        <span><span className={SUPPLY_DISPLAY.partial.colourClass}>{SUPPLY_DISPLAY.partial.symbol}</span> Partial</span>
        <span><span className={SUPPLY_DISPLAY.gap.colourClass}>{SUPPLY_DISPLAY.gap.symbol}</span> Gap</span>
        <span><span className={SUPPLY_DISPLAY.unknown.colourClass}>{SUPPLY_DISPLAY.unknown.symbol}</span> Unknown</span>
        <span className="ml-4 font-semibold text-foreground">Demand:</span>
        <span><span className={DEMAND_DISPLAY.confirmed.colourClass}>{DEMAND_DISPLAY.confirmed.symbol}</span> Confirmed</span>
        <span><span className={DEMAND_DISPLAY.direct.colourClass}>{DEMAND_DISPLAY.direct.symbol}</span> Direct</span>
        <span><span className={DEMAND_DISPLAY.inferred.colourClass}>{DEMAND_DISPLAY.inferred.symbol}</span> Inferred</span>
        <span><span className={DEMAND_DISPLAY.hypothetical.colourClass}>{DEMAND_DISPLAY.hypothetical.symbol}</span> Hypothetical</span>
      </div>

      {/* Matrix — scrollable */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-xs" aria-label="JTBD job coverage matrix — supply and demand evidence by city and hirer">
          <caption className="sr-only">
            Job × City coverage matrix showing supply status and demand evidence for each JTBD job across Paris (T1), Mexico City (T2), and Accra (T3). Filter by hirer type and city tier using the controls above.
          </caption>
          <thead>
            <tr>
              {/* Sticky row-header column — z-30 so it sits above both sticky city headers and sticky job column */}
              <th className="sticky left-0 top-0 z-30 min-w-44 bg-background px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Job
              </th>
              {/* City columns — sticky top-0 so city names stay visible on vertical scroll */}
              {visibleCities.map((city) => (
                <th
                  key={city.id}
                  className="sticky top-0 z-20 min-w-28 bg-background px-3 py-2 text-center text-foreground"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">{city.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TIER_BADGE_CLASS[city.tier]}`}
                    >
                      T{city.tier}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              // Universal gap detection — only meaningful when showing all hirers.
              // Passes the current filtered matrix so tier-filter state is respected.
              const universalGap =
                selectedHirerId === "all" && isUniversalGap(job.id, matrix);

              return (
                <tr
                  key={job.id}
                  className={universalGap ? "bg-[var(--bc-color-red-light)]" : ""}
                >
                  {/* Sticky row label */}
                  <td
                    className={`sticky left-0 z-10 border-b border-r border-border px-3 py-0 ${
                      universalGap ? "bg-[var(--bc-color-red-light)]" : "bg-background"
                    }`}
                  >
                    <div className="flex min-h-14 items-center gap-2">
                      <span className="text-sm text-foreground">{job.name}</span>
                      {universalGap && (
                        <span className="rounded bg-[var(--bc-color-red-light)] px-1.5 py-0.5 text-[10px] text-[var(--bc-color-red-dark)]">
                          Universal gap
                        </span>
                      )}
                    </div>
                  </td>

                  {/* City cells */}
                  {visibleCities.map((city) => {
                    const cell = getCell(job.id, city.id);
                    return (
                      <td key={city.id} className="p-0">
                        <MatrixCellView
                          cell={cell}
                          selectedHirerId={selectedHirerId}
                          onHover={handleCellHover}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* City context footnotes — filtered to match visible cities in the matrix */}
      <div className="mt-6 space-y-1 text-[10px] text-muted-foreground">
        {visibleCities.map((city) => (
          <p key={city.id}>
            <span className={`mr-2 rounded px-1 py-0.5 font-medium ${TIER_BADGE_CLASS[city.tier]}`}>
              T{city.tier}
            </span>
            <span className="text-foreground font-medium">{city.name}: </span>
            {city.structuralContext}
          </p>
        ))}
      </div>

      {/* Floating tooltip — rendered outside table flow to avoid clipping */}
      {tooltip && (
        <CellTooltip
          cell={tooltip.cell}
          selectedHirerId={selectedHirerId}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  );
}
