import memoizeOne from "memoize-one";
import { Element, Node, type Descendant, type Editor, type Path } from "slate";
import { withoutCaretMarker } from "./constants";
import { isForeground } from "./guards";
import {
	type ContentElement,
	type CanvasElement,
	type Scene,
	SCENE_TYPE,
} from "./types";

export const isScene = (node: unknown): node is Scene =>
	Element.isElement(node) && node.type === SCENE_TYPE;

/** The scene holding the node at `path`. `withScenes` guarantees content has one. */
export function parentSceneId(editor: Editor, path: Path): string {
	const parent = Node.parent(editor, path);
	if (!isScene(parent))
		throw new Error(`Node at [${path}] is not inside a scene`);
	return parent.id;
}

export const getContentElements = (nodes: Descendant[]): ContentElement[] =>
	nodes.flatMap((node) => (isScene(node) ? node.children : []));

/**
 * Empty means nothing authored, not zero elements: normalization keeps one
 * placeholder element on an otherwise blank canvas.
 */
export const isScriptEmpty = (nodes: Descendant[]): boolean =>
	getContentElements(nodes).every(
		(element) => withoutCaretMarker(Node.string(element)).trim() === "",
	);

export function previousVisual(
	elements: CanvasElement[],
	id: string,
): ContentElement | undefined {
	const at = elements.findIndex((element) => element.id === id);
	return at < 0 ? undefined : elements.slice(0, at).findLast(isForeground);
}

// Every scene reads its number on every edit; number the document once, not once per scene.
const numberScenes = memoizeOne(
	(nodes: Descendant[]) =>
		new Map(nodes.filter(isScene).map((scene, index) => [scene.id, index + 1])),
);

export function sceneIndexOf(nodes: Descendant[], sceneId: string): number {
	return numberScenes(nodes).get(sceneId) ?? 0;
}
