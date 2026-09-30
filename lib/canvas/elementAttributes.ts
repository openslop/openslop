import omit from "lodash/omit";
import pick from "lodash/pick";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	DURATION_OPTIONS,
	LOOPS_OPTIONS,
	VOLUME_OPTIONS,
	type CanvasContentElement,
	type SplitAttributes,
} from "@/lib/canvas/types";
import { clamp } from "@/lib/utils";
import {
	DEFAULT_MOTION,
	isMotionEffect,
	type MotionEffect,
} from "../render/motionEffectNames";

/** Raw attribute keys omitted from generation inputs: layout knobs, and what the card remembers for the user. */
export const LAYOUT_ATTRIBUTE_KEYS = [
	"loops",
	"loop",
	"volume",
	"motion",
	"trimToDialogue",
	"uploadedFrame",
] as const;

export const splitAttributes = (
	attributes: Record<string, string>,
): SplitAttributes => ({
	generationAttributes: omit(attributes, LAYOUT_ATTRIBUTE_KEYS),
	layoutAttributes: pick(attributes, LAYOUT_ATTRIBUTE_KEYS),
});

export const flatAttributes = (element: SplitAttributes) => ({
	...element.generationAttributes,
	...element.layoutAttributes,
});

const boundsOf = (options: readonly string[]) => {
	const values = options.map(Number);
	return { min: Math.min(...values), max: Math.max(...values) };
};

const VOLUME = boundsOf(VOLUME_OPTIONS);
const LOOPS = boundsOf(LOOPS_OPTIONS);
const DURATION = boundsOf(DURATION_OPTIONS);

const DEFAULT_VOLUME = VOLUME.max;

/** Converts the 0–10 authoring scale to the 0–1 gain players expect. */
export function volumeToGain(volume: number): number {
	return volume / VOLUME.max;
}

function clampedNumber(
	raw: string | undefined,
	{ min, max, fallback }: { min: number; max: number; fallback: number },
): number {
	const text = raw?.trim();
	if (!text) return fallback;
	const value = Number(text);
	return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

export function getVolume(element: CanvasContentElement): number {
	return clampedNumber(element.layoutAttributes?.volume, {
		...VOLUME,
		fallback: DEFAULT_VOLUME,
	});
}

export function getDuration(element: CanvasContentElement): number {
	return clampedNumber(element.generationAttributes?.duration, {
		...DURATION,
		fallback: Number(DEFAULT_DURATION),
	});
}

export function getLoops(element: CanvasContentElement): number {
	return clampedNumber(element.layoutAttributes?.loops, {
		...LOOPS,
		fallback: Number(DEFAULT_LOOPS),
	});
}

export const getLoop = (element: CanvasContentElement): boolean =>
	element.layoutAttributes?.loop === "true";

/** Absent means trimmed: a visual yields to its dialogue unless it says otherwise. */
export const getTrimToDialogue = (element: CanvasContentElement): boolean =>
	element.layoutAttributes?.trimToDialogue !== "false";

export function getMotion(element: CanvasContentElement): MotionEffect {
	const raw = element.layoutAttributes?.motion;
	return isMotionEffect(raw) ? raw : DEFAULT_MOTION;
}

export function layoutAttributeSignature(
	element: CanvasContentElement,
): string {
	return LAYOUT_ATTRIBUTE_KEYS.map(
		(key) => element.layoutAttributes?.[key] ?? "",
	).join(":");
}
