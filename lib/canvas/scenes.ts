import memoizeOne from "memoize-one";
import { Element, Node, type Descendant, type Editor, type Path } from "slate";
import { withoutCaretMarker } from "./constants";
import { isForeground } from "./guards";
import {
	type CanvasContentElement,
	type ScriptElement,
	type SceneElement,
	SCENE_TYPE,
} from "./types";

export const isSceneElement = (node: unknown): node is SceneElement =>
	Element.isElement(node) && node.type === SCENE_TYPE;

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

export function previousVisual(
	elements: ScriptElement[],
	id: string,
): CanvasContentElement | undefined {
	const at = elements.findIndex((element) => element.id === id);
	return at < 0 ? undefined : elements.slice(0, at).findLast(isForeground);
}

// Every scene reads its number on every edit; number the document once, not once per scene.
const numberScenes = memoizeOne(
	(nodes: Descendant[]) =>
		new Map(
			nodes.filter(isSceneElement).map((scene, index) => [scene.id, index + 1]),
		),
);

export function sceneIndexOf(nodes: Descendant[], sceneId: string): number {
	return numberScenes(nodes).get(sceneId) ?? 0;
}
