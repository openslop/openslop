import { IMAGE_MODELS } from "./image/models";
import { LLM_MODELS } from "./llm/models";
import type { ModelCatalog } from "./modelCatalog";
import { MUSIC_MODELS } from "./music/models";
import { SFX_MODELS } from "./sfx/models";
import { TTS_MODELS } from "./tts/models";
import type { ConnectorType, ProviderKey } from "./types";
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

/** The model each connector type generates with, as a project configures it. */
export type ConnectorModels = Record<string, string>;

/**
 * The model a new element is created with: the project's pick when it names one
 * the catalog still offers, and the catalog's own default otherwise.
 */
export function defaultModelFor(
	type: ConnectorType,
	models: ConnectorModels = {},
): string {
	const catalog = MODEL_CATALOGS[type];
	const pinned = models[type];
	return pinned && catalog.has(pinned) ? pinned : catalog.defaultModel;
}
