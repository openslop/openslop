import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { modelRefSchema } from "@/lib/connectors/models";
import { AUTO_LANGUAGE, LANGUAGE_CHOICES } from "./language";
import { DEFAULT_VIDEO_FORMAT, VIDEO_FORMAT_CHOICES } from "./videoFormat";
import { DEFAULT_VIDEO_LENGTH, VIDEO_LENGTHS } from "./videoLength";

const optionalString = z.string().min(1).optional().catch(undefined);

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);
export const languageSchema = z.enum(TTS_LANGUAGES).optional().catch(undefined);
export const ageSchema = z.enum(TTS_AGES).optional().catch(undefined);
export const pitchSchema = z.enum(TTS_PITCHES).optional().catch(undefined);
export const accentSchema = z.enum(TTS_ACCENTS).optional().catch(undefined);

export const voiceTraitsSchema = z.object({
	gender: genderSchema,
	age: ageSchema,
	pitch: pitchSchema,
	accent: accentSchema,
	description: optionalString,
	language: languageSchema,
});

export const VoiceSchema = voiceTraitsSchema.extend({
	voiceId: optionalString,
	provider: modelRefSchema.shape.provider.optional().catch(undefined),
	model: optionalString,
});

/** What describes a voice, as opposed to identifying one, in reading order. */
export const VOICE_TRAITS = [
	"gender",
	"age",
	"pitch",
	"accent",
	"language",
	"description",
] as const satisfies readonly (keyof z.infer<typeof voiceTraitsSchema>)[];

/** The traits a voice declares, as [trait, value] pairs in reading order. */
export function voiceTraitEntries(
	voice: z.infer<typeof voiceTraitsSchema>,
): [string, string][] {
	return VOICE_TRAITS.flatMap((trait) => {
		const value = voice[trait];
		return value ? [[trait, value] as [string, string]] : [];
	});
}

export const voiceSearchParamsSchema = voiceTraitsSchema.extend({
	query: optionalString,
	name: optionalString,
	limit: z.coerce.number().int().positive().optional().catch(undefined),
});

export type Voice = z.infer<typeof VoiceSchema>;

export const ScriptSettingsSchema = z.object({
	language: z.enum(LANGUAGE_CHOICES).catch(AUTO_LANGUAGE),
	length: z.enum(VIDEO_LENGTHS).catch(DEFAULT_VIDEO_LENGTH),
	format: z.enum(VIDEO_FORMAT_CHOICES).catch(DEFAULT_VIDEO_FORMAT),
	template: optionalString,
});

export type ScriptSettings = z.infer<typeof ScriptSettingsSchema>;

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
