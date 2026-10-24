import type { LayerType } from "@/lib/canvas/types";

/** The player's resting geometry, plain so the route's loading skeleton can draw it too. */
export const DOCK_DEFAULT_HEIGHT = 260;
export const SIDE_PLAYER_DEFAULT_WIDTH = 560;
export const GUTTER_PX = 40;
export const RULER_HEIGHT = "h-7";
export const RULER_LABEL = "font-numeric text-label-xs text-muted-foreground";
export const RULER_LABEL_OFFSET = "top-3.5 -translate-y-1/2";
export const LANE_HEIGHT: Record<LayerType | "captions", string> = {
	visual: "h-20",
	audio: "h-16",
	captions: "h-7",
};
