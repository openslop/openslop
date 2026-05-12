import type { CanvasContentElement } from "@/lib/canvas/types";
import type { TransitionType } from "./transitions";

/**
 * Stable key over every element field that resolveElements/buildVideoLayout
 * actually read, plus project-wide layout-affecting settings. Extend this when
 * adding a new layout-affecting attribute so useVideoLayout's memo invalidates
 * correctly.
 */
export function getLayoutKey(
	elements: CanvasContentElement[],
	transitionType: TransitionType,
): string {
	const elementsKey = elements
		.map(
			(el) =>
				`${el.id}:${el.type}:${el.customAttributes?.loops ?? ""}:${el.customAttributes?.volume ?? ""}`,
		)
		.join("|");
	return `${transitionType}|${elementsKey}`;
}
