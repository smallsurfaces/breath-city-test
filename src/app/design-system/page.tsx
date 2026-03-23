"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangleIcon, WindIcon } from "lucide-react";

// ─── Colour tokens sourced directly from dist/css/tokens.css ─────────────────

type ColourSwatch = {
  label: string;
  cssVar: string;
  hex: string;
  group: "palette" | "semantic";
};

const colourSwatches: ColourSwatch[] = [
  // Raw palette
  { label: "White", cssVar: "--bc-color-white", hex: "#ffffff", group: "palette" },
  { label: "Dark Blue", cssVar: "--bc-color-dark-blue", hex: "#003574", group: "palette" },
  { label: "Blue", cssVar: "--bc-color-blue", hex: "#0071c7", group: "palette" },
  { label: "Light Blue", cssVar: "--bc-color-light-blue", hex: "#23bced", group: "palette" },
  { label: "Teal", cssVar: "--bc-color-teal", hex: "#2bcdb0", group: "palette" },
  { label: "Light Teal", cssVar: "--bc-color-light-teal", hex: "#baf0e6", group: "palette" },
  { label: "Green", cssVar: "--bc-color-green", hex: "#03ab3d", group: "palette" },
  { label: "Tangerine", cssVar: "--bc-color-tangerine", hex: "#f55200", group: "palette" },
  { label: "Yellow", cssVar: "--bc-color-yellow", hex: "#e8f000", group: "palette" },
  { label: "Light Grey", cssVar: "--bc-color-light-grey", hex: "#f3f8fe", group: "palette" },
  { label: "Steel", cssVar: "--bc-color-steel", hex: "#b2c2d5", group: "palette" },
  { label: "Dark Blue Dim", cssVar: "--bc-color-dark-blue-dim", hex: "#002a5b", group: "palette" },
  // Semantic
  { label: "Brand", cssVar: "--bc-semantic-brand", hex: "#0071c7", group: "semantic" },
  { label: "Hover", cssVar: "--bc-semantic-hover", hex: "#23bced", group: "semantic" },
  { label: "Error", cssVar: "--bc-semantic-error", hex: "#f55200", group: "semantic" },
  { label: "Success", cssVar: "--bc-semantic-success", hex: "#03ab3d", group: "semantic" },
  { label: "Text", cssVar: "--bc-semantic-text", hex: "#003574", group: "semantic" },
  { label: "Muted", cssVar: "--bc-semantic-muted", hex: "#b2c2d5", group: "semantic" },
  { label: "Border", cssVar: "--bc-semantic-border", hex: "#f3f8fe", group: "semantic" },
  { label: "Background", cssVar: "--bc-semantic-bg", hex: "#ffffff", group: "semantic" },
];

// ─── Spacing tokens sourced directly from dist/css/tokens.css ────────────────

type SpacingToken = {
  label: string;
  cssVar: string;
  value: string;
};

const spacingTokens: SpacingToken[] = [
  { label: "xs", cssVar: "--bc-spacing-xs", value: "10px" },
  { label: "sm", cssVar: "--bc-spacing-sm", value: "20px" },
  { label: "md", cssVar: "--bc-spacing-md", value: "40px" },
  { label: "lg", cssVar: "--bc-spacing-lg", value: "60px" },
  { label: "xl", cssVar: "--bc-spacing-xl", value: "80px" },
  { label: "2xl", cssVar: "--bc-spacing-2xl", value: "120px" },
  { label: "3xl", cssVar: "--bc-spacing-3xl", value: "148px" },
];

// ─── Air quality table data ───────────────────────────────────────────────────

type StationRow = {
  station: string;
  city: string;
  aqi: string;
  pm25: string;
  status: string;
};

