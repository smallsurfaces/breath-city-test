/**
 * CoverageMatrix.tsx
 *
 * Purpose: Renders the 14-city x 11-domain coverage grid — the navigation
 * engine of the roadmap. Filled cells link to the domain page scrolled to
 * that city's example. Empty cells are visually distinct (gray).
 *
 * Key exports: CoverageMatrix
 * External dependencies: shadcn Table, roadmap-data (CITIES, DOMAINS, COVERAGE_MATRIX)
 */

"use client";

import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  CITIES,
  DOMAINS,
  COVERAGE_MATRIX,
  getCoverageCount,
} from "@/data/roadmap-data";

/** The interactive coverage matrix — each filled cell is a navigation link */
export function CoverageMatrix() {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-background min-w-[120px]">
              City
            </TableHead>
            {DOMAINS.map((domain) => (
              <TableHead key={domain.id} className="text-center px-1 min-w-[40px]">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}`}
                        className="block text-xs leading-tight hover:underline"
                      />
                    }
                  >
                    {domain.id}
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>{domain.shortName}</span>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            ))}
            <TableHead className="text-center text-xs px-2">Score</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {CITIES.map((city) => {
            const coverage = COVERAGE_MATRIX[city.slug] ?? [];
            const count = getCoverageCount(city.slug);

            return (
              <TableRow key={city.slug}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium text-xs whitespace-nowrap">
                  <Link
                    href={`/ux-concepts/best-practice-roadmap-v2/city/${city.slug}`}
                    className="hover:underline"
                  >
                    {city.flag} {city.name}
                  </Link>
                </TableCell>

                {DOMAINS.map((domain, idx) => {
                  const active = coverage[idx] ?? false;
                  return (
                    <TableCell key={domain.id} className="text-center px-1">
                      {active ? (
                        <Link
                          href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}#${city.slug}`}
                          className="inline-flex items-center justify-center"
                        >
                          <span className="inline-block w-4 h-4 rounded-full bg-foreground/70 hover:bg-foreground transition-colors" />
                        </Link>
                      ) : (
                        <span className="inline-block w-4 h-4 rounded-full bg-muted" />
                      )}
                    </TableCell>
                  );
                })}

                <TableCell className="text-center text-xs font-medium tabular-nums">
                  {count}/12
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
