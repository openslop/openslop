import pickBy from "lodash/pickBy";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/referenceImages";
import { CHARACTERS_ATTR } from "./characterNames";
import type { CanvasContentElement, CanvasElementType } from "./types";

type ElementTypeGroup = readonly CanvasElementType[];

/** Attributes that survive a retype, by the types they mean the same thing on. */
const PRESERVED_ATTRIBUTE_TYPES: Partial<Record<string, ElementTypeGroup>> = {
	[CHARACTERS_ATTR]: ["image", "clip"],
	[REFERENCE_IMAGES_ATTR]: ["image", "clip"],
};

export function preservedAttributes(
	source: CanvasContentElement,
	targetType: CanvasElementType,
): Record<string, string> {
	return pickBy(source.generationAttributes ?? {}, (_, attribute) =>
		PRESERVED_ATTRIBUTE_TYPES[attribute]?.includes(targetType),
	);
}