const stationData: StationRow[] = [
  { station: "Stephansplatz", city: "Vienna", aqi: "42", pm25: "10.2 µg/m³", status: "Good" },
  { station: "Prater", city: "Vienna", aqi: "58", pm25: "14.6 µg/m³", status: "Moderate" },
  { station: "Mariahilf", city: "Vienna", aqi: "67", pm25: "18.1 µg/m³", status: "Moderate" },
  { station: "Floridsdorf", city: "Vienna", aqi: "81", pm25: "22.4 µg/m³", status: "Unhealthy" },
];

// ─── Scroll area city list ────────────────────────────────────────────────────

const cityList = [
  "Vienna — AQI 42",
  "Berlin — AQI 55",
  "Amsterdam — AQI 61",
  "Copenhagen — AQI 38",
  "Stockholm — AQI 29",
  "Zurich — AQI 44",
  "Oslo — AQI 33",
  "Helsinki — AQI 27",
  "Brussels — AQI 72",
  "Paris — AQI 85",
  "Madrid — AQI 94",
  "Barcelona — AQI 88",
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--bc-semantic-text)" }}
        >
          {title}
        </h2>
        <Separator />
      </div>
      {children}
    </section>
  );
}

// ─── Component example block ──────────────────────────────────────────────────

function Example({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--bc-semantic-muted)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Component group wrapper ──────────────────────────────────────────────────

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h3
        className="text-lg font-semibold"
        style={{ color: "var(--bc-semantic-text)" }}
      >
        {title}
      </h3>
      <div className="flex flex-wrap gap-8 items-start">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bc-semantic-bg)" }}>
      {/* Page header */}
      <header
        className="border-b"
        style={{
          borderColor: "var(--bc-semantic-border)",
          paddingTop: "var(--bc-spacing-md)",
          paddingBottom: "var(--bc-spacing-md)",
        }}
      >
        <div
          className="mx-auto px-6"
          style={{ maxWidth: "var(--bc-container-content-width)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                Breathe Cities
              </p>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--bc-semantic-text)" }}
              >
                Design System
              </h1>
            </div>
            <Link
              href="/"
              className="text-sm font-medium"
              style={{ color: "var(--bc-semantic-brand)" }}
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main
        className="mx-auto px-6 flex flex-col"
        style={{
          maxWidth: "var(--bc-container-content-width)",
          paddingTop: "var(--bc-spacing-lg)",
          paddingBottom: "var(--bc-spacing-lg)",
          gap: "var(--bc-spacing-lg)",
        }}
      >
        {/* ── 1. COLOURS ──────────────────────────────────────────────────── */}
        <Section id="colours" title="Colours">
          {/* Palette */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--bc-semantic-muted)" }}
            >
              Palette
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {colourSwatches
                .filter((s) => s.group === "palette")
                .map((swatch) => (
                  <div key={swatch.cssVar} className="flex flex-col gap-2">
                    <div
                      className="h-16 w-full rounded-lg border"
                      style={{
                        backgroundColor: `var(${swatch.cssVar})`,
                        borderColor: "var(--bc-semantic-border)",
                        borderRadius: "var(--bc-border-radius-sm)",
                      }}
                    />
                    <div className="flex flex-col gap-0.5">
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--bc-semantic-text)" }}
                      >
                        {swatch.label}
                      </p>
                      <p
                        className="text-xs font-mono"
                        style={{ color: "var(--bc-semantic-muted)" }}
                      >
                        {swatch.hex}
                      </p>
                      <p
                        className="text-xs font-mono truncate"
                        style={{ color: "var(--bc-semantic-muted)" }}
                      >
                        {swatch.cssVar}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Semantic */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--bc-semantic-muted)" }}
            >
              Semantic
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {colourSwatches
                .filter((s) => s.group === "semantic")
                .map((swatch) => (
                  <div key={swatch.cssVar} className="flex flex-col gap-2">
                    <div
                      className="h-16 w-full rounded-lg border"
                      style={{
                        backgroundColor: `var(${swatch.cssVar})`,
                        borderColor: "var(--bc-semantic-border)",
                        borderRadius: "var(--bc-border-radius-sm)",
                      }}
                    />
                    <div className="flex flex-col gap-0.5">
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--bc-semantic-text)" }}
                      >
                        {swatch.label}
                      </p>
                      <p
                        className="text-xs font-mono"
                        style={{ color: "var(--bc-semantic-muted)" }}
                      >
                        {swatch.hex}
                      </p>
                      <p
                        className="text-xs font-mono truncate"
                        style={{ color: "var(--bc-semantic-muted)" }}
                      >
                        {swatch.cssVar}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Section>

        {/* ── 2. TYPOGRAPHY ───────────────────────────────────────────────── */}
        <Section id="typography" title="Typography">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-title-large / 4rem / font-bold
              </p>
              <p
                className="leading-tight font-bold"
                style={{
                  fontSize: "var(--bc-font-size-title-large)",
                  lineHeight: "var(--bc-font-line-height-tight)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                Air Quality
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-title-medium / 2.125rem / font-bold
              </p>
              <p
                className="font-bold"
                style={{
                  fontSize: "var(--bc-font-size-title-medium)",
                  lineHeight: "var(--bc-font-line-height-tight)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                Vienna AQI: 42
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-title-small / 1.25rem / font-semibold
              </p>
              <p
                className="font-semibold"
                style={{
                  fontSize: "var(--bc-font-size-title-small)",
                  lineHeight: "var(--bc-font-line-height-snug)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                PM2.5 Particulate Matter
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-title-sub / 1.125rem / font-medium
              </p>
              <p
                className="font-medium"
                style={{
                  fontSize: "var(--bc-font-size-title-sub)",
                  lineHeight: "var(--bc-font-line-height-snug)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                Monitoring station: Stephansplatz
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-body / 1rem / font-normal
              </p>
              <p
                style={{
                  fontSize: "var(--bc-font-size-body)",
                  lineHeight: "var(--bc-font-line-height-normal)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                Real-time air quality data from sensors across the city. Current
                readings show particulate levels within safe thresholds for most
                districts.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-body-smaller / 0.875rem / font-normal
              </p>
              <p
                style={{
                  fontSize: "var(--bc-font-size-body-smaller)",
                  lineHeight: "var(--bc-font-line-height-relaxed)",
                  color: "var(--bc-semantic-text)",
                }}
              >
                Last updated: 14:32 CET — Data refreshes every 15 minutes
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-mono"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                --bc-font-size-caption / 0.938rem / muted
              </p>
              <p
                style={{
                  fontSize: "var(--bc-font-size-caption)",
                  lineHeight: "var(--bc-font-line-height-relaxed)",
                  color: "var(--bc-semantic-muted)",
                }}
              >
                Source: Breathe Cities sensor network · Vienna Environmental Authority
              </p>
            </div>
          </div>
        </Section>

        {/* ── 3. SPACING ──────────────────────────────────────────────────── */}
        <Section id="spacing" title="Spacing">
          <div className="flex flex-col gap-4">
            {spacingTokens.map((token) => (
              <div key={token.cssVar} className="flex items-center gap-4">
                <div
                  className="flex-shrink-0 w-20 text-right"
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--bc-semantic-muted)" }}
                  >
                    {token.label}
                  </span>
                </div>
                <div
                  className="h-6 rounded"
                  style={{
                    width: token.value,
                    backgroundColor: "var(--bc-semantic-brand)",
                    borderRadius: "var(--bc-border-radius-sm)",
                    opacity: "0.7",
                  }}
                />
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--bc-semantic-muted)" }}
                >
                  {token.value} · {token.cssVar}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. COMPONENTS ───────────────────────────────────────────────── */}
        <Section id="components" title="Components">

          {/* Actions */}
          <Group title="Actions — Button">
            <Example label="Default">
              <Button>Check AQI</Button>
            </Example>
            <Example label="Secondary">
              <Button variant="secondary">View Map</Button>
            </Example>
            <Example label="Outline">
              <Button variant="outline">Export Data</Button>
            </Example>
            <Example label="Ghost">
              <Button variant="ghost">Settings</Button>
            </Example>
            <Example label="Destructive">
              <Button variant="destructive">Clear Alert</Button>
            </Example>
            <Example label="Link">
              <Button variant="link">Learn more</Button>
            </Example>
            <Example label="Small">
              <Button size="sm">Filter</Button>
            </Example>
            <Example label="Large">
              <Button size="lg">Subscribe to Alerts</Button>
            </Example>
          </Group>

          <Separator />

          {/* Inputs */}
          <Group title="Inputs">
            <Example label="Input">
              <div className="flex flex-col gap-1.5 w-56">
                <Label htmlFor="station-search">Search stations</Label>
                <Input
                  id="station-search"
                  placeholder="e.g. Stephansplatz"
                />
              </div>
            </Example>

            <Example label="Select">
              <div className="flex flex-col gap-1.5 w-48">
                <Label htmlFor="pollutant-select">Pollutant</Label>
                <Select>
                  <SelectTrigger id="pollutant-select" className="w-48">
                    <SelectValue placeholder="Select pollutant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pm25">PM2.5</SelectItem>
                    <SelectItem value="pm10">PM10</SelectItem>
                    <SelectItem value="no2">NO₂</SelectItem>
                    <SelectItem value="o3">O₃ Ozone</SelectItem>
                    <SelectItem value="co">CO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Example>
          </Group>

          <Separator />

          {/* Display */}
          <Group title="Display">
            <Example label="Card">
              <Card className="w-64">
                <CardHeader>
                  <CardTitle>Vienna — AQI 42</CardTitle>
                  <CardDescription>Stephansplatz monitoring station</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-sm"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    PM2.5: 10.2 µg/m³ · NO₂: 28 µg/m³
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">
                    View details
                  </Button>
                </CardFooter>
              </Card>
            </Example>

            <Example label="Badge">
              <div className="flex flex-col gap-2">
                <Badge>Good</Badge>
                <Badge variant="secondary">Moderate</Badge>
                <Badge variant="destructive">Unhealthy</Badge>
                <Badge variant="outline">PM2.5</Badge>
              </div>
            </Example>

            <Example label="Alert — Default">
              <Alert className="w-72">
                <WindIcon />
                <AlertTitle>Air quality improved</AlertTitle>
                <AlertDescription>
                  Vienna AQI dropped to 42. Conditions are good for outdoor
                  activity.
                </AlertDescription>
              </Alert>
            </Example>

            <Example label="Alert — Destructive">
              <Alert variant="destructive" className="w-72">
                <AlertTriangleIcon />
                <AlertTitle>High PM2.5 Alert</AlertTitle>
                <AlertDescription>
                  Floridsdorf AQI reached 81. Sensitive groups should limit
                  time outdoors.
                </AlertDescription>
              </Alert>
            </Example>

            <Example label="Avatar">
              <div className="flex gap-3 items-center">
                <Avatar size="sm">
                  <AvatarFallback>VN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>BC</AvatarFallback>
                </Avatar>
                <Avatar size="lg">
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
              </div>
            </Example>
          </Group>

          <Separator />

          {/* Feedback */}
          <Group title="Feedback">
            <Example label="Progress — Good (42%)">
              <div className="w-56">
                <Progress value={42}>
                  <ProgressLabel>AQI Score</ProgressLabel>
                  <ProgressValue>{(formattedValue) => formattedValue}</ProgressValue>
                </Progress>
              </div>
            </Example>

            <Example label="Progress — Moderate (67%)">
              <div className="w-56">
                <Progress value={67}>
                  <ProgressLabel>PM2.5 Level</ProgressLabel>
                  <ProgressValue>{(formattedValue) => formattedValue}</ProgressValue>
                </Progress>
              </div>
            </Example>

            <Example label="Skeleton">
              <div className="flex flex-col gap-2 w-56">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Example>
          </Group>

          <Separator />

          {/* Overlay */}
          <Group title="Overlay">
            <Example label="Dialog">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  View AQI Details
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Vienna — AQI 42</DialogTitle>
                    <DialogDescription>
                      Current air quality reading from Stephansplatz monitoring
                      station. Last updated 14:32 CET.
                    </DialogDescription>
                  </DialogHeader>
                  <div
                    className="text-sm"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    <p>PM2.5: 10.2 µg/m³</p>
                    <p>PM10: 18.7 µg/m³</p>
                    <p>NO₂: 28 µg/m³</p>
                    <p>O₃: 52 µg/m³</p>
                  </div>
                  <DialogFooter showCloseButton>
                    <Button>Set alert threshold</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Example>

            <Example label="Sheet">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>
                  Open City Panel
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>City AQI Overview</SheetTitle>
                    <SheetDescription>
                      Live readings from all Breathe Cities monitoring stations.
                    </SheetDescription>
                  </SheetHeader>
                  <div
                    className="px-4 flex flex-col gap-2 text-sm"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    {cityList.slice(0, 6).map((city) => (
                      <p key={city}>{city}</p>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </Example>

            <Example label="Tooltip">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  AQI 42
                </TooltipTrigger>
                <TooltipContent>
                  Good — Air quality is satisfactory
                </TooltipContent>
              </Tooltip>
            </Example>
          </Group>

          <Separator />

          {/* Layout */}
          <Group title="Layout">
            <Example label="Separator — Horizontal">
              <div className="w-64 flex flex-col gap-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--bc-semantic-text)" }}
                >
                  PM2.5 Reading
                </p>
                <Separator />
                <p
                  className="text-sm"
                  style={{ color: "var(--bc-semantic-text)" }}
                >
                  NO₂ Reading
                </p>
              </div>
            </Example>

            <Example label="Tabs">
              <Tabs defaultValue="hourly" className="w-72">
                <TabsList>
                  <TabsTrigger value="hourly">Hourly</TabsTrigger>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
                <TabsContent value="hourly">
                  <p
                    className="text-sm pt-3"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    AQI 42 at 14:00 · AQI 38 at 13:00 · AQI 45 at 12:00
                  </p>
                </TabsContent>
                <TabsContent value="daily">
                  <p
                    className="text-sm pt-3"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    Today avg: 44 · Yesterday avg: 51 · Mon avg: 39
                  </p>
                </TabsContent>
                <TabsContent value="weekly">
                  <p
                    className="text-sm pt-3"
                    style={{ color: "var(--bc-semantic-text)" }}
                  >
                    This week: 42 · Last week: 56 · 2 weeks ago: 48
                  </p>
                </TabsContent>
              </Tabs>
            </Example>

            <Example label="ScrollArea">
              <ScrollArea className="h-48 w-52 rounded-lg border" style={{ borderColor: "var(--bc-semantic-border)" }}>
                <div className="p-4 flex flex-col gap-2">
                  {cityList.map((city) => (
                    <p
                      key={city}
                      className="text-sm"
                      style={{ color: "var(--bc-semantic-text)" }}
                    >
                      {city}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </Example>

            <Example label="Table">
              <div className="w-full max-w-xl">
                <Table>
                  <TableCaption>Live AQI readings — Vienna stations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Station</TableHead>
                      <TableHead>AQI</TableHead>
                      <TableHead>PM2.5</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationData.map((row) => (
                      <TableRow key={row.station}>
                        <TableCell className="font-medium">{row.station}</TableCell>
                        <TableCell>{row.aqi}</TableCell>
                        <TableCell>{row.pm25}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === "Good"
                                ? "default"
                                : row.status === "Moderate"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Example>
          </Group>
        </Section>
      </main>
    </div>
  );
}
