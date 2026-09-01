import { describe, expect, it } from "vitest";
import { CONNECTOR_GROUPS, groupFor } from "../connectorConfigs";
import { MODEL_CATALOGS } from "../models";
import { CONNECTOR_TYPES } from "../types";

describe("CONNECTOR_GROUPS", () => {
	it("covers every connector type exactly once", () => {
		const covered = CONNECTOR_GROUPS.flatMap((group) => group.types);
		expect([...covered].sort()).toEqual([...CONNECTOR_TYPES].sort());
	});

	// One control sets the whole group, so the types it covers have to offer the
	// same models — otherwise it would write a model one of them cannot run.
	it("only groups types that pick from the same catalog", () => {
		for (const { key, types } of CONNECTOR_GROUPS) {
			const [first, ...rest] = types;
			for (const type of rest) {
				expect(
					{ key, models: MODEL_CATALOGS[type].names },
					`${key} spans catalogs`,
				).toEqual({ key, models: MODEL_CATALOGS[first].names });
			}
		}
	});

	it("finds the group a type belongs to", () => {
		expect(groupFor("animated_image").key).toBe("videos");
		expect(groupFor("video").key).toBe("videos");
		expect(groupFor("llm").key).toBe("text");
	});
});
