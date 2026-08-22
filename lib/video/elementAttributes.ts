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

function clampedAttribute(
	element: CanvasContentElement,
	key: string,
	{ min, max, fallback }: { min: number; max: number; fallback: number },
): number {
	const raw = element.customAttributes?.[key]?.trim();
	if (!raw) return fallback;
	const value = Number(raw);
	return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	return clampedAttribute(element, "volume", {
		min: VOLUME_MIN,
		max: VOLUME_MAX,
		fallback: DEFAULT_VOLUME,
	});
}

const DURATIONS = DURATION_OPTIONS.map(Number);
const DURATION_MIN = Math.min(...DURATIONS);
const DURATION_MAX = Math.max(...DURATIONS);

/** Seconds a timed visual is generated to run for, clamped to the offered options. */
export function getDuration(element: CanvasContentElement): number {
	return clampedAttribute(element, "duration", {
		min: DURATION_MIN,
		max: DURATION_MAX,
		fallback: Number(DEFAULT_DURATION),
	});
}

const LOOPS_MAX = 1000;
const DEFAULT_LOOPS = 1;

/** Loop count clamped to [1, 1000], defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	return clampedAttribute(element, "loops", {
		min: DEFAULT_LOOPS,
		max: LOOPS_MAX,
		fallback: DEFAULT_LOOPS,
	});
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
