import {
	PLAYGROUND_CONTENT_TYPES,
	playgroundTypeOf,
	type ContentType,
	type GeneratedType,
	type PlaygroundType,
} from "@/lib/canvas/types";
import { createArtStylePlugin } from "./image/plugins/art-style";
import { createCharacterAvatarPlugin } from "./image/plugins/character-avatar";
import { createReferenceImagesPlugin } from "./image/plugins/reference-images";
import { createDimensionsPlugin } from "./plugins/dimensions";
import { buildVisualPlugins } from "./plugins/visual-chain";
import { createSpeakerVoicePlugin } from "./tts/plugins/speaker-voice";
import { createVideoOutputRulesPlugin } from "./video/plugins/output-rules";
import { createPreviousVisualPlugin } from "./video/plugins/previous-visual";
import type { ConnectorConfig } from "./types";

/** The plugins each generated type installs: all a type does that another does not. */
export type ConnectorRegistry = Record<GeneratedType, ConnectorConfig>;

const speech: ConnectorConfig = { plugins: [createSpeakerVoicePlugin()] };

const CONTENT = {
	narration: speech,
	character: speech,
	image: { plugins: buildVisualPlugins("image") },
	video: {
		plugins: [
			...buildVisualPlugins("video"),
			createPreviousVisualPlugin(),
			createVideoOutputRulesPlugin(),
		],
	},
	sound: {},
	music: {},
} satisfies Record<ContentType, ConnectorConfig>;

/** A draft generates on the plugins of the type it drafts. */
const DRAFTS = Object.fromEntries(
	PLAYGROUND_CONTENT_TYPES.map((type) => [
		playgroundTypeOf(type),
		CONTENT[type],
	]),
) as Record<PlaygroundType, ConnectorConfig>;

export const DEFAULT_CONNECTOR_REGISTRY: ConnectorRegistry = {
	...CONTENT,
	...DRAFTS,
	asset_avatar: {
		plugins: [
			createCharacterAvatarPlugin(),
			createArtStylePlugin(),
			createReferenceImagesPlugin(),
			createDimensionsPlugin("image"),
		],
	},
	asset_voice: {},
};
