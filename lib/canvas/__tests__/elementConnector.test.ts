import { describe, expect, it } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createCanvasNode } from "../createCanvasNode";
import {
	resolveElementConnector,
	resolveElementSchema,
} from "../elementConnector";
import type { CanvasContentElement } from "../types";
import { flatAttributes, splitAttributes } from "@/lib/video/elementAttributes";

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
			model: imageDefaults.defaultModel,
			config: imageDefaults,
		});
	});

	it("keeps a pinned model over the connector default", () => {
		const pinned = imageDefaults.models[1] ?? imageDefaults.models[0];
		expect(
			resolveElementConnector(element("image", { model: pinned }), registry)
				.model,
		).toBe(pinned);
	});

	it("uses a pinned provider that is still registered", () => {
		const { provider, config } = resolveElementConnector(
			element("image", { provider: "openslop" }),
			registry,
		);
		expect(provider).toBe("openslop");
		expect(config).toBe(imageDefaults);
	});
});

// resolveElementConnector trusts the pin, so the guarantee that a pin is always
// a registry provider has to hold where elements are made.
describe("createCanvasNode", () => {
	it("overwrites an incoming provider with the registry's own", () => {
		const node = createCanvasNode("image", registry, {
			attrs: { provider: "retired-vendor" },
		});

		expect(flatAttributes(node).provider).toBe("openslop");
		expect(resolveElementConnector(node, registry).config).toBe(imageDefaults);
	});
});

describe("resolveElementSchema", () => {
	it("resolves the schema for an element with no pin", () => {
		expect(resolveElementSchema(element("image"), registry)).toEqual(
			resolveElementSchema(
				element("image", { provider: "openslop" }),
				registry,
			),
		);
	});
});
