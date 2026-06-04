import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";

export const storyModePlugin: LLMPlugin = {
	name: "storyMode",
	beforeGenerate(params) {
		return {
			...params,
			systemPrompt: dedent`You are a highly engaging storyteller who expertly narrates video stories.
			
			Storywriting guidelines:
			- The story must be mostly told through character dialogue and action.
			- When introducing a character, the narration should mention who they are and what they are doing in the scene.
	
			${params.systemPrompt}`,
		};
	},
	async transformPrompt(
		prompt: string,
		ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
	) {
		if (!ctx?.gateway)
			throw new Error("story mode plugin requires gateway context");
		const { text: outline } = await ctx.gateway.generate({
			prompt: dedent`Briefly outline an engaging story with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${prompt}. Do not write anything else, just the outline.`,
		});
		return dedent`Write a super short, complete, engaging, and simple story for a 5th-grade reading level about the following: ${outline}`;
	},
};
