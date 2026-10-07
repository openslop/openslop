import compact from "lodash/compact";
import uniq from "lodash/uniq";
import type { Descendant } from "slate";
import { parseReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import { getPromptText } from "@/lib/generation/inputs";
import { VoiceSchema, type Voice } from "@/lib/project/types";
import { flatAttributes } from "./elementAttributes";
import { isAssetElement } from "./guards";
import { getContentElements } from "./scenes";
import {
	assetId,
	type AssetElement,
	type AssetType,
	type ScriptElement,
} from "./types";

export const REFERENCE_URLS_ATTR = "images";

export const getAssets = (nodes: Descendant[]): AssetElement[] =>
	nodes.filter(isAssetElement);

/** Every element a generation can read, assets first, in document order. */
export const getScriptElements = (nodes: Descendant[]): ScriptElement[] => [
	...getAssets(nodes),
	...getContentElements(nodes),
];

export const findAsset = <T extends AssetType>(
	nodes: readonly unknown[],
	type: T,
	name?: string,
): AssetElement<T> | undefined => {
	const id = assetId(type, name);
	return nodes.find(
		(node): node is AssetElement<T> => isAssetElement(node) && node.id === id,
	);
};

export const NARRATOR = "Narrator";

const assetsOf =
	<T extends AssetType>(type: T) =>
	(nodes: readonly unknown[]): AssetElement<T>[] =>
		nodes.filter(
			(node): node is AssetElement<T> =>
				isAssetElement(node) && node.type === type,
		);

export const getAvatars = assetsOf("asset_avatar");

const getVoices = assetsOf("asset_voice");

const namesOf = (assets: AssetElement[]): string[] =>
	compact(assets.map((asset) => asset.generationAttributes?.name));

/** Everyone with a look or a voice, the narrator included. */
export const characterNames = (nodes: readonly unknown[]): string[] =>
	uniq(namesOf([...getAvatars(nodes), ...getVoices(nodes)]));

/** The characters a picture can show. */
export const avatarNames = (nodes: readonly unknown[]): string[] =>
	namesOf(getAvatars(nodes));

export const assetText = (
	nodes: readonly unknown[],
	type: AssetType,
	name?: string,
): string => {
	const asset = findAsset(nodes, type, name);
	return asset ? getPromptText(asset) : "";
};

export const referenceUrls = (nodes: readonly unknown[]): string[] =>
	parseReferenceImages(
		findAsset(nodes, "asset_references")?.generationAttributes?.[
			REFERENCE_URLS_ATTR
		],
	) ?? [];

export const voiceFrom = (voice?: AssetElement<"asset_voice">): Voice =>
	VoiceSchema.parse(flatAttributes(voice ?? {}));

/** A speaker's voice, the narrator's when no one is named. */
export const voiceOf = (nodes: readonly unknown[], name = NARRATOR): Voice =>
	voiceFrom(findAsset(nodes, "asset_voice", name));
