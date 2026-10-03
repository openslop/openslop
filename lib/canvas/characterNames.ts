import uniq from "lodash/uniq";
import type { ScriptElement } from "./types";

export const CHARACTERS_ATTR = "characters";

/**
 * Parse the comma-separated `characters` element attribute into trimmed,
 * non-empty, distinct character names. Single source for the format so the delimiter and
 * trimming can't drift between call sites.
 */
export function parseCharacterNames(value: string | undefined): string[] {
	return uniq(
		(value ?? "")
			.split(",")
			.map((name) => name.trim())
			.filter(Boolean),
	);
}

export const shownCharacters = (element: ScriptElement): string[] =>
	parseCharacterNames(element.generationAttributes?.[CHARACTERS_ATTR]);

/** Inverse of `parseCharacterNames`; an empty list clears the attribute. */
export function formatCharacterNames(names: string[]): string | null {
	return names.join(", ") || null;
}
