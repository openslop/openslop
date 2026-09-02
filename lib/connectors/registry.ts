import set from "lodash/fp/set";
import { createConnector } from "./factory";
import { buildAnimatedImagePlugins } from "./animated_image/plugins/animated-image-chain";
import { buildImagePlugins } from "./image/plugins/imageChain";
import { createReferenceImagesPlugin } from "./image/plugins/reference-images";
import { createDimensionsPlugin } from "./plugins/dimensions";
import { createMetadataVoicePlugin } from "./tts/plugins/metadata-voice";
import { createVoiceSearchPlugin } from "./tts/plugins/voice-search";
import type {
	ConnectorConfig,
	ConnectorPlugin,
	ConnectorType,
	ModelRef,
} from "./types";

/**
 * How each connector type is configured. One config per type, not per provider:
 * plugins are what the connector type does, not what one vendor does, and which
 * provider a generation runs on is the model's decision.
 */
export type ConnectorRegistry = Record<ConnectorType, ConnectorConfig>;

/** Static plugin chains; `ConfigProvider` layers the project-scoped ones on top. */
export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	llm: {},
	tts: { plugins: [createMetadataVoicePlugin(), createVoiceSearchPlugin()] },
	image: { plugins: buildImagePlugins() },
	animated_image: { plugins: buildAnimatedImagePlugins() },
	video: {
		plugins: [createReferenceImagesPlugin(), createDimensionsPlugin("video")],
	},
	sfx: {},
	music: {},
};

export function createModelConnector<T extends ConnectorType>(
	registry: ConnectorRegistry,
	type: T,
	model: ModelRef,
) {
	return createConnector(type, model, registry[type]);
}

export function withRegistry(registry: ConnectorRegistry) {
	const apply = (cfg: ConnectorRegistry) => ({
		appendPlugins: (type: ConnectorType, ...plugins: ConnectorPlugin[]) =>
			apply(
				set([type, "plugins"], [...(cfg[type].plugins ?? []), ...plugins], cfg),
			),
		build: () => cfg,
	});
	return apply(registry);
}
