import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { requireGateway } from "@/lib/connectors/plugins";
import { prependSystemPrompt } from "./system-prompt";

const STORY_MODE_SYSTEM_PROMPT = dedent`You are a highly engaging storyteller who expertly narrates video stories.

	Storywriting guidelines:
	- The story must be mostly told through character dialogue and action.
	- When introducing a character, the narration should mention who they are and what they are doing in the scene.`;

export const storyModePlugin: LLMPlugin = {
	name: "storyMode",
	beforeGenerate(params) {
		return prependSystemPrompt(params, STORY_MODE_SYSTEM_PROMPT);
	},
	async transformPrompt(
		prompt: string,
		ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
	) {
		const gateway = requireGateway(ctx, "story-mode");
		const { text: outline } = await gateway.generate({
			prompt: dedent`Outline an engaging story with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${prompt}. Write the outline in the same language as that input. Do not write anything else, just the outline.`,
			maxTokens: 8192,
		});
		return dedent`Write a complete, engaging, and simple story for a 5th-grade reading level, in the same language as the following outline: ${outline}`;
	},
};
