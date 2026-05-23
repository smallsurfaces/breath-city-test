"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { direction1Light, applyTheme } from "@/themes"
import { PrototypeHeader } from "../_components/PrototypeHeader"

// ─── Token map ────────────────────────────────────────────────────────────────

const DIR1_VARS: Record<string, string> = {
  "--background":             "0 0% 100%",
  "--foreground":             "216 100% 22%",
  "--primary":                "210 100% 39%",
  "--primary-foreground":     "0 0% 100%",
  "--secondary":              "185 66% 49%",
  "--secondary-foreground":   "216 100% 22%",
  "--muted":                  "210 47% 94%",
  "--muted-foreground":       "215 25% 45%",
  "--accent":                 "194 84% 53%",
  "--accent-foreground":      "216 100% 22%",
  "--destructive":            "18 100% 48%",
  "--destructive-foreground": "0 0% 100%",
  "--card":                   "0 0% 100%",
  "--card-foreground":        "216 100% 22%",
  "--border":                 "210 30% 88%",
  "--input":                  "210 30% 88%",
  "--ring":                   "210 100% 39%",
  "--radius":                 "0.375rem",
}

// ─── Colour swatches ──────────────────────────────────────────────────────────

const SWATCHES: { token: string; label: string; hex: string; darkText: boolean }[] = [
  { token: "--background",  label: "Background",  hex: "var(--bc-color-white)",      darkText: false },
  { token: "--foreground",  label: "Foreground",  hex: "var(--bc-color-dark-blue)",  darkText: true  },
  { token: "--primary",     label: "Primary",     hex: "var(--bc-color-blue)",        darkText: true  },
  { token: "--secondary",   label: "Secondary",   hex: "var(--bc-color-light-blue)", darkText: false },
  { token: "--accent",      label: "Accent",      hex: "var(--bc-color-light-blue)", darkText: false },
  { token: "--destructive", label: "Destructive", hex: "var(--bc-color-tangerine)",  darkText: true  },
]

// ─── AQI semantic colours (cross-direction, not theme tokens) ─────────────────

