import { describe, expect, it } from "vitest";
import { ANIMATED_IMAGE_ATTRIBUTES } from "@/lib/connectors/animated_image/attributes";
import { IMAGE_ATTRIBUTES } from "@/lib/connectors/image/attributes";
import { DEFAULT_IMAGE_MODEL } from "@/lib/connectors/image/models";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { TTS_ATTRIBUTES } from "@/lib/connectors/tts/attributes";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createCanvasNode } from "../createCanvasNode";
import { elementSchema, resolveElementConnector } from "../elementConnector";
import type { CanvasContentElement } from "../types";
import { splitAttributes } from "@/lib/video/elementAttributes";

function element(
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "n1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [],
	};
}

const registry = DEFAULT_CONNECTOR_REGISTRY;
const imageDefaults = registry.image;

describe("resolveElementConnector", () => {
	it("maps the element type to its connector type", () => {
		expect(resolveElementConnector(element("narration"), registry).type).toBe(
			"tts",
		);
		expect(
			resolveElementConnector(element("animated_image"), registry).type,
		).toBe("animated_image");
	});

	it("falls back to the recommendation when nothing is pinned", () => {
		expect(resolveElementConnector(element("image"), registry)).toEqual({
			type: "image",
			model: DEFAULT_IMAGE_MODEL,
			config: imageDefaults,
		});
	});

	it("keeps a pinned model over the recommendation", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" };
		expect(
			resolveElementConnector(element("image", pinned), registry).model,
		).toEqual(pinned);
	});

	it("falls back when the pinned provider no longer serves the model", () => {
		const { model, config } = resolveElementConnector(
			element("image", { provider: "retired-vendor", model: "Slop Image v1" }),
			registry,
		);
		expect(model).toEqual(DEFAULT_IMAGE_MODEL);
		expect(config).toBe(imageDefaults);
	});
});

describe("resolveElementConnector for speech", () => {
	it("takes the element's own pair, like any other type", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.5" };
		expect(
			resolveElementConnector(element("narration", pinned), registry).model,
		).toEqual(pinned);
	});

	it("falls back to the recommendation when the element names no model", () => {
		expect(
			resolveElementConnector(element("character"), registry).model,
		).toEqual(DEFAULT_MODELS.tts);
	});
});

describe("createCanvasNode", () => {
	it("stores the resolved pair, so the element names its own provider", () => {
		const node = createCanvasNode("image", {
			attrs: { provider: "retired-vendor" },
		});

		expect(resolveElementConnector(node, registry).model).toEqual(
			DEFAULT_IMAGE_MODEL,
		);
		expect(resolveElementConnector(node, registry).config).toBe(imageDefaults);
	});
});

describe("elementSchema", () => {
	it("resolves the connector type's schema from the element's own attributes", () => {
		expect(elementSchema(element("image")).keys).toEqual(IMAGE_ATTRIBUTES.keys);
		expect(elementSchema(element("animated_image")).keys).toEqual(
			ANIMATED_IMAGE_ATTRIBUTES.keys,
		);
		expect(elementSchema(element("narration")).keys).toEqual(
			TTS_ATTRIBUTES.keys,
		);
	});
});
