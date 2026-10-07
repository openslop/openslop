import { describe, expect, it } from "vitest";
import { parseProjectContent } from "../projectContent";
import { ScriptSettingsSchema } from "../types";
import { VideoSettingsSchema } from "../videoSettings";

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
			store: { videoSettings: { aspectRatio: "9:16" } },
			generation: { el1: snapshot },
		});

		expect(content.script).toBe("<scene />");
		expect(content.store.videoSettings.aspectRatio).toBe("9:16");
		expect(content.generation.el1).toEqual(snapshot);
	});

	it("fills a fresh row's empty store", () => {
		const content = parseProjectContent({
			script: "",
			store: {},
			generation: {},
		});

		expect(content.store).toEqual({
			title: "",
			videoSettings: VideoSettingsSchema.parse({}),
			scriptSettings: ScriptSettingsSchema.parse({}),
			models: {},
		});
		expect(content.generation).toEqual({});
	});

	it("opens a row saved before snapshots carried pinned", () => {
		const { pinned: _, ...legacy } = snapshot;
		const content = parseProjectContent({
			script: "",
			store: {},
			generation: { el1: legacy },
		});

		expect(content.generation.el1).toEqual(snapshot);
	});

	it("opens a result generated before inputs carried dependencies", () => {
		const { pinned: _, ...legacy } = snapshot;
		const result = { durationSec: 0, imageUrl: "a.png" };
		const attributes = { style: "noir" };
		const content = parseProjectContent({
			script: "",
			store: {},
			generation: {
				el1: {
					...legacy,
					result,
					connectorType: "image",
					resultInputs: { prompt: "a sunset", attributes, reads: {} },
				},
			},
		});

		expect(content.generation.el1).toEqual({
			...snapshot,
			result,
			connectorType: "image",
			resultInputs: {
				prompt: "a sunset",
				attributes,
				reads: {},
				dependencies: {},
			},
		});
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