const AQI_LEVELS = [
  { label: "Good",                  color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
  { label: "Moderate",              color: "var(--bc-semantic-aqi-moderate-indicator)",       textColor: "var(--bc-semantic-aqi-moderate-text)" },
  { label: "Unhealthy Sensitive",   color: "var(--bc-semantic-aqi-unhealthy-indicator)",      textColor: "var(--bc-color-white)" },
  { label: "Unhealthy",             color: "var(--bc-semantic-aqi-very-unhealthy-indicator)", textColor: "var(--bc-color-white)" },
  { label: "Very Unhealthy",        color: "var(--bc-semantic-aqi-hazardous-indicator)",      textColor: "var(--bc-color-white)" },
  { label: "Hazardous",             color: "var(--bc-semantic-aqi-extreme-indicator)",        textColor: "var(--bc-color-white)" },
]

const POLLUTANTS: { name: string; value: number; unit: string; max: number; color: string }[] = [
  { name: "PM2.5", value: 10.2, unit: "µg/m³", max: 55,   color: "var(--bc-semantic-aqi-good-indicator)"     },
  { name: "PM10",  value: 18.7, unit: "µg/m³", max: 155,  color: "var(--bc-semantic-aqi-good-indicator)"     },
  { name: "NO₂",   value: 28,   unit: "µg/m³", max: 200,  color: "var(--bc-semantic-aqi-good-indicator)"     },
  { name: "O₃",    value: 52,   unit: "µg/m³", max: 105,  color: "var(--bc-semantic-aqi-moderate-indicator)" },
  { name: "CO",    value: 0.3,  unit: "mg/m³", max: 10,   color: "var(--bc-semantic-aqi-good-indicator)"     },
]

const FORECAST: { time: string; aqi: number }[] = [
  { time: "00:00", aqi: 35 },
  { time: "04:00", aqi: 29 },
  { time: "08:00", aqi: 44 },
  { time: "12:00", aqi: 52 },
  { time: "16:00", aqi: 48 },
  { time: "20:00", aqi: 42 },
]

const STATIONS: { name: string; aqi: number; level: string; color: string }[] = [
  { name: "Stephansplatz", aqi: 42, level: "Good",      color: "var(--bc-semantic-aqi-good-indicator)"          },
  { name: "Prater",        aqi: 58, level: "Moderate",  color: "var(--bc-semantic-aqi-moderate-indicator)"      },
  { name: "Mariahilf",     aqi: 67, level: "Moderate",  color: "var(--bc-semantic-aqi-moderate-indicator)"      },
  { name: "Floridsdorf",   aqi: 81, level: "Unhealthy", color: "var(--bc-semantic-aqi-very-unhealthy-indicator)"},
]

const MAP_MARKERS: { aqi: number; x: string; y: string; color: string; textColor: string }[] = [
  { aqi: 42, x: "40%", y: "50%", color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
  { aqi: 38, x: "25%", y: "30%", color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
  { aqi: 55, x: "50%", y: "45%", color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
  { aqi: 61, x: "65%", y: "55%", color: "var(--bc-semantic-aqi-moderate-indicator)",      textColor: "var(--bc-color-white)" },
  { aqi: 58, x: "48%", y: "70%", color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
  { aqi: 81, x: "75%", y: "25%", color: "var(--bc-semantic-aqi-unhealthy-indicator)",     textColor: "var(--bc-color-white)" },
  { aqi: 67, x: "72%", y: "68%", color: "var(--bc-semantic-aqi-moderate-indicator)",      textColor: "var(--bc-color-white)" },
  { aqi: 44, x: "45%", y: "20%", color: "var(--bc-semantic-aqi-good-indicator)",          textColor: "var(--bc-color-white)" },
]

const MAP_RANKINGS: { name: string; district: string; aqi: number; level: string; color: string; textColor: string }[] = [
  { name: "Stephansplatz", district: "1st",  aqi: 42, level: "Good",      color: "var(--bc-semantic-aqi-good-indicator)",      textColor: "var(--bc-color-white)" },
  { name: "Prater",        district: "2nd",  aqi: 55, level: "Good",      color: "var(--bc-semantic-aqi-good-indicator)",      textColor: "var(--bc-color-white)" },
  { name: "Mariahilf",     district: "6th",  aqi: 58, level: "Good",      color: "var(--bc-semantic-aqi-good-indicator)",      textColor: "var(--bc-color-white)" },
  { name: "Favoriten",     district: "10th", aqi: 67, level: "Moderate",  color: "var(--bc-semantic-aqi-moderate-indicator)",  textColor: "var(--bc-color-white)" },
  { name: "Floridsdorf",   district: "21st", aqi: 81, level: "Unhealthy", color: "var(--bc-semantic-aqi-unhealthy-indicator)", textColor: "var(--bc-color-white)" },
  { name: "Donaustadt",    district: "22nd", aqi: 44, level: "Good",      color: "var(--bc-semantic-aqi-good-indicator)",      textColor: "var(--bc-color-white)" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Direction1FinalPage() {
  const themeStyle = applyTheme(direction1Light)

  const wrapperStyle = Object.fromEntries(
    Object.entries(DIR1_VARS).map(([k, v]) => [k, v])
  ) as React.CSSProperties

  const foreground  = "hsl(var(--foreground))"
  const background  = "hsl(var(--background))"
  const primary     = "hsl(var(--primary))"
  const muted       = "hsl(var(--muted))"
  const mutedFg     = "hsl(var(--muted-foreground))"
  const border      = "hsl(var(--border))"
  const card        = "hsl(var(--card))"
  const cardFg      = "hsl(var(--card-foreground))"
  const radius      = "var(--radius, 0.375rem)"
  const sans        = "var(--bc-font-family-sans, sans-serif)"

  const forecastMax = Math.max(...FORECAST.map((f) => f.aqi))

  return (
    <>
      {/* Standard prototype chrome — rendered OUTSIDE the theme-scoped wrapper below,
          because that wrapper locally overrides --background/--border/--foreground with
          raw HSL triplets (DIR1_VARS) that would break the bar's semantic-token styling. */}
      <PrototypeHeader buildName="Direction 01 — Clear Signal (Final)" />

      <div
      style={{
        ...themeStyle,
        ...wrapperStyle,
        backgroundColor: background,
        color: foreground,
        fontFamily: sans,
        minHeight: "100vh",
      }}
    >
      {/* ── Section A — Direction header strip ─────────────────────────────── */}
      <div
        style={{
          backgroundColor: muted,
          borderBottom: `2px solid ${border}`,
          padding: "2rem 2.5rem",
        }}
      >
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          {/* Direction label */}
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: mutedFg,
              marginBottom: "0.25rem",
            }}
          >
            Visual Direction
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: foreground,
                margin: 0,
              }}
            >
              01 — Clear Signal
            </h1>
            <Badge
              style={{
                backgroundColor: "var(--bc-semantic-aqi-good-bg)",
                color: "var(--bc-semantic-aqi-good-text)",
                border: "none",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              Finalised
            </Badge>
          </div>

          {/* Font specimen */}
          <div
            style={{
              backgroundColor: card,
              border: `1px solid ${border}`,
              borderRadius: radius,
              padding: "1.25rem 1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: mutedFg,
                marginBottom: "1rem",
              }}
            >
              Font — Söhne &nbsp;·&nbsp; <span style={{ fontWeight: 400 }}>var(--bc-font-family-sans)</span>
            </p>

            <p
              style={{
                fontFamily: sans,
                fontSize: "2.25rem",
                fontWeight: 700,
                lineHeight: 1.1,
                color: foreground,
                marginBottom: "0.25rem",
              }}
            >
              Air Quality Index
            </p>
            <p style={{ fontSize: "0.6rem", color: mutedFg, marginBottom: "1rem" }}>
              H1 · 2.25rem · Bold 700
            </p>

            <p
              style={{
                fontFamily: sans,
                fontSize: "1rem",
                fontWeight: 400,
                lineHeight: 1.6,
                color: foreground,
                marginBottom: "0.25rem",
              }}
            >
              Real-time monitoring data for Vienna
            </p>
            <p style={{ fontSize: "0.6rem", color: mutedFg, marginBottom: "1rem" }}>
              Body · 1rem · Regular 400
            </p>

            <p
              style={{
                fontFamily: sans,
                fontSize: "0.75rem",
                fontWeight: 500,
                color: mutedFg,
                marginBottom: "0.25rem",
              }}
            >
              PM2.5 · NO₂ · O₃ · CO
            </p>
            <p style={{ fontSize: "0.6rem", color: mutedFg }}>
              Caption/Mono · 0.75rem · Medium 500
            </p>
          </div>

          {/* Colour swatches */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.75rem" }}>
            {SWATCHES.map((s) => (
              <div key={s.token}>
                <div
                  style={{
                    height: "56px",
                    borderRadius: radius,
                    backgroundColor: s.hex,
                    border: `1px solid ${border}`,
                    marginBottom: "0.375rem",
                  }}
                />
                <p style={{ fontSize: "0.6rem", fontWeight: 600, color: foreground }}>{s.label}</p>
                <p style={{ fontSize: "0.55rem", color: mutedFg }}>{s.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section B — AQI city page mockup ───────────────────────────────── */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 2rem 4rem" }}>

        {/* 1. Nav bar */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 0",
            borderBottom: `1px solid ${border}`,
            marginBottom: "2.5rem",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 700, color: primary }}>
            Breathe Cities
          </span>
          <div style={{ display: "flex", gap: "2rem" }}>
            {["Cities", "Rankings", "Health", "API"].map((link) => (
              <span
                key={link}
                style={{ fontSize: "0.875rem", color: mutedFg, cursor: "pointer" }}
              >
                {link}
              </span>
            ))}
          </div>
        </nav>

        {/* 2. Hero section */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", color: mutedFg, marginBottom: "0.5rem" }}>
            Europe / Austria / Vienna
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.75rem",
              marginBottom: "0.25rem",
            }}
          >
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, color: foreground }}>
              Vienna
            </h1>
            <span style={{ fontSize: "1.25rem", lineHeight: 1.8 }}>Austria 🇦🇹</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "1rem",
              margin: "1.25rem 0 0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "6rem",
                fontWeight: 700,
                lineHeight: 1,
                color: "var(--bc-semantic-aqi-good-indicator)",
              }}
            >
              42
            </span>
            <div>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--bc-semantic-aqi-good-indicator)",
                }}
              >
                Good
              </p>
              <p style={{ fontSize: "0.8rem", color: mutedFg }}>AQI (US)</p>
            </div>
          </div>

          {/* AQI colour scale bar */}
          <div style={{ display: "flex", marginBottom: "0.75rem", borderRadius: radius, overflow: "hidden", height: "10px", maxWidth: "480px" }}>
            {AQI_LEVELS.map((lvl, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: lvl.color,
                  position: "relative",
                }}
              >
                {i === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-1px",
                      width: "4px",
                      height: "18px",
                      backgroundColor: foreground,
                      borderRadius: "2px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: "480px",
              marginBottom: "0.75rem",
            }}
          >
            {AQI_LEVELS.map((lvl, i) => (
              <p
                key={i}
                style={{
                  flex: 1,
                  fontSize: "0.5rem",
                  color: mutedFg,
                  textAlign: "center",
                }}
              >
                {i === 0 ? lvl.label : ""}
              </p>
            ))}
          </div>

          <p style={{ fontSize: "0.8rem", color: mutedFg, marginBottom: "0.25rem" }}>
            Main pollutant: PM2.5
          </p>
          <p style={{ fontSize: "0.75rem", color: mutedFg, marginBottom: "1rem" }}>
            Updated 5 minutes ago
          </p>

          {/* Weather strip */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: muted,
              borderRadius: radius,
              fontSize: "0.8rem",
              color: foreground,
              flexWrap: "wrap",
            }}
          >
            <span>🌡️ 14°C</span>
            <span>💧 62% humidity</span>
            <span>💨 12 km/h wind</span>
            <span>👁️ 10 km visibility</span>
          </div>
        </div>

        <Separator style={{ marginBottom: "2rem" }} />

        {/* 3. Health recommendation card */}
        <div
          style={{
            backgroundColor: "var(--bc-semantic-aqi-good-bg)",
            border: "1px solid var(--bc-semantic-aqi-good-indicator)",
            borderRadius: radius,
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>✅</span>
          <div>
            <p style={{ fontWeight: 700, color: "var(--bc-semantic-aqi-good-indicator)", marginBottom: "0.25rem" }}>
              Air quality is Good
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--bc-semantic-aqi-good-text)" }}>
              Air quality is considered satisfactory, and air pollution poses little or no risk.
              Enjoy your usual outdoor activities.
            </p>
          </div>
        </div>

        {/* 4. Pollutant breakdown */}
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: foreground,
            marginBottom: "1rem",
          }}
        >
          Pollutant Breakdown
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {POLLUTANTS.map((p) => (
            <Card key={p.name} style={{ backgroundColor: card, color: cardFg, border: `1px solid ${border}` }}>
              <CardContent style={{ padding: "1rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>{p.name}</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: p.color, marginBottom: "0.25rem" }}>
                  {p.value}
                </p>
                <p style={{ fontSize: "0.65rem", color: mutedFg, marginBottom: "0.75rem" }}>{p.unit}</p>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "3px",
                    backgroundColor: border,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min((p.value / p.max) * 100, 100)}%`,
                      height: "100%",
                      backgroundColor: p.color,
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 5. Air Quality Map */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Map header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: foreground,
                margin: 0,
              }}
            >
              Air Quality Map — Vienna
            </h2>
            <p style={{ fontSize: "0.7rem", color: mutedFg, margin: 0 }}>
              42 monitoring stations · Updated 5 min ago
            </p>
          </div>

          {/* Mock map container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "380px",
              borderRadius: radius,
              overflow: "hidden",
              border: `1px solid ${border}`,
              backgroundColor: "#f8fafc",
              backgroundImage: [
                "repeating-linear-gradient(0deg, transparent, transparent 39px, var(--bc-semantic-map-grid) 39px, var(--bc-semantic-map-grid) 40px)",
                "repeating-linear-gradient(90deg, transparent, transparent 39px, var(--bc-semantic-map-grid) 39px, var(--bc-semantic-map-grid) 40px)",
              ].join(", "),
            }}
          >
            {/* Green zone wash — centre-left */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 45% 40% at 38% 52%, var(--bc-semantic-map-zone-good) 0%, transparent 75%)",
                pointerEvents: "none",
              }}
            />
            {/* Amber zone wash — top-right */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 38% 32% at 76% 22%, var(--bc-semantic-map-zone-mod) 0%, transparent 72%)",
                pointerEvents: "none",
              }}
            />

            {/* Road SVG lines */}
            <svg
              viewBox="0 0 800 380"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              preserveAspectRatio="none"
            >
              {/* Ringstrasse rough oval */}
              <ellipse
                cx="400"
                cy="190"
                rx="155"
                ry="90"
                fill="none"
                stroke="var(--bc-semantic-map-road)"
                strokeWidth="2.5"
              />
              {/* Radial road — NW */}
              <path
                d="M 245 100 Q 180 60 100 30"
                fill="none"
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="2"
              />
              {/* Radial road — SE */}
              <path
                d="M 555 280 Q 630 330 720 370"
                fill="none"
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="2"
              />
              {/* Cross road E–W */}
              <path
                d="M 80 190 Q 240 185 400 190 Q 560 195 720 188"
                fill="none"
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="1.5"
              />
            </svg>

            {/* AQI marker dots */}
            {MAP_MARKERS.map((m, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: m.x,
                  top: m.y,
                  transform: "translate(-50%, -50%)",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: m.color,
                  color: m.textColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                  border: "2px solid rgba(255,255,255,0.8)",
                }}
              >
                {m.aqi}
              </div>
            ))}

            {/* Compass rose — top-right */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                width: "32px",
                height: "32px",
                backgroundColor: "var(--bc-semantic-map-overlay)",
                borderRadius: "50%",
                border: "1px solid var(--bc-semantic-map-grid)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "#334155",
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                flexDirection: "column",
                gap: "0",
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: "7px", marginBottom: "1px" }}>▲</span>
              <span style={{ fontSize: "8px", fontWeight: 800 }}>N</span>
            </div>

            {/* Legend strip */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "1.25rem",
                backgroundColor: "var(--bc-semantic-map-overlay)",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--bc-semantic-text)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                border: "1px solid var(--bc-semantic-map-grid)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--bc-semantic-aqi-good-indicator)" }}>● Good</span>
              <span style={{ color: "var(--bc-semantic-aqi-moderate-indicator)" }}>● Moderate</span>
              <span style={{ color: "var(--bc-semantic-aqi-unhealthy-indicator)" }}>● Unhealthy</span>
            </div>
          </div>

          {/* Rankings section */}
          <div style={{ marginTop: "1.25rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: foreground,
                marginBottom: "0.75rem",
              }}
            >
              Nearby stations
            </h3>
            <Card style={{ backgroundColor: card, border: `1px solid ${border}` }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ borderBottomColor: border }}>
                    <TableHead style={{ color: mutedFg, fontSize: "0.75rem" }}>Station</TableHead>
                    <TableHead style={{ color: mutedFg, fontSize: "0.75rem" }}>District</TableHead>
                    <TableHead style={{ color: mutedFg, fontSize: "0.75rem" }}>AQI</TableHead>
                    <TableHead style={{ color: mutedFg, fontSize: "0.75rem" }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MAP_RANKINGS.map((st) => (
                    <TableRow key={st.name} style={{ borderBottomColor: border }}>
                      <TableCell style={{ color: cardFg, fontWeight: 500, fontSize: "0.8rem" }}>
                        {st.name}
                      </TableCell>
                      <TableCell style={{ color: mutedFg, fontSize: "0.8rem" }}>{st.district}</TableCell>
                      <TableCell style={{ color: cardFg, fontSize: "0.8rem" }}>{st.aqi}</TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: st.color,
                            color: st.textColor,
                            border: "none",
                            fontSize: "0.7rem",
                          }}
                        >
                          {st.level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>

        {/* 6. AQI Forecast */}
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: foreground,
            marginBottom: "1rem",
          }}
        >
          AQI Forecast
        </h2>
        <Tabs defaultValue="today" style={{ marginBottom: "2rem" }}>
          <TabsList style={{ marginBottom: "1rem" }}>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="3day">3 Day</TabsTrigger>
            <TabsTrigger value="7day">7 Day</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <Card style={{ backgroundColor: card, border: `1px solid ${border}` }}>
              <CardContent style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "120px" }}>
                  {FORECAST.map((f) => (
                    <div
                      key={f.time}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <p style={{ fontSize: "0.65rem", color: mutedFg }}>{f.aqi}</p>
                      <div
                        style={{
                          width: "100%",
                          backgroundColor: "var(--bc-semantic-aqi-good-indicator)",
                          borderRadius: `${radius} ${radius} 0 0`,
                          height: `${(f.aqi / forecastMax) * 80}px`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  {FORECAST.map((f) => (
                    <p
                      key={f.time}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "0.65rem",
                        color: mutedFg,
                      }}
                    >
                      {f.time}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="3day">
            <Card style={{ backgroundColor: card, border: `1px solid ${border}` }}>
              <CardContent style={{ padding: "1.5rem" }}>
                <p style={{ color: mutedFg, fontSize: "0.875rem" }}>3-day forecast data</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="7day">
            <Card style={{ backgroundColor: card, border: `1px solid ${border}` }}>
              <CardContent style={{ padding: "1.5rem" }}>
                <p style={{ color: mutedFg, fontSize: "0.875rem" }}>7-day forecast data</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 7. Nearby stations */}
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: foreground,
            marginBottom: "1rem",
          }}
        >
          Nearby Stations
        </h2>
        <Card style={{ backgroundColor: card, border: `1px solid ${border}`, marginBottom: "2rem" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottomColor: border }}>
                <TableHead style={{ color: mutedFg }}>Station</TableHead>
                <TableHead style={{ color: mutedFg }}>AQI</TableHead>
                <TableHead style={{ color: mutedFg }}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STATIONS.map((st) => (
                <TableRow key={st.name} style={{ borderBottomColor: border }}>
                  <TableCell style={{ color: cardFg, fontWeight: 500 }}>{st.name}</TableCell>
                  <TableCell style={{ color: cardFg }}>{st.aqi}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: st.color,
                        color: st.level === "Moderate" ? "var(--bc-semantic-aqi-moderate-text)" : "var(--bc-color-white)",
                        border: "none",
                      }}
                    >
                      {st.level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* 8. Footer */}
        <div
          style={{
            backgroundColor: muted,
            borderRadius: radius,
            padding: "1rem 1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: mutedFg }}>
            © 2025 Breathe Cities · Data for 7,000+ cities worldwide
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
