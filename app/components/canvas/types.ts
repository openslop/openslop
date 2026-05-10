import type {
	CanvasEditor,
	CanvasElement,
	CanvasText,
} from "@/lib/canvas/types";

export {
	CANVAS_ELEMENT_TYPES,
	FOREGROUND_TYPES,
	SCENE_TYPE,
	type CanvasContentElement,
	type CanvasEditor,
	type CanvasElement,
	type CanvasElementType,
	type CanvasText,
	type ParsedElement,
	type ResultKind,
	type SceneElement,
} from "@/lib/canvas/types";

export {
	METADATA_TAG_TYPES,
	type MetadataTagType,
} from "./config/metadataTags";

export type { MetadataCharacter } from "@/lib/project/types";

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasElement;
		Text: CanvasText;
	}
}
