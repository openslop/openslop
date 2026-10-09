import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import { z } from "zod";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { AssetConnectorType } from "@/lib/connectors/types";

export type ResultKind = "image" | "video" | "audio";

/** How an element behaves on the rendered timeline. An overlay is speech: it holds the screen for as long as it talks. */
export type ElementRole = "foreground" | "background" | "overlay" | "effect";

export type LayerType = "audio" | "visual";

/** The presentation-free facts about a content type. Its look lives in the canvas's `elementConfigs`. */
export type ContentSpec = {
	connector: AssetConnectorType;
	outputKind: ResultKind;
	role: ElementRole;
	layer: LayerType;
};

export const CONTENT_TYPES = {
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
	video: {
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
} as const satisfies Record<string, ContentSpec>;

export type ContentType = keyof typeof CONTENT_TYPES;

const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPES) as ContentType[];

export const ContentTypeSchema = z.enum(
	ALL_CONTENT_TYPES as [ContentType, ...ContentType[]],
);

export const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) =>
	String(i + 4),
);

export const DEFAULT_DURATION = "10";

const DURATIONS = DURATION_OPTIONS.map(Number);

/** The longest a video can be generated at, so the ceiling on what one visual covers. */
export const DURATION_MAX = Math.max(...DURATIONS);

/** The shortest option that still covers `seconds`, or the longest there is. */
export const snapDurationUp = (seconds: number): number =>
	DURATIONS.find((option) => option >= seconds) ?? DURATION_MAX;

export const VOLUME_OPTIONS = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;

export const LOOPS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const DEFAULT_LOOPS = "1";

export const SCENE_TYPE = "scene" as const;

/** What every element type declares: the connector it generates on, if any, and whether it is one per name. */
type ElementSpec = { connector?: AssetConnectorType; named?: true };

/** Tiles ahead of the scenes; one with a connector generates like content does. */
export const ASSET_TYPES = {
	asset_avatar: { connector: "image", named: true },
	asset_voice: { named: true },
	asset_style: {},
	asset_references: {},
} as const satisfies Record<`asset_${string}`, ElementSpec>;

export type AssetType = keyof typeof ASSET_TYPES;

export type ElementType = ContentType | AssetType;

export const ELEMENT_TYPES: Record<ElementType, ElementSpec> = {
	...CONTENT_TYPES,
	...ASSET_TYPES,
};

type Specs = typeof CONTENT_TYPES & typeof ASSET_TYPES;

export type GeneratedType = {
	[T in ElementType]: Specs[T] extends { connector: AssetConnectorType }
		? T
		: never;
}[ElementType];

/** What a type generates on; metadata generates nothing. */
export function connectorOf(type: GeneratedType): AssetConnectorType;
export function connectorOf(type: ElementType): AssetConnectorType | undefined;
export function connectorOf(type: ElementType) {
	return ELEMENT_TYPES[type].connector;
}

export const isGenerated = (
	element: CanvasElement,
): element is GeneratedElement => connectorOf(element.type) !== undefined;

export const ElementTypeSchema = z.enum(
	Object.keys(ELEMENT_TYPES) as [ElementType, ...ElementType[]],
);

export type CanvasEditor = BaseEditor &
	ReactEditor & {
		id?: string;
		/** Resolved per call, since the project's and account's pins change mid-session. */
		defaultModels: () => ConnectorModels;
	};

export type SplitAttributes = {
	generationAttributes?: Record<string, string>;
	layoutAttributes?: Record<string, string>;
};

export type ElementOf<T extends ElementType> = SplitAttributes & {
	id: string;
	type: T;
	children: CanvasText[];
};

export type ContentElement = ElementOf<ContentType>;

export type AssetElement<T extends AssetType = AssetType> = ElementOf<T>;

export type CanvasElement = ContentElement | AssetElement;

export type GeneratedElement = ElementOf<GeneratedType>;

export type Scene = {
	id: string;
	type: typeof SCENE_TYPE;
	children: ContentElement[];
};

export type CanvasBlock = Scene | CanvasElement;

export type CanvasText = {
	id: string;
	type: ElementType;
	text: string;
};

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasBlock;
		Text: CanvasText;
	}
}
