import dedent from "dedent";
import { declaredLanguage } from "@/lib/project/language";
import type { Metadata } from "@/lib/project/types";

export const INPUT_LANGUAGE =
	"the language of the user's own topic or script, or English when that is unclear";

export function spokenLanguage(
	metadata: Metadata | undefined,
	fallback: string,
): string {
	const language = declaredLanguage(metadata?.language);
	return language ? `${language} (ISO 639-1)` : fallback;
}

export function languagePrompt(language: string): string {
	return dedent`
		## **Language**
		- Write all narration text and character dialogue in ${language}.
		- Always write image, animated_image (including videoPrompt), sound, and music descriptions in English, whatever language the spoken text is in.`;
}
