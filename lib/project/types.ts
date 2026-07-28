import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { ASPECT_RATIOS } from "@/lib/video/aspectRatio";
import { TRANSITION_TYPES } from "@/lib/video/transitions";

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
});

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

const VideoSettingsSchema = z.object({
	transitionType: z.enum(TRANSITION_TYPES).optional(),
	aspectRatio: z.enum(ASPECT_RATIOS).optional(),
});

export const MODES = ["story", "script", "template"] as const;

export type Mode = (typeof MODES)[number];

export const MetadataSchema = z.object({
	title: z.string().default(""),
	style: z.string().default(""),
	narration: MetadataVoiceSchema.default({}),
	characters: z.record(z.string(), MetadataCharacterSchema).default({}),
	videoSettings: VideoSettingsSchema.optional(),
	/** Persisted for server-side observability of prompt activity; not read in-app. */
	lastMode: z.enum(MODES).optional(),
	lastPrompt: z.string().optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
