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
	ProviderKey,
} from "./types";

/** Every connector type mapped to the providers configured for it. */
export type ConnectorRegistry = Record<
	ConnectorType,
	Record<ProviderKey, ConnectorConfig>
>;

const openslopConfig = (
	plugins?: ConnectorPlugin[],
): Record<ProviderKey, ConnectorConfig> => ({
	openslop: {
		isDefault: true,
		apiKey: "",
		...(plugins && { plugins }),
	},
});

/** Static plugin chains; `ConfigProvider` layers the project-scoped ones on top. */
export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	llm: openslopConfig(),
	tts: openslopConfig([createMetadataVoicePlugin(), createVoiceSearchPlugin()]),
	image: openslopConfig(buildImagePlugins()),
	animated_image: openslopConfig(buildAnimatedImagePlugins()),
	video: openslopConfig([
		createReferenceImagesPlugin(),
		createDimensionsPlugin("video"),
	]),
	sfx: openslopConfig(),
	music: openslopConfig(),
};

export function getDefaultConnector(
	registry: ConnectorRegistry,
	type: ConnectorType,
): { provider: ProviderKey; config: ConnectorConfig } {
	const providers = registry[type];
	for (const [provider, config] of Object.entries(providers)) {
		if (config.isDefault) {
			return { provider: provider as ProviderKey, config };
		}
	}
	const first = Object.entries(providers)[0];
	if (!first)
		throw new Error(`No providers configured for connector type "${type}"`);
	const [provider, config] = first;
	return { provider: provider as ProviderKey, config };
}

export function createDefaultConnector<T extends ConnectorType>(
	registry: ConnectorRegistry,
	type: T,
) {
	const { provider, config } = getDefaultConnector(registry, type);
	return createConnector(type, provider, config);
}

export function withRegistry(registry: ConnectorRegistry) {
	const apply = (cfg: ConnectorRegistry) => ({
		appendPlugins: (type: ConnectorType, ...plugins: ConnectorPlugin[]) => {
			const { provider, config } = getDefaultConnector(cfg, type);
			const next = set(
				[type, provider, "plugins"],
				[...(config.plugins ?? []), ...plugins],
				cfg,
			);
			return apply(next);
		},
		build: () => cfg,
	});
	return apply(registry);
}
