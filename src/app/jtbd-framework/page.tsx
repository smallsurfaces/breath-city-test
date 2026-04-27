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

import { useState, useRef, useEffect } from "react";
import type { City, Job, Hirer, ChainStep, MatrixCell, SupplyStatus, DemandStatus } from "@/types/jtbd";

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
 * Returns true if a job is a "universal gap" — all three cities show supply = gap
 * when viewing all hirers. Used to apply the red row highlight.
 */
function isUniversalGap(jobId: string, allCells: MatrixCell[]): boolean {
  const jobCells = allCells.filter((c) => c.jobId === jobId);
  // Must have all 3 cities represented and all must be gap
  if (jobCells.length < 3) return false;
  return jobCells.every((c) => c.supplyStatus === "gap");
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Supply status label, symbol, and colour class. */
const SUPPLY_DISPLAY: Record<SupplyStatus, { symbol: string; colourClass: string; label: string }> = {
  served:  { symbol: "✓", colourClass: "text-green-400",  label: "Served"  },
  partial: { symbol: "△", colourClass: "text-yellow-400", label: "Partial" },
  gap:     { symbol: "✗", colourClass: "text-red-400",    label: "Gap"     },
  unknown: { symbol: "—", colourClass: "text-gray-600",   label: "Unknown" },
};

/** Demand status symbol and colour class. */
const DEMAND_DISPLAY: Record<DemandStatus, { symbol: string; colourClass: string; label: string }> = {
  confirmed:   { symbol: "●", colourClass: "text-green-300",  label: "Confirmed"   },
  direct:      { symbol: "○", colourClass: "text-green-300",  label: "Direct"      },
  inferred:    { symbol: "○", colourClass: "text-yellow-300", label: "Inferred"    },
  hypothetical:{ symbol: "○", colourClass: "text-gray-500",   label: "Hypothetical"},
};

/** Tier badge colours. */
const TIER_BADGE_CLASS: Record<number, string> = {
  1: "bg-blue-900 text-blue-300",
  2: "bg-purple-900 text-purple-300",
  3: "bg-orange-900 text-orange-300",
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
 * Positioned absolutely relative to the page; nudges left/up near viewport edges.
 */
function CellTooltip({ cell, selectedHirerId, x, y }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x + 12, top: y + 12 });

  // Side effect: nudge tooltip away from viewport edges after mount
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let left = x + 12;
    let top = y + 12;
    if (left + rect.width > vpW - 8) left = x - rect.width - 12;
    if (top + rect.height > vpH - 8) top = y - rect.height - 12;
    setPos({ left, top });
  }, [x, y]);

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
      className="fixed z-50 w-72 rounded-lg border border-gray-700 bg-gray-900 p-3 text-xs shadow-xl"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* Supply section */}
      <div className="mb-2 border-b border-gray-700 pb-2">
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-sm font-bold ${supplyDisplay.colourClass}`}>
            {supplyDisplay.symbol}
          </span>
          <span className="font-semibold text-gray-200">
            Supply: {supplyDisplay.label}
          </span>
        </div>
        {relevantSteps.length === 0 ? (
          <p className="text-gray-500">No data for this hirer / city combination.</p>
        ) : (
          relevantSteps.map((step, i) => (
            <div key={i} className="mb-1">
              {step.supplyProduct && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Product: </span>
                  {step.supplyProduct}
                </p>
              )}
              {step.supplyNotes && (
                <p className="text-gray-400 leading-relaxed">{step.supplyNotes}</p>
              )}
              <p className="mt-0.5 text-gray-600">
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
          <span className="font-semibold text-gray-200">
            Demand: {demandDisplay.label}
          </span>
        </div>
        {relevantSteps.length > 0 && relevantSteps[0].demandSource && (
          <p className="text-gray-500">
            Source: {relevantSteps[0].demandSource}
          </p>
        )}
        {relevantSteps.length > 0 && relevantSteps[0].demandNotes && (
          <p className="mt-0.5 text-gray-400 leading-relaxed">
            {relevantSteps[0].demandNotes}
          </p>
        )}
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
      <div className="flex h-14 items-center justify-center border-b border-r border-gray-800">
        <span className="text-gray-600 text-xs">N/A</span>
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
      <div className="flex h-14 items-center justify-center border-b border-r border-gray-800">
        <span className="text-gray-600 text-xs">N/A</span>
      </div>
    );
  }

  const demand = DEMAND_DISPLAY[cell.demandStatus];

  return (
    <div
      className="flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 border-b border-r border-gray-800 transition-colors hover:bg-gray-800/60"
      onMouseMove={(e) => onHover(cell, e.clientX, e.clientY)}
      onMouseLeave={() => onHover(null, 0, 0)}
    >
      <span className={`text-base font-bold leading-none ${supply.colourClass}`}>
        {supply.symbol}
      </span>
      <span className={`text-[10px] leading-none ${demand.colourClass}`}>
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
          ? "bg-blue-600 text-white"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
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

  // Tooltip state — active cell and pointer position
  const [tooltip, setTooltip] = useState<{
    cell: MatrixCell;
    x: number;
    y: number;
  } | null>(null);

  // Derive visible cities from selected tiers
  const visibleCities = cities.filter((c) => selectedTiers.includes(c.tier as 1 | 2 | 3));

  // Build the full matrix for all 3 cities (used for universal gap detection)
  const allHirersAllCitiesMatrix = buildMatrix("all", [1, 2, 3]);

  // Build the display matrix for the current filter state
  const matrix = buildMatrix(selectedHirerId, selectedTiers);

  /**
   * Look up a cell in the matrix for a specific job × city combination.
   */
  function getCell(jobId: string, cityId: string): MatrixCell | undefined {
    return matrix.find((c) => c.jobId === jobId && c.cityId === cityId);
  }

  /**
   * Toggle a tier in/out of the active set.
   * If "All" is clicked, set all tiers active.
   * If a tier is clicked and it's the only active tier, restore all tiers.
   */
  function handleTierToggle(tier: 1 | 2 | 3 | "all") {
    if (tier === "all") {
      setSelectedTiers([1, 2, 3]);
      return;
    }
    setSelectedTiers((prev) => {
      const has = prev.includes(tier);
      if (has) {
        const next = prev.filter((t) => t !== tier);
        return next.length === 0 ? [1, 2, 3] : next;
      }
      return [...prev, tier].sort() as Array<1 | 2 | 3>;
    });
  }

  const isAllTiersActive = selectedTiers.length === 3;

  /** Tooltip callback from matrix cell hover. */
  function handleCellHover(cell: MatrixCell | null, x: number, y: number) {
    if (!cell) {
      setTooltip(null);
      return;
    }
    setTooltip({ cell, x, y });
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 font-mono text-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <h1 className="text-3xl font-bold text-white">JTBD Framework</h1>
          <span className="mt-1.5 rounded bg-yellow-900 px-2 py-0.5 text-xs text-yellow-300">
            Internal — team only
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          Job × City coverage matrix — Phase 1: Paris (T1) · Mexico City (T2) · Accra (T3)
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
        {/* Hirer filter */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
                active={selectedTiers.includes(tier)}
                onClick={() => handleTierToggle(tier)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-400">Supply:</span>
        <span><span className="text-green-400">✓</span> Served</span>
        <span><span className="text-yellow-400">△</span> Partial</span>
        <span><span className="text-red-400">✗</span> Gap</span>
        <span><span className="text-gray-600">—</span> Unknown</span>
        <span className="ml-4 font-semibold text-gray-400">Demand:</span>
        <span><span className="text-green-300">●</span> Confirmed</span>
        <span><span className="text-green-300">○</span> Direct</span>
        <span><span className="text-yellow-300">○</span> Inferred</span>
        <span><span className="text-gray-500">○</span> Hypothetical</span>
      </div>

      {/* Matrix — scrollable */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {/* Sticky row-header column */}
              <th className="sticky left-0 z-10 min-w-44 bg-gray-950 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Job
              </th>
              {/* City columns */}
              {visibleCities.map((city) => (
                <th
                  key={city.id}
                  className="min-w-28 px-3 py-2 text-center text-gray-200"
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
              // Universal gap detection — only meaningful when showing all hirers
              const universalGap =
                selectedHirerId === "all" && isUniversalGap(job.id, allHirersAllCitiesMatrix);

              return (
                <tr
                  key={job.id}
                  className={universalGap ? "bg-red-950/30" : ""}
                >
                  {/* Sticky row label */}
                  <td
                    className={`sticky left-0 z-10 border-b border-r border-gray-800 px-3 py-0 ${
                      universalGap ? "bg-red-950/30" : "bg-gray-950"
                    }`}
                  >
                    <div className="flex min-h-14 items-center gap-2">
                      <span className="text-sm text-gray-200">{job.name}</span>
                      {universalGap && (
                        <span className="rounded bg-red-900 px-1.5 py-0.5 text-[10px] text-red-300">
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

      {/* City context footnotes */}
      <div className="mt-6 space-y-1 text-[10px] text-gray-600">
        {cities.map((city) => (
          <p key={city.id}>
            <span className={`mr-2 rounded px-1 py-0.5 font-medium ${TIER_BADGE_CLASS[city.tier]}`}>
              T{city.tier}
            </span>
            <span className="text-gray-500 font-medium">{city.name}: </span>
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
