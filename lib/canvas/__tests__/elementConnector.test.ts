import { describe, expect, it } from "vitest";
import { ANIMATED_IMAGE_ATTRIBUTES } from "@/lib/connectors/animated_image/attributes";
import { IMAGE_ATTRIBUTES } from "@/lib/connectors/image/attributes";
import { IMAGE_MODELS } from "@/lib/connectors/image/models";
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
		...splitAttributes({ provider: "openslop", ...customAttributes }),
		children: [],
	};
}

const registry = DEFAULT_CONNECTOR_REGISTRY;
const imageDefaults = registry.image.openslop;

describe("resolveElementConnector", () => {
	it("maps the element type to its connector type", () => {
		expect(resolveElementConnector(element("narration"), registry).type).toBe(
			"tts",
		);
		expect(
			resolveElementConnector(element("animated_image"), registry).type,
		).toBe("animated_image");
	});

	it("falls back to the registry default when nothing is pinned", () => {
		expect(resolveElementConnector(element("image"), registry)).toEqual({
			type: "image",
			provider: "openslop",
			model: IMAGE_MODELS.defaultModel,
			config: imageDefaults,
		});
	});

	it("keeps a pinned model over the connector default", () => {
		const [pinned] = IMAGE_MODELS.names;
		expect(
			resolveElementConnector(element("image", { model: pinned }), registry)
				.model,
		).toBe(pinned);
	});

	it("derives the provider from the model, ignoring a stored one", () => {
		const { provider, config } = resolveElementConnector(
			element("image", { provider: "retired-vendor" }),
			registry,
		);
		expect(provider).toBe(IMAGE_MODELS.providerFor(undefined));
		expect(config).toBe(imageDefaults);
	});
});

// An element carries no provider of its own, so one a saved project still names
// decides nothing: the model it was created with does.
describe("createCanvasNode", () => {
	it("resolves through the model, whatever provider came in", () => {
		const node = createCanvasNode("image", {
			attrs: { provider: "retired-vendor" },
		});

		expect(resolveElementConnector(node, registry).provider).toBe("openslop");
		expect(resolveElementConnector(node, registry).config).toBe(imageDefaults);
	});
});

describe("elementSchema", () => {
	it("resolves the connector type's schema from the element's own attributes", () => {
		expect(elementSchema(element("image")).keys).toEqual(IMAGE_ATTRIBUTES.keys);
		expect(elementSchema(element("animated_image")).keys).toEqual(
			ANIMATED_IMAGE_ATTRIBUTES.keys,
		);
	});
});
