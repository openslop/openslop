import { AttributeSchema } from "../attributes/schema";
import { volumeDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";
import {
	DEFAULT_TTS_EMOTION,
	DEFAULT_TTS_SPEED,
	TTS_ACCENTS,
	TTS_AGES,
	TTS_EMOTIONS,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
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

const trait = (key: string, label: string, options: readonly string[]) => ({
	key,
	label,
	edit: { kind: "enum" as const, options },
});

/** A cast member's voice is described by its traits; which voice they found is picked beside them. */
export const VOICE_ATTRIBUTES = AttributeSchema.from(
	[
		trait("gender", "Gender", TTS_GENDERS),
		trait("language", "Language", TTS_LANGUAGES),
		trait("age", "Age", TTS_AGES),
		trait("pitch", "Pitch", TTS_PITCHES),
		trait("accent", "Accent", TTS_ACCENTS),
		{
			key: "voiceDescription",
			label: "Description",
			edit: { kind: "text", placeholder: "How the voice sounds", rows: 2 },
		},
		// The voice picker sets the pair; it is carried so a voice always has one.
		...modelDefs("tts", {
			key: "voiceModel",
			providerAttr: "voiceProvider",
			hidden: true,
		}),
	],
	{ hideModel: true },
);
