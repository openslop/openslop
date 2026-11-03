import { z } from "zod";
import { Freeze, Repeat } from "@/components/ui/icon";
import { parseNumber } from "@/lib/canvas/element-attributes";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	DURATION_OPTIONS,
	LOOPS_OPTIONS,
	TOGGLE_OFF,
	TOGGLE_ON,
	VOLUME_OPTIONS,
} from "@/lib/canvas/types";
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from "../image/enums";
import type { MediaResolution } from "@/lib/project/aspect-ratio";
import {
	DEFAULT_MOTION,
	MOTION_EFFECTS,
} from "@/lib/render/motion-effect-names";
import { MIN_DURATION_SEC } from "@/lib/render/scene-builder";
import type { AttributeDef } from "./schema";

const volumeValue = z.enum(VOLUME_OPTIONS);

export const toggleValue = z.enum([TOGGLE_OFF, TOGGLE_ON]);

const secondsValue = z
	.string()
	.refine((value) => parseNumber(value) !== undefined);

export const nameDef: AttributeDef = {
	key: "name",
	label: "Name",
	edit: { kind: "text" },
	hidden: true,
};

export const OWN_MODEL_DEFS: readonly AttributeDef[] = [
	{ key: "provider", label: "Provider" },
	{ key: "model", label: "Model" },
];

export const volumeDef = (defaultValue: string): AttributeDef => ({
	key: "volume",
	label: "Volume",
	edit: { kind: "enum", value: volumeValue },
	default: defaultValue,
});

export const motionDef: AttributeDef = {
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", value: z.enum(MOTION_EFFECTS) },
	default: DEFAULT_MOTION,
};

export const durationDef: AttributeDef = {
	key: "duration",
	label: "Duration",
	unit: "s",
	edit: { kind: "enum", value: z.enum(DURATION_OPTIONS) },
	default: DEFAULT_DURATION,
};

export const loopsDef: AttributeDef = {
	key: "loops",
	label: "Loops",
	edit: { kind: "enum", value: z.enum(LOOPS_OPTIONS) },
	default: DEFAULT_LOOPS,
};

export const resolutionDef = (
	options: readonly [MediaResolution, ...MediaResolution[]],
): AttributeDef => ({
	key: "resolution",
	label: "Resolution",
	edit: { kind: "enum", value: z.enum(options) },
	default: options[0],
	perModel: true,
});

export const formatDef: AttributeDef = {
	key: "format",
	label: "Image format",
	edit: { kind: "enum", value: z.enum(IMAGE_FORMATS) },
	default: DEFAULT_IMAGE_FORMAT,
};

export const LOOP_FACES = {
	off: { icon: Freeze, label: "Freeze on last frame" },
	on: { icon: Repeat, label: "Loop" },
} as const;

export const loopDef: AttributeDef = {
	key: "loop",
	label: "Loop",
	edit: { kind: "toggle", value: toggleValue, ...LOOP_FACES },
	default: TOGGLE_ON,
};

export const trimStartDef: AttributeDef = {
	key: "trimStart",
	label: "Trim start",
	unit: "s",
	edit: { kind: "seconds", value: secondsValue, min: 0 },
};

export const timelineDurationDef: AttributeDef = {
	key: "timelineDuration",
	label: "Timeline duration",
	unit: "s",
	edit: { kind: "seconds", value: secondsValue, min: MIN_DURATION_SEC },
};
