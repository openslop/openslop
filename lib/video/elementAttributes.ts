import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	DEFAULT_MOTION,
	isMotionEffect,
	type MotionEffect,
} from "./motionEffects";

/** Raw attribute keys that, when changed, require a layout recompute. */
export const LAYOUT_ATTRIBUTE_KEYS = [
	"loops",
	"volume",
	"motion",
	"captions",
] as const;

const VOLUME_MIN = 0;
const VOLUME_MAX = 10;
const DEFAULT_VOLUME = VOLUME_MAX;

function parseNumericAttribute(value: string | undefined): number {
	return value === undefined || value.trim() === "" ? NaN : Number(value);
}

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	const raw = parseNumericAttribute(element.customAttributes?.volume);
	return Number.isFinite(raw)
		? Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, raw))
		: DEFAULT_VOLUME;
}

const LOOPS_MAX = 1000;

/** Loop count coerced to an integer in [1, 1000], defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	const raw = parseNumericAttribute(element.customAttributes?.loops);
	if (!Number.isFinite(raw)) return 1;
	return Math.max(1, Math.min(LOOPS_MAX, Math.floor(raw)));
}

/** Motion effect validated against the known set, defaulting to "none". */
export function getMotion(element: CanvasContentElement): MotionEffect {
	const raw = element.customAttributes?.motion;
	return isMotionEffect(raw) ? raw : DEFAULT_MOTION;
}

export function areCaptionsEnabled(element: CanvasContentElement): boolean {
	return element.customAttributes?.captions !== "off";
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
