import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/referenceImages";
import { CHARACTERS_ATTR } from "./characterNames";
import {
	IMAGE_AUTHORED_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "./types";

/**
 * A map of attribute name and the types within which it's preserved
 */
const PRESERVED_ATTRIBUTE_TYPES: Record<
	string,
	ReadonlySet<CanvasElementType>
> = {
	[CHARACTERS_ATTR]: IMAGE_AUTHORED_TYPES,
	[REFERENCE_IMAGES_ATTR]: IMAGE_AUTHORED_TYPES,
};

export function preservedAttributes(
	source: CanvasContentElement,
	targetType: CanvasElementType,
): Record<string, string> {
	const attrs = source.customAttributes ?? {};
	const preserved: Record<string, string> = {};
	for (const [attribute, types] of Object.entries(PRESERVED_ATTRIBUTE_TYPES)) {
		const value = attrs[attribute];
		if (value !== undefined && types.has(targetType)) {
			preserved[attribute] = value;
		}
	}
	return preserved;
}
