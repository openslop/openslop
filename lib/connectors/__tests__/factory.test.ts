import { describe, expect, it } from "vitest";
import { createConnector } from "../factory";
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
