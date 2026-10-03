import { Element } from "slate";
import {
	ASSET_TYPES,
	CANVAS_ELEMENT_TYPES,
	ELEMENT_TYPES,
	type AssetElement,
	type AssetType,
	type CanvasContentElement,
	type CanvasElementType,
	type ElementRole,
	type ParsedElement,
	type ScriptElement,
} from "./types";

const ELEMENT_TYPE_NAMES: ReadonlySet<string> = CANVAS_ELEMENT_TYPES;

export const isCanvasElementType = (type: string): type is CanvasElementType =>
	ELEMENT_TYPE_NAMES.has(type);

export const isContentElement = (node: unknown): node is CanvasContentElement =>
	Element.isElement(node) && isCanvasElementType(node.type);

const roleOf = (node: unknown): ElementRole | undefined =>
	isContentElement(node) ? ELEMENT_TYPES[node.type].role : undefined;

export const isForeground = (node: unknown): node is CanvasContentElement =>
	roleOf(node) === "foreground";

export const isSpeech = (node: unknown): boolean => roleOf(node) === "overlay";

export const isAssetType = (type: string): type is AssetType =>
	Object.hasOwn(ASSET_TYPES, type);

export const isAssetElement = (node: unknown): node is AssetElement =>
	Element.isElement(node) && isAssetType(node.type);

export const isScriptElement = (node: unknown): node is ScriptElement =>
	isContentElement(node) || isAssetElement(node);

/** Narrows a parsed OSML node to a canvas element, leaving out assets and tags the canvas does not know. */
export const isParsedContentElement = (
	node: ParsedElement,
): node is ParsedElement & CanvasContentElement =>
	isCanvasElementType(node.type);
