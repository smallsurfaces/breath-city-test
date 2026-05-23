import { Card, CardContent } from "@/components/ui/card";

const SENSOR_DATA = [
  {
    city: "London",
    flag: "\u{1F1EC}\u{1F1E7}",
    totalSensors: 122,
    referenceCount: 18,
    lowCostCount: 104,
    ownership: [
      { label: "City gov", pct: 12 },
      { label: "Academic", pct: 28 },
      { label: "Community", pct: 25 },
      { label: "Breathe London", pct: 35 },
    ],
    dots: [
      { x: 18, y: 12, ref: true }, { x: 45, y: 8, ref: false }, { x: 72, y: 15, ref: false },
      { x: 30, y: 28, ref: false }, { x: 55, y: 22, ref: true }, { x: 82, y: 30, ref: false },
      { x: 12, y: 42, ref: false }, { x: 38, y: 38, ref: false }, { x: 60, y: 35, ref: false },
      { x: 88, y: 18, ref: false }, { x: 25, y: 55, ref: true }, { x: 50, y: 48, ref: false },
      { x: 70, y: 52, ref: false }, { x: 15, y: 68, ref: false }, { x: 42, y: 62, ref: true },
      { x: 65, y: 58, ref: false }, { x: 85, y: 45, ref: false }, { x: 20, y: 78, ref: false },
      { x: 48, y: 75, ref: false }, { x: 75, y: 70, ref: true }, { x: 8, y: 85, ref: false },
      { x: 35, y: 82, ref: false }, { x: 58, y: 88, ref: false }, { x: 90, y: 60, ref: false },
      { x: 32, y: 18, ref: false }, { x: 62, y: 25, ref: false }, { x: 78, y: 42, ref: false },
      { x: 22, y: 48, ref: true }, { x: 52, y: 55, ref: false }, { x: 40, y: 45, ref: false },
      { x: 68, y: 68, ref: false }, { x: 28, y: 72, ref: false }, { x: 55, y: 32, ref: true },
      { x: 80, y: 75, ref: false }, { x: 15, y: 35, ref: false }, { x: 45, y: 90, ref: false },
      { x: 92, y: 50, ref: false }, { x: 10, y: 58, ref: true }, { x: 38, y: 30, ref: false },
      { x: 65, y: 80, ref: false },
    ],
  },
  {
    city: "Nairobi",
    flag: "\u{1F1F0}\u{1F1EA}",
    totalSensors: 24,
    referenceCount: 3,
    lowCostCount: 21,
    ownership: [
      { label: "National gov", pct: 8 },
      { label: "UNEP/Intl", pct: 17 },
      { label: "Community/AirQo", pct: 54 },
      { label: "Academic", pct: 21 },
    ],
    dots: [
      { x: 30, y: 20, ref: true }, { x: 55, y: 35, ref: false }, { x: 75, y: 15, ref: false },
      { x: 20, y: 50, ref: false }, { x: 45, y: 55, ref: true }, { x: 70, y: 45, ref: false },
      { x: 35, y: 70, ref: false }, { x: 60, y: 65, ref: false }, { x: 85, y: 30, ref: false },
      { x: 15, y: 80, ref: false }, { x: 50, y: 78, ref: false }, { x: 80, y: 60, ref: false },
      { x: 25, y: 38, ref: false }, { x: 65, y: 82, ref: false }, { x: 40, y: 42, ref: false },
      { x: 90, y: 72, ref: false }, { x: 12, y: 25, ref: false }, { x: 55, y: 18, ref: true },
      { x: 72, y: 88, ref: false }, { x: 42, y: 85, ref: false },
    ],
  },
  {
    city: "Accra",
    flag: "\u{1F1EC}\u{1F1ED}",
    totalSensors: 14,
    referenceCount: 2,
    lowCostCount: 12,
    ownership: [
      { label: "US Embassy", pct: 14 },
      { label: "National gov", pct: 7 },
      { label: "Community/AirQo", pct: 79 },
    ],
    dots: [
      { x: 48, y: 40, ref: true }, { x: 30, y: 60, ref: true }, { x: 70, y: 25, ref: false },
      { x: 20, y: 30, ref: false }, { x: 55, y: 70, ref: false }, { x: 80, y: 50, ref: false },
      { x: 40, y: 85, ref: false }, { x: 65, y: 55, ref: false }, { x: 15, y: 75, ref: false },
      { x: 85, y: 80, ref: false }, { x: 35, y: 15, ref: false }, { x: 60, y: 90, ref: false },
      { x: 50, y: 50, ref: false }, { x: 75, y: 70, ref: false },
    ],
  },
];

const OWNERSHIP_SHADES = [
  "bg-foreground/60",
  "bg-foreground/40",
  "bg-foreground/25",
  "bg-foreground/15",
];

function DotMap({ dots }: { dots: { x: number; y: number; ref: boolean }[] }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full rounded-lg border border-border/50"
      style={{ height: 180 }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8L8 0" stroke="currentColor" strokeWidth="0.3" className="text-foreground/8" />
        </pattern>
      </defs>
      <rect width="100" height="100" rx="4" fill="currentColor" className="text-foreground/5" />
      <rect width="100" height="100" rx="4" fill="url(#crosshatch)" />
      {dots.map((dot, i) =>
        dot.ref ? (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={2.8}
            fill="currentColor" className="text-foreground/70"
          />
        ) : (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={2.2}
            fill="none"
            stroke="currentColor" className="text-foreground/40"
            strokeWidth="0.8"
          />
        )
      )}
    </svg>
  );
}

function OwnershipBar({ segments }: { segments: { label: string; pct: number }[] }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={OWNERSHIP_SHADES[i] ?? "bg-foreground/10"}
          style={{ width: `${seg.pct}%` }}
        />
      ))}
    </div>
  );
}

export function SensorLandscape() {
  return (
    <>
      {SENSOR_DATA.map((city) => (
        <Card key={city.city} className="flex flex-col h-full">
          <CardContent className="flex flex-col h-full gap-3 pt-5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {city.flag} {city.city}
              </p>
              <p className="text-xs text-muted-foreground">
                {city.totalSensors} sensors
              </p>
            </div>

            <DotMap dots={city.dots} />

            <OwnershipBar segments={city.ownership} />

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground/70" />
                Ref
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-foreground/40" />
                Low-cost
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {city.ownership.map((seg, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span
                    className={`inline-block h-2 w-3 rounded-sm ${OWNERSHIP_SHADES[i] ?? "bg-foreground/10"}`}
                  />
                  {seg.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
