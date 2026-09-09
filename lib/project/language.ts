import { TTS_LANGUAGES, type TTSLanguage } from "@/lib/connectors/tts/enums";

export const AUTO_LANGUAGE = "auto";

/** What speech speaks when the project leaves the language on auto. */
export const FALLBACK_LANGUAGE: TTSLanguage = "en";

export type LanguageChoice = typeof AUTO_LANGUAGE | TTSLanguage;

export const LANGUAGE_CHOICES = [AUTO_LANGUAGE, ...TTS_LANGUAGES] as const;

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

export function languageLabel(choice: LanguageChoice): string {
	return choice === AUTO_LANGUAGE
		? "Auto"
		: (displayNames.of(choice) ?? choice);
}

export function declaredLanguage(
	choice: LanguageChoice | undefined,
): TTSLanguage | undefined {
	return choice === AUTO_LANGUAGE ? undefined : choice;
}
