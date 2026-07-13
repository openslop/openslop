import type { Descendant } from "slate";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import type { TransitionType } from "./transitions";
import { layoutAttributeSignature } from "./elementAttributes";

const elementSignature = (el: CanvasContentElement) =>
	`${el.id}:${el.type}:${layoutAttributeSignature(el)}`;

/**
 * Stable key over every element field that resolveElements/buildVideoLayout
 * actually read, plus the scene grouping and project-wide layout-affecting
 * settings. Scene membership belongs in the key because consumers derive scene
 * segments alongside the layout, and moving an element between scenes can leave
 * the flat element order untouched. The set of layout-affecting attributes
 * lives in `LAYOUT_ATTRIBUTE_KEYS` so this key and the resolver stay in
 * lockstep — add new attributes there, not here.
 */
export function getLayoutKey(
	nodes: Descendant[],
	transitionType: TransitionType,
): string {
	const scenesKey = nodes
		.filter(isSceneElement)
		.map(
			(scene) =>
				`${scene.id}[${scene.children.map(elementSignature).join("|")}]`,
		)
		.join("|");
	return `${transitionType}|${scenesKey}`;
}
