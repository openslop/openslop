import dedent from "dedent";
import type {
  LLMGenerateParams,
  LLMGenerateResult,
  LLMPlugin,
  PluginContext,
} from "../types";

export const storyKernelPlugin: LLMPlugin = {
  name: "storyKernel",
  async transformPrompt(
    prompt: string,
    ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
  ) {
    if (!ctx) throw new Error("kernel plugin requires provider context");
    const { text: kernel } = await ctx.provider.generate({
      prompt: dedent`Briefly outline an engaging story with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${prompt}`,
    });
    return dedent`Write a complete, engaging, and simple story for a 5th-grade reading level about the following: ${kernel}`;
  },
};
