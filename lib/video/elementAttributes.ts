import omit from "lodash/omit";
import pick from "lodash/pick";
import {
	DEFAULT_DURATION,
	DURATION_MAX,
	DURATION_MIN,
	type CanvasContentElement,
	type SplitAttributes,
} from "@/lib/canvas/types";
import { clamp } from "@/lib/utils";
import {
	DEFAULT_MOTION,
	isMotionEffect,
	type MotionEffect,
} from "./motionEffectNames";

/** Raw attribute keys that, when changed, require a layout recompute but are omitted from generation inputs */
export const LAYOUT_ATTRIBUTE_KEYS = ["loops", "volume", "motion"] as const;

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
	const raw = flatAttributes(element)[key]?.trim();
	if (!raw) return fallback;
	const value = Number(raw);
	return Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

export function getVolume(element: CanvasContentElement): number {
	return clampedAttribute(element, "volume", {
		min: VOLUME_MIN,
		max: VOLUME_MAX,
		fallback: DEFAULT_VOLUME,
	});
}

export function getDuration(element: CanvasContentElement): number {
	return clampedAttribute(element, "duration", {
		min: DURATION_MIN,
		max: DURATION_MAX,
		fallback: Number(DEFAULT_DURATION),
	});
}

const LOOPS_MAX = 1000;
const DEFAULT_LOOPS = 1;

export function getLoops(element: CanvasContentElement): number {
	return clampedAttribute(element, "loops", {
		min: DEFAULT_LOOPS,
		max: LOOPS_MAX,
		fallback: DEFAULT_LOOPS,
	});
}

export function getMotion(element: CanvasContentElement): MotionEffect {
	const raw = element.layoutAttributes?.motion;
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
		(key) => element.layoutAttributes?.[key] ?? "",
	).join(":");
}
