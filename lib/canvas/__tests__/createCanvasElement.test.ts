import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = type === "sfx" ? { loops: "1" } : {};
		return {
			defaultAttributes,
			resolve: (attrs: Record<string, string>) => ({
				...defaultAttributes,
				...attrs,
			}),
		};
	},
}));

import { createCanvasElement } from "../createCanvasElement";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";

const ZWSP = "​";

describe("createCanvasElement", () => {
	it("backfills defaultAttributes for sound (loops=1)", () => {
		const node = createCanvasElement("sound");
		expect(flatAttributes(node).loops).toBe("1");
	});

	it("caller-supplied attrs override defaults", () => {
		const node = createCanvasElement("sound", {
			attrs: { loops: "3" },
		});
		expect(flatAttributes(node).loops).toBe("3");
	});

	it("merges defaults under caller attrs (caller wins, defaults fill gaps)", () => {
		const node = createCanvasElement("sound", {
			attrs: { effect: "thunder" },
		});
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			effect: "thunder",
		});
	});

	it("takes the recommended model, provider and name", () => {
		const node = createCanvasElement("sound");
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.sfx);
	});

	it("takes the model the project configured for the connector type", () => {
		const pinned = {
			provider: "elevenlabs",
			model: "Eleven Text to Sound v2",
		} as const;
		const node = createCanvasElement("sound", {
			defaultModels: { sfx: pinned },
		});
		expect(flatAttributes(node)).toMatchObject(pinned);
	});

	// A project can name a model that has since been retired.
	it("falls back to the recommendation when the project names an unknown model", () => {
		const node = createCanvasElement("sound", {
			defaultModels: { sfx: { provider: "openslop", model: "Retired v0" } },
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.sfx);
	});

	it("gives speech a model of its own, like every other type", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const node = createCanvasElement("narration", {
			defaultModels: { tts: pinned },
		});
		expect(flatAttributes(node)).toMatchObject(pinned);
	});

	it("keeps a caller-supplied model over the project's", () => {
		const node = createCanvasElement("image", {
			attrs: { provider: "runware", model: "Seedream 5 Lite" },
			defaultModels: { image: { provider: "openslop", model: "Retired v0" } },
		});
		expect(flatAttributes(node)).toMatchObject({
			provider: "runware",
			model: "Seedream 5 Lite",
		});
	});

	// A name is only meaningful on its own provider.
	it("falls back to the recommendation when the caller pairs a model with the wrong provider", () => {
		const node = createCanvasElement("image", {
			attrs: { provider: "openslop", model: "Seedream 5 Lite" },
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.image);
	});

	it("falls back to the recommendation when the caller names an unknown model", () => {
		const node = createCanvasElement("image", {
			attrs: DEFAULT_MODELS.video,
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.image);
	});

	it("preserves provided id", () => {
		const node = createCanvasElement("image", { id: "abc" });
		expect(node.id).toBe("abc");
	});

	it("generates a fresh id when none provided", () => {
		const node = createCanvasElement("image");
		expect(node.id).toBeTruthy();
		expect(typeof node.id).toBe("string");
	});

	it("creates [ZWSP, text] children with trimmed text", () => {
		const node = createCanvasElement("narration", {
			text: "  hello  ",
		});
		expect(node.children).toHaveLength(2);
		expect(node.children[0].text).toBe(ZWSP);
		expect(node.children[1].text).toBe("hello");
	});

	it("defaults text child to empty string", () => {
		const node = createCanvasElement("narration");
		expect(node.children[1].text).toBe("");
	});

	it("gives an avatar an image model, and the art style none", () => {
		const avatar = createCanvasElement("asset_avatar", {
			attrs: { name: "Mia" },
		});
		const style = createCanvasElement("asset_style");

		expect(flatAttributes(avatar)).toMatchObject(DEFAULT_MODELS.image);
		expect(flatAttributes(style)).toEqual({});
	});
});
