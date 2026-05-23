/**
 * page.tsx -- JTBD City Toolkit dashboard page
 *
 * Purpose: Single-page city dashboard with a city selector and 8 tool panels.
 * Each panel is a visual sketch of a real tool (map, gauge, chart, table).
 * When a city lacks a capability, the panel dims with a reason message.
 * This IS the concept: the kit lighting up and going dark based on what
 * exists tells the story.
 *
 * Route: /ux-concepts/jtbd-city-toolkit
 *
 * Key exports: ToolkitPage (default)
 * External dependencies: toolkit-data, ToolPanels, ToolCard
 */

"use client";

import { useState } from "react";
import { CITIES, TOOL_LABELS } from "@/data/toolkit-data";
import type { CityData, ToolId } from "@/data/toolkit-data";
import { ToolCard } from "./_components/ToolCard";
import {
  MonitoringPanel,
  BenchmarkingPanel,
  SourceIdPanel,
  ForecastingPanel,
  HealthPanel,
  AdvocacyPanel,
  ActionPanel,
  OpenDataPanel,
} from "./_components/ToolPanels";

/** Returns a count of active panels for the summary strip */
function countActiveTools(city: CityData): number {
  return Object.values(city.toolStatus).filter((s) => s === "active").length;
}

/** Returns a count of partially-active panels */
function countPartialTools(city: CityData): number {
  return Object.values(city.toolStatus).filter((s) => s === "partial").length;
}

/** Tool panel order for the grid */
const TOOL_ORDER: ToolId[] = [
  "monitoring",
  "benchmarking",
  "sourceId",
  "forecasting",
  "health",
  "advocacy",
  "action",
  "openData",
];

export default function ToolkitPage() {
  const [selectedSlug, setSelectedSlug] = useState("london");

  const city = CITIES.find((c) => c.slug === selectedSlug);
  if (!city) return null;

  const activeCount = countActiveTools(city);
  const partialCount = countPartialTools(city);

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: "var(--bc-color-light-grey)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* ---- Page header ---- */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            City Air Quality Toolkit
          </h1>
          <p
            className="mx-auto mt-2 max-w-2xl text-base"
            style={{ color: "var(--bc-semantic-muted)" }}
          >
            8 digital tools that together form the complete air quality
            infrastructure a city needs. Select a city to see which tools are
            available today -- and where the gaps are.
          </p>
        </div>

        {/* ---- City selector ---- */}
        <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <label
            htmlFor="city-select"
            className="text-sm font-medium"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            Select a city:
          </label>
          <select
            id="city-select"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium"
            style={{
              borderColor: "var(--bc-color-steel)",
              backgroundColor: "var(--bc-color-white)",
              color: "var(--bc-semantic-text)",
              minWidth: "220px",
            }}
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>

        {/* ---- Sensor density strip ---- */}
        <div
          className="mb-8 rounded-xl px-4 py-3 text-center"
          style={{
            backgroundColor: "var(--bc-color-white)",
            border: "1px solid var(--bc-color-steel)",
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            {city.name} &mdash; {city.stationCount} monitoring stations ({city.stationTypes})
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--bc-semantic-muted)" }}
          >
            {city.densityMessage}
            {" "}&middot;{" "}
            {activeCount} of 8 tools active
            {partialCount > 0 && `, ${partialCount} partial`}
          </p>
        </div>

        {/* ---- Tools grid ---- */}
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOL_ORDER.map((toolId) => (
            <ToolCard
              key={toolId}
              title={TOOL_LABELS[toolId]}
              status={city.toolStatus[toolId]}
              dimReason={city.dimReasons[toolId]}
            >
              {toolId === "monitoring" && (
                <MonitoringPanel
                  sensors={city.sensors}
                  stationCount={city.stationCount}
                />
              )}
              {toolId === "benchmarking" && (
                <BenchmarkingPanel
                  currentAqi={city.currentAqi}
                  whoGuideline={city.whoGuideline}
                  nationalStandard={city.nationalStandard}
                  nationalStandardLabel={city.nationalStandardLabel}
                />
              )}
              {toolId === "sourceId" && (
                <SourceIdPanel sources={city.sources} />
              )}
              {toolId === "forecasting" && (
                <ForecastingPanel forecast={city.forecast} />
              )}
              {toolId === "health" && (
                <HealthPanel alerts={city.alerts} />
              )}
              {toolId === "advocacy" && (
                <AdvocacyPanel
                  trendLine={city.trendLine}
                  trendStat={city.trendStat}
                  trendDirection={city.trendDirection}
                />
              )}
              {toolId === "action" && (
                <ActionPanel actions={city.actions} />
              )}
              {toolId === "openData" && (
                <OpenDataPanel
                  dataRows={city.dataRows}
                  apiEndpoint={city.apiEndpoint}
                />
              )}
            </ToolCard>
          ))}
        </div>
      </div>
    </main>
  );
}
