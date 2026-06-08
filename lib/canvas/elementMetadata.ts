import type { CanvasElementType, ResultKind } from "./types";
import type { ConnectorType } from "@/lib/connectors/types";

export interface ElementMetadata {
	connector: ConnectorType;
	outputKind: ResultKind;
	defaultAttributes?: Record<string, string>;
}

export const ELEMENT_METADATA: Record<CanvasElementType, ElementMetadata> = {
	narration: {
		connector: "tts",
		outputKind: "audio",
		defaultAttributes: {
			volume: "10",
			speed: "medium",
			captions: "on",
		},
	},
	character: {
		connector: "tts",
		outputKind: "audio",
		defaultAttributes: {
			volume: "10",
			speed: "medium",
			captions: "on",
		},
	},
	image: {
		connector: "image",
		outputKind: "image",
		defaultAttributes: { motion: "none" },
	},
	animated_image: {
		connector: "animated_image",
		outputKind: "video",
		defaultAttributes: {
			motion: "none",
			videoPrompt: "slow cinematic pan",
		},
	},
	clip: {
		connector: "video",
		outputKind: "video",
		defaultAttributes: {
			duration: "5",
			volume: "5",
			motion: "none",
		},
	},
	sound: {
		connector: "sfx",
		outputKind: "audio",
		defaultAttributes: { loops: "1", volume: "2" },
	},
	music: {
		connector: "music",
		outputKind: "audio",
		defaultAttributes: { loops: "1", volume: "2" },
	},
};
