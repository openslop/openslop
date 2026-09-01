import set from "lodash/fp/set";
import { createConnector, providersFor } from "./factory";
import { buildAnimatedImagePlugins } from "./animated_image/plugins/animated-image-chain";
import { buildImagePlugins } from "./image/plugins/imageChain";
import { createReferenceImagesPlugin } from "./image/plugins/reference-images";
import { createDimensionsPlugin } from "./plugins/dimensions";
import { providerForModel } from "./models";
import { createMetadataVoicePlugin } from "./tts/plugins/metadata-voice";
import { createVoiceSearchPlugin } from "./tts/plugins/voice-search";
import type {
	ConnectorConfig,
	ConnectorPlugin,
	ConnectorType,
	ProviderKey,
} from "./types";

/** Every connector type mapped to the providers configured for it. */
export type ConnectorRegistry = Record<
	ConnectorType,
	Partial<Record<ProviderKey, ConnectorConfig>>
>;

/**
 * Every provider serving a type, sharing that type's plugin chain: plugins are
 * what the connector type does, not what one vendor does. Which provider a
 * generation uses is the model's decision, so nothing here is marked default.
 */
const configFor = (
	type: ConnectorType,
	plugins?: ConnectorPlugin[],
): Partial<Record<ProviderKey, ConnectorConfig>> =>
	Object.fromEntries(
		providersFor(type).map((provider) => [
			provider,
			plugins ? { plugins } : {},
		]),
	);

/** Static plugin chains; `ConfigProvider` layers the project-scoped ones on top. */
export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	llm: configFor("llm"),
	tts: configFor("tts", [
		createMetadataVoicePlugin(),
		createVoiceSearchPlugin(),
	]),
	image: configFor("image", buildImagePlugins()),
	animated_image: configFor("animated_image", buildAnimatedImagePlugins()),
	video: configFor("video", [
		createReferenceImagesPlugin(),
		createDimensionsPlugin("video"),
	]),
	sfx: configFor("sfx"),
	music: configFor("music"),
};

/**
 * The connector serving a model. Picking a model picks the provider, and so the
 * gateway and the key the generation runs on.
 */
export function createModelConnector<T extends ConnectorType>(
	registry: ConnectorRegistry,
	type: T,
	model: string | undefined,
) {
	const provider = providerForModel(type, model);
	const config = registry[type][provider];
	if (!config)
		throw new Error(`No "${provider}" connector configured for "${type}"`);
	return createConnector(type, provider, config);
}

export function withRegistry(registry: ConnectorRegistry) {
	const apply = (cfg: ConnectorRegistry) => ({
		/** Appended for every provider of the type, since a plugin is the type's behaviour. */
		appendPlugins: (type: ConnectorType, ...plugins: ConnectorPlugin[]) => {
			const next = Object.entries(cfg[type]).reduce(
				(acc, [provider, config]) =>
					set(
						[type, provider, "plugins"],
						[...(config.plugins ?? []), ...plugins],
						acc,
					),
				cfg,
			);
			return apply(next);
		},
		build: () => cfg,
	});
	return apply(registry);
}
