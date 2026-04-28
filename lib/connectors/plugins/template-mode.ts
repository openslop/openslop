import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "../types";

export function createTemplateModePlugin(templateId: string | null): LLMPlugin {
	const loadContent = async () => {
		if (!templateId) return undefined;
		const { getTemplateContent } = await import("@/lib/templates/content");
		return getTemplateContent(templateId);
	};

	return {
		name: "templateMode",
		async beforeGenerate(params) {
			const content = await loadContent();
			if (!content?.systemPrompt) return params;
			return {
				...params,
				systemPrompt: params.systemPrompt
					? `${content.systemPrompt}\n\n${params.systemPrompt}`
					: content.systemPrompt,
			};
		},
		async transformPrompt(
			prompt: string,
			ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
		) {
			const content = await loadContent();
			if (!content) return prompt;

			if (!ctx?.gateway)
				throw new Error("template mode plugin requires gateway context");

			return dedent`Pastiche this story format (with tone, language, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about ${prompt}.

				Example story: ${content.exampleText}`;
		},
	};
}
