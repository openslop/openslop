import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import { z } from "zod";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { AssetConnectorType } from "@/lib/connectors/types";

export type ResultKind = "image" | "video" | "audio";

/** How an element behaves on the rendered timeline. An overlay is speech: it holds the screen for as long as it talks. */
export type ElementRole = "foreground" | "background" | "overlay" | "effect";

export type LayerType = "audio" | "visual";

/** The presentation-free facts about an element type. Its look lives in the canvas's `elementConfigs`. */
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
} as const satisfies Record<string, ElementTypeSpec>;

export type CanvasElementType = keyof typeof ELEMENT_TYPES;

const ALL_ELEMENT_TYPES = Object.keys(ELEMENT_TYPES) as CanvasElementType[];

export const CANVAS_ELEMENT_TYPES: ReadonlySet<CanvasElementType> = new Set(
	ALL_ELEMENT_TYPES,
);

export const CanvasElementTypeSchema = z.enum(
	ALL_ELEMENT_TYPES as [CanvasElementType, ...CanvasElementType[]],
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

export type AssetType =
	| "title"
	| "project"
	| "cast"
	| "voice"
	| "style"
	| "references";

type AssetTypeSpec = {
	connector?: AssetConnectorType;
	/** The id of the type's unnamed asset, when it is not the type itself. */
	unnamedId?: string;
	/** Written in place on the canvas, where the rest are locked and edited from a dialog. */
	editable?: true;
};

/** Elements ahead of the scenes. Only a character's look generates; the rest are metadata. */
export const ASSET_TYPES: Record<AssetType, AssetTypeSpec> = {
	title: { editable: true },
	project: {},
	cast: { connector: "image" },
	voice: { unnamedId: "narrator" },
	style: {},
	references: {},
};

export type ElementType = CanvasElementType | AssetType;

/** A named asset is `type:name`; a type's unnamed one has its own fixed id. */
export const assetId = (type: AssetType, name?: string): string =>
	name ? `${type}:${name}` : (ASSET_TYPES[type].unnamedId ?? type);

const CONNECTORS: Record<ElementType, { connector?: AssetConnectorType }> = {
	...ELEMENT_TYPES,
	...ASSET_TYPES,
};

/** What a type generates on; metadata generates nothing. */
export const connectorOf = (
	type: ElementType,
): AssetConnectorType | undefined => CONNECTORS[type].connector;

export type GeneratedType = CanvasElementType | "cast";

export const isGenerated = (
	element: ScriptElement,
): element is CanvasNode<GeneratedType> =>
	connectorOf(element.type) !== undefined;

export const ElementTypeSchema = z.enum(
	Object.keys(CONNECTORS) as [ElementType, ...ElementType[]],
);

export type CanvasEditor = BaseEditor &
	ReactEditor & {
		id?: string;
		/** Resolved per call against `nodes`' project element, which can change mid-session. */
		defaultModels: (nodes?: readonly unknown[]) => ConnectorModels;
	};

export type SplitAttributes = {
	generationAttributes?: Record<string, string>;
	layoutAttributes?: Record<string, string>;
};

export type CanvasNode<T extends ElementType = ElementType> =
	SplitAttributes & {
		id: string;
		type: T;
		children: CanvasText[];
	};

export type CanvasContentElement = CanvasNode<CanvasElementType>;

export type AssetElement<T extends AssetType = AssetType> = CanvasNode<T>;

/** Anything on the canvas that holds text and attributes: all but a scene. */
export type ScriptElement = CanvasContentElement | AssetElement;

export type SceneElement = {
	id: string;
	type: typeof SCENE_TYPE;
	children: CanvasContentElement[];
};

export type CanvasElement = SceneElement | ScriptElement;

export type CanvasText = {
	id: string;
	type: ElementType;
	text: string;
};

export type ParsedElement = SplitAttributes & {
	id: string;
	type: string;
	children: { id: string; type: string; text: string }[];
};

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasElement;
		Text: CanvasText;
	}
}
