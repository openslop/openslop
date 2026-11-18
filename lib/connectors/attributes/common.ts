import { z } from "zod";
import { Freeze, Image, Monitor, Motion, Repeat } from "@/components/ui/icon";
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
import type { AttributeDef } from "./schema";

/** A slider over evenly spaced numeric options, which stay the only values it accepts. */
const rangeEdit = (options: readonly string[]) => {
	const values = options.map(Number);
	return {
		kind: "range" as const,
		value: z.enum(options),
		min: Math.min(...values),
		max: Math.max(...values),
		step: values[1] - values[0],
	};
};

const volumeRange = rangeEdit(VOLUME_OPTIONS);

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
	edit: volumeRange,
	default: defaultValue,
});

export const motionDef: AttributeDef = {
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", value: z.enum(MOTION_EFFECTS), icon: Motion },
	default: DEFAULT_MOTION,
};

export const durationDef: AttributeDef = {
	key: "duration",
	label: "Duration",
	unit: "s",
	edit: rangeEdit(DURATION_OPTIONS),
	default: DEFAULT_DURATION,
};

export const loopsDef: AttributeDef = {
	key: "loops",
	label: "Loops",
	edit: rangeEdit(LOOPS_OPTIONS),
	default: DEFAULT_LOOPS,
};

export const resolutionDef = (
	options: readonly [MediaResolution, ...MediaResolution[]],
): AttributeDef => ({
	key: "resolution",
	label: "Resolution",
	edit: { kind: "enum", value: z.enum(options), icon: Monitor },
	default: options[0],
	perModel: true,
});

export const formatDef: AttributeDef = {
	key: "format",
	label: "Image format",
	edit: { kind: "enum", value: z.enum(IMAGE_FORMATS), icon: Image },
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

export const trimEndDef: AttributeDef = {
	key: "trimEnd",
	label: "Trim end",
	unit: "s",
	edit: { kind: "seconds", value: secondsValue, min: 0 },
};
