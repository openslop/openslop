import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { connectorModelsSchema, modelRefSchema } from "@/lib/connectors/models";
import { AUTO_LANGUAGE, LANGUAGE_CHOICES } from "./language";
import { VideoSettingsSchema } from "@/lib/video/videoSettings";

const optionalString = z.string().min(1).optional().catch(undefined);

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);
export const languageSchema = z.enum(TTS_LANGUAGES).optional().catch(undefined);
export const ageSchema = z.enum(TTS_AGES).optional().catch(undefined);
export const pitchSchema = z.enum(TTS_PITCHES).optional().catch(undefined);
export const accentSchema = z.enum(TTS_ACCENTS).optional().catch(undefined);

const voiceTraitsSchema = z.object({
	gender: genderSchema,
	age: ageSchema,
	pitch: pitchSchema,
	accent: accentSchema,
	description: optionalString,
	language: languageSchema,
});

export const MetadataVoiceSchema = voiceTraitsSchema.extend({
	voiceId: optionalString,
	resolvedVoiceId: optionalString,
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

export type MetadataVoice = z.infer<typeof MetadataVoiceSchema>;

export const MetadataCharacterSchema = MetadataVoiceSchema.extend({
	appearance: z.string(),
	/** Whether the avatar node's result came from an upload rather than generation. */
	avatarUploaded: z.boolean().optional().catch(undefined),
});

export type MetadataCharacter = z.infer<typeof MetadataCharacterSchema>;

export const metadataVoiceFor = (
	metadata: {
		narration: MetadataVoice;
		characters: Record<string, MetadataVoice>;
	},
	characterName?: string,
): MetadataVoice | undefined =>
	characterName ? metadata.characters[characterName] : metadata.narration;

export const MetadataSchema = z.object({
	title: z.string().default(""),
	style: z.string().default(""),
	language: z
		.enum(LANGUAGE_CHOICES)
		.default(AUTO_LANGUAGE)
		.catch(AUTO_LANGUAGE),
	narration: MetadataVoiceSchema.default({}),
	characters: z.record(z.string(), MetadataCharacterSchema).default({}),
	videoSettings: VideoSettingsSchema,
	/** The model each connector type generates with, when the project pins one. */
	models: connectorModelsSchema.default({}),
	/** The template the project's scripts are written against, when it has one. */
	templateId: optionalString,
});

export type Metadata = z.infer<typeof MetadataSchema>;

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
