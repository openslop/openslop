import { Element, Node, type Descendant, type Editor, type Path } from "slate";
import {
	type CanvasContentElement,
	type SceneElement,
	SCENE_TYPE,
} from "./types";

export const isSceneElement = (n: unknown): n is SceneElement =>
	Element.isElement(n) && n.type === SCENE_TYPE;

/** The scene holding the node at `path`. `withScenes` guarantees content has one. */
export function parentSceneId(editor: Editor, path: Path): string {
	const parent = Node.parent(editor, path);
	if (!isSceneElement(parent))
		throw new Error(`Node at [${path}] is not inside a scene`);
	return parent.id;
}

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
