import type { CanvasContentElement } from "@/lib/canvas/types";
import type { TransitionType } from "./transitions";
import { layoutAttributeSignature } from "./elementAttributes";

/**
 * Stable key over every element field that resolveElements/buildVideoLayout
 * actually read, plus project-wide layout-affecting settings. The set of
 * layout-affecting attributes lives in `LAYOUT_ATTRIBUTE_KEYS` so this key and
 * the resolver stay in lockstep — add new attributes there, not here.
 */
export function getLayoutKey(
	elements: CanvasContentElement[],
	transitionType: TransitionType,
): string {
	const elementsKey = elements
		.map((el) => `${el.id}:${el.type}:${layoutAttributeSignature(el)}`)
		.join("|");
	return `${transitionType}|${elementsKey}`;
}
