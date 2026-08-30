import { AttributeSchema } from "../attributes/schema";
import { volumeDef } from "../attributes/common";
import { modelDef } from "../attributes/model";
import { TTS_EMOTIONS, TTS_SPEEDS } from "./enums";

export const TTS_ATTRIBUTES = AttributeSchema.from([
	modelDef("tts"),
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
]);
