import type { AttributeSchema } from "./schema";

/**
 * Diff between an old and new attribute schema for the same element, as a
 * partial-update payload (`null` deletes the key, matching `updateElementAttrs`).
 * Drops attrs whose key left the schema and fills defaults for keys it gained,
 * so identical schemas reconcile to nothing. Never touches keys outside both
 * schemas (e.g. `provider`).
 */
export function reconcileAttributes(
	oldSchema: AttributeSchema,
	newSchema: AttributeSchema,
	attrs: Record<string, string>,
): Record<string, string | null> {
	const oldKeys = new Set(oldSchema.keys);
	const newKeys = new Set(newSchema.keys);
	const delta: Record<string, string | null> = {};

	for (const key of oldSchema.keys) {
		if (!newKeys.has(key)) delta[key] = null;
	}
	for (const [key, value] of Object.entries(newSchema.defaultAttributes)) {
		if (!oldKeys.has(key) && attrs[key] === undefined) delta[key] = value;
	}
	return delta;
}
