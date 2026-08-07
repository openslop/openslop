import dedent from "dedent";
import { requireState } from "@/lib/connectors/plugins";
import type { LLMPlugin } from "@/lib/connectors/types";
import type {
	Metadata,
	MetadataCharacter,
	MetadataVoice,
} from "@/lib/project/types";
import { prependSystemPrompt } from "./system-prompt";

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
	const appearanceLine =
		character.appearance && !character.avatarUploaded
			? `- appearance: ${character.appearance}`
			: "";
	const body = [voiceLines, appearanceLine].filter(Boolean).join("\n");
	return `## ${name}\n\n${body}`;
}

function buildPreamble(metadata: Metadata): string {
	const sections: string[] = [];

	if (metadata.style) {
		sections.push(dedent`
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

export const projectMetadataPlugin: LLMPlugin = {
	name: "projectMetadata",
	beforeGenerate(params, ctx) {
		const { metadata } = requireState(ctx, "projectMetadata");
		return prependSystemPrompt(params, buildPreamble(metadata));
	},
};
