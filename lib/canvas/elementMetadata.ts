import type { CanvasElementType, ResultKind } from "./types";
import type { ConnectorType } from "@/lib/connectors/types";

export interface ElementMetadata {
	type: CanvasElementType;
	connector: ConnectorType;
	outputKind: ResultKind;
	defaultAttributes?: Record<string, string>;
}

const NARRATION_AUDIO_DEFAULTS = {
	volume: "10",
	speed: "medium",
	captions: "on",
};

export const ELEMENT_METADATA: Record<CanvasElementType, ElementMetadata> = {
	narration: {
		type: "narration",
		connector: "tts",
		outputKind: "audio",
		defaultAttributes: NARRATION_AUDIO_DEFAULTS,
	},
	character: {
		type: "character",
		connector: "tts",
		outputKind: "audio",
		defaultAttributes: NARRATION_AUDIO_DEFAULTS,
	},
	image: {
		type: "image",
		connector: "image",
		outputKind: "image",
		defaultAttributes: { motion: "none" },
	},
	animated_image: {
		type: "animated_image",
		connector: "animated_image",
		outputKind: "video",
		defaultAttributes: {
			motion: "none",
			videoPrompt: "slow cinematic pan",
		},
	},
	clip: {
		type: "clip",
		connector: "video",
		outputKind: "video",
		defaultAttributes: {
			duration: "5",
			volume: "5",
			motion: "none",
		},
	},
	sound: {
		type: "sound",
		connector: "sfx",
		outputKind: "audio",
		defaultAttributes: { loops: "1", volume: "2" },
	},
	music: {
		type: "music",
		connector: "music",
		outputKind: "audio",
		defaultAttributes: { loops: "1", volume: "2" },
	},
};
