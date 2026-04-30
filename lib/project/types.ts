import { z } from "zod";
import { TTS_GENDERS } from "@/lib/connectors/tts/enums";

const optionalString = z.string().min(1).optional().catch(undefined);

export const genderSchema = z.enum(TTS_GENDERS).optional().catch(undefined);

export const MetadataVoiceSchema = z.object({
	gender: genderSchema,
	age: optionalString,
	pitch: optionalString,
	accent: optionalString,
	description: optionalString,
});

export type MetadataVoice = z.infer<typeof MetadataVoiceSchema>;

export type MetadataCharacter = MetadataVoice & {
	appearance: string;
	avatarUrl?: string;
};

export type Metadata = {
	style: string;
	narration: MetadataVoice;
	characters: Record<string, MetadataCharacter>;
};

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;
