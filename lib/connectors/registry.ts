import type { GeneratedType } from "@/lib/canvas/types";
import { createArtStylePlugin } from "./image/plugins/art-style";
import { createCharacterAvatarPlugin } from "./image/plugins/character-avatar";
import { createReferenceImagesPlugin } from "./image/plugins/reference-images";
import { createDimensionsPlugin } from "./plugins/dimensions";
import { buildVisualPlugins } from "./plugins/visualChain";
import { createSpeakerVoicePlugin } from "./tts/plugins/speaker-voice";
import { createCharacterVoicesPlugin } from "./video/plugins/character-voices";
import { createVideoOutputRulesPlugin } from "./video/plugins/output-rules";
import { createPreviousVisualPlugin } from "./video/plugins/previous-visual";
import type { ConnectorConfig } from "./types";

/** The plugins each generated type installs: all a type does that another does not. */
export type ConnectorRegistry = Record<GeneratedType, ConnectorConfig>;

const speech: ConnectorConfig = { plugins: [createSpeakerVoicePlugin()] };

export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	narration: speech,
	character: speech,
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
	sound: {},
	music: {},
	asset_avatar: {
		// No character-references: an avatar depending on avatars could depend on itself.
		plugins: [
			createCharacterAvatarPlugin(),
			createArtStylePlugin(),
			createReferenceImagesPlugin(),
			createDimensionsPlugin("image"),
		],
	},
};
