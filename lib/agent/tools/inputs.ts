import { z } from "zod";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";

/** Spread flat into a tool's input: a nested object is a shape models get wrong. */
export const VOICE_TRAITS = {
	gender: z.enum(TTS_GENDERS).optional(),
	age: z.enum(TTS_AGES).optional(),
	pitch: z.enum(TTS_PITCHES).optional(),
	accent: z.enum(TTS_ACCENTS).optional(),
	description: z
		.string()
		.min(1)
		.optional()
		.describe("How the voice sounds, in a few words."),
};

export const named = (what: string) => ({
	message: `name at least one ${what} to change`,
});
export const notEmpty = (input: object) => Object.keys(input).length > 0;
