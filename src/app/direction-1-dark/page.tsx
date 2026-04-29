"use client";
import { direction1Dark, applyTheme } from "@/themes";
import DirectionHeader from "@/components/aqi/DirectionHeader";
import BrandPalette from "@/components/aqi/BrandPalette";
import { AqiAreaChart, PollutantPieChart, WeeklyBarChart } from "@/components/aqi/AqiCharts";
import AqiMockup from "@/components/aqi/AqiMockup";

const swatches = [
  { label: "Background", hex: "#001433" },
  { label: "Foreground", hex: "#f2f2f2" },
  { label: "Primary", hex: "#4d9fdb" },
  { label: "Secondary", hex: "#2d8a78" },
  { label: "Accent", hex: "var(--bc-color-light-blue)" },
  { label: "Destructive", hex: "#ff6633" },
];

export default function Page() {
  return (
    <div style={{ ...applyTheme(direction1Dark), backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))", minHeight: "100vh" }}>
      <DirectionHeader directionName="Direction 01 — Clear Signal" mode="dark" fontLabel="Söhne — var(--bc-font-family-sans)" fontFamily="var(--bc-font-family-sans)" swatches={swatches} />
      <div style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
        <section><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24, color: "hsl(var(--foreground))" }}>Brand Palette</h2><BrandPalette /></section>
        <section><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 24, color: "hsl(var(--foreground))" }}>AQI Charts</h2><div style={{ display: "flex", flexDirection: "column", gap: 32 }}><AqiAreaChart /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}><PollutantPieChart /><WeeklyBarChart /></div></div></section>
      </div>
      <AqiMockup typography="sans" />
    </div>
  );
}
