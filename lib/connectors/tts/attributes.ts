import { AttributeSchema } from "../attributes/schema";
import { volumeDef } from "../attributes/common";
import {
	DEFAULT_TTS_EMOTION,
	DEFAULT_TTS_SPEED,
	TTS_EMOTIONS,
	TTS_SPEEDS,
} from "./enums";

export const TTS_ATTRIBUTES = AttributeSchema.from(
	[
		{
			key: "emotion",
			label: "Emotion",
			edit: { kind: "enum", options: TTS_EMOTIONS },
			default: DEFAULT_TTS_EMOTION,
		},
		{
			key: "speed",
			label: "Speed",
			edit: { kind: "enum", options: TTS_SPEEDS },
			default: DEFAULT_TTS_SPEED,
		},
		volumeDef("10"),
	],
	{ hideModel: true },
);
