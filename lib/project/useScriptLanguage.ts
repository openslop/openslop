"use client";

import { useProject } from "./useProject";
import type { LanguageChoice } from "./language";

export function useScriptLanguage(): [
	LanguageChoice,
	(next: LanguageChoice) => void,
] {
	const language = useProject((s) => s.metadata.language);
	const updateMetadata = useProject((s) => s.updateMetadata);
	return [language, (next) => updateMetadata({ language: next })];
}
