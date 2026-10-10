import { AttributeSchema } from "../attributes/schema";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "../tts/enums";

const trait = (key: string, label: string, options: readonly string[]) => ({
	key,
	label,
	edit: { kind: "enum" as const, options },
});

/** A voice is described by its traits; the voice they find is picked beside them. */
export const VOICE_ATTRIBUTES = AttributeSchema.from([
	trait("gender", "Gender", TTS_GENDERS),
	trait("language", "Language", TTS_LANGUAGES),
	trait("age", "Age", TTS_AGES),
	trait("pitch", "Pitch", TTS_PITCHES),
	trait("accent", "Accent", TTS_ACCENTS),
	{
		key: "description",
		label: "Description",
		edit: { kind: "text", placeholder: "How the voice sounds", rows: 2 },
	},
]);
