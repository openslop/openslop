import compact from "lodash/compact";
import memoize from "lodash/memoize";
import uniq from "lodash/uniq";
import type { Descendant } from "slate";
import { parseReferenceImages } from "@/lib/connectors/attributes/reference-images";
import { VoiceSchema, type Voice } from "@/lib/project/types";
import { fromKeys } from "@/lib/utils";
import { flatAttributes } from "./element-attributes";
import { isAssetElement } from "./guards";
import { getElementBodyText } from "./osml-serializer";
import { getContentElements } from "./scenes";
import type { AssetElement, AssetType, CanvasElement } from "./types";

export const REFERENCE_URLS_ATTR = "images";

// Slate replaces the children array on every edit, so the array keys one revision.
export const getAssets = memoize((nodes: readonly unknown[]): AssetElement[] =>
	nodes.filter(isAssetElement),
);
getAssets.cache = new WeakMap();

/** Every element a generation can read, assets first, in document order. */
export const getCanvasElements = (nodes: Descendant[]): CanvasElement[] => [
	...getAssets(nodes),
	...getContentElements(nodes),
];

/** An asset is what it holds and for whom, never its id. */
export const isAsset = <T extends AssetType>(
	node: unknown,
	type: T,
	name?: string,
): node is AssetElement<T> =>
	isAssetElement(node) &&
	node.type === type &&
	node.generationAttributes?.name === name;

export const findAsset = <T extends AssetType>(
	nodes: readonly unknown[],
	type: T,
	name?: string,
): AssetElement<T> | undefined =>
	getAssets(nodes).find((node) => isAsset(node, type, name));

export function requireAsset<T extends AssetType>(
	nodes: readonly unknown[],
	type: T,
	name?: string,
): AssetElement<T> {
	const asset = findAsset(nodes, type, name);
	if (!asset) throw new Error(`No "${type}" asset on the canvas`);
	return asset;
}

const assetsOf =
	<T extends AssetType>(type: T) =>
	(nodes: readonly unknown[]): AssetElement<T>[] =>
		getAssets(nodes).filter(
			(asset): asset is AssetElement<T> => asset.type === type,
		);

/** What a `{{Name}}` can name, each held by its picture and, for a character, a voice. */
export const ASSET_KIND_SPECS = {
	character: {
		label: "Character",
		plural: "Characters",
		types: ["asset_avatar", "asset_voice"],
	},
	location: {
		label: "Location",
		plural: "Locations",
		types: ["asset_location"],
	},
	prop: { label: "Prop", plural: "Props", types: ["asset_prop"] },
} as const satisfies Record<
	string,
	{ label: string; plural: string; types: readonly AssetType[] }
>;

export type AssetKind = keyof typeof ASSET_KIND_SPECS;

export const ASSET_KINDS = Object.keys(ASSET_KIND_SPECS) as AssetKind[];

export type PictureType = (typeof ASSET_KIND_SPECS)[AssetKind]["types"][0];

export const pictureTypeOf = (kind: AssetKind): PictureType =>
	ASSET_KIND_SPECS[kind].types[0];

const KIND_OF_TYPE: Partial<Record<AssetType, AssetKind>> = Object.fromEntries(
	ASSET_KINDS.flatMap((kind) =>
		ASSET_KIND_SPECS[kind].types.map((type) => [type, kind]),
	),
);

export const kindOfType = (type: AssetType): AssetKind | undefined =>
	KIND_OF_TYPE[type];

const PICTURE_TYPES: readonly AssetType[] = ASSET_KINDS.map(pictureTypeOf);

const isPicture = (asset: AssetElement): asset is AssetElement<PictureType> =>
	PICTURE_TYPES.includes(asset.type);

export const isNamed = (node: unknown, name: string): node is AssetElement =>
	isAssetElement(node) &&
	node.generationAttributes?.name === name &&
	kindOfType(node.type) !== undefined;

/** What `name` is, if anything: names are unique across kinds. */
export const kindOfName = (
	nodes: readonly unknown[],
	name: string,
): AssetKind | undefined => {
	const asset = getAssets(nodes).find((node) => isNamed(node, name));
	return asset && kindOfType(asset.type);
};

export const getPictures = (
	nodes: readonly unknown[],
): AssetElement<PictureType>[] => getAssets(nodes).filter(isPicture);

export const findPicture = (
	nodes: readonly unknown[],
	name: string,
): AssetElement<PictureType> | undefined =>
	getPictures(nodes).find((asset) => isNamed(asset, name));

export const picturesOfKind = (
	nodes: readonly unknown[],
	kind: AssetKind,
): AssetElement<PictureType>[] => assetsOf(pictureTypeOf(kind))(nodes);

const namesOf = (assets: AssetElement[]): string[] =>
	uniq(compact(assets.map((asset) => asset.generationAttributes?.name)));

/** Every name of a kind: for characters, everyone with a look or a voice. */
export const assetNames = (
	nodes: readonly unknown[],
	kind: AssetKind,
): string[] =>
	namesOf(
		ASSET_KIND_SPECS[kind].types.flatMap((type) => assetsOf(type)(nodes)),
	);

/** Each kind's names a `{{Name}}` can draw, so a voice-only character is left out. */
export const picturedNames = (
	nodes: readonly unknown[],
): Record<AssetKind, string[]> =>
	fromKeys(ASSET_KINDS, (kind) => namesOf(picturesOfKind(nodes, kind)));

export const allAssetNames = (nodes: readonly unknown[]): string[] =>
	ASSET_KINDS.flatMap((kind) => assetNames(nodes, kind));

export const assetText = (
	nodes: readonly unknown[],
	type: AssetType,
	name?: string,
): string => {
	const asset = findAsset(nodes, type, name);
	return asset ? getElementBodyText(asset).trim() : "";
};

export const referenceUrls = (nodes: readonly unknown[]): string[] =>
	parseReferenceImages(
		findAsset(nodes, "asset_references")?.generationAttributes?.[
			REFERENCE_URLS_ATTR
		],
	) ?? [];

export const voiceFrom = (voice?: AssetElement<"asset_voice">): Voice =>
	VoiceSchema.parse(flatAttributes(voice ?? {}));

export const voiceOf = (nodes: readonly unknown[], name: string): Voice =>
	voiceFrom(findAsset(nodes, "asset_voice", name));
