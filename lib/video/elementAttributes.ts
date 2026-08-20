import type { CanvasContentElement } from "@/lib/canvas/types";
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

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	const raw = Number(element.customAttributes?.volume);
	return Number.isFinite(raw)
		? clamp(raw, VOLUME_MIN, VOLUME_MAX)
		: DEFAULT_VOLUME;
}

const LOOPS_MAX = 1000;

/** Loop count coerced to an integer in [1, 1000], defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	const raw = Number(element.customAttributes?.loops);
	if (!Number.isFinite(raw)) return 1;
	return clamp(Math.floor(raw), 1, LOOPS_MAX);
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
