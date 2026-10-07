import dedent from "dedent";
import compact from "lodash/compact";
import { getAvatars, referenceUrls } from "@/lib/canvas/assets";
import type { AssetElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { LLMConnector } from "@/lib/connectors/types";
import type { GenerationQueue } from "@/lib/generation/queue";

const DERIVE_PROMPT = dedent`Describe the visual art style of the attached reference image(s) in 1–2 concise sentences: the medium, linework, shading, colors and lighting, with specific detail on how characters are drawn. Never mention a place, a setting, a time of day, the subjects or what is happening: the description is placed in front of the prompt for every scene, so it must fit all of them. Reply with only the description.`;

/** Generated avatars already carry the style, so reading them back is circular. */
export function uploadedAvatarUrls(
	assets: AssetElement[],
	queue: GenerationQueue,
): string[] {
	return compact(
		getAvatars(assets).map(({ id }) => {
			const { result, pinned } = queue.getElementSnapshot(id);
			return pinned ? getPrimaryUrl(result, "image") : undefined;
		}),
	);
}

export function artStyleReferences(
	assets: AssetElement[],
	queue: GenerationQueue,
): string[] {
	return [...referenceUrls(assets), ...uploadedAvatarUrls(assets, queue)];
}

/** "" when there is nothing to read, so callers can leave the style alone. */
export async function deriveArtStyle(
	llm: Pick<LLMConnector, "generate">,
	assets: AssetElement[],
	queue: GenerationQueue,
): Promise<string> {
	const referenceImages = artStyleReferences(assets, queue);
	if (referenceImages.length === 0) return "";
	const { text } = await llm.generate({
		prompt: DERIVE_PROMPT,
		referenceImages,
		maxTokens: 4096,
		thinkingLevel: "low",
	});
	return text.trim();
}
