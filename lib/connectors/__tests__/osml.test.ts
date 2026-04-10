import { describe, expect, it } from "vitest";
import { osmlPlugin } from "../plugins/osml";

describe("osmlPlugin", () => {
  const beforeGenerate = osmlPlugin.beforeGenerate;
  if (!beforeGenerate) throw new Error("expected beforeGenerate");

  it("injects systemPrompt when none provided", () => {
    const params = { prompt: "hello" };
    const result = beforeGenerate(params);
    expect(result).toHaveProperty("systemPrompt");
    expect((result as { systemPrompt: string }).systemPrompt).toBeTruthy();
  });

  it("preserves existing systemPrompt", () => {
    const params = { prompt: "hello", systemPrompt: "custom" };
    const result = beforeGenerate(params);
    expect((result as { systemPrompt: string }).systemPrompt).toBe("custom");
  });
});
