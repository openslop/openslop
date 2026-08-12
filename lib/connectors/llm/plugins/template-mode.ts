import dedent from "dedent";
import type { LLMPlugin } from "@/lib/connectors/types";
import { getTemplate } from "@/lib/templates/templates";
import { spokenLanguage } from "./language-prompt";
import { prependSystemPrompt } from "./system-prompt";

export function createTemplateModePlugin(templateId: string): LLMPlugin {
	return {
		name: "templateMode",
		beforeGenerate(params) {
			return prependSystemPrompt(params, getTemplate(templateId).systemPrompt);
		},
		async transformPrompt(prompt: string, ctx) {
			const language = spokenLanguage(
				ctx?.state?.metadata,
				"the same language that the user_input is in",
			);
			return dedent`Pastiche this story format (with tone, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${prompt}</user_input>. Write the story in ${language}.

				Example story: ${getTemplate(templateId).exampleText}`;
		},
	};
}
