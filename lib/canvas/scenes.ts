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
