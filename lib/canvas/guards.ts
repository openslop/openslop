import { Element } from "slate";
import {
	ASSET_TYPES,
	NAME_REF_TYPE,
	CONTENT_TYPES,
	ELEMENT_TYPES,
	type AssetElement,
	type AssetType,
	type ContentElement,
	type ContentType,
	type ElementType,
	type CanvasElement,
	type NameRefElement,
	type ElementOf,
} from "./types";

export const isContentType = (type: string): type is ContentType =>
	Object.hasOwn(CONTENT_TYPES, type);

export const isContentElement = (node: unknown): node is ContentElement =>
	Element.isElement(node) && isContentType(node.type);

export const isForeground = (node: unknown): node is ContentElement =>
	isContentElement(node) && CONTENT_TYPES[node.type].role === "foreground";

export const takesNameRefs = (node: unknown): node is ContentElement =>
	isContentElement(node) && CONTENT_TYPES[node.type].layer === "visual";

export const isNameRef = (node: unknown): node is NameRefElement =>
	Element.isElement(node) && node.type === NAME_REF_TYPE;

export const isSpeech = (node: unknown): node is ElementOf<"speech"> =>
	isContentElement(node) && node.type === "speech";

export const isAssetType = (type: string): type is AssetType =>
	Object.hasOwn(ASSET_TYPES, type);

export const isAssetElement = (node: unknown): node is AssetElement =>
	Element.isElement(node) && isAssetType(node.type);

export const isElementType = (type: string): type is ElementType =>
	Object.hasOwn(ELEMENT_TYPES, type);

export const isCanvasElement = (node: unknown): node is CanvasElement =>
	Element.isElement(node) && isElementType(node.type);
