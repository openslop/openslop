import type { CanvasContentElement } from "./types";

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
	characters: parseCharacterNames,
};

export function getElementCharacterNames(
	element: CanvasContentElement,
): string[] {
	const attrs = element.customAttributes;
	if (!attrs) return [];
	return Object.entries(CHARACTER_NAME_EXTRACTORS).flatMap(([key, extract]) => {
		const value = attrs[key];
		return value ? extract(value).filter(Boolean) : [];
	});
}
