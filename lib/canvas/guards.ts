import { Element } from "slate";
import {
	CANVAS_ELEMENT_TYPES,
	FOREGROUND_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ParsedElement,
} from "@/lib/canvas/types";

const ELEMENT_TYPE_NAMES: ReadonlySet<string> = CANVAS_ELEMENT_TYPES;

export const isCanvasElementType = (type: string): type is CanvasElementType =>
	ELEMENT_TYPE_NAMES.has(type);

export const isContentElement = (n: unknown): n is CanvasContentElement =>
	Element.isElement(n) && isCanvasElementType(n.type);

export const isForeground = (n: unknown): n is CanvasContentElement =>
	isContentElement(n) && FOREGROUND_TYPES.has(n.type);

/** Narrows a parsed OSML node to a canvas element, the complement of `collectMetadata`. */
export const isParsedContentElement = (
	node: ParsedElement,
): node is ParsedElement & CanvasContentElement =>
	isCanvasElementType(node.type);
