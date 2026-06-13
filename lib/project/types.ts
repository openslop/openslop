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

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);
export const languageSchema = z.enum(TTS_LANGUAGES).optional().catch(undefined);
export const ageSchema = z.enum(TTS_AGES).optional().catch(undefined);
export const pitchSchema = z.enum(TTS_PITCHES).optional().catch(undefined);
export const accentSchema = z.enum(TTS_ACCENTS).optional().catch(undefined);

const voiceTraits = {
	gender: genderSchema,
	age: ageSchema,
	pitch: pitchSchema,
	accent: accentSchema,
	description: optionalString,
	language: languageSchema,
};

export const MetadataVoiceSchema = z.object({
	...voiceTraits,
	voiceId: optionalString,
	resolvedVoiceId: optionalString,
});

export const voiceSearchParamsSchema = z.object({
	...voiceTraits,
	query: optionalString,
	name: optionalString,
	limit: z.coerce.number().int().positive().optional().catch(undefined),
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
