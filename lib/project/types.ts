import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import type { TransitionType } from "@/lib/video/transitions";

const optionalString = z.string().min(1).optional().catch(undefined);
const voiceSearchString = z.string().min(1).optional();
const voiceSearchLimitSchema = z
	.string()
	.regex(/^[1-9]\d*$/, "limit must be a positive integer")
	.transform(Number)
	.optional();

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

const voiceSearchTraitsSchema = z.object({
	gender: z.enum(TTS_GENDERS).optional(),
	age: z.enum(TTS_AGES).optional(),
	pitch: z.enum(TTS_PITCHES).optional(),
	accent: z.enum(TTS_ACCENTS).optional(),
	description: voiceSearchString,
	language: z.enum(TTS_LANGUAGES).optional(),
});

export const voiceSearchRequestSchema = voiceSearchTraitsSchema.extend({
	query: voiceSearchString,
	name: voiceSearchString,
	limit: voiceSearchLimitSchema,
});

export type MetadataVoice = z.infer<typeof MetadataVoiceSchema>;

export type MetadataCharacter = MetadataVoice & {
	appearance: string;
	avatarUrl?: string;
	avatarUploaded?: boolean;
};

export type VideoSettings = {
	transitionType?: TransitionType;
	aspectRatio?: AspectRatio;
};

export type Mode = "story" | "script" | "template";

export type Metadata = {
	title: string;
	style: string;
	narration: MetadataVoice;
	characters: Record<string, MetadataCharacter>;
	videoSettings?: VideoSettings;
	lastMode?: Mode;
	lastPrompt?: string;
};

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
