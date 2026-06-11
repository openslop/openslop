import { parseCharacterNames } from "@/lib/canvas/characterNames";
import type { CanvasContentElement } from "@/lib/canvas/types";

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
