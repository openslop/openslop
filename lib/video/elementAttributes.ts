import type { CanvasContentElement } from "@/lib/canvas/types";
import { clamp } from "@/lib/utils";
import {
	DEFAULT_MOTION,
	isMotionEffect,
	type MotionEffect,
} from "./motionEffects";

/** Raw attribute keys that, when changed, require a layout recompute but are omitted from generation inputs */
export const LAYOUT_ATTRIBUTE_KEYS = [
	"loops",
	"volume",
	"motion",
	"captions",
] as const;

const VOLUME_MIN = 0;
const VOLUME_MAX = 10;
const DEFAULT_VOLUME = VOLUME_MAX;

function parseFiniteNumber(value: string | undefined): number | undefined {
	if (value == null || value.trim() === "") return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	const raw = parseFiniteNumber(element.customAttributes?.volume);
	return raw == null ? DEFAULT_VOLUME : clamp(raw, VOLUME_MIN, VOLUME_MAX);
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
