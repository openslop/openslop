/**
 * Which panels the rail offers, in the order it draws them. The loading skeleton
 * counts rail items from here, so a new panel cannot leave it a slot short.
 */
export const RAIL_PANEL_KEYS = [
	"layout",
	"captions",
	"properties",
	"history",
] as const;

/** Panels held apart at the foot of the rail. */
export const PINNED_PANEL_KEYS = ["sloppy"] as const;

export type PanelKey =
	| (typeof RAIL_PANEL_KEYS)[number]
	| (typeof PINNED_PANEL_KEYS)[number];
