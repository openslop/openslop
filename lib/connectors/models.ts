import { IMAGE_MODELS } from "./image/models";
import { LLM_MODELS } from "./llm/models";
import type { ModelCatalog } from "./modelCatalog";
import { MUSIC_MODELS } from "./music/models";
import { providerMeta } from "./providerCatalog";
import { SFX_MODELS } from "./sfx/models";
import { TTS_MODELS } from "./tts/models";
import { CONNECTOR_TYPES, type ConnectorType, type ProviderKey } from "./types";
import { VIDEO_MODELS } from "./video/models";

/**
 * The catalog each connector type picks from. An animated image animates a
 * video model; the still it is made from picks separately, from the image one.
 */
export const MODEL_CATALOGS: Record<ConnectorType, ModelCatalog> = {
	llm: LLM_MODELS,
	tts: TTS_MODELS,
	image: IMAGE_MODELS,
	animated_image: VIDEO_MODELS,
	video: VIDEO_MODELS,
	sfx: SFX_MODELS,
	music: MUSIC_MODELS,
};

/** The connector serving a model, and so the gateway its generation is routed through. */
export const providerForModel = (
	type: ConnectorType,
	model: string | undefined,
): ProviderKey => MODEL_CATALOGS[type].providerFor(model);

/** The id the serving provider's own API takes for a model. */
export const vendorModelFor = (
	type: ConnectorType,
	model: string | undefined,
): string => MODEL_CATALOGS[type].idFor(model);

/** The model each connector type generates with, as one scope configures it. */
export type ConnectorModels = Record<string, string>;

/**
 * The scopes a model default can come from, outermost last. An element's own
 * pick beats its project's, which beats the account's, which beats the model
 * OpenSlop recommends.
 */
export type ModelDefaults = {
	project?: ConnectorModels;
	account?: ConnectorModels;
};

export type ModelSource = "element" | "project" | "account" | "recommended";

/**
 * The model a new element is created with: the nearest scope that names one the
 * catalog still offers, and the catalog's own default otherwise.
 */
export function defaultModelFor(
	type: ConnectorType,
	defaults: ModelDefaults = {},
): string {
	return MODEL_CATALOGS[type].resolve(
		defaults.project?.[type],
		defaults.account?.[type],
	);
}

/**
 * Which scope a model came from. An element's stored model reads as inherited
 * while it still matches what its scopes resolve to, and as its own pick once
 * it diverges, so the badge can say where the choice was made without the
 * element having to record it.
 */
export function modelSourceFor(
	type: ConnectorType,
	model: string,
	defaults: ModelDefaults = {},
): ModelSource {
	if (model !== defaultModelFor(type, defaults)) return "element";
	const offered = (name?: string) =>
		Boolean(name && MODEL_CATALOGS[type].has(name));
	if (offered(defaults.project?.[type])) return "project";
	if (offered(defaults.account?.[type])) return "account";
	return "recommended";
}

/**
 * Whether a scope asks for anything other than what OpenSlop recommends.
 * Pinning the recommended model is not a change, so a scope that only names
 * defaults has nothing to reset — and a pin the catalog has since dropped
 * resolves back to the default, so it does not count either.
 */
export function differsFromRecommended(models: ConnectorModels): boolean {
	return Object.entries(models).some(([type, model]) => {
		const catalog = MODEL_CATALOGS[type as ConnectorType];
		return catalog && catalog.resolve(model) !== catalog.defaultModel;
	});
}

/**
 * Every connector type's effective model, so the places that create elements
 * read one flat map instead of walking the scopes themselves.
 */
export function resolveDefaultModels(
	defaults: ModelDefaults = {},
): ConnectorModels {
	return Object.fromEntries(
		CONNECTOR_TYPES.map((type) => [type, defaultModelFor(type, defaults)]),
	);
}

/** Every model a provider serves, once each, across the types it covers. */
export function modelNamesForProvider(provider: ProviderKey): string[] {
	return [
		...new Set(
			providerMeta(provider).modalities.flatMap((type) =>
				MODEL_CATALOGS[type].namesFor(provider),
			),
		),
	];
}
