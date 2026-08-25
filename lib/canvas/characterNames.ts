import uniq from "lodash/uniq";
import type { CanvasContentElement } from "./types";

export const CHARACTERS_ATTR = "characters";

/**
 * Parse the comma-separated `characters` element attribute into trimmed,
 * non-empty character names. Single source for the format so the delimiter and
 * trimming can't drift between call sites.
 */
export function parseCharacterNames(value: string | undefined): string[] {
	return (value ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean);
}

const CHARACTER_NAME_EXTRACTORS: Record<string, (value: string) => string[]> = {
	name: (v) => [v.trim()],
	[CHARACTERS_ATTR]: parseCharacterNames,
};

export function getElementCharacterNames(
	element: CanvasContentElement,
): string[] {
	const attrs = element.generationAttributes;
	if (!attrs) return [];
	return uniq(
		Object.entries(CHARACTER_NAME_EXTRACTORS).flatMap(([key, extract]) => {
			const value = attrs[key];
			return value ? extract(value).filter(Boolean) : [];
		}),
	);
}
