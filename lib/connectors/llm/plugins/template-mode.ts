import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { getTemplateById } from "@/lib/templates/templates";
import { compact } from "lodash";

export function createTemplateModePlugin(
	templateId: string | undefined,
): LLMPlugin {
	const template = templateId ? getTemplateById(templateId) : undefined;

	return {
		name: "templateMode",
		beforeGenerate(params) {
			if (!template) return params;
			const segments = compact([template.systemPrompt, params.systemPrompt]);
			if (segments.length === 0) return params;
			return { ...params, systemPrompt: segments.join("\n\n") };
		},
		async transformPrompt(
			prompt: string,
			ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
		) {
			if (!template) return prompt;

			if (!ctx?.gateway)
				throw new Error("template mode plugin requires gateway context");

			return dedent`Pastiche this story format (with tone, language, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about ${prompt}.

				Example story: ${template.exampleText}`;
		},
	};
}
