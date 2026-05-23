import { z } from "zod";
import { TTS_GENDERS, TTS_LANGUAGES } from "@/lib/connectors/tts/enums";
import type { TransitionType } from "@/lib/video/transitions";

const optionalString = z.string().min(1).optional().catch(undefined);

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);
export const languageSchema = z.enum(TTS_LANGUAGES).optional().catch(undefined);

export const MetadataVoiceSchema = z.object({
	gender: genderSchema,
	age: optionalString,
	pitch: optionalString,
	accent: optionalString,
	description: optionalString,
	language: languageSchema,
});

export const voiceSearchParamsSchema = z.object({
	query: optionalString,
	gender: genderSchema,
	age: optionalString,
	pitch: optionalString,
	accent: optionalString,
	description: optionalString,
	name: optionalString,
	language: languageSchema,
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
};

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
