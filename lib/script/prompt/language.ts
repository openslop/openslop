import dedent from "dedent";
import { declaredLanguage } from "@/lib/project/language";
import type { Metadata } from "@/lib/project/types";

export const INPUT_LANGUAGE =
	"the language of the user's own topic or script, or English when that is unclear";

export function spokenLanguage(metadata: Metadata, fallback: string): string {
	const language = declaredLanguage(metadata.language);
	return language ? `${language} (ISO 639-1)` : fallback;
}

export function languagePrompt(language: string): string {
	return dedent`
		## Language
		The script language is ${language}.
		- Write narration, character dialogue and <metadata_title> in the script language.
		- Write <metadata_style> and all <image>, <video>, <sound> and <music> prompts in English. Only speech quoted inside a <video> prompt is in the script language.`;
}
