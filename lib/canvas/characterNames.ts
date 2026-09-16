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

/** Inverse of `parseCharacterNames`; an empty list clears the attribute. */
export function formatCharacterNames(names: string[]): string | null {
	return names.join(", ") || null;
}

export function getElementCharacterNames(
	element: CanvasContentElement,
): string[] {
	const attrs = element.generationAttributes;
	if (!attrs) return [];
	const name = attrs.name?.trim();
	return uniq([
		...(name ? [name] : []),
		...parseCharacterNames(attrs[CHARACTERS_ATTR]),
	]);
}
