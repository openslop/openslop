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
			"provider",
			"model",
			"referenceImagesOverride",
			"motion",
		]);
		expect(
			resolveAttributeSchema("animated_image", DEFAULT_MODELS.animated_image)
				.keys,
		).toEqual([
			"provider",
			"model",
			"stillProvider",
			"stillModel",
			"referenceImagesOverride",
			"videoPrompt",
			"duration",
			"motion",
		]);
	});

	// Speech inherits its model from the voice in metadata, so tts declares none.
	it("offers every other asset connector's models as a badge, defaulted to the recommendation", () => {
		for (const type of ASSET_CONNECTOR_TYPES.filter((t) => t !== "tts")) {
			const schema = resolveAttributeSchema(type, DEFAULT_MODELS[type]);

			expect(schema.badgeAttributes.model?.edit).toEqual({
				kind: "model",
				connector: type,
				providerKey: "provider",
			});
			expect(schema.badgeAttributes.provider).toBeUndefined();
			expect(schema.settingsAttributes.provider).toBeUndefined();
			expect(schema.defaultAttributes).toMatchObject(DEFAULT_MODELS[type]);
		}
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", DEFAULT_MODELS.llm).keys).toEqual([]);
	});
});
