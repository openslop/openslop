/** The rail's panels in draw order; the loading skeleton reads it too. */
export const RAIL_PANEL_GROUPS = [
	["assets", "captions"],
	["layout", "properties"],
	["models"],
	["history", "project"],
] as const;

/** Panels held apart at the foot of the rail. */
export const PINNED_PANEL_KEYS = ["sloppy"] as const;

export type PanelKey =
	| (typeof RAIL_PANEL_GROUPS)[number][number]
	| (typeof PINNED_PANEL_KEYS)[number];
