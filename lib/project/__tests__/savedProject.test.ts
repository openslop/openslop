import { describe, expect, it } from "vitest";
import { parseSavedProject } from "../savedProject";

const snapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

describe("parseSavedProject", () => {
	it("types the JSON columns of a saved row", () => {
		const content = parseSavedProject({
			script: "<scene />",
			store: { videoSettings: { aspectRatio: "9:16" } },
			generation: { el1: snapshot },
		});

		expect(content.script).toBe("<scene />");
		expect(content.store.videoSettings.aspectRatio).toBe("9:16");
		expect(content.generation.el1).toEqual(snapshot);
	});

	it("throws on a structurally wrong row", () => {
		expect(() =>
			parseSavedProject({ script: null, store: {}, generation: {} }),
		).toThrow();
		expect(() =>
			parseSavedProject({
				script: "",
				store: {},
				generation: { el1: { status: "done" } },
			}),
		).toThrow();
	});
});
