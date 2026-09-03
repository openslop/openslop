import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = type === "sfx" ? { loops: "1" } : {};
		return {
			defaultAttributes,
			modelPicks:
				type === "tts"
					? []
					: [
							{
								kind: "model",
								key: "model",
								providerAttr: "provider",
								type,
							},
						],
			resolve: (attrs: Record<string, string>) => ({
				...defaultAttributes,
				...attrs,
			}),
		};
	},
}));

import { createCanvasNode } from "../createCanvasNode";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
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

	it("takes the recommended model, provider and name", () => {
		const node = createCanvasNode("sound");
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.sfx);
	});

	it("takes the model the project configured for the connector type", () => {
		const pinned = {
			provider: "elevenlabs",
			model: "Eleven Text to Sound v2",
		} as const;
		const node = createCanvasNode("sound", {
			defaultModels: { sfx: pinned },
		});
		expect(flatAttributes(node)).toMatchObject(pinned);
	});

	// A project can name a model that has since been retired.
	it("falls back to the recommendation when the project names an unknown model", () => {
		const node = createCanvasNode("sound", {
			defaultModels: { sfx: { provider: "openslop", model: "Retired v0" } },
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.sfx);
	});

	// Speech inherits its model from the voice in project metadata.
	it("gives a narration no model of its own", () => {
		const attrs = flatAttributes(
			createCanvasNode("narration", {
				defaultModels: { tts: DEFAULT_MODELS.tts },
			}),
		);
		expect(attrs.provider).toBeUndefined();
		expect(attrs.model).toBeUndefined();
	});

	it("keeps a caller-supplied model over the project's", () => {
		const node = createCanvasNode("image", {
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
		const node = createCanvasNode("image", {
			attrs: { provider: "openslop", model: "Seedream 5 Lite" },
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.image);
	});

	it("falls back to the recommendation when the caller names an unknown model", () => {
		const node = createCanvasNode("image", {
			attrs: DEFAULT_MODELS.video,
		});
		expect(flatAttributes(node)).toMatchObject(DEFAULT_MODELS.image);
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
