import { buildVisualPlugins } from "./plugins/visualChain";
import { createSpeakerVoicePlugin } from "./tts/plugins/speaker-voice";
import { createCharacterVoicesPlugin } from "./video/plugins/character-voices";
import { createVideoOutputRulesPlugin } from "./video/plugins/output-rules";
import { createPreviousVisualPlugin } from "./video/plugins/previous-visual";
import type { ConnectorConfig, ConnectorType } from "./types";

/**
 * How each connector type is configured. One config per type, not per provider:
 * plugins are what the connector type does, not what one vendor does, and which
 * provider a generation runs on is the model's decision.
 */
export type ConnectorRegistry = Record<ConnectorType, ConnectorConfig>;

export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	llm: {},
	tts: { plugins: [createSpeakerVoicePlugin()] },
	image: { plugins: buildVisualPlugins("image") },
	video: {
		plugins: [
			// First, while the characters are still named; character-references consumes them.
			createCharacterVoicesPlugin(),
			...buildVisualPlugins("video"),
			// Last, so a model's reference image limit drops the previous scene's frames before characters.
			createPreviousVisualPlugin(),
			createVideoOutputRulesPlugin(),
		],
	},
	sfx: {},
	music: {},
};
