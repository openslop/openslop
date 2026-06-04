import dedent from "dedent";
import type { LLMPlugin } from "@/lib/connectors/types";
import { getProjectStore } from "@/lib/project/store";
import type {
	Metadata,
	MetadataCharacter,
	MetadataVoice,
} from "@/lib/project/types";
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
	return `## ${name}\n\n${body}`;
}

function buildPreamble(metadata: Metadata): string {
	const sections: string[] = [];

	if (metadata.style) {
		sections.push(`
			# Art Style

			Below is the exact art style description for the story. Do not change it.

			${metadata.style}`);
	}

	if (metadata.narration) {
		const voice = renderVoice(metadata.narration);
		if (voice)
			sections.push(dedent`
				# Narration Voice

				Below is the exact voice description for the narrator. Do not change it.

				${voice}`);
	}

	const characterEntries = Object.entries(metadata.characters ?? {});
	if (characterEntries.length > 0) {
		const blocks = characterEntries.map(([name, character]) =>
			renderCharacter(name, character),
		);
		sections.push(dedent`
			# Characters

			Include the following characters exactly (and others if needed). Do not modify any of the below attributes of these characters (including the name):

			${blocks.join("\n\n")}`);
	}

	return sections.join("\n\n");
}

export function createProjectMetadataPlugin(projectId: string): LLMPlugin {
	return {
		name: "projectMetadata",
		beforeGenerate(params) {
			const metadata = getProjectStore(projectId).getState().metadata;
			const preamble = buildPreamble(metadata);
			if (!preamble) return params;
			return {
				...params,
				systemPrompt: compact([preamble, params.systemPrompt]).join("\n\n"),
			};
		},
	};
}
