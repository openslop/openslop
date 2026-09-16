import { describe, expect, it } from "vitest";
import { parseProjectContent } from "../projectContent";

const snapshot = {
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	pinned: false,
};

describe("parseProjectContent", () => {
	it("types the JSON columns of a saved row", () => {
		const content = parseProjectContent({
			script: "<scene />",
			store: { metadata: { title: "T" }, referenceImages: ["a.png"] },
			generation: { el1: snapshot },
		});

		expect(content.script).toBe("<scene />");
		expect(content.store.metadata.title).toBe("T");
		expect(content.store.referenceImages).toEqual(["a.png"]);
		expect(content.generation.el1).toEqual(snapshot);
	});

	it("fills a fresh row's empty store", () => {
		const content = parseProjectContent({
			script: "",
			store: {},
			generation: {},
		});

		expect(content.store.referenceImages).toEqual([]);
		expect(content.generation).toEqual({});
	});

	it("throws on a structurally wrong row", () => {
		expect(() =>
			parseProjectContent({ script: null, store: {}, generation: {} }),
		).toThrow();
		expect(() =>
			parseProjectContent({
				script: "",
				store: {},
				generation: { el1: { status: "done" } },
			}),
		).toThrow();
	});
});
