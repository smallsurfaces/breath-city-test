/**
 * ToolCard.tsx -- Wrapper card for each toolkit panel
 *
 * Purpose: Renders a tool panel inside a card with its title. Handles the
 * active/partial/dim states -- when a city lacks a capability, the card
 * visually dims (reduced opacity, greyed overlay) with a short explanation.
 *
 * Key exports: ToolCard
 * External dependencies: toolkit-data types
 */

"use client";

import type { ToolStatus } from "@/data/toolkit-data";

interface ToolCardProps {
  title: string;
  status: ToolStatus;
  dimReason?: string;
  children: React.ReactNode;
}

/**
 * Wraps a tool panel in a card with title and active/dim/partial visual state.
 * - active: fully rendered, no overlay
 * - partial: rendered with a subtle "partial" indicator
 * - dim: greyed out with reduced opacity and a reason overlay
 */
export function ToolCard({ title, status, dimReason, children }: ToolCardProps) {
  const isDim = status === "dim";
  const isPartial = status === "partial";

  return (
    <div
      className="relative flex flex-col gap-3 rounded-2xl p-4 transition-all"
      style={{
        backgroundColor: "var(--bc-color-white)",
        border: `1px solid ${isDim ? "var(--bc-semantic-border)" : "var(--bc-color-steel)"}`,
        boxShadow: isDim ? "none" : "var(--bc-shadow-sm)",
      }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <h3
          className="text-sm font-semibold"
          style={{
            color: isDim
              ? "var(--bc-semantic-muted)"
              : "var(--bc-semantic-text)",
          }}
        >
          {title}
        </h3>

        {isPartial && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: "var(--bc-semantic-aqi-moderate-bg)",
              color: "var(--bc-semantic-aqi-moderate-text)",
            }}
          >
            Partial
          </span>
        )}
      </div>

      {/* Panel content */}
      <div
        className="relative min-h-[120px]"
        style={{
          opacity: isDim ? 0.2 : isPartial ? 0.65 : 1,
          filter: isDim ? "grayscale(0.8)" : "none",
          transition: "opacity 0.3s, filter 0.3s",
        }}
      >
        {children}
      </div>

      {/* Dim overlay with reason */}
      {isDim && dimReason && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <div
            className="rounded-lg px-4 py-3 text-center text-sm font-medium"
            style={{
              backgroundColor: "var(--bc-color-light-grey)",
              color: "var(--bc-semantic-muted)",
              border: "1px solid var(--bc-color-steel)",
              maxWidth: "80%",
            }}
          >
            {dimReason}
          </div>
        </div>
      )}
    </div>
  );
}
