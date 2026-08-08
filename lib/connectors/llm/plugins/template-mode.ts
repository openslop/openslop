import dedent from "dedent";
import type { LLMPlugin } from "@/lib/connectors/types";
import { prependSystemPrompt } from "./system-prompt";

/**
 * The prompt payload is ~160KB of prose no UI ever renders, so it is fetched on
 * the first template-mode generation rather than bundled with the editor.
 */
const loadPrompt = async (templateId: string) =>
	(await import("@/lib/templates/prompts")).getTemplatePrompt(templateId);

export function createTemplateModePlugin(templateId: string): LLMPlugin {
	return {
		name: "templateMode",
		async beforeGenerate(params) {
			const { systemPrompt } = await loadPrompt(templateId);
			return prependSystemPrompt(params, systemPrompt);
		},
		async transformPrompt(prompt: string) {
			const { exampleText } = await loadPrompt(templateId);
			return dedent`Pastiche this story format (with tone, language, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${prompt}</user_input>.

				Example story: ${exampleText}`;
		},
	};
}
