import type { AttributeDef } from "./schema";

export const REFERENCE_IMAGES_ATTR = "referenceImagesOverride";

/**
 * The element's own reference images, or `undefined` when it carries no override
 * and inherits the project's. An empty array is an override that clears them.
 */
export function parseReferenceImages(
	value: string | undefined,
): string[] | undefined {
	if (value === undefined) return undefined;
	return value
		.split(",")
		.map((url) => url.trim())
		.filter(Boolean);
}

export const serializeReferenceImages = (urls: string[]): string =>
	urls.join(",");

/** No default: an absent value is what makes an element inherit the project's references. */
export const referenceImagesDef: AttributeDef = {
	key: REFERENCE_IMAGES_ATTR,
	label: "References",
	edit: { kind: "images" },
};
