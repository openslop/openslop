import { z } from "zod";
import { AttributeSchema } from "../attributes/schema";
import {
	nameDef,
	OWN_MODEL_DEFS,
	timelineDurationDef,
	trimStartDef,
	volumeDef,
} from "../attributes/common";
import {
	DEFAULT_TTS_EMOTION,
	DEFAULT_TTS_SPEED,
	TTS_EMOTIONS,
	TTS_SPEEDS,
} from "./enums";

export const TTS_ATTRIBUTES = AttributeSchema.from([
	nameDef,
	...OWN_MODEL_DEFS,
	{
		key: "emotion",
		label: "Emotion",
		edit: { kind: "enum", value: z.enum(TTS_EMOTIONS) },
		default: DEFAULT_TTS_EMOTION,
	},
	{
		key: "speed",
		label: "Speed",
		edit: { kind: "enum", value: z.enum(TTS_SPEEDS) },
		default: DEFAULT_TTS_SPEED,
	},
	volumeDef("10"),
	trimStartDef,
	timelineDurationDef,
]);
