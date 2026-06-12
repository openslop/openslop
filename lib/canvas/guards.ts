import { Element } from "slate";
import {
	CANVAS_ELEMENT_TYPES,
	FOREGROUND_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";

export const isContentElement = (n: unknown): n is CanvasContentElement =>
	Element.isElement(n) && CANVAS_ELEMENT_TYPES.has(n.type as CanvasElementType);

export const isForeground = (n: unknown): n is CanvasContentElement =>
	isContentElement(n) && FOREGROUND_TYPES.has(n.type);
