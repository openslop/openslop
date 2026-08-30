import { describe, expect, it } from "vitest";
import { createConnector, resolveAttributeSchema } from "../factory";
import { MODEL_CATALOGS } from "../models";
import { DEFAULT_CONNECTOR_REGISTRY, getDefaultConnector } from "../registry";
import { ASSET_CONNECTOR_TYPES, type ConnectorType } from "../types";

const stubConfig = {
	isDefault: true,
	apiKey: "test-key",
};

describe("createConnector", () => {
	it("creates a valid LLM connector", () => {
		const connector = createConnector("llm", "openslop", stubConfig);
		expect(connector.type).toBe("llm");
	});

	it("throws for unknown provider", () => {
		expect(() =>
			createConnector("llm", "nonexistent" as never, stubConfig),
		).toThrow('Unknown provider "nonexistent" for type "llm"');
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
			const connector = createConnector(type, "openslop", stubConfig);
			expect(connector.type).toBe(type);
		}
	});
});

describe("resolveAttributeSchema", () => {
	it("resolves the connector type's base schema, keyed by connector type not element type", () => {
		// narration and character both resolve through "tts" and get the same schema.
		expect(resolveAttributeSchema("tts", "openslop").keys).toEqual([
			"model",
			"emotion",
			"speed",
			"volume",
		]);
	});

	it("resolves distinct schemas for image vs animated_image", () => {
		expect(resolveAttributeSchema("image", "openslop").keys).toEqual([
			"model",
			"referenceImagesOverride",
			"motion",
		]);
		expect(resolveAttributeSchema("animated_image", "openslop").keys).toEqual([
			"model",
			"stillModel",
			"referenceImagesOverride",
			"videoPrompt",
			"duration",
			"motion",
		]);
	});

	it("offers every asset connector's own catalog as a badge, defaulted", () => {
		for (const type of ASSET_CONNECTOR_TYPES) {
			const { provider } = getDefaultConnector(
				DEFAULT_CONNECTOR_REGISTRY,
				type,
			);
			const catalog = MODEL_CATALOGS[type];
			const schema = resolveAttributeSchema(type, provider);

			expect(schema.badgeAttributes.model?.edit).toEqual({
				kind: "enum",
				options: catalog.names,
			});
			expect(schema.defaultAttributes.model).toBe(catalog.defaultModel);
		}
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", "openslop").keys).toEqual([]);
	});

	it("throws for unknown provider", () => {
		expect(() => resolveAttributeSchema("tts", "nonexistent" as never)).toThrow(
			'Unknown provider "nonexistent" for type "tts"',
		);
	});
});
