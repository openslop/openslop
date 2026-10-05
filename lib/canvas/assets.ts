import compact from "lodash/compact";
import isString from "lodash/isString";
import pickBy from "lodash/pickBy";
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

/** Speaks every line no character does: a cast member with a voice and no avatar. */
export const NARRATOR = "Narrator";

export const NO_AVATAR = { avatar: "none" } as const;

/** What a new asset starts with: the narrator has no avatar. */
export const assetDefaults = (
	type: AssetType,
	name?: string,
): Record<string, string> =>
	type === "cast" && name === NARRATOR ? NO_AVATAR : {};

const casts = (nodes: readonly unknown[]): AssetElement<"cast">[] =>
	nodes.filter(
		(node): node is AssetElement<"cast"> =>
			isAssetElement(node) && node.type === "cast",
	);

export const hasAvatar = (cast: AssetElement<"cast">): boolean =>
	cast.generationAttributes?.avatar !== NO_AVATAR.avatar;

const namesOf = (members: AssetElement<"cast">[]): string[] =>
	compact(members.map((cast) => cast.generationAttributes?.name));

export const castNames = (nodes: readonly unknown[]): string[] =>
	namesOf(casts(nodes));

/** The cast members a picture can show. */
export const avatarNames = (nodes: readonly unknown[]): string[] =>
	namesOf(casts(nodes).filter(hasAvatar));

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
		findAsset(nodes, "references")?.generationAttributes?.[REFERENCE_URLS_ATTR],
	) ?? [];

/** A cast member's voice, read off its voice-prefixed keys. */
export const castVoice = (cast?: AssetElement<"cast">): Voice => {
	const attrs = flatAttributes(cast ?? {});
	return VoiceSchema.parse({
		...attrs,
		provider: attrs.voiceProvider,
		model: attrs.voiceModel,
		description: attrs.voiceDescription,
	});
};

export const voiceAttrs = ({
	provider,
	model,
	description,
	...traits
}: Partial<Voice>): Record<string, string> =>
	pickBy(
		{
			...traits,
			voiceProvider: provider,
			voiceModel: model,
			voiceDescription: description,
		},
		isString,
	);

/** What is known of a speaker's voice, the narrator's when no one is named. */
export const voiceOf = (nodes: readonly unknown[], name = NARRATOR): Voice =>
	castVoice(findAsset(nodes, "cast", name));
