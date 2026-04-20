import { describe, expect, it } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { storyModePlugin } from "../plugins/story-mode";
import type {
  LLMGenerateParams,
  LLMGenerateResult,
  PluginContext,
} from "../types";

class MockLLMGateway extends GatewayClient<
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

const { transformPrompt } = storyModePlugin;
if (!transformPrompt)
  throw new Error("storyModePlugin.transformPrompt is required");

describe("storyModePlugin", () => {
  it("calls gateway to generate a story outline and rewrites the prompt", async () => {
    const gateway = new MockLLMGateway();
    const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = {
      gateway,
    };

    const result = await transformPrompt("a knight and a dragon", ctx);

    expect(result).toContain(
      "A brave knight rescues a dragon who turns out to be friendly.",
    );
    expect(result).toContain("5th-grade reading level");
  });

  it("throws when no context is provided", async () => {
    await expect(transformPrompt("test")).rejects.toThrow(
      "story mode plugin requires gateway context",
    );
  });
});
