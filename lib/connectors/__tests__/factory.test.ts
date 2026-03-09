import { describe, expect, it } from "vitest";
import { createConnector } from "../factory";
import type { ConnectorType } from "../types";

const stubConfig = { provider: "openslop", apiKey: "test-key" };

describe("createConnector", () => {
  it("creates a valid LLM connector", () => {
    const connector = createConnector("llm", stubConfig);
    expect(connector.type).toBe("llm");
  });

  it("throws for unknown provider", () => {
    expect(() =>
      createConnector("llm", { provider: "nonexistent", apiKey: "" }),
    ).toThrow('Unknown provider "nonexistent" for type "llm"');
  });

  it("falls back to default provider when provider is empty", () => {
    const connector = createConnector("llm", { provider: "", apiKey: "" });
    expect(connector.type).toBe("llm");
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
      const connector = createConnector(type, stubConfig);
      expect(connector.type).toBe(type);
    }
  });
});
