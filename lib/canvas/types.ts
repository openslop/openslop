import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import { z } from "zod";
import type { AssetConnectorType } from "@/lib/connectors/types";

export type ResultKind = "image" | "video" | "audio";

/** How an element behaves on the rendered timeline. */
export type ElementRole = "foreground" | "background" | "overlay" | "effect";

export type LayerType = "audio" | "visual";

/** The presentation-free facts about an element type. Its look lives in `elementConfigs`. */
export type ElementTypeSpec = {
	connector: AssetConnectorType;
	outputKind: ResultKind;
	role: ElementRole;
	layer: LayerType;
};

export const ELEMENT_TYPES = {
	narration: {
		connector: "tts",
		outputKind: "audio",
		role: "overlay",
		layer: "audio",
	},
	character: {
		connector: "tts",
		outputKind: "audio",
		role: "overlay",
		layer: "audio",
	},
	image: {
		connector: "image",
		outputKind: "image",
		role: "foreground",
		layer: "visual",
	},
	animated_image: {
		connector: "animated_image",
		outputKind: "video",
		role: "foreground",
		layer: "visual",
	},
	clip: {
		connector: "video",
		outputKind: "video",
		role: "foreground",
		layer: "visual",
	},
	sound: {
		connector: "sfx",
		outputKind: "audio",
		role: "effect",
		layer: "audio",
	},
	music: {
		connector: "music",
		outputKind: "audio",
		role: "background",
		layer: "audio",
	},
} as const satisfies Record<string, ElementTypeSpec>;

export type CanvasElementType = keyof typeof ELEMENT_TYPES;

const ALL_ELEMENT_TYPES = Object.keys(ELEMENT_TYPES) as CanvasElementType[];

export const CANVAS_ELEMENT_TYPES: ReadonlySet<CanvasElementType> = new Set(
	ALL_ELEMENT_TYPES,
);

export const CanvasElementTypeSchema = z.enum(
	ALL_ELEMENT_TYPES as [CanvasElementType, ...CanvasElementType[]],
);

export const FOREGROUND_TYPES: ReadonlySet<CanvasElementType> = new Set(
	ALL_ELEMENT_TYPES.filter((type) => ELEMENT_TYPES[type].role === "foreground"),
);

export const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) =>
	String(i + 4),
);

export const DEFAULT_DURATION = "10";

const DURATIONS = DURATION_OPTIONS.map(Number);

export const DURATION_MIN = Math.min(...DURATIONS);

/** The longest a clip can be generated at, so the ceiling on what one visual covers. */
export const DURATION_MAX = Math.max(...DURATIONS);

/** The shortest option that still covers `seconds`, or the longest there is. */
export const snapDurationUp = (seconds: number): number =>
	DURATIONS.find((option) => option >= seconds) ?? DURATION_MAX;

export const SCENE_TYPE = "scene" as const;

export type CanvasEditor = BaseEditor & ReactEditor & { id?: string };

export type SplitAttributes = {
	generationAttributes?: Record<string, string>;
	layoutAttributes?: Record<string, string>;
};

export type CanvasContentElement = SplitAttributes & {
	id: string;
	type: CanvasElementType;
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

export type ParsedElement = SplitAttributes & {
	id: string;
	type: string;
	customAttributes?: Record<string, string>;
	children: { id: string; type: string; text: string }[];
};

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasElement;
		Text: CanvasText;
	}
}
