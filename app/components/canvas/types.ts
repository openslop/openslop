import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export type ResultKind = "image" | "video" | "audio";

export type CanvasElementType =
	| "narration"
	| "character"
	| "image"
	| "clip"
	| "sound"
	| "music";

export const CANVAS_ELEMENT_TYPES = new Set<CanvasElementType>([
	"narration",
	"character",
	"image",
	"clip",
	"sound",
	"music",
]);

export const SCENE_TYPE = "scene" as const;

export const FOREGROUND_TYPES: ReadonlySet<CanvasElementType> = new Set([
	"image",
	"clip",
]);

export type CanvasEditor = BaseEditor & ReactEditor & { id?: string };

export type CanvasContentElement = {
	id: string;
	type: CanvasElementType;
	customAttributes?: Record<string, string>;
	children: CanvasText[];
};

export type SceneElement = {
	id: string;
	type: typeof SCENE_TYPE;
	children: CanvasContentElement[];
};

export type CanvasElement = SceneElement | CanvasContentElement;

export type CanvasText = {
	id: string;
	type: CanvasElementType;
	text: string;
};

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasElement;
		Text: CanvasText;
	}
}
