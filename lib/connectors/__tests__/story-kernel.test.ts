import { describe, expect, it } from "vitest";
import { BaseProvider } from "@/lib/providers/base";
import { storyModePlugin } from "../plugins/story-mode";
import type {
  LLMGenerateParams,
  LLMGenerateResult,
  PluginContext,
} from "../types";

class MockLLMProvider extends BaseProvider<
  LLMGenerateParams,
  LLMGenerateResult
> {
  async generate(): Promise<LLMGenerateResult> {
    return {
      text: "A brave knight rescues a dragon who turns out to be friendly.",
      model: "test",
    };
  }
}

describe("storyModePlugin", () => {
  it("calls provider to generate a story outline and rewrites the prompt", async () => {
    const provider = new MockLLMProvider();
    const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = {
      provider,
    };

    const result = await storyModePlugin.transformPrompt!(
      "a knight and a dragon",
      ctx,
    );

    expect(result).toContain(
      "A brave knight rescues a dragon who turns out to be friendly.",
    );
    expect(result).toContain("5th-grade reading level");
  });

  it("throws when no context is provided", async () => {
    await expect(storyModePlugin.transformPrompt!("test")).rejects.toThrow(
      "story mode plugin requires provider context",
    );
  });
});
