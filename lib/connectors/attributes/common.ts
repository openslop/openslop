import { DURATION_OPTIONS } from "@/lib/canvas/types";
import { MOTION_EFFECTS } from "@/lib/video/motionEffects";
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
