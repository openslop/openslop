import { AttributeSchema } from "../attributes/schema";
import { volumeDef } from "../attributes/common";
import { TTS_EMOTIONS, TTS_SPEEDS } from "./enums";

const CAPTIONS_OPTIONS = ["on", "off"] as const;

export const TTS_ATTRIBUTES = AttributeSchema.from([
	{
		key: "emotion",
		label: "Emotion",
		edit: { kind: "enum", options: TTS_EMOTIONS },
		default: "neutral",
	},
	{
		key: "speed",
		label: "Speed",
		edit: { kind: "enum", options: TTS_SPEEDS },
		default: "medium",
	},
	volumeDef("10"),
	{
		key: "captions",
		label: "Captions",
		edit: { kind: "enum", options: CAPTIONS_OPTIONS },
		default: "on",
	},
]);
