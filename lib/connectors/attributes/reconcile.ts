import type { AttributeSchema } from "./schema";

/**
 * Diff between an old and new attribute schema for the same element, as a
 * partial-update payload (`null` deletes the key, matching `updateElementAttrs`).
 * Drops attrs whose key left the schema; fills defaults for keys the schema
 * gained. Never touches keys outside both schemas (e.g. `model`, `provider`).
 */
export function reconcileAttributes(
	oldSchema: AttributeSchema,
	newSchema: AttributeSchema,
	attrs: Record<string, string>,
): Record<string, string | null> {
	const newKeys = new Set(newSchema.keys);
	const delta: Record<string, string | null> = {};

	for (const key of oldSchema.keys) {
		if (!newKeys.has(key)) delta[key] = null;
	}
	for (const [key, value] of Object.entries(newSchema.defaultAttributes)) {
		if (attrs[key] === undefined) delta[key] = value;
	}
	return delta;
}
