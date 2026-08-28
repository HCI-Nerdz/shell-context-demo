export type ContextKind = "enum" | "string" | "path" | "secret";

export interface ContextToken {
  id: string;
  label: string;
  value: string;
  zone: "app" | "host";
  kind?: ContextKind;
}

export type ThemeId = "default" | "high-contrast";

/** Spatial layout: context vs input. */
export type LineMode = "1-line" | "2-line";

/**
 * Gutter arrow lifetime (top-bar setting — not hard-coded).
 * ephemeral: reticle while editing; never in history/copy
 * persist: keep on committed rows; present in copy
 */
export type ArrowMode = "ephemeral" | "persist";

export interface HistoryEntry {
  tokens: ContextToken[];
  command: string;
  /** Whether this committed row shows gutter arrow (persist mode). */
  showArrow: boolean;
}

export interface PasteBlock {
  lines: string[];
  visibleStart: number;
}

/** Simulation only — real shell negotiates with host. */
export type ChromePlacement = "host" | "overlay";
