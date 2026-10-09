import { dedent } from "@/lib/dedent";
import { declaredLanguage } from "@/lib/project/language";
import type { ScriptSettings } from "@/lib/project/types";

export const INPUT_LANGUAGE =
	"the language of the user's own topic or script, or English when that is unclear";

export function spokenLanguage(
	settings: ScriptSettings,
	fallback: string,
): string {
	const language = declaredLanguage(settings.language);
	return language ? `${language} (ISO 639-1)` : fallback;
}

export function languagePrompt(language: string): string {
	return dedent`
		## Language
		The script language is ${language}.
		- Write narration and character dialogue in the script language.
		- Write all <image>, <video>, <sound> and <music> prompts in English. Only speech quoted inside a <video> prompt is in the script language.`;
}
