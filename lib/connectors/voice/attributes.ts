import { z } from "zod";
import {
	Globe,
	Hourglass,
	Translate,
	User,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import { nameDef, OWN_MODEL_DEFS } from "../attributes/common";
import { AttributeSchema } from "../attributes/schema";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "../tts/enums";

const trait = (
	key: string,
	label: string,
	options: readonly string[],
	icon: IconComponent,
) => ({
	key,
	label,
	edit: { kind: "enum" as const, value: z.enum(options), icon },
});

/** A voice is described by its traits; the voice they find is picked beside them. */
export const VOICE_ATTRIBUTES = AttributeSchema.from([
	nameDef,
	...OWN_MODEL_DEFS,
	trait("gender", "Gender", TTS_GENDERS, User),
	trait("language", "Language", TTS_LANGUAGES, Translate),
	trait("age", "Age", TTS_AGES, Hourglass),
	trait("pitch", "Pitch", TTS_PITCHES, Waveform),
	trait("accent", "Accent", TTS_ACCENTS, Globe),
	{
		key: "description",
		label: "Description",
		edit: { kind: "text", placeholder: "How the voice sounds", rows: 2 },
	},
	{ key: "pickedVoiceId", label: "Picked voice" },
]);
