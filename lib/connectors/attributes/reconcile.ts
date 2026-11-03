import type { AttributeSchema } from "./schema";

/**
 * Diff between an old and new attribute schema for the same element, as a
 * partial-update payload (`null` deletes the key): fills defaults for keys it
 * gained, and resets or drops what the new schema no longer offers.
 */
export function reconcileAttributes(
	oldSchema: AttributeSchema,
	newSchema: AttributeSchema,
	attrs: Record<string, string>,
): Record<string, string | null> {
	const oldKeys = new Set(oldSchema.keys);
	const defaults = newSchema.defaultAttributes;
	const delta: Record<string, string | null> = {};

	for (const [key, value] of Object.entries(defaults)) {
		if (!oldKeys.has(key) && attrs[key] === undefined) delta[key] = value;
	}
	for (const [key, value] of Object.entries(attrs)) {
		if (!newSchema.offers(key, value)) delta[key] = defaults[key] ?? null;
	}
	return delta;
}
