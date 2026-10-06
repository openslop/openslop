import compact from "lodash/compact";
import isString from "lodash/isString";
import omit from "lodash/omit";
import pickBy from "lodash/pickBy";
import type { Descendant } from "slate";
import { parseReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import { getPromptText } from "@/lib/generation/inputs";
import { VoiceSchema, VOICE_TRAITS, type Voice } from "@/lib/project/types";
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

/** Speaks every line no character does: a character with a voice and no avatar. */
export const NARRATOR = "Narrator";

export const NO_AVATAR = { avatar: "none" } as const;

/** What a new asset starts with: the narrator has no avatar. */
export const assetDefaults = (
	type: AssetType,
	name?: string,
): Record<string, string> =>
	type === "asset_character" && name === NARRATOR ? NO_AVATAR : {};

const characters = (
	nodes: readonly unknown[],
): AssetElement<"asset_character">[] =>
	nodes.filter(
		(node): node is AssetElement<"asset_character"> =>
			isAssetElement(node) && node.type === "asset_character",
	);

export const hasAvatar = (
	character: AssetElement<"asset_character">,
): boolean => character.generationAttributes?.avatar !== NO_AVATAR.avatar;

const namesOf = (members: AssetElement<"asset_character">[]): string[] =>
	compact(members.map((character) => character.generationAttributes?.name));

export const characterNames = (nodes: readonly unknown[]): string[] =>
	namesOf(characters(nodes));

/** The characters a picture can show. */
export const avatarNames = (nodes: readonly unknown[]): string[] =>
	namesOf(characters(nodes).filter(hasAvatar));

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

/** A character's voice, read off its voice-prefixed keys. */
export const characterVoice = (
	character?: AssetElement<"asset_character">,
): Voice => {
	const attrs = flatAttributes(character ?? {});
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

const VOICE_KEYS = [
	...VOICE_TRAITS.filter((trait) => trait !== "description"),
	"voiceDescription",
	"voiceProvider",
	"voiceModel",
	"voiceId",
];

/** What an element generates from: a character's portrait is not drawn from their voice. */
export const ownAttributes = (
	element: ScriptElement,
): Record<string, string> =>
	element.type === "asset_character"
		? omit(element.generationAttributes, VOICE_KEYS)
		: (element.generationAttributes ?? {});

/** What is known of a speaker's voice, the narrator's when no one is named. */
export const voiceOf = (nodes: readonly unknown[], name = NARRATOR): Voice =>
	characterVoice(findAsset(nodes, "asset_character", name));
