import compact from "lodash/compact";
import type { Descendant } from "slate";
import { parseReferenceImages } from "@/lib/connectors/attributes/referenceImages";
import { getPromptText } from "@/lib/generation/inputs";
import {
	VoiceSchema,
	ProjectSettingsSchema,
	type Voice,
	type ProjectSettings,
} from "@/lib/project/types";
import { modelRefSchema, type ConnectorModels } from "@/lib/connectors/models";
import { CONNECTOR_TYPES, type ModelRef } from "@/lib/connectors/types";
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

export const castNames = (nodes: readonly unknown[]): string[] =>
	compact(
		nodes
			.filter(isAssetElement)
			.filter((asset) => asset.type === "cast")
			.map((asset) => asset.generationAttributes?.name),
	);

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

/** What is known of a speaker's voice: nothing for a name the cast does not know. */
export const voiceOf = (nodes: readonly unknown[], name?: string): Voice =>
	VoiceSchema.parse(flatAttributes(findAsset(nodes, "voice", name) ?? {}));

export const projectSettings = (nodes: readonly unknown[]): ProjectSettings =>
	ProjectSettingsSchema.parse(
		flatAttributes(findAsset(nodes, "project") ?? {}),
	);

/** A model the project pins is stored as `provider/model` under its connector type. */
export const formatModel = ({ provider, model }: ModelRef) =>
	`${provider}/${model}`;

export const projectModels = (nodes: readonly unknown[]): ConnectorModels => {
	const attrs = flatAttributes(findAsset(nodes, "project") ?? {});
	return Object.fromEntries(
		CONNECTOR_TYPES.flatMap((type) => {
			const [provider, ...model] = attrs[type]?.split("/") ?? [];
			const pick = modelRefSchema.safeParse({
				provider,
				model: model.join("/"),
			});
			return pick.success ? [[type, pick.data]] : [];
		}),
	);
};
