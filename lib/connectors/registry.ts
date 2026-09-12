import set from "lodash/fp/set";
import { buildVisualPlugins } from "./plugins/visualChain";
import { createMetadataVoicePlugin } from "./tts/plugins/metadata-voice";
import { createVoiceSearchPlugin } from "./tts/plugins/voice-search";
import { createStartFramePlugin } from "./video/plugins/start-frame";
import type { ConnectorConfig, ConnectorPlugin, ConnectorType } from "./types";

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
	image: { plugins: buildVisualPlugins("image") },
	video: {
		plugins: [createStartFramePlugin(), ...buildVisualPlugins("video")],
	},
	sfx: {},
	music: {},
};

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
