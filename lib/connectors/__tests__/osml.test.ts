import { describe, expect, it } from "vitest";
import { osmlPlugin } from "../plugins/osml";

describe("osmlPlugin", () => {
  it("injects systemPrompt when none provided", () => {
    const params = { prompt: "hello" };
    const result = osmlPlugin.beforeGenerate!(params);
    expect(result).toHaveProperty("systemPrompt");
    expect((result as { systemPrompt: string }).systemPrompt).toBeTruthy();
  });

  it("preserves existing systemPrompt", () => {
    const params = { prompt: "hello", systemPrompt: "custom" };
    const result = osmlPlugin.beforeGenerate!(params);
    expect((result as { systemPrompt: string }).systemPrompt).toBe("custom");
  });
});
