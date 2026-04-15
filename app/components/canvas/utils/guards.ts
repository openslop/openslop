import { Element } from "slate";
import {
  CANVAS_ELEMENT_TYPES,
  FOREGROUND_TYPES,
  SCENE_TYPE,
  type CanvasContentElement,
  type CanvasElement,
  type CanvasElementType,
  type SceneElement,
} from "../types";

export const isSceneElement = (n: unknown): n is SceneElement =>
  Element.isElement(n) && (n as CanvasElement).type === SCENE_TYPE;

export const isContentElement = (n: unknown): n is CanvasContentElement =>
  Element.isElement(n) &&
  CANVAS_ELEMENT_TYPES.has((n as CanvasElement).type as CanvasElementType);

export const isForeground = (n: unknown): n is CanvasContentElement =>
  isContentElement(n) && FOREGROUND_TYPES.has(n.type);
