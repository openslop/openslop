import type { CanvasContentElement } from "@/lib/canvas/types";

/**
 * Single boundary for reading layout-affecting element `customAttributes`.
 *
 * These values are stored as raw strings on the element but consumed as typed,
 * clamped numbers by `resolveElements`, while `getLayoutKey` must include the
 * same fields so memoized layouts invalidate when they change. Keeping both the
 * coercion rules and the field list here is the only place to change when a new
 * layout-affecting attribute is added — the resolver and the memo key can no
 * longer drift apart.
 */

/** Raw attribute keys that, when changed, require a layout recompute. */
export const LAYOUT_ATTRIBUTE_KEYS = ["loops", "volume"] as const;

const VOLUME_MIN = 0;
const VOLUME_MAX = 10;
const DEFAULT_VOLUME = VOLUME_MAX;

/** Volume coerced to a finite number clamped to [0, 10], defaulting to 10. */
export function getVolume(element: CanvasContentElement): number {
	const raw = Number(element.customAttributes?.volume);
	return Number.isFinite(raw)
		? Math.max(VOLUME_MIN, Math.min(VOLUME_MAX, raw))
		: DEFAULT_VOLUME;
}

/** Loop count coerced to an integer of at least 1, defaulting to 1. */
export function getLoops(element: CanvasContentElement): number {
	return Math.max(1, Number(element.customAttributes?.loops) || 1);
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
