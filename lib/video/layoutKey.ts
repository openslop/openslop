import type { CanvasContentElement } from "@/lib/canvas/types";

/**
 * Stable key over every element field that resolveElements/buildVideoLayout
 * actually read. Extend this when adding a new layout-affecting attribute so
 * useVideoLayout's memo invalidates correctly.
 */
export function getLayoutKey(elements: CanvasContentElement[]): string {
	return elements
		.map((el) => `${el.id}:${el.type}:${el.customAttributes?.loops ?? ""}`)
		.join("|");
}
