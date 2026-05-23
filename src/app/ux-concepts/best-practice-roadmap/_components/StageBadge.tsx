/**
 * StageBadge.tsx
 *
 * Purpose: Renders a coloured badge for one of the three roadmap stages
 * (Seeing, Understanding, Acting, All stages). Used throughout the roadmap
 * wireframe to visually categorise domains and practices.
 *
 * Key exports: StageBadge
 * External dependencies: shadcn Badge, roadmap-data STAGE_COLORS
 */

import { Badge } from "@/components/ui/badge";
import { type Stage, STAGE_COLORS } from "@/data/roadmap-data";

interface StageBadgeProps {
  stage: Stage;
}

/** Renders a stage label as a coloured badge using the wireframe palette */
export function StageBadge({ stage }: StageBadgeProps) {
  const colors = STAGE_COLORS[stage];
  return (
    <Badge
      variant="outline"
      className={`${colors.bg} ${colors.text} border-transparent text-xs`}
    >
      {stage}
    </Badge>
  );
}
