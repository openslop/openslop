import { dedent } from "@/lib/dedent";
import without from "lodash/without";
import {
	assetText,
	characterNames,
	NARRATOR,
	voiceOf,
} from "@/lib/canvas/assets";
import type { AssetElement } from "@/lib/canvas/types";
import {
	voiceTraitEntries,
	type Voice,
	type ScriptSettings,
} from "@/lib/project/types";
import { videoLengthBudget } from "@/lib/project/video-length";
import { videoFormatLabel } from "@/lib/project/video-format";

function renderVoice(voice: Voice): string {
	return voiceTraitEntries(voice)
		.map(([trait, value]) => `- ${trait}: ${value}`)
		.join("\n");
}

function renderCharacter(assets: AssetElement[], name: string): string {
	const appearance = assetText(assets, "asset_avatar", name);
	const body = [
		renderVoice(voiceOf(assets, name)),
		appearance && `- appearance: ${appearance}`,
	]
		.filter(Boolean)
		.join("\n");
	return `## ${name}\n\n${body}`;
}

export function projectPreamble(assets: AssetElement[]): string {
	const sections: string[] = [];

	const style = assetText(assets, "asset_style");
	if (style) {
		sections.push(dedent`
			# Art Style

			Every visual is drawn in this art style. Never restate it in a prompt.

			${style}`);
	}

	const voice = renderVoice(voiceOf(assets));
	if (voice)
		sections.push(dedent`
			# Narration Voice

			The narrator speaks in this voice.

			${voice}`);

	const characters = without(characterNames(assets), NARRATOR);
	if (characters.length > 0) {
		sections.push(dedent`
			# Characters

			The characters. Name one exactly as written here:

			${characters.map((name) => renderCharacter(assets, name)).join("\n\n")}`);
	}

	return sections.join("\n\n");
}

/** Empty on `auto`: the writer then picks the format closest to the brief. */
export function formatSection({ format }: ScriptSettings): string {
	if (format === "auto") return "";

	return dedent`
		# Format

		The user picked the ${videoFormatLabel(format)} format. Write in it.`;
}

/** Empty on `auto`: no budget is a budget the model would otherwise invent. */
export function lengthSection({ length }: ScriptSettings): string {
	const budget = videoLengthBudget(length);
	if (!budget) return "";
	const { minWords, maxWords } = budget;

	return dedent`
		# Length

		Write ${minWords} to ${maxWords} words of dialogue. Only spoken words count;
		prompts and attributes do not.`;
}
