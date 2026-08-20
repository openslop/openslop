import type { Descendant } from "slate";
import { isSceneElement } from "@/lib/canvas/scenes";
import type { TransitionType } from "./transitions";
import { layoutAttributeSignature } from "./elementAttributes";

/**
 * Stable key over every element field that resolveElements/buildVideoLayout
 * actually read, plus project-wide layout-affecting settings. The set of
 * layout-affecting attributes lives in `LAYOUT_ATTRIBUTE_KEYS` so this key and
 * the resolver stay in lockstep — add new attributes there, not here.
 */
export function getLayoutKey(
	nodes: Descendant[],
	transitionType: TransitionType,
): string {
	const elementsKey = nodes
		.filter(isSceneElement)
		.flatMap((scene) =>
			scene.children.map(
				(el) =>
					`${scene.id}:${el.id}:${el.type}:${layoutAttributeSignature(el)}`,
			),
		)
		.join("|");
	return `${transitionType}|${elementsKey}`;
}
