import { describe, expect, it } from "vitest";
import { BaseProvider } from "@/lib/providers/base";
import { storyKernelPlugin } from "../plugins/story-kernel";
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

describe("storyKernelPlugin", () => {
  it("calls provider to generate a story outline and rewrites the prompt", async () => {
    const provider = new MockLLMProvider();
    const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = {
      provider,
    };

    const result = await storyKernelPlugin.transformPrompt!(
      "a knight and a dragon",
      ctx,
    );

    expect(result).toContain(
      "A brave knight rescues a dragon who turns out to be friendly.",
    );
    expect(result).toContain("5th-grade reading level");
  });

  it("throws when no context is provided", async () => {
    await expect(storyKernelPlugin.transformPrompt!("test")).rejects.toThrow(
      "kernel plugin requires provider context",
    );
  });
});
