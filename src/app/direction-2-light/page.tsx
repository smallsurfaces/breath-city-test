"use client";
import { direction2Light, applyTheme } from "@/themes";
import DirectionHeader from "@/components/aqi/DirectionHeader";
import BrandPalette from "@/components/aqi/BrandPalette";
import { AqiAreaChart, PollutantPieChart, WeeklyBarChart } from "@/components/aqi/AqiCharts";
import AqiMockup from "@/components/aqi/AqiMockup";

const swatches = [
  { label: "Background", hex: "#ffffff" },
  { label: "Foreground", hex: "#003880", darkText: true },
  { label: "Primary", hex: "#0071c7" },
  { label: "Secondary", hex: "#0f83a6" },
  { label: "Accent", hex: "#6b6b00", darkText: true },
  { label: "Destructive", hex: "#f55200" },
];

export default function Page() {
  return (
    <div style={{ ...applyTheme(direction2Light), backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))", minHeight: "100vh" }}>
      <DirectionHeader directionName="Direction 02 — Open Sky" mode="light" fontLabel="Söhne — var(--bc-font-family-sans)" fontFamily="var(--bc-font-family-sans)" swatches={swatches} />
      <div style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
        <section><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24, color: "hsl(var(--foreground))" }}>Brand Palette</h2><BrandPalette /></section>
        <section><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24, color: "hsl(var(--foreground))" }}>AQI Charts</h2><div style={{ display: "flex", flexDirection: "column", gap: 32 }}><AqiAreaChart /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}><PollutantPieChart /><WeeklyBarChart /></div></div></section>
      </div>
      <AqiMockup typography="sans" />
    </div>
  );
}
