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

	it("resolves distinct schemas for image vs video", () => {
		expect(resolveAttributeSchema("image", DEFAULT_MODELS.image).keys).toEqual([
			"referenceImagesOverride",
			"format",
			"motion",
		]);
		expect(resolveAttributeSchema("video", DEFAULT_MODELS.video).keys).toEqual([
			"startFrame",
			"uploadedFrame",
			"referenceImagesOverride",
			"resolution",
			"duration",
			"trimToDialogue",
			"loop",
			"volume",
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

	// A voice picks its model in its own editor, so speech shows no control of its own.
	it("hides the model control on speech alone", () => {
		for (const type of ASSET_CONNECTOR_TYPES) {
			expect(
				resolveAttributeSchema(type, DEFAULT_MODELS[type]).hidesModel,
			).toBe(type === "tts");
		}
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", DEFAULT_MODELS.llm).keys).toEqual([]);
	});
});
