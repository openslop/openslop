import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import type { TransitionType } from "@/lib/video/transitions";

const optionalString = z.string().min(1).optional().catch(undefined);

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);
export const languageSchema = z.enum(TTS_LANGUAGES).optional().catch(undefined);
export const ageSchema = z.enum(TTS_AGES).optional().catch(undefined);
export const pitchSchema = z.enum(TTS_PITCHES).optional().catch(undefined);
export const accentSchema = z.enum(TTS_ACCENTS).optional().catch(undefined);

export const MetadataVoiceSchema = z.object({
	gender: genderSchema,
	age: ageSchema,
	pitch: pitchSchema,
	accent: accentSchema,
	description: optionalString,
	language: languageSchema,
	voiceId: optionalString,
	resolvedVoiceId: optionalString,
});

export const voiceSearchParamsSchema = z.object({
	query: optionalString,
	gender: genderSchema,
	age: ageSchema,
	pitch: pitchSchema,
	accent: accentSchema,
	description: optionalString,
	name: optionalString,
	language: languageSchema,
	limit: z.coerce.number().int().positive().optional().catch(undefined),
});

export type MetadataVoice = z.infer<typeof MetadataVoiceSchema>;

export type MetadataCharacter = MetadataVoice & {
	appearance: string;
	avatarUrl?: string;
};

export type VideoSettings = {
	transitionType?: TransitionType;
};

export type Metadata = {
	title: string;
	style: string;
	narration: MetadataVoice;
	characters: Record<string, MetadataCharacter>;
	videoSettings?: VideoSettings;
	lastMode?: "story" | "script" | "template";
	lastPrompt?: string;
};

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
