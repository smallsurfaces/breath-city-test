/**
 * TypeScript types for the JTBD Framework data model.
 * These types mirror the JSON schema in /src/data/jtbd/.
 * Used by the /jtbd-framework route and its components.
 */

/** A city in the BC portfolio with tier and context metadata. */
export interface City {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  continent: string;
  globalSouth: boolean;
  bcMember: boolean;
  structuralContext: string;
}

/** A job-to-be-done in the JTBD taxonomy. */
export interface Job {
  id: string;
  name: string;
  jobType: "functional" | "emotional" | "social";
  description: string;
}

/** A hirer type — the person hiring a product to complete a job. */
export interface Hirer {
  id: string;
  name: string;
  cluster: "expert" | "resident" | "city";
  subType: string | null;
}

/** Supply-side coverage status for a chain step. */
export type SupplyStatus = "served" | "partial" | "gap" | "unknown";

/** Demand-side evidence strength for a chain step. */
export type DemandStatus = "hypothetical" | "inferred" | "direct" | "confirmed";

/** Evidence source type for supply-side assessment. */
export type SupplyConfidence =
  | "desktop-research"
  | "expert-testimony"
  | "direct-tested";

/**
 * A single chain step record: one cell in the matrix.
 * The core data unit: city × hirer × job → supply + demand evidence.
 */
export interface ChainStep {
  cityId: string;
  hirerId: string;
  jobId: string;
  stepNumber: number;
  supplyStatus: SupplyStatus;
  supplyProduct: string | null;
  supplyProductUrl: string | null;
  supplyNotes: string;
  supplyConfidence: SupplyConfidence;
  demandStatus: DemandStatus;
  demandSource: string | null;
  demandNotes: string | null;
}

/** Filter state for the matrix view. Tier is multi-select (array of tier numbers, or ["all"]). */
export interface FilterState {
  hirerId: string | "all";
  tiers: Array<1 | 2 | 3 | "all">;
}

/**
 * Aggregated cell data for one job × city cell in the matrix.
 * When hirerId = "all", shows worst-case supply and highest demand across all hirers.
 */
export interface MatrixCell {
  jobId: string;
  cityId: string;
  supplyStatus: SupplyStatus;
  demandStatus: DemandStatus;
  /** All individual steps contributing to this cell (for tooltip detail). */
  steps: ChainStep[];
}
