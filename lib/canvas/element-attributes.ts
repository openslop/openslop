import omit from "lodash/omit";
import pick from "lodash/pick";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	DURATION_OPTIONS,
	LOOPS_OPTIONS,
	VOLUME_OPTIONS,
	isToggleOn,
	type ContentElement,
	type SplitAttributes,
} from "./types";
import { clamp } from "@/lib/utils";
import {
	DEFAULT_MOTION,
	isMotionEffect,
	type MotionEffect,
} from "../render/motion-effect-names";
import { MIN_DURATION_SEC } from "../render/scene-builder";

/** Raw attribute keys omitted from generation inputs: layout knobs, and what the card remembers for the user. */
export const LAYOUT_ATTRIBUTE_KEYS = [
	"loops",
	"loop",
	"volume",
	"motion",
	"uploadedFrame",
	"trimStart",
	"timelineDuration",
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

const parseNumber = (raw: string | undefined): number | undefined => {
	const text = raw?.trim();
	const value = text ? Number(text) : NaN;
	return Number.isFinite(value) ? value : undefined;
};

type Bounds = { min: number; max?: number };

export function clampedNumber(
	raw: string | undefined,
	bounds: Bounds & { fallback: number },
): number;
export function clampedNumber(
	raw: string | undefined,
	bounds: Bounds,
): number | undefined;
export function clampedNumber(
	raw: string | undefined,
	{ min, max = Infinity, fallback }: Bounds & { fallback?: number },
): number | undefined {
	const value = parseNumber(raw);
	return value === undefined ? fallback : clamp(value, min, max);
}

export function getVolume(element: ContentElement): number {
	return clampedNumber(element.layoutAttributes?.volume, {
		...VOLUME,
		fallback: DEFAULT_VOLUME,
	});
}

export function getDuration(element: ContentElement): number {
	return clampedNumber(element.generationAttributes?.duration, {
		...DURATION,
		fallback: Number(DEFAULT_DURATION),
	});
}

export function getLoops(element: ContentElement): number {
	return clampedNumber(element.layoutAttributes?.loops, {
		...LOOPS,
		fallback: Number(DEFAULT_LOOPS),
	});
}

export const getLoop = (element: ContentElement): boolean =>
	isToggleOn(element.layoutAttributes?.loop);

export const getTrimStart = (element: ContentElement): number =>
	clampedNumber(element.layoutAttributes?.trimStart, { min: 0, fallback: 0 });

export const getTimelineDuration = (
	element: ContentElement,
): number | undefined =>
	clampedNumber(element.layoutAttributes?.timelineDuration, {
		min: MIN_DURATION_SEC,
	});

export function getMotion(element: ContentElement): MotionEffect {
	const raw = element.layoutAttributes?.motion;
	return isMotionEffect(raw) ? raw : DEFAULT_MOTION;
}

export function layoutAttributeSignature(element: ContentElement): string {
	return LAYOUT_ATTRIBUTE_KEYS.map(
		(key) => element.layoutAttributes?.[key] ?? "",
	).join(":");
}
