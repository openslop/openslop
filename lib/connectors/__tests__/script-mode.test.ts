import { describe, expect, it } from "vitest";
import { scriptModePlugin } from "../plugins/script-mode";

describe("scriptModePlugin", () => {
  it("sets systemPrompt when none provided", () => {
    const result = scriptModePlugin.beforeGenerate!({ prompt: "hello" });
    const sys = (result as { systemPrompt: string }).systemPrompt;
    expect(sys).toBeTruthy();
    expect(sys).toContain("script-to-XML converter");
  });

  it("prepends to existing systemPrompt", () => {
    const result = scriptModePlugin.beforeGenerate!({
      prompt: "hello",
      systemPrompt: "custom instructions",
    });
    const sys = (result as { systemPrompt: string }).systemPrompt;
    expect(sys).toContain("script-to-XML converter");
    expect(sys).toContain("custom instructions");
    expect(sys.indexOf("script-to-XML")).toBeLessThan(
      sys.indexOf("custom instructions"),
    );
  });

  it("preserves other params", () => {
    const result = scriptModePlugin.beforeGenerate!({
      prompt: "test",
      model: "claude",
    }) as Record<string, unknown>;
    expect(result.prompt).toBe("test");
    expect(result.model).toBe("claude");
  });

  it("includes key instructions in system prompt", () => {
    const result = scriptModePlugin.beforeGenerate!({ prompt: "x" });
    const sys = (result as { systemPrompt: string }).systemPrompt;
    expect(sys).toContain("ALL CAPS");
    expect(sys).toContain("NARRATOR");
    expect(sys).toContain("stage directions");
  });
});
