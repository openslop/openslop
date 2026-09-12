import { Freeze, FullTimeline, Repeat, Trim } from "@/components/ui/icon";
import { DURATION_OPTIONS } from "@/lib/canvas/types";
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from "../image/enums";
import {
	DEFAULT_VIDEO_RESOLUTION,
	type VideoResolution,
} from "@/lib/project/aspectRatio";
import { MOTION_EFFECTS } from "@/lib/render/motionEffectNames";
import type { AttributeDef } from "./schema";

const VOLUME_OPTIONS = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;
const LOOPS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

/** Attribute leaves shared across multiple connector types; each type supplies its own default. */
export const volumeDef = (defaultValue: string): AttributeDef => ({
	key: "volume",
	label: "Volume",
	edit: { kind: "enum", options: VOLUME_OPTIONS },
	default: defaultValue,
});

export const motionDef = (defaultValue: string): AttributeDef => ({
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", options: MOTION_EFFECTS },
	default: defaultValue,
});

export const durationDef = (defaultValue: string): AttributeDef => ({
	key: "duration",
	label: "Duration",
	unit: "s",
	edit: { kind: "enum", options: DURATION_OPTIONS },
	default: defaultValue,
});

export const loopsDef = (defaultValue: string): AttributeDef => ({
	key: "loops",
	label: "Loops",
	edit: { kind: "enum", options: LOOPS_OPTIONS },
	default: defaultValue,
});

export const resolutionDef = (
	options: readonly VideoResolution[],
): AttributeDef => ({
	key: "resolution",
	label: "Resolution",
	edit: { kind: "enum", options },
	default: DEFAULT_VIDEO_RESOLUTION,
});

export const formatDef: AttributeDef = {
	key: "format",
	label: "Image format",
	edit: { kind: "enum", options: IMAGE_FORMATS },
	default: DEFAULT_IMAGE_FORMAT,
};

export const loopDef: AttributeDef = {
	key: "loop",
	label: "Loop",
	edit: {
		kind: "toggle",
		off: { icon: Freeze, label: "Freeze on last frame" },
		on: { icon: Repeat, label: "Loop" },
	},
	default: "true",
};

/**
 * Trimmed, a visual is on screen for the dialogue that follows it and no
 * longer. Untrimmed, it plays out in full and the dialogue can only extend it.
 * The same faces name the mode wherever it shows, on the card and the timeline.
 */
export const TRIM_TO_DIALOGUE_FACES = {
	on: {
		icon: Trim,
		label: "Trim to dialogue",
		hint: "Trimmed to the dialogue under it",
	},
	off: {
		icon: FullTimeline,
		label: "Play in full",
		hint: "Plays its full length",
	},
} as const;

export const trimToDialogueDef: AttributeDef = {
	key: "trimToDialogue",
	label: "Timing",
	edit: { kind: "toggle", ...TRIM_TO_DIALOGUE_FACES },
	default: "true",
};
