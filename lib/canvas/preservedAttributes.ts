import pickBy from "lodash/pickBy";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/referenceImages";
import { CHARACTERS_ATTR } from "./characterNames";
import type { ContentElement, ContentType } from "./types";

type ElementTypeGroup = readonly ContentType[];

/** Attributes that survive a retype, by the types they mean the same thing on. */
const PRESERVED_ATTRIBUTE_TYPES: Partial<Record<string, ElementTypeGroup>> = {
	[CHARACTERS_ATTR]: ["image", "video"],
	[REFERENCE_IMAGES_ATTR]: ["image", "video"],
};

export function preservedAttributes(
	source: ContentElement,
	targetType: ContentType,
): Record<string, string> {
	return pickBy(source.generationAttributes ?? {}, (_, attribute) =>
		PRESERVED_ATTRIBUTE_TYPES[attribute]?.includes(targetType),
	);
}
