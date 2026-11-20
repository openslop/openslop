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
		- Every spoken or sung line is in the script language, wherever the format puts it: a <speech> element, speech quoted in a <video> prompt, or the lyrics of a <music> prompt.
		- Everything else in <image>, <video>, <sound> and <music> prompts is in English.`;
}
