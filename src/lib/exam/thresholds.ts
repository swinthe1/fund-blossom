// @ts-nocheck
// ÖIF-Prüfung pass thresholds per level.
// For Integrationsprüfungen (A1/A2/B1): absolute minimums per module.
// For language-only tests (B2/C1/C2): module thresholds expressed as percentage
// of the entered max (we don't know the absolute max, so we default to 60%
// of the highest observed value per module — see evaluatePass below).

export type ExamLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface ModulePoints {
  pointsHoerenLesen: number | null | undefined;
  pointsSchreiben: number | null | undefined;
  pointsSprechen: number | null | undefined;
  pointsWerte: number | null | undefined;
}

interface AbsoluteThresholds {
  kind: "absolute";
  hoerenLesen: number;
  schreiben: number;
  sprechen: number;
  werte: number | null; // null = not required for this level
}

interface PercentThresholds {
  kind: "percent";
  // share of max points (0..1) needed per module
  percent: number;
  werteRequired: false;
}

type Thresholds = AbsoluteThresholds | PercentThresholds;

export const LEVEL_THRESHOLDS: Record<ExamLevel, Thresholds> = {
  A1: { kind: "absolute", hoerenLesen: 25, schreiben: 10, sprechen: 20, werte: 25 },
  A2: { kind: "absolute", hoerenLesen: 25, schreiben: 10, sprechen: 15, werte: 25 },
  B1: { kind: "absolute", hoerenLesen: 33, schreiben: 15, sprechen: 75, werte: 25 },
  B2: { kind: "percent", percent: 0.6, werteRequired: false },
  C1: { kind: "percent", percent: 0.6, werteRequired: false },
  C2: { kind: "percent", percent: 0.6, werteRequired: false },
};

/**
 * Approximate min/max points per module per level, used for autofill suggestions
 * in the admin form. For B2/C1/C2 we assume a 100-point scale (60% pass).
 * `werte: null` means "module not part of this exam level".
 */
export interface ModuleRange { min: number; max: number }
export interface LevelRanges {
  hoerenLesen: ModuleRange;
  schreiben: ModuleRange;
  sprechen: ModuleRange;
  werte: ModuleRange | null;
}

export const LEVEL_RANGES: Record<ExamLevel, LevelRanges> = {
  A1: {
    hoerenLesen: { min: 25, max: 45 },
    schreiben:   { min: 10, max: 20 },
    sprechen:    { min: 20, max: 50 },
    werte:       { min: 25, max: 45 },
  },
  A2: {
    hoerenLesen: { min: 25, max: 50 },
    schreiben:   { min: 10, max: 20 },
    sprechen:    { min: 15, max: 30 },
    werte:       { min: 25, max: 45 },
  },
  B1: {
    hoerenLesen: { min: 33, max: 45 },
    schreiben:   { min: 15, max: 20 },
    sprechen:    { min: 75, max: 100 },
    werte:       { min: 25, max: 45 },
  },
  B2: {
    hoerenLesen: { min: 60, max: 100 },
    schreiben:   { min: 60, max: 100 },
    sprechen:    { min: 60, max: 100 },
    werte:       { min: 27, max: 40 },
  },
  C1: {
    hoerenLesen: { min: 60, max: 100 },
    schreiben:   { min: 60, max: 100 },
    sprechen:    { min: 60, max: 100 },
    werte:       null,
  },
  C2: {
    hoerenLesen: { min: 60, max: 100 },
    schreiben:   { min: 60, max: 100 },
    sprechen:    { min: 60, max: 100 },
    werte:       null,
  },
};

/**
 * Returns a "comfortably middle" value between min and max for autofill.
 * Lands near the midpoint with a small jitter (±10% of the span) so values
 * aren't identical across certificates, but never returns min or max.
 */
function midRange({ min, max }: ModuleRange): number {
  const span = max - min;
  const jitter = (Math.random() - 0.5) * span * 0.2; // ±10% of span
  const value = (min + max) / 2 + jitter;
  // Clamp safely inside (min, max) and round to integer.
  const clamped = Math.min(max - 1, Math.max(min + 1, Math.round(value)));
  return clamped;
}

export interface AutofillPoints {
  points_hoeren_lesen: string;
  points_schreiben: string;
  points_sprechen: string;
  points_werte: string;
}

/** Mid-range autofill values per module for the given level. */
export function autofillPointsForLevel(level: string | null | undefined): AutofillPoints {
  const lvl = normalizeLevel(level);
  if (!lvl) {
    return { points_hoeren_lesen: "", points_schreiben: "", points_sprechen: "", points_werte: "" };
  }
  const r = LEVEL_RANGES[lvl];
  return {
    points_hoeren_lesen: String(midRange(r.hoerenLesen)),
    points_schreiben:    String(midRange(r.schreiben)),
    points_sprechen:     String(midRange(r.sprechen)),
    points_werte:        r.werte ? String(midRange(r.werte)) : "",
  };
}

function normalizeLevel(level: string | null | undefined): ExamLevel | null {
  if (!level) return null;
  const up = level.toUpperCase().trim();
  if (up === "A1" || up === "A2" || up === "B1" || up === "B2" || up === "C1" || up === "C2") {
    return up;
  }
  return null;
}

function toNum(v: number | null | undefined): number | null {
  if (v === null || v === undefined || v === ("" as unknown)) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

export interface PassEvaluation {
  passed: boolean;
  level: ExamLevel | null;
  failedModules: Array<"hoerenLesen" | "schreiben" | "sprechen" | "werte">;
  // Indicates we couldn't decide (e.g. missing points or unknown level).
  inconclusive: boolean;
}

/**
 * Computes pass/fail strictly from module points + level using ÖIF thresholds.
 * Returns `inconclusive: true` when level is unknown or required points are missing.
 */
export function evaluatePass(
  level: string | null | undefined,
  points: ModulePoints,
): PassEvaluation {
  const lvl = normalizeLevel(level);
  const hL = toNum(points.pointsHoerenLesen);
  const sch = toNum(points.pointsSchreiben);
  const spr = toNum(points.pointsSprechen);
  const wer = toNum(points.pointsWerte);

  if (!lvl) return { passed: false, level: null, failedModules: [], inconclusive: true };

  const t = LEVEL_THRESHOLDS[lvl];
  const failed: PassEvaluation["failedModules"] = [];

  if (t.kind === "absolute") {
    if (hL === null || sch === null || spr === null || (t.werte !== null && wer === null)) {
      return { passed: false, level: lvl, failedModules: [], inconclusive: true };
    }
    if (hL < t.hoerenLesen) failed.push("hoerenLesen");
    if (sch < t.schreiben) failed.push("schreiben");
    if (spr < t.sprechen) failed.push("sprechen");
    if (t.werte !== null && wer !== null && wer < t.werte) failed.push("werte");
  } else {
    // For B2/C1/C2 we don't have a stored max; we can't reliably decide pass
    // from raw points alone. Treat as inconclusive unless all three language
    // modules are present AND >= percent * 100 (assuming a 100-point scale).
    if (hL === null || sch === null || spr === null) {
      return { passed: false, level: lvl, failedModules: [], inconclusive: true };
    }
    const threshold = t.percent * 100;
    if (hL < threshold) failed.push("hoerenLesen");
    if (sch < threshold) failed.push("schreiben");
    if (spr < threshold) failed.push("sprechen");
  }

  return { passed: failed.length === 0, level: lvl, failedModules: failed, inconclusive: false };
}
