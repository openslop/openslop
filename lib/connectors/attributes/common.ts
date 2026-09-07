import { Freeze, Repeat } from "@/components/ui/icon";
import { DURATION_OPTIONS } from "@/lib/canvas/types";
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from "../image/enums";
import {
	DEFAULT_VIDEO_RESOLUTION,
	type VideoResolution,
} from "@/lib/video/aspectRatio";
import { MOTION_EFFECTS } from "@/lib/video/motionEffectNames";
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
