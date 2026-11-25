import { dedent } from "@/lib/dedent";
import {
	ASSET_KIND_SPECS,
	ASSET_KINDS,
	namesOfKind,
	assetText,
	imageAssetTypeOf,
	voiceOf,
	type AssetKind,
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

/** A character also says how they sound; every kind says how it looks. */
function renderNamedAsset(
	assets: AssetElement[],
	kind: AssetKind,
	name: string,
): string {
	const appearance = assetText(assets, imageAssetTypeOf(kind), name);
	const body = [
		kind === "character" && renderVoice(voiceOf(assets, name)),
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

	for (const kind of ASSET_KINDS) {
		const names = namesOfKind(assets, kind);
		if (names.length === 0) continue;
		sections.push(dedent`
			# ${ASSET_KIND_SPECS[kind].plural}

			Name one exactly as written here:

			${names.map((name) => renderNamedAsset(assets, kind, name)).join("\n\n")}`);
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
