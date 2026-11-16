import { dedent } from "@/lib/dedent";
import {
	assetText,
	characterNames,
	findAsset,
	voiceOf,
} from "@/lib/canvas/assets";
import { characterRef } from "@/lib/connectors/character-refs";
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

/** What the writer may do with a character: speech needs a voice, and only an avatar shows how they look. */
function renderRoles(assets: AssetElement[], name: string): string {
	const speaks = findAsset(assets, "asset_voice", name)
		? "Speaks in <speech> lines."
		: "No voice: never give them a <speech> line.";
	const drawn = findAsset(assets, "asset_avatar", name)
		? `Drawn from an avatar: write them as ${characterRef(name)} in prompts.`
		: `No avatar: still write them as ${characterRef(name)} in prompts, and describe how they look.`;
	return `${speaks} ${drawn}`;
}

function renderCharacter(assets: AssetElement[], name: string): string {
	const appearance = assetText(assets, "asset_avatar", name);
	const traits = [
		renderVoice(voiceOf(assets, name)),
		appearance && `- appearance: ${appearance}`,
	]
		.filter(Boolean)
		.join("\n");
	return [`## ${name}`, renderRoles(assets, name), traits]
		.filter(Boolean)
		.join("\n\n");
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

	const characters = characterNames(assets);
	if (characters.length > 0) {
		sections.push(dedent`
			# Characters

			The characters. Name one exactly as written here:

			${characters.map((name) => renderCharacter(assets, name)).join("\n\n")}`);
	}

	return sections.join("\n\n");
}

/** Empty on `auto`, where the writer falls back to the format closest to the brief. */
export function formatSection({ format }: ScriptSettings): string {
	if (format === "auto") return "";

	return dedent`
		# Format

		The format is ${videoFormatLabel(format)}. Write in it.`;
}

/** Empty on `auto`: no budget is a budget the model would otherwise invent. */
export function lengthSection({ length }: ScriptSettings): string {
	const budget = videoLengthBudget(length);
	if (!budget) return "";
	const { minWords, maxWords } = budget;

	return dedent`
		# Length

		Write ${minWords} to ${maxWords} words of speech. Only spoken words count;
		prompts and attributes do not.`;
}
