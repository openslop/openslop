import dedent from "dedent";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { getProjectStore } from "@/lib/project/store";
import type {
	Metadata,
	MetadataCharacter,
	MetadataVoice,
} from "@/lib/project/types";
import { getTemplateById } from "@/lib/templates/templates";
import { compact } from "lodash";

const VOICE_FIELDS: (keyof MetadataVoice)[] = [
	"gender",
	"age",
	"pitch",
	"accent",
	"language",
	"description",
];

function renderVoice(voice: MetadataVoice): string {
	const lines = VOICE_FIELDS.flatMap((field) => {
		const value = voice[field];
		return value ? [`- ${field}: ${value}`] : [];
	});
	return lines.join("\n");
}

function renderCharacter(name: string, character: MetadataCharacter): string {
	const voiceLines = renderVoice(character);
	const appearanceLine = character.appearance
		? `- appearance: ${character.appearance}`
		: "";
	const body = [voiceLines, appearanceLine].filter(Boolean).join("\n");
	return `## ${name}
	
	${body}`;
}

function buildPreamble(metadata: Metadata): string {
	const sections: string[] = [];

	if (metadata.style) {
		sections.push(`# Art Style\n${metadata.style}`);
	}

	if (metadata.narration) {
		const voice = renderVoice(metadata.narration);
		if (voice)
			sections.push(dedent`# Narration Voice

			${voice}`);
	}

	const characterEntries = Object.entries(metadata.characters ?? {});
	if (characterEntries.length > 0) {
		const blocks = characterEntries.map(([name, character]) =>
			renderCharacter(name, character),
		);
		sections.push(dedent`# Characters

			Include the following characters (and others if needed):

			${blocks.join("\n\n")}`);
	}

	return sections.join("\n\n");
}

export function createTemplateModePlugin(
	projectId: string,
	templateId: string | undefined,
): LLMPlugin {
	const template = templateId ? getTemplateById(templateId) : undefined;

	return {
		name: "templateMode",
		beforeGenerate(params) {
			if (!template) return params;
			const metadata = getProjectStore(projectId).getState().metadata;
			const segments = compact([
				buildPreamble(metadata),
				template.systemPrompt,
				params.systemPrompt,
			]);
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
