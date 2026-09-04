import { describe, expect, it } from "vitest";
import { MODEL_GROUPS, groupFor } from "../modelGroups";
import { MODELS } from "../models";
import { CONNECTOR_TYPES } from "../types";

describe("MODEL_GROUPS", () => {
	it("covers every connector type exactly once", () => {
		const covered = MODEL_GROUPS.flatMap((group) => group.types);
		expect([...covered].sort()).toEqual([...CONNECTOR_TYPES].sort());
	});

	// One control sets the whole group, so the types it covers have to offer the
	// same models — otherwise it would write a model one of them cannot run.
	it("only groups types that pick from the same catalog", () => {
		for (const { key, types } of MODEL_GROUPS) {
			const [first, ...rest] = types;
			for (const type of rest) {
				expect({ key, models: MODELS[type] }, `${key} spans catalogs`).toEqual({
					key,
					models: MODELS[first],
				});
			}
		}
	});

	it("finds the group a type belongs to", () => {
		expect(groupFor("animated_image").key).toBe("videos");
		expect(groupFor("video").key).toBe("videos");
		expect(groupFor("llm").key).toBe("text");
	});
});
