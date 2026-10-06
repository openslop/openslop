import compact from "lodash/compact";
import isString from "lodash/isString";
import mapKeys from "lodash/mapKeys";
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

/** Speaks every line no character does: a character with a voice and no avatar. */
export const NARRATOR = "Narrator";

export const NO_AVATAR = { avatar: "none" } as const;

/** What a new asset starts with: the narrator has no avatar. */
export const assetDefaults = (
	type: AssetType,
	name?: string,
): Record<string, string> =>
	type === "asset_character" && name === NARRATOR ? NO_AVATAR : {};

export const getCharacters = (
	nodes: readonly unknown[],
): AssetElement<"asset_character">[] =>
	nodes.filter(
		(node): node is AssetElement<"asset_character"> =>
			isAssetElement(node) && node.type === "asset_character",
	);

export const hasAvatar = (character: AssetElement): boolean =>
	character.generationAttributes?.avatar !== NO_AVATAR.avatar;

const namesOf = (members: AssetElement<"asset_character">[]): string[] =>
	compact(members.map((character) => character.generationAttributes?.name));

export const characterNames = (nodes: readonly unknown[]): string[] =>
	namesOf(getCharacters(nodes));

/** The characters a picture can show. */
export const avatarNames = (nodes: readonly unknown[]): string[] =>
	namesOf(getCharacters(nodes).filter(hasAvatar));

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

const VOICE_FIELDS = Object.keys(VoiceSchema.shape);

const RENAMED_VOICE_FIELDS: Record<string, string> = {
	provider: "voiceProvider",
	model: "voiceModel",
	description: "voiceDescription",
};

const voiceAttr = (field: string) => RENAMED_VOICE_FIELDS[field] ?? field;

/** The keys a character's voice is kept under. */
export const VOICE_KEYS = VOICE_FIELDS.map(voiceAttr);

/** A character's voice, read off its voice keys. */
export const characterVoice = (
	character?: AssetElement<"asset_character">,
): Voice => {
	const attrs = flatAttributes(character ?? {});
	return VoiceSchema.parse(
		Object.fromEntries(
			VOICE_FIELDS.map((field) => [field, attrs[voiceAttr(field)]]),
		),
	);
};

export const voiceAttrs = (voice: Partial<Voice>): Record<string, string> =>
	pickBy(
		mapKeys(voice, (_, field) => voiceAttr(field)),
		isString,
	);

/** What is known of a speaker's voice, the narrator's when no one is named. */
export const voiceOf = (nodes: readonly unknown[], name = NARRATOR): Voice =>
	characterVoice(findAsset(nodes, "asset_character", name));
