import { describe, expect, it } from "vitest";
import { createConnector, resolveAttributeSchema } from "../factory";
import { DEFAULT_MODELS } from "../models";
import { CONTENT_TYPES } from "@/lib/canvas/types";
import type { ConnectorType } from "../types";

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
			"name",
			"provider",
			"model",
			"emotion",
			"speed",
			"volume",
			"trimStart",
			"timelineDuration",
		]);
	});

	it("resolves distinct schemas for image vs video", () => {
		expect(resolveAttributeSchema("image", DEFAULT_MODELS.image).keys).toEqual([
			"provider",
			"model",
			"referenceImagesOverride",
			"resolution",
			"format",
			"motion",
		]);
		expect(resolveAttributeSchema("video", DEFAULT_MODELS.video).keys).toEqual([
			"provider",
			"model",
			"startFrame",
			"continuity",
			"uploadedFrame",
			"referenceImagesOverride",
			"resolution",
			"duration",
			"loop",
			"volume",
			"motion",
			"trimStart",
			"timelineDuration",
		]);
	});

	it("carries the model pair on every connector content generates with", () => {
		for (const { connector } of Object.values(CONTENT_TYPES)) {
			const schema = resolveAttributeSchema(
				connector,
				DEFAULT_MODELS[connector],
			);
			expect(schema.keys).toEqual(
				expect.arrayContaining(["provider", "model"]),
			);
		}
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", DEFAULT_MODELS.llm).keys).toEqual([]);
	});
});
