import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/referenceImages";
import { CHARACTERS_ATTR } from "./characterNames";
import type { CanvasContentElement, CanvasElementType } from "./types";

type ElementTypeGroup = readonly CanvasElementType[];

/**
 * A map of attribute name and the types within which it's preserved
 */
const PRESERVED_ATTRIBUTE_TYPES: Record<string, ElementTypeGroup> = {
	[CHARACTERS_ATTR]: ["image", "animated_image"],
	[REFERENCE_IMAGES_ATTR]: ["image", "animated_image"],
};

export function preservedAttributes(
	source: CanvasContentElement,
	targetType: CanvasElementType,
): Record<string, string> {
	const attrs = source.customAttributes ?? {};
	const preserved: Record<string, string> = {};
	for (const [attribute, types] of Object.entries(PRESERVED_ATTRIBUTE_TYPES)) {
		const value = attrs[attribute];
		if (value !== undefined && types.includes(targetType)) {
			preserved[attribute] = value;
		}
	}
	return preserved;
}
