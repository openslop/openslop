import dedent from "dedent";
import {
	voiceTraitEntries,
	type Metadata,
	type MetadataCharacter,
	type MetadataVoice,
} from "@/lib/project/types";
import { videoLengthBudget } from "@/lib/video/videoLength";

function renderVoice(voice: MetadataVoice): string {
	return voiceTraitEntries(voice)
		.map(([trait, value]) => `- ${trait}: ${value}`)
		.join("\n");
}

function renderCharacter(name: string, character: MetadataCharacter): string {
	const voiceLines = renderVoice(character);
	const appearanceLine = character.appearance
		? `- appearance: ${character.appearance}`
		: "";
	const body = [voiceLines, appearanceLine].filter(Boolean).join("\n");
	return `## ${name}\n\n${body}`;
}

export function projectPreamble(metadata: Metadata): string {
	const sections: string[] = [];

	if (metadata.style) {
		sections.push(dedent`
			# Art Style

			Below is the exact art style description for the story. Do not change it.

			${metadata.style}`);
	}

	const voice = renderVoice(metadata.narration);
	if (voice)
		sections.push(dedent`
			# Narration Voice

			Below is the exact voice description for the narrator. Do not change it.

			${voice}`);

	const characterEntries = Object.entries(metadata.characters);
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

/** Empty on `auto`: no budget is a budget the model would otherwise invent. */
export function lengthSection(metadata: Metadata): string {
	const budget = videoLengthBudget(metadata.videoSettings.length);
	if (!budget) return "";
	const { minWords, maxWords } = budget;

	return dedent`
		# Length

		Write ${minWords} to ${maxWords} words of dialogue. Only spoken words count;
		descriptions and attributes do not.`;
}
