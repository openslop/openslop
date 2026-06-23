import type { CanvasContentElement, CanvasElementType } from "./types";

type ElementTypeGroup = readonly CanvasElementType[];

/**
 * A map of attribute name and the types within which it's preserved
 */
const PRESERVED_ATTRIBUTE_TYPES: Record<string, ElementTypeGroup> = {
	characters: ["image", "animated_image"],
};

export function preservedAttributes(
	source: CanvasContentElement,
	targetType: CanvasElementType,
): Record<string, string> {
	const attrs = source.customAttributes ?? {};
	const preserved: Record<string, string> = {};
	for (const [attribute, types] of Object.entries(PRESERVED_ATTRIBUTE_TYPES)) {
		if (attrs[attribute] && types.includes(targetType)) {
			preserved[attribute] = attrs[attribute];
		}
	}
	return preserved;
}
