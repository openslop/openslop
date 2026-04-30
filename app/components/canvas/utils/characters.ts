import type { CanvasContentElement } from "../types";

const CHARACTER_NAME_EXTRACTORS: Record<string, (value: string) => string[]> = {
	name: (v) => [v.trim()],
	characters: (v) =>
		v
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
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
