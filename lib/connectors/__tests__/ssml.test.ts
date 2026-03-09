import { describe, expect, it } from "vitest";
import { ssmlPlugin } from "../plugins/ssml";

describe("ssmlPlugin", () => {
  it("injects systemPrompt when none provided", () => {
    const params = { prompt: "hello" };
    const result = ssmlPlugin.beforeGenerate!(params);
    expect(result).toHaveProperty("systemPrompt");
    expect((result as { systemPrompt: string }).systemPrompt).toBeTruthy();
  });

  it("preserves existing systemPrompt", () => {
    const params = { prompt: "hello", systemPrompt: "custom" };
    const result = ssmlPlugin.beforeGenerate!(params);
    expect((result as { systemPrompt: string }).systemPrompt).toBe("custom");
  });
});
