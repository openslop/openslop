import { describe, expect, it } from "vitest";
import {
	createConnector,
	isKnownProvider,
	resolveAttributeSchema,
} from "../factory";
import type { ConnectorType } from "../types";

const stubConfig = {
	defaultModel: "test-model",
	models: ["test-model"],
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

	it("creates all connector types", () => {
		const types: ConnectorType[] = [
			"llm",
			"music",
			"sfx",
			"image",
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
			"emotion",
			"speed",
			"volume",
			"captions",
		]);
	});

	it("resolves distinct schemas for image vs animated_image despite sharing runtime type", () => {
		expect(resolveAttributeSchema("image", "openslop").keys).toEqual([
			"motion",
		]);
		expect(resolveAttributeSchema("animated_image", "openslop").keys).toEqual([
			"videoPrompt",
			"duration",
			"motion",
		]);
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

describe("isKnownProvider", () => {
	it("is true for a registered provider", () => {
		expect(isKnownProvider("tts", "openslop")).toBe(true);
	});

	it("is false for a provider with no registered constructor", () => {
		expect(isKnownProvider("tts", "nonexistent")).toBe(false);
	});
});
