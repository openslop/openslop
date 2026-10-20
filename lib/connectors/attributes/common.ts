import { Freeze, Repeat } from "@/components/ui/icon";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	DURATION_OPTIONS,
	LOOPS_OPTIONS,
	TOGGLE_ON,
	VOLUME_OPTIONS,
} from "@/lib/canvas/types";
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from "../image/enums";
import type { VideoResolution } from "@/lib/project/aspect-ratio";
import {
	DEFAULT_MOTION,
	MOTION_EFFECTS,
} from "@/lib/render/motion-effect-names";
import { MIN_DURATION_SEC } from "@/lib/render/scene-builder";
import type { AttributeDef } from "./schema";

/** Attribute leaves shared across multiple connector types. */
export const volumeDef = (defaultValue: string): AttributeDef => ({
	key: "volume",
	label: "Volume",
	edit: { kind: "enum", options: VOLUME_OPTIONS },
	default: defaultValue,
});

export const motionDef: AttributeDef = {
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", options: MOTION_EFFECTS },
	default: DEFAULT_MOTION,
};

export const durationDef: AttributeDef = {
	key: "duration",
	label: "Duration",
	unit: "s",
	edit: { kind: "enum", options: DURATION_OPTIONS },
	default: DEFAULT_DURATION,
};

export const loopsDef: AttributeDef = {
	key: "loops",
	label: "Loops",
	edit: { kind: "enum", options: LOOPS_OPTIONS },
	default: DEFAULT_LOOPS,
};

export const resolutionDef = (
	options: readonly [VideoResolution, ...VideoResolution[]],
): AttributeDef => ({
	key: "resolution",
	label: "Resolution",
	edit: { kind: "enum", options },
	default: options[0],
});

export const formatDef: AttributeDef = {
	key: "format",
	label: "Image format",
	edit: { kind: "enum", options: IMAGE_FORMATS },
	default: DEFAULT_IMAGE_FORMAT,
};

export const LOOP_FACES = {
	off: { icon: Freeze, label: "Freeze on last frame" },
	on: { icon: Repeat, label: "Loop" },
} as const;

export const loopDef: AttributeDef = {
	key: "loop",
	label: "Loop",
	edit: { kind: "toggle", ...LOOP_FACES },
	default: TOGGLE_ON,
};

export const trimStartDef: AttributeDef = {
	key: "trimStart",
	label: "Trim start",
	unit: "s",
	edit: { kind: "seconds", min: 0 },
};

export const timelineDurationDef: AttributeDef = {
	key: "timelineDuration",
	label: "Timeline duration",
	unit: "s",
	edit: { kind: "seconds", min: MIN_DURATION_SEC },
};
