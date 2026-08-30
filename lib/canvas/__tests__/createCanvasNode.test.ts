import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => ({
		defaultAttributes: type === "sfx" ? { loops: "1" } : {},
		keys: [],
	}),
}));

import { createCanvasNode } from "../createCanvasNode";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/video/elementAttributes";

const ZWSP = "​";

describe("createCanvasNode", () => {
	it("backfills defaultAttributes for sound (loops=1)", () => {
		const node = createCanvasNode("sound");
		expect(flatAttributes(node).loops).toBe("1");
	});

	it("caller-supplied attrs override defaults", () => {
		const node = createCanvasNode("sound", {
			attrs: { loops: "3" },
		});
		expect(flatAttributes(node).loops).toBe("3");
	});

	it("merges defaults under caller attrs (caller wins, defaults fill gaps)", () => {
		const node = createCanvasNode("sound", {
			attrs: { effect: "thunder" },
		});
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			effect: "thunder",
		});
	});

	it("takes the catalog's default model", () => {
		const node = createCanvasNode("narration");
		expect(flatAttributes(node).model).toBe(MODEL_CATALOGS.tts.defaultModel);
	});

	// The provider is resolved from the model wherever it is needed.
	it("stores no provider of its own", () => {
		expect(flatAttributes(createCanvasNode("narration"))).not.toHaveProperty(
			"provider",
		);
	});

	it("takes the model the project configured for the connector type", () => {
		const node = createCanvasNode("narration", {
			projectModels: { tts: "Slop TTS v1" },
		});
		expect(flatAttributes(node).model).toBe("Slop TTS v1");
	});

	// A project can name a model that has since been retired.
	it("falls back to the catalog when the project names an unknown model", () => {
		const node = createCanvasNode("narration", {
			projectModels: { tts: "Retired v0" },
		});
		expect(flatAttributes(node).model).toBe(MODEL_CATALOGS.tts.defaultModel);
	});

	it("keeps a caller-supplied model over the project's", () => {
		const node = createCanvasNode("image", {
			attrs: { model: "Slop Image v1" },
			projectModels: { image: "Retired v0" },
		});
		expect(flatAttributes(node).model).toBe("Slop Image v1");
	});

	// Pasted OSML can name a model from another connector's catalog.
	it("falls back to the catalog when the caller names an unknown model", () => {
		const node = createCanvasNode("image", {
			attrs: { model: MODEL_CATALOGS.video.defaultModel },
		});
		expect(flatAttributes(node).model).toBe(MODEL_CATALOGS.image.defaultModel);
	});

	it("preserves provided id", () => {
		const node = createCanvasNode("image", { id: "abc" });
		expect(node.id).toBe("abc");
	});

	it("generates a fresh id when none provided", () => {
		const node = createCanvasNode("image");
		expect(node.id).toBeTruthy();
		expect(typeof node.id).toBe("string");
	});

	it("creates [ZWSP, text] children with trimmed text", () => {
		const node = createCanvasNode("narration", {
			text: "  hello  ",
		});
		expect(node.children).toHaveLength(2);
		expect(node.children[0].text).toBe(ZWSP);
		expect(node.children[1].text).toBe("hello");
	});

	it("defaults text child to empty string", () => {
		const node = createCanvasNode("narration");
		expect(node.children[1].text).toBe("");
	});
});
