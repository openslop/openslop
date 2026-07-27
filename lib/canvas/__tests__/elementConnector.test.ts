import { describe, expect, it } from "vitest";
import set from "lodash/fp/set";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import {
	resolveElementConnector,
	resolveElementSchema,
} from "../elementConnector";
import type { CanvasContentElement } from "../types";

function element(
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return { id: "n1", type, customAttributes, children: [] };
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

	it("falls back to the default when the pinned provider is unregistered", () => {
		const { provider, config } = resolveElementConnector(
			element("image", { provider: "retired-vendor" }),
			registry,
		);
		expect(provider).toBe("openslop");
		expect(config).toBe(imageDefaults);
	});

	it("falls back to the default when the pinned provider is missing from the registry", () => {
		const withoutImageProviders = set("image", {}, registry);
		const { provider } = resolveElementConnector(
			element("image", { provider: "openslop" }),
			set("image.other", imageDefaults, withoutImageProviders),
		);
		expect(provider).toBe("other");
	});
});

describe("resolveElementSchema", () => {
	it("resolves the schema through the fallback provider for unknown pins", () => {
		expect(
			resolveElementSchema(element("image", { provider: "gone" }), registry),
		).toEqual(resolveElementSchema(element("image"), registry));
	});
});
