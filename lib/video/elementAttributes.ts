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

/**
 * A blank attribute means "unset", not zero — `Number("")` is a finite 0, which
 * would silently mute audio or read as a zero loop count.
 */
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
	const raw = numericAttribute(element, "volume");
	return raw === undefined
		? DEFAULT_VOLUME
		: clamp(raw, VOLUME_MIN, VOLUME_MAX);
}

const LOOPS_MAX = 1000;

/** Loop count coerced to an integer in [1, 1000], defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	const raw = numericAttribute(element, "loops");
	return raw === undefined ? 1 : clamp(Math.floor(raw), 1, LOOPS_MAX);
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
