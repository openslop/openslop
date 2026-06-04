import dedent from "dedent";
import { getProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";

export function createReferenceStylePlugin(projectId: string): LLMPlugin {
	return {
		name: "reference-style",
		async transformPrompt(
			prompt: string,
			ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
		) {
			const referenceImages =
				getProjectStore(projectId).getState().referenceImages;
			if (referenceImages.length === 0) return prompt;
			if (!ctx?.gateway)
				throw new Error("reference-style plugin requires gateway context");
			const { text: style } = await ctx.gateway.generate({
				prompt: dedent`Vividly and concisely describe the visual art style of the attached reference image(s) in 1–2 concise sentences. Include ultra specific detail on character art style and overall art style.`,
				referenceImages,
				maxTokens: 4096,
			});
			return dedent`Art style reference: ${style}

			${prompt}`;
		},
	};
}
