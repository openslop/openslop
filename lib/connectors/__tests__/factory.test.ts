import { describe, expect, it } from "vitest";
import { createConnector, resolveAttributeSchema } from "../factory";
import { DEFAULT_MODELS } from "../models";
import { ASSET_CONNECTOR_TYPES, type ConnectorType } from "../types";

const stubConfig = {};

describe("createConnector", () => {
	it("creates a valid LLM connector", () => {
		const connector = createConnector("llm", DEFAULT_MODELS.llm, stubConfig);
		expect(connector.type).toBe("llm");
	});

	it("creates all connector types, each reporting the type it was registered under", () => {
		const types: ConnectorType[] = [
			"llm",
			"music",
			"sfx",
			"image",
			"animated_image",
			"tts",
			"video",
		];
		for (const type of types) {
			const connector = createConnector(type, DEFAULT_MODELS[type], stubConfig);
			expect(connector.type).toBe(type);
		}
	});
});

describe("resolveAttributeSchema", () => {
	it("resolves the connector type's base schema, keyed by connector type not element type", () => {
		// narration and character both resolve through "tts" and get the same schema.
		expect(resolveAttributeSchema("tts", DEFAULT_MODELS.tts).keys).toEqual([
			"emotion",
			"speed",
			"volume",
		]);
	});

	it("resolves distinct schemas for image vs animated_image", () => {
		expect(resolveAttributeSchema("image", DEFAULT_MODELS.image).keys).toEqual([
			"referenceImagesOverride",
			"motion",
		]);
		expect(
			resolveAttributeSchema("animated_image", DEFAULT_MODELS.animated_image)
				.keys,
		).toEqual([
			"imageProvider",
			"imageModel",
			"referenceImagesOverride",
			"videoPrompt",
			"duration",
			"motion",
		]);
	});

	// An element's own pair is what picks the schema, so no schema carries it.
	it("keeps the element's own model out of every schema", () => {
		for (const type of ASSET_CONNECTOR_TYPES) {
			const schema = resolveAttributeSchema(type, DEFAULT_MODELS[type]);
			expect(schema.keys).not.toContain("provider");
			expect(schema.keys).not.toContain("model");
		}
	});

	it("resolves the still behind an animated image from the image models", () => {
		const schema = resolveAttributeSchema(
			"animated_image",
			DEFAULT_MODELS.animated_image,
		);
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;

		expect(schema.resolve({}, { image: pinned })).toMatchObject({
			imageProvider: pinned.provider,
			imageModel: pinned.model,
		});
		expect(
			schema.resolve({
				imageProvider: "openslop",
				imageModel: "Seedream 5 Lite",
			}),
		).toMatchObject({
			imageProvider: DEFAULT_MODELS.image.provider,
			imageModel: DEFAULT_MODELS.image.model,
		});
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", DEFAULT_MODELS.llm).keys).toEqual([]);
	});
});
