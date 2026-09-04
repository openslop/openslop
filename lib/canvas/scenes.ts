import { Element, Node, type Descendant, type Editor, type Path } from "slate";
import { withoutCaretMarker } from "./constants";
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

/**
 * Empty means nothing authored, not zero elements: normalization keeps one
 * placeholder element on an otherwise blank canvas.
 */
export const isScriptEmpty = (nodes: Descendant[]): boolean =>
	getContentElements(nodes).every(
		(element) => withoutCaretMarker(Node.string(element)).trim() === "",
	);

export function sceneIndexOf(nodes: Descendant[], sceneId: string): number {
	return nodes.filter(isSceneElement).findIndex((n) => n.id === sceneId) + 1;
}
