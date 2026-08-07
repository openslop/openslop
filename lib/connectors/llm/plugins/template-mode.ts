import dedent from "dedent";
import type { LLMPlugin } from "@/lib/connectors/types";
import { getTemplate } from "@/lib/templates/templates";
import { prependSystemPrompt } from "./system-prompt";

export function createTemplateModePlugin(templateId: string): LLMPlugin {
	return {
		name: "templateMode",
		beforeGenerate(params) {
			return prependSystemPrompt(params, getTemplate(templateId).systemPrompt);
		},
		async transformPrompt(prompt: string) {
			return dedent`Pastiche this story format (with tone, language, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${prompt}</user_input>.

				Example story: ${getTemplate(templateId).exampleText}`;
		},
	};
}
