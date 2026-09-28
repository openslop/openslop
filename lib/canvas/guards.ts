import { Element } from "slate";
import {
	CANVAS_ELEMENT_TYPES,
	FOREGROUND_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ParsedElement,
} from "./types";

const ELEMENT_TYPE_NAMES: ReadonlySet<string> = CANVAS_ELEMENT_TYPES;

export const isCanvasElementType = (type: string): type is CanvasElementType =>
	ELEMENT_TYPE_NAMES.has(type);

export const isContentElement = (node: unknown): node is CanvasContentElement =>
	Element.isElement(node) && isCanvasElementType(node.type);

export const isForeground = (node: unknown): node is CanvasContentElement =>
	isContentElement(node) && FOREGROUND_TYPES.has(node.type);

/** Narrows a parsed OSML node to a canvas element, the complement of `collectMetadata`. */
export const isParsedContentElement = (
	node: ParsedElement,
): node is ParsedElement & CanvasContentElement =>
	isCanvasElementType(node.type);
