import { Element, type Descendant } from "slate";
import {
	type CanvasContentElement,
	type SceneElement,
	SCENE_TYPE,
} from "./types";

export const isSceneElement = (n: unknown): n is SceneElement =>
	Element.isElement(n) && n.type === SCENE_TYPE;

export const getContentElements = (
	nodes: Descendant[],
): CanvasContentElement[] =>
	nodes.flatMap((node) => (isSceneElement(node) ? node.children : []));

export function sceneIndexOf(nodes: Descendant[], sceneId: string): number {
	let count = 0;
	for (const node of nodes) {
		if (!isSceneElement(node)) continue;
		count += 1;
		if (node.id === sceneId) return count;
	}
	return 0;
}
