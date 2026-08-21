import {
	DEFAULT_DURATION,
	DURATION_OPTIONS,
	type CanvasContentElement,
} from "@/lib/canvas/types";
import { clamp } from "@/lib/utils";
import { DEFAULT_MOTION, isMotionEffect } from "./motionEffects";
import type { MotionEffect } from "./motionEffectNames";

/** Raw attribute keys that, when changed, require a layout recompute but are omitted from generation inputs */
export const LAYOUT_ATTRIBUTE_KEYS = ["loops", "volume", "motion"] as const;

const VOLUME_MIN = 0;
const VOLUME_MAX = 10;
const DEFAULT_VOLUME = VOLUME_MAX;

/** Converts the 0–10 authoring scale to the 0–1 gain players expect. */
export function volumeToGain(volume: number): number {
	return volume / VOLUME_MAX;
}

// A blank attribute is an unset one, the way `getMotion` reads it. Coercing the
// raw string would make `Number("")` a deliberate 0, muting the element.
function numericAttribute(
	element: CanvasContentElement,
	key: string,
): number | undefined {
	const raw = element.customAttributes?.[key]?.trim();
	if (!raw) return undefined;
	const value = Number(raw);
	return Number.isFinite(value) ? value : undefined;
}

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	const volume = numericAttribute(element, "volume");
	return volume === undefined
		? DEFAULT_VOLUME
		: clamp(volume, VOLUME_MIN, VOLUME_MAX);
}

const DURATIONS = DURATION_OPTIONS.map(Number);
const DURATION_MIN = Math.min(...DURATIONS);
const DURATION_MAX = Math.max(...DURATIONS);

/** Seconds a timed visual is generated to run for, clamped to the offered options. */
export function getDuration(element: CanvasContentElement): number {
	const duration = numericAttribute(element, "duration");
	return duration === undefined
		? Number(DEFAULT_DURATION)
		: clamp(duration, DURATION_MIN, DURATION_MAX);
}

const LOOPS_MAX = 1000;
const DEFAULT_LOOPS = 1;

/** Loop count coerced to an integer in [1, 1000], defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	const loops = numericAttribute(element, "loops");
	return loops === undefined
		? DEFAULT_LOOPS
		: clamp(Math.floor(loops), DEFAULT_LOOPS, LOOPS_MAX);
}

/** Motion effect validated against the known set, defaulting to "none". */
export function getMotion(element: CanvasContentElement): MotionEffect {
	const raw = element.customAttributes?.motion;
	return isMotionEffect(raw) ? raw : DEFAULT_MOTION;
}

/**
 * Stable signature over the raw layout-affecting attribute values, in
 * `LAYOUT_ATTRIBUTE_KEYS` order. Used to build the layout memo key.
 */
export function layoutAttributeSignature(
	element: CanvasContentElement,
): string {
	return LAYOUT_ATTRIBUTE_KEYS.map(
		(key) => element.customAttributes?.[key] ?? "",
	).join(":");
}
