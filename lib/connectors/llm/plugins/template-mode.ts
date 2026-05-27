import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";
import { getTemplateById, type Template } from "@/lib/templates/templates";

const VOICE_TRAIT_KEYS = [
	"gender",
	"age",
	"pitch",
	"accent",
	"description",
	"language",
] as const satisfies readonly (keyof MetadataVoice)[];

function formatVoiceTraits(voice: MetadataVoice): string {
	return VOICE_TRAIT_KEYS.filter((key) => voice[key])
		.map((key) => `- ${key}: ${voice[key]}`)
		.join("\n");
}

function formatCharacter(name: string, character: MetadataCharacter): string {
	const lines = [`${name}:`];
	if (character.appearance) lines.push(`- appearance: ${character.appearance}`);
	const traits = formatVoiceTraits(character);
	if (traits) lines.push(traits);
	return lines.join("\n");
}

function buildPreamble(template: Template): string {
	const sections: string[] = [];

	if (template.artStyle) {
		sections.push(dedent`
			The art style is pre-configured. Use this style for metadata — do not deviate from it or invent a different style:
			${template.artStyle}
		`);
	}

	if (template.narration) {
		const traits = formatVoiceTraits(template.narration);
		if (traits) {
			sections.push(dedent`
				The narrator is pre-configured. Use these traits exactly — do not introduce a different narrator or change their voice:
				${traits}
			`);
		}
	}

	const characters = Object.entries(template.characters);
	if (characters.length > 0) {
		const block = characters
			.map(([name, character]) => formatCharacter(name, character))
			.join("\n\n");
		sections.push(dedent`
			The following characters are pre-configured. Use them as-is — do not invent new characters or change their traits:

			${block}
		`);
	}

	if (template.systemPrompt) sections.push(template.systemPrompt);

	return sections.join("\n\n");
}

export function createTemplateModePlugin(
	templateId: string | undefined,
): LLMPlugin {
	const template = templateId ? getTemplateById(templateId) : undefined;
	const preamble = template ? buildPreamble(template) : "";

	return {
		name: "templateMode",
		beforeGenerate(params) {
			if (!preamble) return params;
			return {
				...params,
				systemPrompt: params.systemPrompt
					? `${preamble}\n\n${params.systemPrompt}`
					: preamble,
			};
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
