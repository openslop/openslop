import type { Descendant } from "slate";
import { isScene } from "@/lib/canvas/scenes";
import type { TransitionType } from "./transitions";
import { layoutAttributeSignature } from "../canvas/element-attributes";

/** Add new layout attributes to `LAYOUT_ATTRIBUTE_KEYS`, not here. Text is left out, so a clip's label catches up with its prompt on the next layout change. */
export function getLayoutKey(
	nodes: Descendant[],
	transitionType: TransitionType,
): string {
	const elementsKey = nodes
		.filter(isScene)
		.flatMap((scene) =>
			scene.children.map(
				(element) =>
					`${scene.id}:${element.id}:${element.type}:${layoutAttributeSignature(element)}`,
			),
		)
		.join("|");
	return `${transitionType}|${elementsKey}`;
}
