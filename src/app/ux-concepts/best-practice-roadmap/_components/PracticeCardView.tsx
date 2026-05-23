import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type PracticeCard,
  type CityExample,
  getDomainById,
  getCityBySlug,
  getPracticeById,
} from "@/data/roadmap-data";
import { StageBadge } from "./StageBadge";

interface PracticeCardViewProps {
  practice: PracticeCard;
  linkCities?: boolean;
  anchorId?: string;
}

function DeltaBar({ data }: { data: any }) {
  const max = Math.max(data.before, data.after);
  const beforePct = (data.before / max) * 100;
  const afterPct = (data.after / max) * 100;

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{data.label}</div>
      <div className="space-y-1.5">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Before</div>
          <div className="h-5 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded bg-foreground/20"
              style={{ width: `${beforePct}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {data.before} {data.unit}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">After</div>
          <div className="h-5 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded bg-foreground/60"
              style={{ width: `${afterPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-muted-foreground">
              {data.after} {data.unit}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {data.change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupedBar({ data }: { data: any }) {
  const isSourceBreakdown = data.metrics.every(
    (m: any) => m.before === 0
  );
  const max = isSourceBreakdown
    ? Math.max(...data.metrics.map((m: any) => m.after))
    : Math.max(
        ...data.metrics.flatMap((m: any) => [m.before, m.after])
      );

  return (
    <div className="space-y-2">
      {data.metrics.map((m: any, i: number) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-muted-foreground">{m.label}</span>
            <span className="text-sm font-semibold text-foreground">
              {m.change}
            </span>
          </div>
          {isSourceBreakdown ? (
            <div className="h-4 w-full rounded bg-muted overflow-hidden">
              <div
                className="h-full rounded bg-foreground/60"
                style={{ width: `${(m.after / max) * 100}%` }}
              />
            </div>
          ) : (
            <div className="flex gap-1 h-4">
              <div
                className="h-full rounded bg-foreground/20"
                style={{ width: `${(m.before / max) * 50}%` }}
              />
              <div
                className="h-full rounded bg-foreground/60"
                style={{ width: `${(m.after / max) * 50}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data }: { data: any }) {
  const values: number[] = data.values;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = 240;
  const h = 60;
  const pad = 2;

  const points = values.map((v: number, i: number) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const areaPath = `M${points[0]} ${points.join(" L")} L${pad + ((values.length - 1) / (values.length - 1)) * (w - pad * 2)},${h} L${pad},${h} Z`;

  return (
    <div className="space-y-1">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height: 80 }}
        preserveAspectRatio="none"
      >
        <path d={areaPath} fill="currentColor" className="text-foreground/10" />
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground/60"
        />
      </svg>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {data.label} &middot; {data.years}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {data.change}
        </span>
      </div>
    </div>
  );
}

function CoverageRing({ data }: { data: any }) {
  const pct = data.value;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative flex items-center justify-center"
        style={{ width: 80, height: 80 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              hsl(var(--foreground) / 0.5) 0% ${pct}%,
              hsl(var(--muted)) ${pct}% 100%
            )`,
          }}
        />
        <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
          <span className="text-lg font-semibold text-foreground">
            {pct}{data.unit}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{data.label}</span>
    </div>
  );
}

function SourceDonut({ data, cityFlag }: { data: any; cityFlag?: string }) {
  const segments: { label: string; icon: string; value: number }[] = data.segments;
  const opacities = [0.6, 0.4, 0.25, 0.15];

  let cumulativePct = 0;
  const stops = segments.map((seg, i) => {
    const start = cumulativePct;
    cumulativePct += seg.value;
    return `hsl(var(--foreground) / ${opacities[i] ?? 0.1}) ${start}% ${cumulativePct}%`;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: 100, height: 100 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <div className="absolute inset-5 rounded-full bg-background flex items-center justify-center">
          <span className="text-lg">{cityFlag ?? ""}</span>
        </div>
      </div>
      <div className="grid gap-1 w-full">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: `hsl(var(--foreground) / ${opacities[i] ?? 0.1})` }}
            />
            <span>{seg.icon}</span>
            <span className="text-muted-foreground flex-1 truncate">{seg.label}</span>
            <span className="font-semibold text-foreground">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseIndicator({ data }: { data: any }) {
  const filled = data.phase === "building" ? 1 : data.phase === "established" ? 2 : 3;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 rounded-full border-2 border-foreground/40 ${
              step <= filled ? "bg-foreground/50" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{data.label}</span>
    </div>
  );
}

function ChartViz({ data, cityFlag }: { data: any; cityFlag?: string }) {
  if (!data) return null;
  switch (data.type) {
    case "deltaBar":
      return <DeltaBar data={data} />;
    case "groupedBar":
      return <GroupedBar data={data} />;
    case "sourceDonut":
      return <SourceDonut data={data} cityFlag={cityFlag} />;
    case "sparkline":
      return <Sparkline data={data} />;
    case "coverageRing":
      return <CoverageRing data={data} />;
    case "phase":
      return <PhaseIndicator data={data} />;
    default:
      return null;
  }
}

function CityExampleRow({
  example,
  linkCities,
}: {
  example: CityExample;
  linkCities: boolean;
}) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const cityLabel = (
    <span className="font-medium text-foreground">
      {city.flag} {city.name}
    </span>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {linkCities ? (
          <Link
            href={`/ux-concepts/best-practice-roadmap/city/${city.slug}`}
            className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground"
          >
            {cityLabel}
          </Link>
        ) : (
          cityLabel
        )}
        <span className="text-muted-foreground">&middot;</span>
        <span className="text-xs text-muted-foreground">{city.populationLabel}</span>
        <span className="text-muted-foreground">&middot;</span>
        <Badge
          variant={example.provenance === "BC Partnership" ? "outline" : "secondary"}
          className="text-xs"
        >
          {example.provenance}
        </Badge>
      </div>

      {example.chartData && (
        <div className="rounded-lg bg-muted/30 p-4">
          <ChartViz data={example.chartData} cityFlag={city.flag} />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {example.interventionName}
        {example.introducedYear !== "ongoing" && `, introduced ${example.introducedYear}`}
        {example.introducedYear === "ongoing" && ", ongoing"}
      </p>
    </div>
  );
}

export function PracticeCardView({
  practice,
  linkCities = true,
  anchorId,
}: PracticeCardViewProps) {
  const domain = getDomainById(practice.domainId);

  return (
    <Card id={anchorId} className="scroll-mt-16">
      <CardHeader>
        <CardTitle className="text-base">{practice.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {domain && (
            <Link
              href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
              className="hover:underline"
            >
              <Badge variant="outline" className="text-xs">
                {domain.shortName}
              </Badge>
            </Link>
          )}
          {domain && <StageBadge stage={domain.stage} />}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{practice.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {practice.totalPopulationImpacted} people impacted
          </span>
          <span>&middot;</span>
          <span>
            {practice.cityCount} {practice.cityCount === 1 ? "city" : "cities"}
          </span>
        </div>

        <Separator />

        <div className="space-y-5">
          {practice.cityExamples.map((example) => (
            <CityExampleRow
              key={example.citySlug}
              example={example}
              linkCities={linkCities}
            />
          ))}
        </div>

        {practice.relatedPracticeIds.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Related:</span>
              {practice.relatedPracticeIds.map((relId) => {
                const related = getPracticeById(relId);
                if (!related) return null;
                const relDomain = getDomainById(related.domainId);
                return (
                  <Link
                    key={relId}
                    href={`/ux-concepts/best-practice-roadmap/domain/${relDomain?.slug ?? ""}`}
                    className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground text-foreground"
                  >
                    {related.name}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface PracticeCardTileProps {
  practice: PracticeCard;
  example: CityExample;
  linkCity?: boolean;
}

export function PracticeCardTile({
  practice,
  example,
  linkCity = true,
}: PracticeCardTileProps) {
  const domain = getDomainById(practice.domainId);
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col h-full gap-3 pt-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {practice.name}
          </span>
          {domain && <StageBadge stage={domain.stage} />}
        </div>

        {example.chartData && (
          <div className="rounded-lg bg-muted/30 p-3" style={{ minHeight: 140 }}>
            <ChartViz data={example.chartData} cityFlag={city.flag} />
          </div>
        )}

        <div className="mt-auto space-y-2">
          {linkCity ? (
            <Link
              href={`/ux-concepts/best-practice-roadmap/city/${city.slug}`}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {city.flag} {city.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {city.flag} {city.name}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{city.populationLabel}</span>
            <span>&middot;</span>
            <Badge
              variant={example.provenance === "BC Partnership" ? "outline" : "secondary"}
              className="text-xs"
            >
              {example.provenance}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            {example.interventionName}
            {example.introducedYear !== "ongoing" && `, introduced ${example.introducedYear}`}
            {example.introducedYear === "ongoing" && ", ongoing"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
