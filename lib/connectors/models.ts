import { z } from "zod";
import { DEFAULT_IMAGE_MODEL, IMAGE_MODELS } from "./image/models";
import { DEFAULT_LLM_MODEL, LLM_MODELS } from "./llm/models";
import { DEFAULT_MUSIC_MODEL, MUSIC_MODELS } from "./music/models";
import { isProvider } from "./providerCatalog";
import { DEFAULT_SFX_MODEL, SFX_MODELS } from "./sfx/models";
import { DEFAULT_TTS_MODEL, TTS_MODELS } from "./tts/models";
import {
	CONNECTOR_TYPES,
	type ConnectorType,
	type ModelEntries,
	type ModelEntry,
	type ModelPick,
	type ModelRef,
	type ModelsByProvider,
	type Provider,
	PROVIDERS,
} from "./types";
import { DEFAULT_VIDEO_MODEL, VIDEO_MODELS } from "./video/models";

/**
 * Every model each connector type offers, by the provider serving it. An
 * animated image animates a video model; the still it is made from picks
 * separately, from the image ones.
 */
export const MODELS: {
	[T in ConnectorType]: ModelsByProvider<ModelEntries[T]>;
} = {
	llm: LLM_MODELS,
	tts: TTS_MODELS,
	image: IMAGE_MODELS,
	animated_image: VIDEO_MODELS,
	video: VIDEO_MODELS,
	sfx: SFX_MODELS,
	music: MUSIC_MODELS,
};

export const DEFAULT_MODELS: Record<ConnectorType, ModelRef> = {
	llm: DEFAULT_LLM_MODEL,
	tts: DEFAULT_TTS_MODEL,
	image: DEFAULT_IMAGE_MODEL,
	animated_image: DEFAULT_VIDEO_MODEL,
	video: DEFAULT_VIDEO_MODEL,
	sfx: DEFAULT_SFX_MODEL,
	music: DEFAULT_MUSIC_MODEL,
};

export const hasModel = (
	type: ConnectorType,
	pick: ModelPick | undefined,
): pick is ModelRef =>
	pick?.model !== undefined &&
	isProvider(pick.provider) &&
	MODELS[type][pick.provider]?.[pick.model] !== undefined;

export function modelEntry<T extends ConnectorType>(
	type: T,
	ref: ModelRef,
): ModelEntries[T] {
	const entry = MODELS[type][ref.provider]?.[ref.model];
	if (!entry)
		throw new Error(`"${ref.provider}" has no ${type} model "${ref.model}"`);
	return entry;
}

/** A request as the vendor's API takes it: the catalog pair swapped for the vendor's own model id. */
export type VendorParams<TReq> = Omit<TReq, "provider" | "model"> & {
	model: string;
};

export function vendorParams<TReq extends ModelRef>(
	type: ConnectorType,
	request: TReq,
): VendorParams<TReq> {
	const { provider, model, ...rest } = request;
	return { ...rest, model: modelEntry(type, { provider, model }).id };
}

export const sameModel = (a: ModelRef, b: ModelRef): boolean =>
	a.provider === b.provider && a.model === b.model;

/** The first candidate the catalog knows, as a bare pair whatever else it carried. */
export function resolveModel(
	type: ConnectorType,
	...candidates: (ModelPick | undefined)[]
): ModelRef {
	const { provider, model } =
		candidates.find((pick) => hasModel(type, pick)) ?? DEFAULT_MODELS[type];
	return { provider, model };
}

export function listModels(type: ConnectorType): (ModelRef & ModelEntry)[] {
	return Object.entries(MODELS[type]).flatMap(([provider, table]) =>
		Object.entries(table).map(([model, entry]) => ({
			provider: provider as Provider,
			model,
			...entry,
		})),
	);
}

export function modalitiesFor(provider: Provider): ConnectorType[] {
	return CONNECTOR_TYPES.filter((type) => MODELS[type][provider] !== undefined);
}

export const modelRefSchema = z.object({
	provider: z.enum(PROVIDERS),
	model: z.string(),
});

export const connectorModelsSchema = z.record(z.string(), modelRefSchema);

export type ConnectorModels = z.infer<typeof connectorModelsSchema>;

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

export function defaultModelFor(
	type: ConnectorType,
	defaults: ModelDefaults = {},
): ModelRef {
	return resolveModel(type, defaults.project?.[type], defaults.account?.[type]);
}

/**
 * Which scope a model came from. An element's stored model reads as inherited
 * while it still matches what its scopes resolve to, and as its own pick once
 * it diverges, so the badge can say where the choice was made without the
 * element having to record it.
 */
export function modelSourceFor(
	type: ConnectorType,
	model: ModelRef,
	defaults: ModelDefaults = {},
): ModelSource {
	if (!sameModel(model, defaultModelFor(type, defaults))) return "element";
	if (hasModel(type, defaults.project?.[type])) return "project";
	if (hasModel(type, defaults.account?.[type])) return "account";
	return "recommended";
}

/**
 * Whether a scope asks for anything other than what OpenSlop recommends.
 * Pinning the recommended model is not a change, so a scope that only names
 * defaults has nothing to reset — and a pin the catalog has since dropped
 * resolves back to the default, so it does not count either.
 */
export function differsFromRecommended(models: ConnectorModels): boolean {
	return CONNECTOR_TYPES.some(
		(type) =>
			!sameModel(resolveModel(type, models[type]), DEFAULT_MODELS[type]),
	);
}

export function resolveDefaultModels(
	defaults: ModelDefaults = {},
): ConnectorModels {
	return Object.fromEntries(
		CONNECTOR_TYPES.map((type) => [type, defaultModelFor(type, defaults)]),
	);
}
